import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import SceneDetector from "@/components/SceneDetector";
import SceneTimeline from "@/components/SceneTimeline";
import VideoPreview, { VideoPreviewRef } from "@/components/VideoPreview";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface VideoProcessorProps {
  videoFile: File;
  videoUrl: string;
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
}

const VideoProcessor = ({ videoFile, videoUrl, onReset }: VideoProcessorProps) => {
  const { checkSubscription, checkSubscriptionDirect, updateFreeExportsUsed, subscribed, freeExportsUsed } = useAuth();
  const videoPreviewRef = useRef<VideoPreviewRef>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [filteredScenes, setFilteredScenes] = useState<Scene[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyze' | 'filter' | 'shuffle' | 'export'>('upload');
  const [minDuration, setMinDuration] = useState(1.0);
  const [maxDuration, setMaxDuration] = useState(6.9);
  const [minFinalClipLength, setMinFinalClipLength] = useState(0.5);
  const [segmentLength, setSegmentLength] = useState(120); // 2 minutes in seconds
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportCompleted, setExportCompleted] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(-1);
  const [isPreviewingFinal, setIsPreviewingFinal] = useState(false);
  const [exportedVideoBlob, setExportedVideoBlob] = useState<Blob | null>(null);
  const [exportLogs, setExportLogs] = useState<string[]>([]);
  const [originalVideoQuality, setOriginalVideoQuality] = useState<{width: number, height: number} | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<QualityOption | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const qualityOptions: QualityOption[] = [
    { label: "420p", height: 420, width: 747 },
    { label: "720p", height: 720, width: 1280 },
    { label: "1080p", height: 1080, width: 1920 }
  ];

  const detectVideoQuality = async () => {
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
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
    
    // Set default quality to original or closest lower option
    const availableQualities = qualityOptions.filter(q => q.height <= quality.height);
    if (availableQualities.length > 0) {
      setSelectedQuality(availableQualities[availableQualities.length - 1]);
    } else {
      setSelectedQuality(qualityOptions[0]); // Fallback to lowest quality
    }
  };

  const startAnalysis = async () => {
    await detectVideoQuality();
    setIsAnalyzing(true);
    setCurrentStep('analyze');
    setAnalysisProgress(0);
    
    // Extended analysis time to ensure complete scene detection
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Don't move to filter step automatically - wait for scenes to be detected
          return 100;
        }
        return prev + 5; // Slower progress for more thorough analysis
      });
    }, 500); // Longer intervals
  };

  const handleScenesDetected = (detectedScenes: Scene[]) => {
    setScenes(detectedScenes);
    setIsAnalyzing(false);
    setCurrentStep('filter');
    applyFilters(detectedScenes);
    toast.success("Scene detection completed!");
  };

  const applyFilters = (scenesToFilter: Scene[] = scenes) => {
    const filtered = scenesToFilter.filter(scene => 
      scene.duration >= minDuration && scene.duration <= maxDuration
    ).map(scene => ({
      ...scene,
      startTime: scene.startTime + trimStart,
      endTime: scene.endTime - trimEnd,
      duration: scene.duration - trimStart - trimEnd
    })).filter(scene => scene.duration >= minFinalClipLength);
    
    setFilteredScenes(filtered);
    toast.success(`Filtered to ${filtered.length} scenes`);
  };

  const shuffleScenes = () => {
    const shuffled = [...filteredScenes];
    
    // Group scenes by segment
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
    toast.success("Scenes shuffled successfully!");
  };

  const handleScenePreview = (scene: Scene) => {
    videoPreviewRef.current?.seekAndPlay(scene.startTime, scene.duration);
  };

  const previewFinalVideo = () => {
    if (filteredScenes.length === 0) {
      toast.error("No scenes to preview");
      return;
    }
    
    setIsPreviewingFinal(true);
    setCurrentPreviewIndex(0);
    playSceneSequence(0);
    toast.success("Playing preview of all scenes");
  };

  const playSceneSequence = (index: number) => {
    if (index >= filteredScenes.length) {
      setIsPreviewingFinal(false);
      setCurrentPreviewIndex(-1);
      toast.success("Preview completed");
      return;
    }

    const scene = filteredScenes[index];
    videoPreviewRef.current?.seekAndPlay(scene.startTime, scene.duration);
    
    // Schedule next scene
    setTimeout(() => {
      playSceneSequence(index + 1);
    }, scene.duration * 1000);
  };

  const addLog = (message: string) => {
    setExportLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const drawCredit = async (user: any) => {
    console.log('[CREDIT] ===== STARTING CREDIT DRAW =====');
    console.log('[CREDIT] User email:', user.email);
    console.log('[CREDIT] User ID:', user.id);
    try {
      // Get or create subscriber record
      let { data: subscriber, error: selectError } = await supabase
        .from("subscribers")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (selectError) {
        console.error('[CREDIT] Error fetching subscriber:', selectError);
        toast.error("Failed to update export count");
        return;
      }

      console.log('[CREDIT] Current subscriber data:', subscriber);

      // Create subscriber if doesn't exist
      if (!subscriber) {
        console.log('[CREDIT] Creating new subscriber with 1 export used');
        const { data: newSubscriber, error: insertError } = await supabase
          .from("subscribers")
          .insert({
            email: user.email,
            user_id: user.id,
            subscribed: false,
            free_exports_used: 1,
          })
          .select()
          .single();

        if (insertError) {
          console.error('[CREDIT] Error creating subscriber:', insertError);
          toast.error("Failed to track export usage");
          return;
        }
        console.log('[CREDIT] New subscriber created:', newSubscriber);
        console.log('[CREDIT] About to call updateFreeExportsUsed with value: 1');
        
        // Update UI state immediately
        updateFreeExportsUsed(1);
        console.log('[CREDIT] updateFreeExportsUsed called');
        toast.success(`Export started! 2 exports remaining`);
      } else if (!subscriber.subscribed) {
        // Increment export count for non-subscribers
        console.log('[CREDIT] Updating existing subscriber, incrementing from', subscriber.free_exports_used, 'to', subscriber.free_exports_used + 1);
        const { data: updatedSubscriber, error: updateError } = await supabase
          .from("subscribers")
          .update({
            free_exports_used: subscriber.free_exports_used + 1,
          })
          .eq("email", user.email)
          .select()
          .single();

        if (updateError) {
          console.error('[CREDIT] Error updating subscriber:', updateError);
          toast.error("Failed to track export usage");
          return;
        }
        console.log('[CREDIT] Subscriber updated successfully:', updatedSubscriber);
        console.log('[CREDIT] About to call updateFreeExportsUsed with value:', updatedSubscriber.free_exports_used);
        
        // Update UI state immediately
        updateFreeExportsUsed(updatedSubscriber.free_exports_used);
        console.log('[CREDIT] updateFreeExportsUsed called');
        toast.success(`Export started! ${3 - updatedSubscriber.free_exports_used} exports remaining`);
      } else {
        console.log('[CREDIT] User is subscribed, no credit needed');
        toast.success("Export started!");
      }
    } catch (error) {
      console.error('[CREDIT] Error drawing credit:', error);
      toast.error("Failed to track export usage");
    }
  };

  const exportVideo = async () => {
    if (!subscribed && freeExportsUsed >= 3) {
      setShowUpgradeDialog(true);
      return;
    }
    console.log('[EXPORT] Export button clicked');
    if (filteredScenes.length === 0) {
      toast.error("No scenes to export");
      return;
    }

    // Simple auth check
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      toast.error("Please sign in to export videos");
      return;
    }

    console.log('[EXPORT] Auth check passed, user:', authData.session.user.email);

    // Open dialog immediately and draw credit
    setShowExportDialog(true);
    setIsExporting(true);
    setExportProgress(0);
    setExportLogs([]);
    setCurrentStep('export');
    
    console.log('[EXPORT] Dialog opened, calling drawCredit');
    // Draw credit and wait for it to complete
    await drawCredit(authData.session.user);
    
    try {
      addLog("Starting browser-native video export...");
      
      // Create a video element for processing
      const videoElement = document.createElement('video');
      videoElement.src = videoUrl;
      videoElement.muted = true; // Mute audio during export
      videoElement.preload = 'metadata';
      
      addLog("Loading video metadata...");
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = resolve;
        videoElement.onerror = reject;
      });
      
      setExportProgress(10);
      addLog("Video metadata loaded successfully");
      
      // Create canvas for recording all scenes with selected quality
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = selectedQuality?.width || videoElement.videoWidth || 640;
      canvas.height = selectedQuality?.height || videoElement.videoHeight || 480;
      
      addLog(`Starting recording of ${filteredScenes.length} scenes sequentially...`);
      
      // Set up MediaRecorder with MP4 support if available
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
      
      // Start recording
      mediaRecorder.start();
      
      // Process all scenes sequentially
      for (let i = 0; i < filteredScenes.length; i++) {
        const scene = filteredScenes[i];
        const startTime = scene.startTime + trimStart;
        const duration = Math.max(0.5, scene.duration - trimStart - trimEnd);
        
        addLog(`Recording scene ${i + 1}/${filteredScenes.length} (${startTime.toFixed(1)}s for ${duration.toFixed(1)}s)`);
        
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
        addLog(`Scene ${i + 1} recorded successfully`);
      }
      
      // Stop recording
      mediaRecorder.stop();
      
      addLog("Finalizing video export...");
      
      // Wait for final recording data
      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => {
          const finalBlob = new Blob(recordedChunks, { type: mimeType });
          setExportedVideoBlob(finalBlob);
          resolve();
        };
      });
      setIsExporting(false);
      setExportCompleted(true);
      setExportProgress(100);
      addLog("Export completed successfully!");
      toast.success("Video exported successfully!");
      
      // Lägg till: Hämta senaste exportvärde från backend
      await checkSubscription();
      
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
    a.download = `${videoFile.name.split('.')[0]}_exported.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Video download started!");
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Video Processing</h1>
          <p className="text-muted-foreground">
            File: {videoFile.name} • Size: {(videoFile.size / 1024 / 1024).toFixed(1)}MB
          </p>
        </div>
        <Button variant="outline" onClick={onReset}>
          Upload New Video
        </Button>
      </div>

      {/* Progress Steps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            Processing Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            {[
              { key: 'upload', label: 'Upload', icon: '📁' },
              { key: 'analyze', label: 'Analyze', icon: '🔍' },
              { key: 'filter', label: 'Filter', icon: '🎯' },
              { key: 'shuffle', label: 'Shuffle', icon: '🔀' },
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
                Analyzing video for scene changes... {analysisProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Preview */}
          <VideoPreview ref={videoPreviewRef} videoUrl={videoUrl} />

          {/* Scene Detection */}
          {currentStep === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle>Start Scene Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Click below to start analyzing your video for scene changes. 
                  This process will identify cuts and transitions automatically.
                </p>
                <Button variant="hero" size="lg" onClick={startAnalysis}>
                  Analyze Video for Scenes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Scene Detection Component */}
          {(isAnalyzing || scenes.length > 0) && (
            <SceneDetector
              videoUrl={videoUrl}
              onScenesDetected={handleScenesDetected}
              isAnalyzing={isAnalyzing}
              segmentLength={segmentLength}
            />
          )}

          {/* Scene Timeline */}
          {scenes.length > 0 && (
            <SceneTimeline 
              scenes={currentStep === 'filter' || currentStep === 'shuffle' ? filteredScenes : scenes}
              videoUrl={videoUrl}
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

          {/* Filter Controls */}
          {scenes.length > 0 && (
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Filters out clips shorter than this after trimming
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Segment Length: {segmentLength}s
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="300"
                    step="30"
                    value={segmentLength}
                    onChange={(e) => setSegmentLength(Number(e.target.value))}
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

          {/* Shuffle Controls */}
          {filteredScenes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Scene Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>• {scenes.length} total scenes detected</p>
                  <p>• {filteredScenes.length} scenes after filtering</p>
                </div>
                
                <Button variant="hero" onClick={shuffleScenes} className="w-full">
                  Shuffle Scenes
                </Button>
                
                <Button variant="outline" onClick={previewFinalVideo} className="w-full">
                  Preview Final Video
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
                
                <Button variant="premium" onClick={() => {
                  console.log('EXPORT BUTTON CLICKED!');
                  exportVideo();
                }} className="w-full">
                  Export Video
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          {scenes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Processing Stats</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Total Scenes:</span>
                  <span className="font-medium">{scenes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Filtered Scenes:</span>
                  <span className="font-medium">{filteredScenes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Segments:</span>
                  <span className="font-medium">
                    {Math.max(...scenes.map(s => s.segment)) + 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Scene Duration:</span>
                  <span className="font-medium">
                    {scenes.length > 0 ? 
                      (scenes.reduce((acc, s) => acc + s.duration, 0) / scenes.length).toFixed(1)
                      : 0}s
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exporting Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Processing {filteredScenes.length} scenes...</p>
              <p>Applying trim settings: Start {trimStart.toFixed(1)}s, End {trimEnd.toFixed(1)}s</p>
            </div>
            
            {isExporting && (
              <div className="space-y-2">
                <Progress value={exportProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {exportProgress.toFixed(0)}% complete
                </p>
                
                {/* Export Logs */}
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

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md p-0 overflow-visible">
          <div className="relative rounded-2xl border-2 border-primary/20 shadow-glow bg-gradient-to-br from-card via-card to-primary/5 overflow-visible pt-8">
            {/* Limited offer badge */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold animate-pulse">
                🔥 Limited Time Offer
              </div>
            </div>
            <div className="text-center pt-8 pb-4 px-6">
              <div className="mb-4 flex flex-col items-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold mb-2">
                  ⚠️ You have used all your free credits
                </span>
                <span className="text-sm text-muted-foreground">To continue exporting, please upgrade to Pro.</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Upgrade to Pro</h2>
              <p className="text-lg text-muted-foreground mb-4">Unlock unlimited exports and all premium features</p>
              <div className="space-y-2 mb-4">
                <div className="text-2xl text-muted-foreground line-through">$34.99/month</div>
                <div className="text-5xl font-bold text-red-500">$12.99<span className="text-xl text-muted-foreground font-normal">/month</span></div>
                <div className="text-sm font-semibold text-red-500">Save 63% - Limited Time Only!</div>
              </div>
              <div className="text-sm text-muted-foreground mb-6">Billed monthly • Cancel anytime</div>
              <ul className="text-left text-base space-y-2 mb-6 max-w-xs mx-auto">
                <li className="flex items-center gap-2"><span className="text-primary">•</span> Unlimited video uploads</li>
                <li className="flex items-center gap-2"><span className="text-primary">•</span> AI-powered scene detection</li>
                <li className="flex items-center gap-2"><span className="text-primary">•</span> Smart duration filtering</li>
                <li className="flex items-center gap-2"><span className="text-primary">•</span> Intelligent scene shuffling</li>
                <li className="flex items-center gap-2"><span className="text-primary">•</span> Real-time preview</li>
                <li className="flex items-center gap-2"><span className="text-primary">•</span> HD video export</li>
                <li className="flex items-center gap-2"><span className="text-primary">•</span> Priority support</li>
                <li className="flex items-center gap-2"><span className="text-primary">•</span> No watermarks</li>
              </ul>
              <a href="/app#pricing" className="block">
                <button className="w-full bg-gradient-primary text-white text-lg font-bold py-4 rounded-xl shadow transition hover:opacity-90">Upgrade Now</button>
              </a>
              <p className="text-center text-xs text-muted-foreground mt-4">Secure payment • Instant access</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoProcessor;
