import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  RotateCcw,
  Scissors,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { usePageVisibility } from '@/hooks/usePageVisibility';

interface VideoProcessorProps {
  videoFiles: File[];
  videoUrls: string[];
  onReset: () => void;
}

interface Scene {
  start: number;
  end: number;
  duration: number;
  url: string;
  originalIndex: number;
}

const VideoProcessor = ({ videoFiles, videoUrls, onReset }: VideoProcessorProps) => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [minDuration, setMinDuration] = useState<number>(1);
  const [maxDuration, setMaxDuration] = useState<number>(6.9);
  const [shuffle, setShuffle] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoFormat, setVideoFormat] = useState<"mp4" | "webm">("mp4");
  const [currentStep, setCurrentStep] = useState<"analyze" | "process" | "download">("analyze");
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState<boolean>(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const [isDownloadComplete, setIsDownloadComplete] = useState<boolean>(false);
  const { user, subscribed } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPageVisible = usePageVisibility();

  // Function to format time in seconds to HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  // Function to calculate total duration of scenes
  const calculateTotalDuration = (): number => {
    return scenes.reduce((acc, scene) => acc + scene.duration, 0);
  };

  // Function to handle scene analysis
  const handleAnalyze = useCallback(async () => {
    if (!videoFiles || videoFiles.length === 0) {
      toast({
        title: "No videos uploaded",
        description: "Please upload videos to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setScenes([]);
    setProgress(0);
    setCurrentStep("analyze");

    const allScenes: Scene[] = [];

    for (let videoIndex = 0; videoIndex < videoFiles.length; videoIndex++) {
      const videoFile = videoFiles[videoIndex];
      const videoUrl = videoUrls[videoIndex];
      const tempVideo = document.createElement('video');
      tempVideo.src = videoUrl;

      await new Promise<void>((resolve, reject) => {
        tempVideo.onloadedmetadata = async () => {
          const duration = tempVideo.duration;
          const interval = 0.5; // Check every 0.5 seconds
          let currentTime = 0;
          let sceneStart = 0;
          let lastFrameData: string | null = null;

          while (currentTime < duration) {
            tempVideo.currentTime = currentTime;

            await new Promise<void>((resolveFrame) => {
              tempVideo.onseeked = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = tempVideo.videoWidth;
                canvas.height = tempVideo.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                const frameData = canvas.toDataURL('image/jpeg', 0.8);

                if (lastFrameData) {
                  const diff = compareImages(lastFrameData, frameData);
                  if (diff > 0.02) {
                    const sceneEnd = currentTime;
                    const sceneDuration = sceneEnd - sceneStart;

                    if (sceneDuration >= minDuration && sceneDuration <= maxDuration) {
                      allScenes.push({
                        start: sceneStart,
                        end: sceneEnd,
                        duration: sceneDuration,
                        url: videoUrl,
                        originalIndex: videoIndex,
                      });
                    }
                    sceneStart = currentTime;
                  }
                }
                lastFrameData = frameData;
                resolveFrame();
              };
            });

            currentTime += interval;
            const overallProgress = ((videoIndex / videoFiles.length) + (currentTime / duration) / videoFiles.length) * 100;
            setProgress(overallProgress);
          }

          // Add last scene if it meets criteria
          if (sceneStart < duration) {
            const sceneDuration = duration - sceneStart;
            if (sceneDuration >= minDuration && sceneDuration <= maxDuration) {
              allScenes.push({
                start: sceneStart,
                end: duration,
                duration: sceneDuration,
                url: videoUrl,
                originalIndex: videoIndex,
              });
            }
          }
          resolve();
        };

        tempVideo.onerror = (error) => {
          console.error("Error loading video metadata:", error);
          reject("Error loading video metadata.");
        };
      });
    }

    if (shuffle) {
      // Fisher-Yates shuffle algorithm
      for (let i = allScenes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allScenes[i], allScenes[j]] = [allScenes[j], allScenes[i]];
      }
    }

    setScenes(allScenes);
    setIsAnalyzing(false);
    setCurrentStep("process");
    toast.success(`Found ${allScenes.length} scenes!`);
  }, [videoFiles, videoUrls, minDuration, maxDuration, shuffle, toast]);

  // Function to compare two images
  const compareImages = (img1: string, img2: string): number => {
    const data1 = img1.substring(img1.indexOf(',') + 1);
    const data2 = img2.substring(img2.indexOf(',') + 1);

    if (data1.length !== data2.length) {
      return 1; // Different images
    }

    let diff = 0;
    for (let i = 0; i < data1.length; i++) {
      if (data1[i] !== data2[i]) {
        diff++;
      }
    }
    return diff / data1.length;
  };

  // Function to handle video processing and concatenation
  const handleProcess = async () => {
    if (!scenes || scenes.length === 0) {
      toast({
        title: "No scenes to process",
        description: "Please analyze videos first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProgress(0);
    setCurrentStep("process");

    try {
      const videoBlobs: Blob[] = [];
      let currentProgress = 0;

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const videoFile = videoFiles[scene.originalIndex];

        const blob = await getVideoBlob(videoFile, scene.start, scene.end);
        videoBlobs.push(blob);

        currentProgress = ((i + 1) / scenes.length) * 100;
        setProgress(currentProgress);
      }

      // Concatenate video blobs
      const concatenatedBlob = new Blob(videoBlobs, { type: 'video/mp4' });
      const url = URL.createObjectURL(concatenatedBlob);

      setDownloadURL(url);
      setIsProcessing(false);
      setCurrentStep("download");
      toast.success("Video processing complete!");
    } catch (error: any) {
      console.error("Error processing videos:", error);
      setErrorMessage(error.message || "Failed to process videos.");
      setIsProcessing(false);
    }
  };

  // Function to get a video blob for a specific time range
  const getVideoBlob = (videoFile: File, start: number, end: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoFile);
      video.muted = true; // Mute the video to prevent autoplay issues
      video.crossOrigin = "anonymous"; // Enable CORS

      video.addEventListener('loadedmetadata', () => {
        video.currentTime = start;

        video.addEventListener('seeked', async () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Use MediaRecorder to capture the video
          const stream = canvas.captureStream();
          const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9' // force webm for transparency
          });
          const chunks: Blob[] = [];
          recorder.ondataavailable = (event) => chunks.push(event.data);
          recorder.onstop = () => {
            const completeBlob = new Blob(chunks, { type: 'video/webm' });
            resolve(completeBlob);
            URL.revokeObjectURL(video.src); // Clean up the video URL
          };

          recorder.start();
          setTimeout(() => {
            recorder.stop();
            video.remove(); // Clean up the video element
          }, (end - start) * 1000); // Stop after the duration of the clip
        });

        video.addEventListener('error', (error) => {
          console.error("Error during video processing:", error);
          reject(error);
          URL.revokeObjectURL(video.src); // Clean up the video URL
          video.remove(); // Clean up the video element
        });

        video.play().catch(error => {
          console.error("Autoplay prevented:", error);
          reject(error);
          URL.revokeObjectURL(video.src); // Clean up the video URL
          video.remove(); // Clean up the video element
        });
      });
    });
  };

  // Cleanup video URLs when component unmounts
  useEffect(() => {
    return () => {
      // Only cleanup if page is visible or component is actually unmounting
      if (isPageVisible || document.hidden === false) {
        scenes.forEach(scene => {
          if (scene.url && scene.url.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(scene.url);
            } catch (error) {
              console.log('Error revoking scene URL:', error);
            }
          }
        });
      }
    };
  }, [scenes, isPageVisible]);

  // Modified effect to handle page visibility
  useEffect(() => {
    // Don't restart analysis if page was just hidden and is now visible again
    if (!isPageVisible) {
      return;
    }

    if (videoFiles.length > 0 && scenes.length === 0 && !hasStartedAnalysis && currentStep === 'analyze') {
      setHasStartedAnalysis(true);
      handleAnalyze();
    }
  }, [videoFiles, scenes.length, hasStartedAnalysis, currentStep, isPageVisible, handleAnalyze]);

  // Add warning about tab switching during analysis
  const TabSwitchWarning = () => (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-3 text-blue-800 dark:text-blue-200">
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">i</div>
        <div>
          <p className="font-semibold text-base">Tab Switching Protection Active</p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Your analysis will continue even if you switch tabs. Progress is automatically saved.
          </p>
        </div>
      </div>
    </div>
  );

  // Function to handle resetting the state
  const handleResetState = () => {
    // Revoke the download URL if it exists
    if (downloadURL) {
      URL.revokeObjectURL(downloadURL);
      setDownloadURL(null);
    }

    // Reset all state variables to their initial values
    setScenes([]);
    setMinDuration(1);
    setMaxDuration(6.9);
    setShuffle(true);
    setIsAnalyzing(false);
    setIsProcessing(false);
    setProgress(0);
    setErrorMessage(null);
    setVideoFormat("mp4");
    setCurrentStep("analyze");
    setHasStartedAnalysis(false);
    setIsSettingsOpen(false);
    setIsMobileSettingsOpen(false);
    setIsDownloadDialogOpen(false);
    setDownloadProgress(0);
    setDownloadError(null);
    setIsDownloadComplete(false);

    // Call the onReset function passed from the parent component
    onReset();
  };

  // Function to handle initiating the download
  const handleDownload = async () => {
    if (!downloadURL) {
      toast({
        title: "No video to download",
        description: "Please process videos first",
        variant: "destructive",
      });
      return;
    }

    setIsDownloadDialogOpen(true);
    setDownloadError(null);
    setDownloadProgress(0);
    setIsDownloadComplete(false);

    try {
      const response = await fetch(downloadURL);
      const totalBytes = response.headers.get('Content-Length');
      const reader = response.body?.getReader();

      if (!reader || !totalBytes) {
        throw new Error('Failed to start download');
      }

      const totalBytesNumber = parseInt(totalBytes, 10);
      let receivedBytes = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        if (value) {
          chunks.push(value);
          receivedBytes += value.length;
          const progress = Math.round((receivedBytes / totalBytesNumber) * 100);
          setDownloadProgress(progress);
        }
      }

      const completeBlob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(completeBlob);

      // Create a temporary link element and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `clipmixpro_output.${videoFormat}`; // Set the filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url); // Clean up the URL
      setIsDownloadComplete(true);
      toast.success("Download complete!");
    } catch (error: any) {
      console.error("Download error:", error);
      setDownloadError(error.message || "Download failed");
      toast({
        title: "Download failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Video Processor</h2>
          <p className="text-muted-foreground">
            Mix and shuffle video scenes to create engaging content
          </p>
        </div>

        {/* Progress Bar */}
        {(isAnalyzing || isProcessing) && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium">
                  {isAnalyzing ? "Analyzing Videos" : "Processing Videos"}
                </p>
                <span className="text-sm text-muted-foreground">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <Progress value={progress} />
            </CardContent>
          </Card>
        )}

        {/* Analysis Step */}
        {currentStep === 'analyze' && (
          <div className="space-y-6">
            {/* Tab Switch Protection Notice */}
            <TabSwitchWarning />
            
            {/* Warning Message - Always visible during analysis */}
            {isAnalyzing && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4">
                <div className="flex items-center space-x-3 text-yellow-800 dark:text-yellow-200">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">!</div>
                  <div>
                    <p className="font-semibold text-base">Analysis in Progress</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      You can safely switch tabs - your progress will be maintained automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Analysis Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Min Duration Slider */}
                <div className="space-y-2">
                  <Label htmlFor="min-duration">Min. Scene Duration (seconds)</Label>
                  <Slider
                    id="min-duration"
                    min={1}
                    max={6}
                    step={0.1}
                    defaultValue={[minDuration]}
                    onValueChange={(value) => setMinDuration(value[0])}
                  />
                  <p className="text-sm text-muted-foreground">
                    {minDuration.toFixed(1)} seconds
                  </p>
                </div>

                {/* Max Duration Slider */}
                <div className="space-y-2">
                  <Label htmlFor="max-duration">Max. Scene Duration (seconds)</Label>
                  <Slider
                    id="max-duration"
                    min={minDuration}
                    max={7}
                    step={0.1}
                    defaultValue={[maxDuration]}
                    onValueChange={(value) => setMaxDuration(value[0])}
                    disabled={minDuration > 6}
                  />
                  <p className="text-sm text-muted-foreground">
                    {maxDuration.toFixed(1)} seconds
                  </p>
                </div>

                {/* Shuffle Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffle"
                    checked={shuffle}
                    onCheckedChange={(checked) => setShuffle(checked || false)}
                  />
                  <Label htmlFor="shuffle">Shuffle Scenes</Label>
                </div>
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleResetState}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4 mr-2" />
                    Analyze Videos
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Process Step */}
        {currentStep === "process" && (
          <div className="space-y-6">
            {/* Process Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Process Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Format Select */}
                <div className="space-y-2">
                  <Label htmlFor="video-format">Video Format</Label>
                  <Select onValueChange={setVideoFormat} defaultValue={videoFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a video format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp4">MP4</SelectItem>
                      <SelectItem value="webm">WebM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Process Button */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleResetState}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleProcess}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4 mr-2" />
                    Process Videos
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Download Step */}
        {currentStep === "download" && (
          <div className="space-y-6">
            {/* Download Ready Card */}
            <Card>
              <CardHeader>
                <CardTitle>Download Ready</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Your video is ready to download!</p>
                <Button className="w-full" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </Button>
              </CardContent>
            </Card>

            {/* Reset Button */}
            <Button variant="outline" onClick={handleResetState}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  There was an error processing your video.
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Download Dialog */}
        <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Downloading Video</DialogTitle>
              <DialogDescription>
                Please wait while your video is being downloaded.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {downloadError ? (
                <div className="text-red-500">Error: {downloadError}</div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Download Progress</p>
                    <span className="text-sm text-muted-foreground">
                      {downloadProgress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={downloadProgress} />
                </>
              )}
            </div>
            {isDownloadComplete && (
              <div className="flex items-center space-x-2 text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                <p>Download complete!</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VideoProcessor;
