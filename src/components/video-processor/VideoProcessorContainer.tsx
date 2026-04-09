import { useEffect } from "react";
import { toast } from "sonner";
import { Film } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useVideoProcessor, VideoProcessorProvider } from "@/contexts/VideoProcessorContext";
import { shuffleWithConstraints } from "@/lib/shuffle";
import { Scene } from "@/types/scene";
import {
  SCENE_MIN_DURATION, SCENE_MAX_DURATION, SCENE_EDGE_TRIM, SCENE_MAX_FINAL_DURATION,
  EXPORT_WIDTH, EXPORT_HEIGHT, EXPORT_BITRATE_HIGH, EXPORT_BITRATE_LOW, EXPORT_FRAMERATE,
} from "@/lib/constants";
import ErrorBoundary from "@/components/ErrorBoundary";
import VideoPreview from "@/components/VideoPreview";
import SceneDetector from "@/components/SceneDetector";
import AnalysisView from "./AnalysisView";
import FinalVideoPreview from "./FinalVideoPreview";
import SceneGrid from "./SceneGrid";
import DurationControl from "./DurationControl";
import ExportControls from "./ExportControls";
import ExportDialog from "./ExportDialog";

function VideoProcessorInner() {
  const { subscribed, user } = useAuth();
  const ctx = useVideoProcessor();
  const {
    videoFiles, videoUrls,
    currentStep, setCurrentStep,
    isAnalyzing, setIsAnalyzing,
    scenes, setScenes,
    shuffledScenes, setShuffledScenes,
    currentVideoIndex, setCurrentVideoIndex,
    allVideoScenes, setAllVideoScenes,
    originalVideoDuration, setOriginalVideoDuration,
    maxVideoDuration, setMaxVideoDuration,
    isExporting, setIsExporting,
    exportProgress, setExportProgress,
    showExportDialog, setShowExportDialog,
    exportedVideoBlob, setExportedVideoBlob,
    exportLogs, addLog, setExportLogs,
    exportFormat,
    getSelectedShuffledScenes, getScenesWithinDuration,
    formatDuration,
  } = ctx;

  const primaryVideoFile = videoFiles[0];
  const primaryVideoUrl = videoUrls[0];

  // Check supported formats on mount
  useEffect(() => {
    const formats = [
      'video/mp4', 'video/mp4;codecs=h264', 'video/mp4;codecs=avc1.42E01E',
      'video/webm', 'video/webm;codecs=vp8', 'video/webm;codecs=vp9'
    ];
    console.log('Supported video formats:');
    formats.forEach(f => console.log(`  ${f}: ${MediaRecorder.isTypeSupported(f) ? 'yes' : 'no'}`));
  }, []);

  // Auto-start analysis
  useEffect(() => {
    setCurrentVideoIndex(0);
    setAllVideoScenes([]);
    setIsAnalyzing(true);
    toast.info("Starting enhanced scene detection...");

    const promises = videoUrls.map((url) => {
      const video = document.createElement('video');
      video.src = url;
      return new Promise<number>((resolve) => {
        video.onloadedmetadata = () => resolve(video.duration);
        video.onerror = () => resolve(0);
      });
    });

    Promise.all(promises).then(durations => {
      setOriginalVideoDuration(durations.reduce((sum, d) => sum + d, 0));
    });
  }, []);

  // Handle scenes detected from SceneDetector
  const handleScenesDetected = (detectedScenes: Scene[]) => {
    const videoScenes = detectedScenes.map(scene => ({
      ...scene,
      id: `video${currentVideoIndex + 1}_${scene.id}`,
      videoIndex: currentVideoIndex,
    }));

    const newAll = [...allVideoScenes];
    newAll[currentVideoIndex] = videoScenes;
    setAllVideoScenes(newAll);

    if (currentVideoIndex < videoFiles.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      return;
    }

    // All videos analyzed
    const all = newAll.flat();
    const filtered = all.filter(s => s.duration >= SCENE_MIN_DURATION && s.duration <= SCENE_MAX_DURATION);

    const totalEdgeTrim = SCENE_EDGE_TRIM * 2;
    const trimmed = filtered.map(s => ({
      ...s,
      startTime: s.startTime + SCENE_EDGE_TRIM,
      duration: s.duration - totalEdgeTrim,
      id: s.id + '_trimmed',
      selected: true,
    }));

    const finalScenes = trimmed.map(s => {
      if (s.duration > SCENE_MAX_FINAL_DURATION) {
        const excess = s.duration - SCENE_MAX_FINAL_DURATION;
        const trim = excess / 2;
        return { ...s, startTime: s.startTime + trim, duration: SCENE_MAX_FINAL_DURATION, id: s.id + '_maxTrimmed' };
      }
      return s;
    });

    if (finalScenes.length === 0) {
      toast.error("No scenes found that can be trimmed to 1-6.9 seconds. Try different videos.");
      setIsAnalyzing(false);
      return;
    }

    const shuffled = shuffleWithConstraints(finalScenes);
    setScenes(finalScenes);
    setShuffledScenes(shuffled);
    setIsAnalyzing(false);
    setCurrentStep('results');

    const totalDur = finalScenes.reduce((sum, s) => sum + s.duration, 0);
    setMaxVideoDuration(totalDur);

    const label = videoFiles.length > 1 ? `${videoFiles.length} videos mixed` : 'video';
    toast.success(`Found ${finalScenes.length} scenes from ${label} • Final video: ${formatDuration(totalDur)}`);
  };

  // Export video
  const exportVideo = async () => {
    const selectedScenes = getSelectedShuffledScenes();
    const scenesToExport = getScenesWithinDuration(selectedScenes, maxVideoDuration);

    if (selectedScenes.length === 0) { toast.error("No scenes selected for export."); return; }
    if (scenesToExport.length === 0) { toast.error("No selected scenes fit within the duration limit"); return; }
    if (!user) { toast.error("Please sign in to export videos"); return; }
    if (!subscribed) { toast.error("Subscribe to export videos."); return; }

    setShowExportDialog(true);
    setIsExporting(true);
    setExportProgress(0);
    setExportLogs([]);

    try {
      addLog("Starting video export...");

      const videoElement = document.createElement('video');
      videoElement.src = primaryVideoUrl;
      videoElement.muted = true;
      videoElement.preload = 'metadata';

      addLog("Loading video metadata...");
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = resolve;
        videoElement.onerror = reject;
      });
      setExportProgress(10);
      addLog("Video metadata loaded successfully");

      const canvas = document.createElement('canvas');
      const canvasCtx = canvas.getContext('2d')!;
      canvas.width = EXPORT_WIDTH;
      canvas.height = EXPORT_HEIGHT;

      addLog(`Starting recording of ${scenesToExport.length} scenes (within ${formatDuration(maxVideoDuration)} limit)...`);

      const stream = canvas.captureStream(EXPORT_FRAMERATE);
      let mediaRecorder: MediaRecorder;

      addLog(`Setting up video recording in ${exportFormat.toUpperCase()} format...`);

      // Codec selection
      const tryCodecs = exportFormat === 'mp4'
        ? ['video/mp4;codecs=h264', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8']
        : ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4;codecs=h264'];

      let selectedMime = '';
      for (const mime of tryCodecs) {
        if (MediaRecorder.isTypeSupported(mime)) { selectedMime = mime; break; }
      }

      const bitrate = selectedMime.includes('vp8') ? EXPORT_BITRATE_LOW : EXPORT_BITRATE_HIGH;
      mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMime, videoBitsPerSecond: bitrate });
      addLog(`Using ${selectedMime} at ${bitrate / 1_000_000} Mbps`);

      const recordedChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
      mediaRecorder.start();

      // Create video elements for all source videos
      const videoElements = videoUrls.map(url => {
        const v = document.createElement('video');
        v.src = url;
        v.muted = true;
        return v;
      });

      await Promise.all(videoElements.map(v =>
        new Promise((resolve, reject) => { v.onloadedmetadata = resolve; v.onerror = reject; })
      ));

      for (let i = 0; i < scenesToExport.length; i++) {
        const scene = scenesToExport[i];
        const vi = scene.videoIndex || 0;
        const currentVideo = videoElements[vi];

        addLog(`Recording scene ${i + 1}/${scenesToExport.length} from video ${vi + 1} (${scene.duration.toFixed(1)}s)`);

        currentVideo.currentTime = scene.startTime;
        await new Promise(resolve => { currentVideo.onseeked = resolve; });

        currentVideo.play();
        const sceneEnd = scene.startTime + scene.duration;

        await new Promise<void>((resolve) => {
          const drawFrame = () => {
            if (currentVideo.currentTime < sceneEnd && !currentVideo.paused) {
              canvasCtx.drawImage(currentVideo, 0, 0, canvas.width, canvas.height);
              requestAnimationFrame(drawFrame);
            } else {
              currentVideo.pause();
              resolve();
            }
          };
          drawFrame();
        });

        setExportProgress(10 + ((i + 1) / scenesToExport.length) * 80);
      }

      mediaRecorder.stop();
      addLog("Finalizing video export...");

      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => {
          const mimeType = mediaRecorder.mimeType || 'video/webm';
          setExportedVideoBlob(new Blob(recordedChunks, { type: mimeType }));
          resolve();
        };
      });

      // Cleanup video elements
      videoElements.forEach(v => { v.src = ''; v.load(); });

      setIsExporting(false);
      setExportProgress(100);
      addLog("Export completed successfully!");
      toast.success("Video exported successfully!");
    } catch (error) {
      console.error('Export error:', error);
      addLog(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsExporting(false);
      toast.error(`Failed to export video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const downloadVideo = () => {
    if (!exportedVideoBlob) { toast.error("No exported video available"); return; }
    const ext = exportedVideoBlob.type.includes('mp4') ? 'mp4' : 'webm';
    const url = URL.createObjectURL(exportedVideoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${primaryVideoFile.name.split('.')[0]}_shuffled.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Video download started! (${ext.toUpperCase()} format)`);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">
            {currentStep === 'analyze' && `Analyzing Your Video${videoFiles.length > 1 ? 's' : ''}`}
            {currentStep === 'results' && 'Shuffled Results'}
          </h2>
          {videoFiles.length > 1 && currentStep === 'analyze' && (
            <p className="text-sm text-primary font-medium">
              <Film className="w-4 h-4 inline mr-1" />
              Mixing {videoFiles.length} videos together
            </p>
          )}
          <p className="text-muted-foreground">
            {currentStep === 'analyze' && (
              <span>
                Detecting scenes and optimizing to 1-6.9 second clips (removing 0.8s transitions, centering long clips)...
                {videoFiles.length > 1 && (
                  <>
                    <br />
                    <span className="text-primary font-medium">
                      Analyzing video {currentVideoIndex + 1} of {videoFiles.length}: {videoFiles[currentVideoIndex]?.name}
                    </span>
                  </>
                )}
              </span>
            )}
            {currentStep === 'results' && `${shuffledScenes.length} scenes ready for export • Final video: ${formatDuration(ctx.getTotalDuration())}`}
          </p>
        </div>

        {/* Video Preview */}
        <VideoPreview videoUrl={primaryVideoUrl} />

        {/* Analysis Step */}
        {currentStep === 'analyze' && (
          <ErrorBoundary fallbackMessage="Scene analysis encountered an error. Try uploading a different video.">
            <AnalysisView />
          </ErrorBoundary>
        )}

        {/* Scene Detector */}
        {isAnalyzing && (
          <SceneDetector
            videoUrl={videoUrls[currentVideoIndex]}
            onScenesDetected={handleScenesDetected}
            isAnalyzing={true}
            key={`scene-detector-${currentVideoIndex}`}
          />
        )}

        {/* Results Step */}
        {currentStep === 'results' && (
          <ErrorBoundary fallbackMessage="The video editor encountered an error. Try reshuffling or uploading a different video.">
            <div className="space-y-6">
              <FinalVideoPreview />
              <SceneGrid />
              <DurationControl />
              <ExportControls onExport={exportVideo} />
            </div>
          </ErrorBoundary>
        )}

        {/* Export Dialog */}
        <ExportDialog onDownload={downloadVideo} />
      </div>
    </div>
  );
}

// Public component wraps inner with provider
interface VideoProcessorProps {
  videoFiles: File[];
  videoUrls: string[];
  onReset: () => void;
}

export default function VideoProcessorContainer({ videoFiles, videoUrls, onReset }: VideoProcessorProps) {
  return (
    <VideoProcessorProvider videoFiles={videoFiles} videoUrls={videoUrls} onReset={onReset}>
      <VideoProcessorInner />
    </VideoProcessorProvider>
  );
}
