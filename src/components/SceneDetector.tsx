import { useEffect, useRef, useState } from 'react';
import { Scene } from "@/types/scene";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  SCENE_DIFFERENCE_THRESHOLD, SCENE_DETECTION_BATCH_SIZE,
  SCENE_MIN_DETECTION_DURATION, SCENE_FRAME_INTERVAL, SCENE_DETECTION_DELAY_MS,
} from "@/lib/constants";

interface SceneDetectorProps {
  videoUrl: string;
  onScenesDetected: (scenes: Scene[]) => void;
  isAnalyzing: boolean;
}

const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 90;

const SceneDetector = ({ videoUrl, onScenesDetected, isAnalyzing }: SceneDetectorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thumbnailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Reuse a single canvas for all thumbnail generation
  const getThumbnailCanvas = () => {
    if (!thumbnailCanvasRef.current) {
      thumbnailCanvasRef.current = document.createElement('canvas');
      thumbnailCanvasRef.current.width = THUMBNAIL_WIDTH;
      thumbnailCanvasRef.current.height = THUMBNAIL_HEIGHT;
    }
    return thumbnailCanvasRef.current;
  };

  const generateThumbnail = async (video: HTMLVideoElement, time: number): Promise<string> => {
    return new Promise((resolve) => {
      const thumbnailCanvas = getThumbnailCanvas();
      const thumbnailCtx = thumbnailCanvas.getContext('2d', { willReadFrequently: true })!;
      
      // Add timeout for thumbnail generation
      const timeoutId = setTimeout(() => {
        video.removeEventListener('seeked', seekHandler);
        // Return a placeholder on timeout
        resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
      }, 2000);
      
      const seekHandler = () => {
        clearTimeout(timeoutId);
        try {
          thumbnailCtx.drawImage(video, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
          const dataUrl = thumbnailCanvas.toDataURL('image/jpeg', 0.7);
          video.removeEventListener('seeked', seekHandler);
          resolve(dataUrl);
        } catch (error) {
          video.removeEventListener('seeked', seekHandler);
          resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        }
      };

      // Check if already at correct time
      if (Math.abs(video.currentTime - time) < 0.1) {
        clearTimeout(timeoutId);
        try {
          thumbnailCtx.drawImage(video, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
          const dataUrl = thumbnailCanvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        } catch (error) {
          resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        }
        return;
      }
      
      video.addEventListener('seeked', seekHandler);
      video.currentTime = time;
    });
  };

  const calculateFrameDifference = (frame1: ImageData, frame2: ImageData): number => {
    if (!frame1 || !frame2 || frame1.data.length !== frame2.data.length) {
      return 1.0;
    }

    let totalDiff = 0;
    const pixels = frame1.data.length / 4;

    for (let i = 0; i < frame1.data.length; i += 4) {
      const r1 = frame1.data[i];
      const g1 = frame1.data[i + 1];
      const b1 = frame1.data[i + 2];
      const r2 = frame2.data[i];
      const g2 = frame2.data[i + 1];
      const b2 = frame2.data[i + 2];

      const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      totalDiff += diff;
    }

    return totalDiff / (pixels * 3 * 255);
  };

  const processBatch = async (
    video: HTMLVideoElement,
    ctx: CanvasRenderingContext2D,
    startTime: number,
    endTime: number,
    lastFrameData: ImageData | null,
    lastSceneStart: number,
    existingScenes: Scene[]
  ) => {
    let scenes = [...existingScenes];
    let currentFrameData = lastFrameData;
    let sceneStart = lastSceneStart;

    for (let time = startTime; time < endTime; time += SCENE_FRAME_INTERVAL) {
      setCurrentTime(time);
      setDetectionProgress((time / video.duration) * 100);

      // Handle potential seeking issues with timeout
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            video.removeEventListener('seeked', seekHandler);
            reject(new Error(`Seek timeout at ${time}s`));
          }, 3000);

          const seekHandler = () => {
            clearTimeout(timeout);
            video.removeEventListener('seeked', seekHandler);
            resolve();
          };

          if (Math.abs(video.currentTime - time) < 0.1) {
            clearTimeout(timeout);
            resolve();
          } else {
            video.addEventListener('seeked', seekHandler);
            video.currentTime = time;
          }
        });
      } catch (error) {
        console.warn(`Skipping frame at ${time}s due to seeking error:`, error);
        continue;
      }

      // Draw frame to canvas
      try {
        ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);
      } catch (error) {
        console.warn(`Error drawing frame at ${time}s:`, error);
        continue;
      }

      const newFrameData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (currentFrameData) {
        const difference = calculateFrameDifference(currentFrameData, newFrameData);

        if (difference > SCENE_DIFFERENCE_THRESHOLD) {
          // Scene change detected
          const sceneDuration = time - sceneStart;

          if (sceneDuration >= SCENE_MIN_DETECTION_DURATION) {
            const thumbnail = await generateThumbnail(video, sceneStart);
            
            scenes.push({
              id: `scene-${scenes.length}`,
              startTime: sceneStart,
              endTime: time,
              duration: sceneDuration,
              difference,
              thumbnail,
              segment: Math.floor(sceneStart / SCENE_DETECTION_BATCH_SIZE)
            });
          }

          sceneStart = time;
        }
      }

      currentFrameData = newFrameData;

      // Add delay to prevent blocking
      if (SCENE_DETECTION_DELAY_MS > 0) {
        await new Promise(resolve => setTimeout(resolve, SCENE_DETECTION_DELAY_MS));
      }
    }

    return { scenes, lastFrameData: currentFrameData, lastSceneStart: sceneStart };
  };

  const startSceneDetection = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Wait for video metadata to load
    await new Promise<void>(resolve => {
      if (video.readyState >= 2) resolve();
      else video.addEventListener('loadedmetadata', () => resolve(), { once: true });
    });

    canvas.width = 320;  // Higher resolution for better scene change detection
    canvas.height = 180;

    let scenes: Scene[] = [];
    let lastFrameData: ImageData | null = null;
    let lastSceneStart = 0;
    const duration = video.duration;

    try {
      console.log(`Starting scene detection for ${duration.toFixed(1)}s video`);
      
      // Process video in small batches
      for (let startTime = 0; startTime < duration; startTime += SCENE_DETECTION_BATCH_SIZE) {
        const endTime = Math.min(startTime + SCENE_DETECTION_BATCH_SIZE, duration);
        
        const result = await processBatch(
          video,
          ctx,
          startTime,
          endTime,
          lastFrameData,
          lastSceneStart,
          scenes
        );
        
        scenes = result.scenes;
        lastFrameData = result.lastFrameData;
        lastSceneStart = result.lastSceneStart;

        // Clear canvas between batches but preserve lastFrameData for cross-batch continuity
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Add final scene
      if (lastSceneStart < duration - SCENE_MIN_DETECTION_DURATION) {
        const finalDuration = duration - lastSceneStart;
        const thumbnail = await generateThumbnail(video, lastSceneStart);
        
        scenes.push({
          id: `scene-${scenes.length}`,
          startTime: lastSceneStart,
          endTime: duration,
          duration: finalDuration,
          difference: 0.5,
          thumbnail,
          segment: Math.floor(lastSceneStart / SCENE_DETECTION_BATCH_SIZE)
        });
      }

      console.log(`Scene detection completed: ${scenes.length} scenes found`);
      
      setDetectionProgress(100);
      onScenesDetected(scenes);
      
    } catch (error) {
      console.error('Scene detection error:', error);
      toast.error(`Scene detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    if (isAnalyzing && videoUrl) {
      startSceneDetection();
    }
  }, [isAnalyzing, videoUrl]);

  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        src={videoUrl}
        className="hidden"
        muted
        preload="metadata"
        onError={(e) => {
          console.log('Scene detector video load error (this is normal during cleanup):', e);
        }}
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>Scene Detection Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={detectionProgress} className="w-full" />
            <div className="text-sm text-muted-foreground text-center">
              {detectionProgress.toFixed(1)}% complete
              {currentTime > 0 && (
                <span className="ml-2">
                  ({Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')})
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SceneDetector;