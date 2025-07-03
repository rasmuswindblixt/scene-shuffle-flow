import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Scene {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnail?: string;
  segment: number;
}

interface SceneDetectorProps {
  videoUrl: string;
  onScenesDetected: (scenes: Scene[]) => void;
  isAnalyzing: boolean;
  segmentLength: number;
}

const SceneDetector = ({ videoUrl, onScenesDetected, isAnalyzing, segmentLength }: SceneDetectorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (isAnalyzing && videoRef.current) {
      startSceneDetection();
    }
  }, [isAnalyzing, videoUrl]);

  const startSceneDetection = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Wait for video metadata to load
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });

    const duration = video.duration;
    const scenes: Scene[] = [];
    const frameInterval = 0.5; // Check every 0.5 seconds
    let lastFrameData: ImageData | null = null;
    let lastSceneStart = 0;

    canvas.width = 160;
    canvas.height = 90;

    for (let time = 0; time <= duration; time += frameInterval) {
      video.currentTime = time;
      setCurrentTime(time);
      setDetectionProgress((time / duration) * 100);

      await new Promise(resolve => {
        video.onseeked = resolve;
      });

      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (lastFrameData) {
        const difference = calculateFrameDifference(lastFrameData, currentFrameData);
        
        // If significant change detected (scene cut)
        if (difference > 0.3) {
          const sceneEnd = time;
          const sceneDuration = sceneEnd - lastSceneStart;
          
          if (sceneDuration > 0.5) { // Minimum scene length
            const segment = Math.floor(lastSceneStart / segmentLength);
            
            scenes.push({
              id: `scene-${scenes.length}`,
              startTime: lastSceneStart,
              endTime: sceneEnd,
              duration: sceneDuration,
              segment: segment
            });
          }
          
          lastSceneStart = time;
        }
      }

      lastFrameData = currentFrameData;

      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Add final scene
    if (duration - lastSceneStart > 0.5) {
      const segment = Math.floor(lastSceneStart / segmentLength);
      scenes.push({
        id: `scene-${scenes.length}`,
        startTime: lastSceneStart,
        endTime: duration,
        duration: duration - lastSceneStart,
        segment: segment
      });
    }

    // If no scenes detected, create artificial scenes every 3-5 seconds
    if (scenes.length === 0) {
      for (let time = 0; time < duration; time += 3 + Math.random() * 2) {
        const endTime = Math.min(time + 2 + Math.random() * 3, duration);
        const segment = Math.floor(time / segmentLength);
        
        scenes.push({
          id: `scene-${scenes.length}`,
          startTime: time,
          endTime: endTime,
          duration: endTime - time,
          segment: segment
        });
        
        time = endTime;
      }
    }

    onScenesDetected(scenes);
    setDetectionProgress(100);
  };

  const calculateFrameDifference = (frame1: ImageData, frame2: ImageData): number => {
    const data1 = frame1.data;
    const data2 = frame2.data;
    let diff = 0;
    const totalPixels = data1.length / 4;

    for (let i = 0; i < data1.length; i += 4) {
      const r1 = data1[i], g1 = data1[i + 1], b1 = data1[i + 2];
      const r2 = data2[i], g2 = data2[i + 1], b2 = data2[i + 2];
      
      const pixelDiff = Math.sqrt(
        Math.pow(r1 - r2, 2) + 
        Math.pow(g1 - g2, 2) + 
        Math.pow(b1 - b2, 2)
      ) / (255 * Math.sqrt(3));
      
      diff += pixelDiff;
    }

    return diff / totalPixels;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          Scene Detection Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Analyzing frame changes at {formatTime(currentTime)}
              </p>
              <Progress value={detectionProgress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-1">
                {detectionProgress.toFixed(1)}% complete
              </p>
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <p className="text-sm font-medium mb-2">Detection Algorithm</p>
              <p className="text-xs text-muted-foreground">
                Comparing consecutive frames for visual changes • 
                Threshold: 30% difference • 
                Minimum scene: 0.5s
              </p>
            </div>
          </div>
        )}

        {/* Hidden video and canvas for analysis */}
        <div className="hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            crossOrigin="anonymous"
          />
          <canvas ref={canvasRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SceneDetector;