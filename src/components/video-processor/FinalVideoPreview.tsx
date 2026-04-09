import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square } from "lucide-react";
import { useCoreContext } from "@/contexts/VideoProcessorContext";

export default function FinalVideoPreview() {
  const { videoUrls, getSelectedShuffledScenes, getScenesWithinDuration, maxVideoDuration } = useCoreContext();
  const primaryVideoUrl = videoUrls[0];

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();
  const isPlayingRef = useRef(false);
  const seekedHandlerRef = useRef<(() => void) | null>(null);

  const previewScenes = getScenesWithinDuration(getSelectedShuffledScenes(), maxVideoDuration);

  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = undefined; }
    if (transitionTimeoutRef.current) { clearTimeout(transitionTimeoutRef.current); transitionTimeoutRef.current = undefined; }
  }, []);

  const removeSeekedListener = useCallback(() => {
    if (seekedHandlerRef.current && videoRef.current) {
      videoRef.current.removeEventListener('seeked', seekedHandlerRef.current);
      seekedHandlerRef.current = null;
    }
  }, []);

  const playScene = useCallback((sceneIndex: number, scenesSnapshot: typeof previewScenes) => {
    if (!videoRef.current || sceneIndex >= scenesSnapshot.length || !isPlayingRef.current) return;

    // Clean up any pending listeners/timeouts from previous scene
    clearAllTimeouts();
    removeSeekedListener();

    const scene = scenesSnapshot[sceneIndex];
    const video = videoRef.current;
    const videoIndex = scene.videoIndex || 0;
    const currentVideoUrl = videoUrls[videoIndex];

    const seekToStart = () => {
      if (!videoRef.current || !isPlayingRef.current) return;
      videoRef.current.currentTime = scene.startTime;
    };

    // Switch video source if needed, wait for it to load before seeking
    if (!video.src.endsWith(new URL(currentVideoUrl, window.location.href).pathname) && video.src !== currentVideoUrl) {
      video.pause();
      const handleLoaded = () => {
        video.removeEventListener('loadeddata', handleLoaded);
        seekToStart();
      };
      video.addEventListener('loadeddata', handleLoaded);
      video.src = currentVideoUrl;
    } else {
      seekToStart();
    }

    const handleSeeked = () => {
      removeSeekedListener();
      if (!isPlayingRef.current || !videoRef.current) return;
      videoRef.current.play().catch(console.error);

      // Use timeupdate to detect scene end instead of setTimeout for accuracy
      const handleTimeUpdate = () => {
        if (!videoRef.current || !isPlayingRef.current) {
          videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
          return;
        }
        if (videoRef.current.currentTime >= scene.startTime + scene.duration) {
          videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          videoRef.current.pause();
          const nextIndex = sceneIndex + 1;
          if (nextIndex < scenesSnapshot.length) {
            setCurrentSceneIndex(nextIndex);
            transitionTimeoutRef.current = setTimeout(() => playScene(nextIndex, scenesSnapshot), 100);
          } else {
            setIsPlaying(false);
            isPlayingRef.current = false;
            setCurrentSceneIndex(0);
          }
        }
      };
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
    };

    seekedHandlerRef.current = handleSeeked;
    video.addEventListener('seeked', handleSeeked);
  }, [videoUrls, clearAllTimeouts, removeSeekedListener]);

  const startPreview = () => {
    const scenesSnapshot = [...previewScenes];
    setIsPlaying(true);
    isPlayingRef.current = true;
    setCurrentSceneIndex(0);
    transitionTimeoutRef.current = setTimeout(() => playScene(0, scenesSnapshot), 100);
  };

  const stopPreview = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    clearAllTimeouts();
    removeSeekedListener();
    if (videoRef.current) videoRef.current.pause();
    setCurrentSceneIndex(0);
  }, [clearAllTimeouts, removeSeekedListener]);

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      clearAllTimeouts();
      removeSeekedListener();
      if (videoRef.current) videoRef.current.pause();
    };
  }, [clearAllTimeouts, removeSeekedListener]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Final Video Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={primaryVideoUrl}
              className="w-full max-h-64 object-contain"
              muted
              controls={false}
              onError={(e) => {
                console.log('Preview video load error (this is normal during cleanup):', e);
              }}
            />
            {isPlaying && (
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                Scene {currentSceneIndex + 1} of {previewScenes.length}
              </div>
            )}
            {previewScenes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-white text-center">
                  <p className="text-lg font-medium">No scenes selected</p>
                  <p className="text-sm text-gray-300">Select scenes below to preview</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              onClick={startPreview}
              disabled={isPlaying || previewScenes.length === 0}
              variant="outline"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Preview Final Video ({previewScenes.length} scenes)
            </Button>
            <Button
              onClick={stopPreview}
              disabled={!isPlaying}
              variant="outline"
              size="sm"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Preview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
