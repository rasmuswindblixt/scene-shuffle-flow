import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import SceneDetector from "@/components/SceneDetector";
import SceneTimeline from "@/components/SceneTimeline";
import VideoPreview, { VideoPreviewRef } from "@/components/VideoPreview";

interface DualVideoProcessorProps {
  videoFiles: [File, File];
  videoUrls: [string, string];
  onReset: () => void;
}

interface QualityOption {
  label: string;
  height: number;
  width: number;
}

interface Scene {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnail?: string;
  segment: number;
  videoIndex: 0 | 1; // Which video this scene belongs to
}

const DualVideoProcessor = ({ videoFiles, videoUrls, onReset }: DualVideoProcessorProps) => {
  const videoPreviewRef = useRef<VideoPreviewRef>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [scenes1, setScenes1] = useState<Scene[]>([]);
  const [scenes2, setScenes2] = useState<Scene[]>([]);
  const [combinedScenes, setCombinedScenes] = useState<Scene[]>([]);
  const [filteredScenes, setFilteredScenes] = useState<Scene[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyze' | 'filter' | 'shuffle' | 'export'>('upload');
  const [minDuration, setMinDuration] = useState(1.0);
  const [maxDuration, setMaxDuration] = useState(6.9);
  const [minFinalClipLength, setMinFinalClipLength] = useState(0.5);
  const [numberOfSegments, setNumberOfSegments] = useState(5);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportedVideoBlob, setExportedVideoBlob] = useState<Blob | null>(null);
  const [exportLogs, setExportLogs] = useState<string[]>([]);
  const [originalVideoQuality, setOriginalVideoQuality] = useState<{width: number, height: number} | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<QualityOption | null>(null);
  const [currentPreviewVideo, setCurrentPreviewVideo] = useState<0 | 1>(0);
  const [analyzingVideo, setAnalyzingVideo] = useState<0 | 1>(0);

  const qualityOptions: QualityOption[] = [
    { label: "420p", height: 420, width: 747 },
    { label: "720p", height: 720, width: 1280 },
    { label: "1080p", height: 1080, width: 1920 }
  ];

  const detectVideoQuality = async () => {
    const videoElement = document.createElement('video');
    videoElement.src = videoUrls[0]; // Use first video for quality detection
    videoElement.muted = true;
    videoElement.preload = 'metadata';
    
    await new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = resolve;
      videoElement.onerror = reject;
    });
    
    const quality = {
      width: videoElement.videoWidth || 640,
      height: videoElement.videoHeight || 480
    };
    
    setOriginalVideoQuality(quality);
    
    // Set default quality
    const availableQualities = qualityOptions.filter(q => q.height <= quality.height);
    if (availableQualities.length > 0) {
      setSelectedQuality(availableQualities[availableQualities.length - 1]);
    } else {
      setSelectedQuality(qualityOptions[0]);
    }
  };

  const startAnalysis = async () => {
    await detectVideoQuality();
    setIsAnalyzing(true);
    setCurrentStep('analyze');
    setAnalysisProgress(0);
    setAnalyzingVideo(0);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5; // Slower progress for two videos
      });
    }, 500);
  };

  const handleScenesDetected = (detectedScenes: Scene[], videoIndex: 0 | 1) => {
    // Add videoIndex to all scenes
    const scenesWithVideoIndex = detectedScenes.map(scene => ({
      ...scene,
      videoIndex,
      id: `${videoIndex}-${scene.id}` // Ensure unique IDs
    }));

    if (videoIndex === 0) {
      setScenes1(scenesWithVideoIndex);
      // Start analyzing second video
      setAnalyzingVideo(1);
    } else {
      setScenes2(scenesWithVideoIndex);
      // Both videos analyzed, combine scenes
      const allScenes = [...scenes1, ...scenesWithVideoIndex];
      setCombinedScenes(allScenes);
      setIsAnalyzing(false);
      setCurrentStep('filter');
      applyFilters(allScenes);
      toast.success("Scene detection completed for both videos!");
    }
  };

  const createSegmentedScenes = (allScenes: Scene[]) => {
    // Get video durations (approximate from last scene)
    const video1Scenes = allScenes.filter(s => s.videoIndex === 0);
    const video2Scenes = allScenes.filter(s => s.videoIndex === 1);
    
    const video1Duration = video1Scenes.length > 0 ? Math.max(...video1Scenes.map(s => s.endTime)) : 0;
    const video2Duration = video2Scenes.length > 0 ? Math.max(...video2Scenes.map(s => s.endTime)) : 0;
    
    const segmentDuration1 = video1Duration / numberOfSegments;
    const segmentDuration2 = video2Duration / numberOfSegments;
    
    // Assign new segment numbers based on numberOfSegments
    const updatedScenes = allScenes.map(scene => {
      if (scene.videoIndex === 0) {
        const newSegment = Math.floor(scene.startTime / segmentDuration1);
        return { ...scene, segment: Math.min(newSegment, numberOfSegments - 1) };
      } else {
        const newSegment = Math.floor(scene.startTime / segmentDuration2);
        return { ...scene, segment: Math.min(newSegment, numberOfSegments - 1) };
      }
    });
    
    return updatedScenes;
  };

  const applyFilters = (scenesToFilter: Scene[] = combinedScenes) => {
    // First, update segments based on numberOfSegments
    const segmentedScenes = createSegmentedScenes(scenesToFilter);
    
    const filtered = segmentedScenes.filter(scene => 
      scene.duration >= minDuration && scene.duration <= maxDuration
    ).map(scene => ({
      ...scene,
      startTime: scene.startTime + trimStart,
      endTime: scene.endTime - trimEnd,
      duration: scene.duration - trimStart - trimEnd
    })).filter(scene => scene.duration >= minFinalClipLength);
    
    setFilteredScenes(filtered);
    toast.success(`Filtered to ${filtered.length} scenes from both videos`);
  };

  const shuffleScenes = () => {
    const shuffled = [...filteredScenes];
    
    // Group scenes by segment, keeping video separation
    const segmentGroups: { [key: number]: Scene[] } = {};
    shuffled.forEach(scene => {
      if (!segmentGroups[scene.segment]) {
        segmentGroups[scene.segment] = [];
      }
      segmentGroups[scene.segment].push(scene);
    });

    // Shuffle within each segment
    Object.keys(segmentGroups).forEach(segment => {
      const segmentScenes = segmentGroups[parseInt(segment)];
      for (let i = segmentScenes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [segmentScenes[i], segmentScenes[j]] = [segmentScenes[j], segmentScenes[i]];
      }
    });

    // Flatten back to single array
    const result = Object.values(segmentGroups).flat();
    setFilteredScenes(result);
    setCurrentStep('shuffle');
    toast.success("Scenes from both videos shuffled successfully!");
  };

  const handleScenePreview = (scene: Scene) => {
    // Switch to the correct video for preview
    setCurrentPreviewVideo(scene.videoIndex);
    videoPreviewRef.current?.seekAndPlay(scene.startTime, scene.duration);
  };

  const addLog = (message: string) => {
    setExportLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const exportVideo = async () => {
    if (filteredScenes.length === 0) {
      toast.error("No scenes to export");
      return;
    }
    
    setShowExportDialog(true);
    setIsExporting(true);
    setExportProgress(0);
    setExportLogs([]);
    setCurrentStep('export');
    
    try {
      addLog("Starting dual video export...");
      
      // Create video elements for both videos
      const videoElement1 = document.createElement('video');
      const videoElement2 = document.createElement('video');
      videoElement1.src = videoUrls[0];
      videoElement2.src = videoUrls[1];
      videoElement1.muted = true;
      videoElement2.muted = true;
      videoElement1.preload = 'metadata';
      videoElement2.preload = 'metadata';
      
      await Promise.all([
        new Promise((resolve, reject) => {
          videoElement1.onloadedmetadata = resolve;
          videoElement1.onerror = reject;
        }),
        new Promise((resolve, reject) => {
          videoElement2.onloadedmetadata = resolve;
          videoElement2.onerror = reject;
        })
      ]);
      
      setExportProgress(10);
      addLog("Both video metadata loaded successfully");
      
      // Create canvas with selected quality
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = selectedQuality?.width || 640;
      canvas.height = selectedQuality?.height || 480;
      
      addLog(`Starting recording of ${filteredScenes.length} scenes from both videos...`);
      
      // Set up MediaRecorder
      const stream = canvas.captureStream(30);
      let mimeType = 'video/mp4';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp9';
      }
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      const recordedChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      
      mediaRecorder.start();
      
      // Process all scenes sequentially
      for (let i = 0; i < filteredScenes.length; i++) {
        const scene = filteredScenes[i];
        const videoElement = scene.videoIndex === 0 ? videoElement1 : videoElement2;
        const videoName = scene.videoIndex === 0 ? "Video 1" : "Video 2";
        const startTime = scene.startTime + trimStart;
        const duration = Math.max(0.5, scene.duration - trimStart - trimEnd);
        
        addLog(`Recording scene ${i + 1}/${filteredScenes.length} from ${videoName} (${startTime.toFixed(1)}s for ${duration.toFixed(1)}s)`);
        
        // Seek to scene start
        videoElement.currentTime = startTime;
        await new Promise(resolve => {
          videoElement.onseeked = resolve;
        });
        
        // Play and record this scene
        videoElement.play();
        
        const sceneEndTime = startTime + duration;
        await new Promise<void>((resolve) => {
          const drawFrame = () => {
            if (videoElement.currentTime < sceneEndTime && !videoElement.paused) {
              ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
              requestAnimationFrame(drawFrame);
            } else {
              videoElement.pause();
              resolve();
            }
          };
          drawFrame();
        });
        
        const progress = 10 + ((i + 1) / filteredScenes.length) * 80;
        setExportProgress(progress);
        addLog(`Scene ${i + 1} from ${videoName} recorded successfully`);
      }
      
      // Stop recording
      mediaRecorder.stop();
      
      addLog("Finalizing dual video export...");
      
      // Wait for final recording data
      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => {
          const finalBlob = new Blob(recordedChunks, { type: mimeType });
          setExportedVideoBlob(finalBlob);
          resolve();
        };
      });
      
      setIsExporting(false);
      setExportProgress(100);
      addLog("Dual video export completed successfully!");
      toast.success("Dual video exported successfully!");
      
    } catch (error) {
      console.error('Export error:', error);
      addLog(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsExporting(false);
      toast.error(`Failed to export video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const downloadVideo = () => {
    if (!exportedVideoBlob) {
      toast.error("No exported video available");
      return;
    }
    
    const url = URL.createObjectURL(exportedVideoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dual_video_mash_exported.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Video download started!");
  };

  const getVideoStats = () => {
    const video1Scenes = filteredScenes.filter(s => s.videoIndex === 0);
    const video2Scenes = filteredScenes.filter(s => s.videoIndex === 1);
    return { video1Scenes: video1Scenes.length, video2Scenes: video2Scenes.length };
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dual Video Processing</h1>
          <p className="text-muted-foreground">
            Video 1: {videoFiles[0].name} • Video 2: {videoFiles[1].name}
          </p>
        </div>
        <Button variant="outline" onClick={onReset}>
          Start Over
        </Button>
      </div>

      {/* Progress Steps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">🎭</span>
            Dual Video Processing Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            {[
              { key: 'upload', label: 'Upload', icon: '📁' },
              { key: 'analyze', label: 'Analyze', icon: '🔍' },
              { key: 'filter', label: 'Filter', icon: '🎯' },
              { key: 'shuffle', label: 'Mash', icon: '🔀' },
              { key: 'export', label: 'Export', icon: '📤' }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${currentStep === step.key ? 'bg-primary text-primary-foreground' :
                    ['upload', 'analyze'].includes(step.key) && currentStep !== 'upload' ? 'bg-primary/20 text-primary' :
                    'bg-secondary text-secondary-foreground'}
                `}>
                  {step.icon}
                </div>
                <span className={`ml-2 font-medium ${
                  currentStep === step.key ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {index < 4 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    ['upload', 'analyze'].includes(step.key) && currentStep !== 'upload' ? 'bg-primary' : 'bg-border'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Analyzing {analyzingVideo === 0 ? 'first' : 'second'} video for scenes... {analysisProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Preview */}
          <VideoPreview ref={videoPreviewRef} videoUrl={videoUrls[currentPreviewVideo]} />
          
          {/* Video Switcher */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Button 
                  variant={currentPreviewVideo === 0 ? "default" : "outline"} 
                  onClick={() => setCurrentPreviewVideo(0)}
                  className="flex-1"
                >
                  Preview Video 1
                </Button>
                <Button 
                  variant={currentPreviewVideo === 1 ? "default" : "outline"} 
                  onClick={() => setCurrentPreviewVideo(1)}
                  className="flex-1"
                >
                  Preview Video 2
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scene Detection */}
          {currentStep === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle>Start Dual Video Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Click below to start analyzing both videos for scene changes. 
                  This will detect cuts and transitions in both videos automatically.
                </p>
                <Button variant="hero" size="lg" onClick={startAnalysis}>
                  Analyze Both Videos for Scenes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Scene Detection Components */}
          {isAnalyzing && (
            <>
              {analyzingVideo === 0 && (
                <SceneDetector
                  videoUrl={videoUrls[0]}
                  onScenesDetected={(scenes: any) => handleScenesDetected(scenes, 0)}
                  isAnalyzing={analyzingVideo === 0}
                  segmentLength={120}
                />
              )}
              {analyzingVideo === 1 && scenes1.length > 0 && (
                <SceneDetector
                  videoUrl={videoUrls[1]}
                  onScenesDetected={(scenes: any) => handleScenesDetected(scenes, 1)}
                  isAnalyzing={analyzingVideo === 1}
                  segmentLength={120}
                />
              )}
            </>
          )}

          {/* Scene Timeline */}
          {combinedScenes.length > 0 && (
            <SceneTimeline 
              scenes={currentStep === 'filter' || currentStep === 'shuffle' ? filteredScenes : combinedScenes}
              videoUrl={videoUrls[currentPreviewVideo]}
              onScenePreview={handleScenePreview}
            />
          )}
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-6">
          {/* Video Quality Info */}
          {originalVideoQuality && (
            <Card>
              <CardHeader>
                <CardTitle>Video Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p className="font-medium mb-2">Original Quality:</p>
                  <p className="text-muted-foreground">
                    {originalVideoQuality.width} × {originalVideoQuality.height}
                    {originalVideoQuality.height >= 1080 ? " (1080p+)" : 
                     originalVideoQuality.height >= 720 ? " (720p+)" : " (SD)"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Segment Control */}
          {combinedScenes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Segment Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Number of Segments: {numberOfSegments}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={numberOfSegments}
                    onChange={(e) => setNumberOfSegments(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Each video will be divided into {numberOfSegments} segments for proportional mixing
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter Controls */}
          {combinedScenes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Scene Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                   <label className="text-sm font-medium mb-2 block">
                     Duration Range: {minDuration.toFixed(1)}s - {maxDuration.toFixed(1)}s
                   </label>
                   <div className="space-y-2">
                     <input
                       type="range"
                       min="0.5"
                       max="10"
                       step="0.1"
                       value={minDuration}
                       onChange={(e) => setMinDuration(Number(e.target.value))}
                       className="w-full"
                     />
                     <input
                       type="range"
                       min="1"
                       max="30"
                       step="0.1"
                       value={maxDuration}
                       onChange={(e) => setMaxDuration(Number(e.target.value))}
                       className="w-full"
                     />
                   </div>
                 </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Min Final Clip Length: {minFinalClipLength.toFixed(1)}s
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={minFinalClipLength}
                    onChange={(e) => setMinFinalClipLength(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Trim Start: {trimStart.toFixed(1)}s
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={trimStart}
                    onChange={(e) => setTrimStart(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Trim End: {trimEnd.toFixed(1)}s
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <Button onClick={() => applyFilters()} className="w-full">
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mash Controls */}
          {filteredScenes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dual Video Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>• {combinedScenes.length} total scenes detected</p>
                  <p>• {filteredScenes.length} scenes after filtering</p>
                  <p>• Video 1: {getVideoStats().video1Scenes} scenes</p>
                  <p>• Video 2: {getVideoStats().video2Scenes} scenes</p>
                </div>
                
                <Button variant="hero" onClick={shuffleScenes} className="w-full">
                  Mash Videos Together
                </Button>
                
                {/* Export Quality Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Export Quality:</label>
                  <select 
                    value={selectedQuality?.label || ""} 
                    onChange={(e) => {
                      const quality = qualityOptions.find(q => q.label === e.target.value);
                      setSelectedQuality(quality || null);
                    }}
                    className="w-full p-2 rounded border bg-background text-foreground"
                  >
                    {qualityOptions
                      .filter(q => q.height <= (originalVideoQuality?.height || 1080))
                      .map(quality => (
                        <option key={quality.label} value={quality.label}>
                          {quality.label} ({quality.width}×{quality.height})
                        </option>
                      ))}
                  </select>
                </div>
                
                <Button variant="premium" onClick={exportVideo} className="w-full">
                  Export Mashed Video
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exporting Dual Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Processing {filteredScenes.length} scenes from both videos...</p>
              <p>Applying trim settings: Start {trimStart.toFixed(1)}s, End {trimEnd.toFixed(1)}s</p>
            </div>
            
            {isExporting && (
              <div className="space-y-2">
                <Progress value={exportProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {exportProgress.toFixed(0)}% complete
                </p>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                  <h4 className="text-sm font-medium mb-2">Processing Logs:</h4>
                  <div className="text-xs space-y-1">
                    {exportLogs.map((log, index) => (
                      <div key={index} className="text-gray-600">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isExporting && exportProgress === 100 && (
              <div className="text-center space-y-3">
                <p className="text-sm text-green-600 font-medium">
                  Export completed successfully!
                </p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="premium"
                    onClick={downloadVideo}
                  >
                    Download Video
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowExportDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DualVideoProcessor;
