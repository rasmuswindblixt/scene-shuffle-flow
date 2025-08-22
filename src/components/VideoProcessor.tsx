import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shuffle, Download, Play, Square, Film, CheckSquare, Square as SquareIcon, AlertCircle, FileVideo } from "lucide-react";
import SceneDetector from "@/components/SceneDetector";
import VideoPreview, { VideoPreviewRef } from "@/components/VideoPreview";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Scene } from "@/types/scene";

interface VideoProcessorProps {
  videoFiles: File[];
  videoUrls: string[];
  onReset: () => void;
}

const VideoProcessor = ({ videoFiles, videoUrls, onReset }: VideoProcessorProps) => {
  const { subscribed, updateFreeExportsUsed, user } = useAuth();
  const videoPreviewRef = useRef<VideoPreviewRef>(null);
  
  // For now, work with first video while building multi-video support
  const primaryVideoFile = videoFiles[0];
  const primaryVideoUrl = videoUrls[0];
  
  // Core state - dramatically simplified
  const [currentStep, setCurrentStep] = useState<'analyze' | 'results' | 'export'>('analyze');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [shuffledScenes, setShuffledScenes] = useState<Scene[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportedVideoBlob, setExportedVideoBlob] = useState<Blob | null>(null);
  const [exportLogs, setExportLogs] = useState<string[]>([]);
  const [originalVideoDuration, setOriginalVideoDuration] = useState<number>(0);
  const [maxVideoDuration, setMaxVideoDuration] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<'mp4' | 'webm'>('mp4');

  // Check supported formats on component mount
  useEffect(() => {
    const checkFormats = () => {
      const formats = [
        'video/mp4',
        'video/mp4;codecs=h264',
        'video/mp4;codecs=avc1.42E01E',
        'video/webm',
        'video/webm;codecs=vp8',
        'video/webm;codecs=vp9'
      ];
      
      console.log('🎥 Supported video formats:');
      formats.forEach(format => {
        const supported = MediaRecorder.isTypeSupported(format);
        console.log(`  ${format}: ${supported ? '✅' : '❌'}`);
      });
    };
    
    checkFormats();
  }, []);

  // Auto-start analysis when component mounts
  useEffect(() => {
    // Reset multi-video analysis state
    setCurrentVideoIndex(0);
    setAllVideoScenes([]);
    setIsAnalyzing(true);
    toast.info("Starting enhanced scene detection...");
    
    // Get total duration from all videos
    let totalDuration = 0;
    const promises = videoUrls.map((url, index) => {
    const video = document.createElement('video');
      video.src = url;
      return new Promise<number>((resolve, reject) => {
        video.onloadedmetadata = () => {
          resolve(video.duration);
        };
        video.onerror = (error) => {
          console.log(`Duration check error for video ${index + 1} (this is normal during cleanup):`, error);
          resolve(0); // Return 0 duration on error instead of rejecting
        };
      });
    });
    
    Promise.all(promises).then(durations => {
      totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
      setOriginalVideoDuration(totalDuration);
    });
  }, []);

  // Calculate extraction percentage
  const getExtractionPercentage = () => {
    if (originalVideoDuration === 0) return 0;
    const extractedDuration = getTotalDuration();
    return (extractedDuration / originalVideoDuration) * 100;
  };

  const addLog = (message: string) => {
    setExportLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Get scenes within the max duration limit
  const getScenesWithinDuration = (scenes: Scene[], maxDuration: number): Scene[] => {
    const result: Scene[] = [];
    let totalDuration = 0;
    
    for (const scene of scenes) {
      if (totalDuration + scene.duration <= maxDuration) {
        result.push(scene);
        totalDuration += scene.duration;
      } else {
        break;
      }
    }
    
    return result;
  };

  // Calculate total duration of selected scenes within max duration limit
  const getTotalDuration = () => {
    const selectedScenes = getSelectedShuffledScenes();
    const scenesWithinLimit = getScenesWithinDuration(selectedScenes, maxVideoDuration);
    return scenesWithinLimit.reduce((total, scene) => total + scene.duration, 0);
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Scene selection handlers
  const toggleSceneSelection = (sceneId: string) => {
    setScenes(prevScenes => 
      prevScenes.map(scene => 
        scene.id === sceneId 
          ? { ...scene, selected: !scene.selected }
          : scene
      )
    );
    
    // Update shuffled scenes as well
    setShuffledScenes(prevShuffled => 
      prevShuffled.map(scene => 
        scene.id === sceneId 
          ? { ...scene, selected: !scene.selected }
          : scene
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = scenes.every(scene => scene.selected);
    const newSelectedState = !allSelected;
    
    setScenes(prevScenes => 
      prevScenes.map(scene => ({ ...scene, selected: newSelectedState }))
    );
    
    setShuffledScenes(prevShuffled => 
      prevShuffled.map(scene => ({ ...scene, selected: newSelectedState }))
    );
  };

  const getSelectedScenes = () => scenes.filter(scene => scene.selected);
  const getSelectedShuffledScenes = () => shuffledScenes.filter(scene => scene.selected);

  // State for multi-video analysis
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [allVideoScenes, setAllVideoScenes] = useState<Scene[][]>([]);

  const handleScenesDetected = (detectedScenes: Scene[]) => {
    console.log(`Video ${currentVideoIndex + 1} scenes detected:`, detectedScenes.length);
    
    // Add video identifier to scenes
    const videoScenes = detectedScenes.map(scene => ({
      ...scene,
      id: `video${currentVideoIndex + 1}_${scene.id}`,
      videoIndex: currentVideoIndex
    }));
    
    // Store scenes for current video
    const newAllVideoScenes = [...allVideoScenes];
    newAllVideoScenes[currentVideoIndex] = videoScenes;
    setAllVideoScenes(newAllVideoScenes);
    
    // Check if we need to analyze more videos
    if (currentVideoIndex < videoFiles.length - 1) {
      // Move to next video
      setCurrentVideoIndex(currentVideoIndex + 1);
      return; // SceneDetector will be re-rendered with new video
    }
    
    // All videos analyzed, now process all scenes together
    const allScenes = newAllVideoScenes.flat();
    console.log("Total raw scenes from all videos:", allScenes.length);
    
    // Filter scenes to 1.8-7.7 seconds (will be trimmed by 0.8s total to get 1-6.9s final clips)
    const filtered = allScenes.filter(scene => 
      scene.duration >= 1.8 && scene.duration <= 7.7
    );
    
    // Trim 0.4s from start and end of each scene to avoid transitions
    const initialTrimmedScenes = filtered.map(scene => ({
      ...scene,
      startTime: scene.startTime + 0.4,
      duration: scene.duration - 0.8,
      id: scene.id + '_trimmed',
      selected: true // All scenes selected by default
    }));

    // Further trim scenes longer than 6.9s by cutting equal amounts from start and end
    let scenesMaxTrimmed = 0;
    const finalTrimmedScenes = initialTrimmedScenes.map(scene => {
      if (scene.duration > 6.9) {
        const excess = scene.duration - 6.9;
        const trimPerSide = excess / 2;
        scenesMaxTrimmed++;
        
        return {
          ...scene,
          startTime: scene.startTime + trimPerSide,
          duration: 6.9,
          id: scene.id + '_maxTrimmed'
        };
      }
      return scene;
    });
    
    console.log("Filtered scenes (1.8-7.7s):", filtered.length);
    console.log("Initial trimmed scenes:", initialTrimmedScenes.length);
    console.log("Scenes additionally trimmed to 6.9s max:", scenesMaxTrimmed);
    console.log("Final trimmed scenes (max 6.9s):", finalTrimmedScenes.length);
    
    if (finalTrimmedScenes.length === 0) {
      toast.error("No scenes found that can be trimmed to 1-6.9 seconds. Try different videos.");
      setIsAnalyzing(false);
      return;
    }

    // Shuffle all scenes
    const shuffled = shuffleWithConstraints(finalTrimmedScenes);
    
    setScenes(finalTrimmedScenes);
    setShuffledScenes(shuffled);
    setIsAnalyzing(false);
    setCurrentStep('results');
    
    const totalDuration = finalTrimmedScenes.reduce((sum, scene) => sum + scene.duration, 0);
    // Set max duration to total duration initially
    setMaxVideoDuration(totalDuration);
    
    const videoText = videoFiles.length > 1 ? `${videoFiles.length} videos mixed` : 'video';
    toast.success(`Found ${finalTrimmedScenes.length} scenes from ${videoText} • Final video: ${formatDuration(totalDuration)}`);
  };

  // Smart shuffle algorithm that prevents adjacent original sequences AND mixes videos evenly
  const shuffleWithConstraints = (scenes: Scene[]): Scene[] => {
    if (scenes.length <= 1) return scenes;
    
    // First, create a truly mixed shuffle that interleaves videos
    let shuffled = createMixedShuffle(scenes);
    let attempts = 0;
    const maxAttempts = 100;
    
    // Then apply the original constraint (no adjacent original sequences)
    do {
      if (attempts > 0) {
        shuffled = createMixedShuffle(scenes);
      }
      attempts++;
    } while (hasAdjacentOriginalOrder(shuffled, scenes) && attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      console.warn("Could not find perfect shuffle with constraints, using best mixed attempt");
    }
    
    console.log("Final shuffle video distribution:", getVideoDistribution(shuffled));
    return shuffled;
  };

  // Create a shuffle that properly mixes videos instead of clumping them
  const createMixedShuffle = (scenes: Scene[]): Scene[] => {
    // Group scenes by video
    const videoGroups: { [key: number]: Scene[] } = {};
    scenes.forEach(scene => {
      const videoIndex = scene.videoIndex || 0;
      if (!videoGroups[videoIndex]) {
        videoGroups[videoIndex] = [];
      }
      videoGroups[videoIndex].push(scene);
    });
    
    // Shuffle each video's scenes internally
    const shuffledGroups = Object.values(videoGroups).map(group => 
      group.sort(() => Math.random() - 0.5)
    );
    
    // Interleave scenes from different videos
    const result: Scene[] = [];
    const maxLength = Math.max(...shuffledGroups.map(group => group.length));
    
    for (let i = 0; i < maxLength; i++) {
      // Randomly order the videos for this round
      const videoOrder = Object.keys(videoGroups)
        .map(Number)
        .sort(() => Math.random() - 0.5);
      
      for (const videoIndex of videoOrder) {
        const group = shuffledGroups[videoIndex];
        if (i < group.length) {
          result.push(group[i]);
        }
      }
    }
    
    return result;
  };

  // Helper function to see video distribution in shuffle
  const getVideoDistribution = (scenes: Scene[]): string => {
    const distribution = scenes.map(scene => `V${(scene.videoIndex || 0) + 1}`).join(' ');
    const counts = scenes.reduce((acc, scene) => {
      const key = `Video ${(scene.videoIndex || 0) + 1}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return `${JSON.stringify(counts)} | Pattern: ${distribution.substring(0, 50)}${distribution.length > 50 ? '...' : ''}`;
  };

  // Get video mixing statistics for UI display
  const getVideoMixingStats = (scenes: Scene[]): string => {
    const counts = scenes.reduce((acc, scene) => {
      const videoIndex = scene.videoIndex || 0;
      acc[videoIndex] = (acc[videoIndex] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });

    const videoLabels = Object.keys(counts).map(key => {
      const index = parseInt(key);
      const filename = videoFiles[index]?.name.split('.')[0] || `Video ${index + 1}`;
      return `${filename}: ${counts[index]} clips`;
    });

    return `Mixed from ${videoLabels.join(' • ')}`;
  };

  // Check if shuffled array has any adjacent scenes that were adjacent in original
  const hasAdjacentOriginalOrder = (shuffled: Scene[], original: Scene[]): boolean => {
    for (let i = 0; i < shuffled.length - 1; i++) {
      const currentIndex = original.findIndex(s => s.id === shuffled[i].id);
      const nextIndex = original.findIndex(s => s.id === shuffled[i + 1].id);
      
      // Check if they were adjacent in original order
      if (Math.abs(currentIndex - nextIndex) === 1) {
        return true;
      }
    }
    return false;
  };

  // This function is no longer needed as scenes have thumbnails from SceneDetector
  // Keeping it for potential future use
  const generateThumbnails = async (scenes: Scene[]): Promise<string[]> => {
    try {
      const video = document.createElement('video');
      video.src = primaryVideoUrl;
      video.muted = true;
      video.preload = 'metadata';
      
      // Wait for video to load
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = (error) => {
          console.log('Thumbnail generation video load error (this is normal during cleanup):', error);
          reject(error);
        };
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 160;
      canvas.height = 90;
      
      const thumbnails: string[] = [];
      
      for (const scene of scenes) {
        // Seek to middle of scene for thumbnail
        const middleTime = scene.startTime + (scene.duration / 2);
        video.currentTime = middleTime;
        
        await new Promise((resolve) => {
          video.onseeked = resolve;
        });
        
        // Draw frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        thumbnails.push(dataUrl);
      }
      
      return thumbnails;
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      return [];
    }
  };

  const reshuffleScenes = () => {
    // Only shuffle selected scenes
    const selectedScenes = getSelectedShuffledScenes();
    
    if (selectedScenes.length === 0) {
      toast.error("No scenes selected for shuffling!");
      return;
    }

    if (selectedScenes.length === 1) {
      toast.info("Only one scene selected - nothing to shuffle!");
      return;
    }
    
    const newShuffle = shuffleWithConstraints(selectedScenes);
    setShuffledScenes(newShuffle);
    
    toast.success(`${selectedScenes.length} selected scenes reshuffled!`);
  };

  const drawCredit = async (user: any) => {
    if (subscribed) {
      toast.success("Export started!");
      return;
    }

    try {
      // Get or create subscriber record
      let { data: subscriber, error: selectError } = await supabase
        .from("subscribers")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (selectError) {
        console.error('Error fetching subscriber:', selectError);
        toast.error("Failed to update export count");
        return;
      }

      // Create subscriber if doesn't exist
      if (!subscriber) {
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
          console.error('Error creating subscriber:', insertError);
          toast.error("Failed to track export usage");
          return;
        }
        
        updateFreeExportsUsed(1);
        toast.success("Export started!");
      } else {
        // Increment export count
        const { data: updatedSubscriber, error: updateError } = await supabase
          .from("subscribers")
          .update({
            free_exports_used: subscriber.free_exports_used + 1,
          })
          .eq("email", user.email)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating subscriber:', updateError);
          toast.error("Failed to track export usage");
          return;
        }
        
        updateFreeExportsUsed(updatedSubscriber.free_exports_used);
        toast.success("Export started!");
      }
    } catch (error) {
      console.error('Error drawing credit:', error);
      toast.error("Failed to track export usage");
    }
  };

  const exportVideo = async () => {
    const selectedScenes = getSelectedShuffledScenes();
    const scenesToExport = getScenesWithinDuration(selectedScenes, maxVideoDuration);
    
    if (selectedScenes.length === 0) {
      toast.error("No scenes selected for export. Please select at least one scene.");
      return;
    }
    
    if (scenesToExport.length === 0) {
      toast.error("No selected scenes fit within the duration limit");
      return;
    }

    // Check authentication using auth context (handles both real users and test users)
    if (!user) {
      toast.error("Please sign in to export videos");
      return;
    }

    setShowExportDialog(true);
    setIsExporting(true);
    setExportProgress(0);
    setExportLogs([]);
    
    await drawCredit(user);
    
    try {
      addLog("Starting video export...");
      
      // Create video element for processing with error handling
      const videoElement = document.createElement('video');
      videoElement.src = primaryVideoUrl;
      videoElement.muted = true;
      videoElement.preload = 'metadata';
      videoElement.onerror = (error) => {
        console.log('Primary video load error (this is normal during cleanup):', error);
      };
      
      addLog("Loading video metadata...");
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = resolve;
        videoElement.onerror = reject;
      });
      
      setExportProgress(10);
      addLog("Video metadata loaded successfully");
      
      // Create canvas for recording - fixed 720p as per requirements
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 1280;
      canvas.height = 720;
      
      // Process selected scenes within duration limit sequentially
      // Note: scenesToExport is already defined at the top of this function with selected scenes
      
      addLog(`Starting recording of ${scenesToExport.length} scenes (within ${formatDuration(maxVideoDuration)} limit)...`);
      
      // Set up MediaRecorder with user-selected format and high quality
      const stream = canvas.captureStream(60); // Increased to 60fps for smoother video
      let mediaRecorder: MediaRecorder;
      
      addLog(`Setting up video recording in ${exportFormat.toUpperCase()} format...`);
      
      if (exportFormat === 'mp4') {
        // User selected MP4 format - try different MP4 options
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
          mediaRecorder = new MediaRecorder(stream, { 
            mimeType: 'video/mp4;codecs=h264',
            videoBitsPerSecond: 8000000 // 8 Mbps for high quality
          });
          addLog('Using MP4 format with H.264 codec');
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mediaRecorder = new MediaRecorder(stream, { 
            mimeType: 'video/mp4',
            videoBitsPerSecond: 8000000 // 8 Mbps for high quality
          });
          addLog('Using MP4 format with default codec');
        } else {
          addLog('⚠️ MP4 format not supported by this browser, using WebM instead');
          toast.warning("MP4 not supported in this browser. Using WebM format instead.", {
            duration: 4000,
          });
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            mediaRecorder = new MediaRecorder(stream, { 
              mimeType: 'video/webm;codecs=vp9',
              videoBitsPerSecond: 8000000 // 8 Mbps for high quality
            });
            addLog('Fallback: Using WebM format with VP9 codec');
          } else {
            mediaRecorder = new MediaRecorder(stream, { 
              mimeType: 'video/webm;codecs=vp8',
              videoBitsPerSecond: 5000000 // 5 Mbps fallback
            });
            addLog('Fallback: Using WebM format with VP8 codec');
          }
        }
      } else {
        // User selected WebM format
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mediaRecorder = new MediaRecorder(stream, { 
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 8000000 // 8 Mbps for high quality
          });
          addLog('Using WebM format with VP9 codec');
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          mediaRecorder = new MediaRecorder(stream, { 
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 5000000 // 5 Mbps for VP8
          });
          addLog('Using WebM format with VP8 codec');
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mediaRecorder = new MediaRecorder(stream, { 
            mimeType: 'video/webm',
            videoBitsPerSecond: 5000000 // 5 Mbps default WebM
          });
          addLog('Using WebM format with default codec');
        } else {
          addLog('⚠️ WebM format not supported, falling back to MP4');
          toast.warning("WebM not supported in this browser. Using MP4 format instead.", {
            duration: 4000,
          });
          mediaRecorder = new MediaRecorder(stream, { 
            mimeType: 'video/mp4;codecs=h264',
            videoBitsPerSecond: 8000000 // 8 Mbps fallback
          });
          addLog('Fallback: Using MP4 format with H.264 codec');
        }
      }
      
      const recordedChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Create video elements for all videos with error handling
      const videoElements = videoUrls.map((url, index) => {
        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        video.onerror = (error) => {
          console.log(`Video ${index + 1} load error (this is normal during cleanup):`, error);
        };
        return video;
      });
      
      // Preload all video metadata
      await Promise.all(videoElements.map(video => 
        new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = reject;
        })
      ));
      for (let i = 0; i < scenesToExport.length; i++) {
        const scene = scenesToExport[i];
        const videoIndex = scene.videoIndex || 0;
        const currentVideo = videoElements[videoIndex];
        
        addLog(`Recording scene ${i + 1}/${scenesToExport.length} from video ${videoIndex + 1} (${scene.duration.toFixed(1)}s)`);
        
        // Seek to scene start in the correct video
        currentVideo.currentTime = scene.startTime;
        await new Promise(resolve => {
          currentVideo.onseeked = resolve;
        });
        
        // Play and record this scene
        currentVideo.play();
        
        const sceneEndTime = scene.startTime + scene.duration;
        await new Promise<void>((resolve) => {
          const drawFrame = () => {
            if (currentVideo.currentTime < sceneEndTime && !currentVideo.paused) {
              ctx.drawImage(currentVideo, 0, 0, canvas.width, canvas.height);
              requestAnimationFrame(drawFrame);
            } else {
              currentVideo.pause();
              resolve();
            }
          };
          drawFrame();
        });
        
        const progress = 10 + ((i + 1) / scenesToExport.length) * 80;
        setExportProgress(progress);
      }
      
      // Stop recording
      mediaRecorder.stop();
      
      addLog("Finalizing video export...");
      
      // Wait for final recording data
      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => {
          // Use the same MIME type as the recorder
          const mimeType = mediaRecorder.mimeType || 'video/webm';
          const finalBlob = new Blob(recordedChunks, { type: mimeType });
          setExportedVideoBlob(finalBlob);
          resolve();
        };
      });
      
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
    if (!exportedVideoBlob) {
      toast.error("No exported video available");
      return;
    }
    
    // Determine file extension based on MIME type
    let extension = 'webm';
    if (exportedVideoBlob.type.includes('mp4')) {
      extension = 'mp4';
    } else if (exportedVideoBlob.type.includes('webm')) {
      extension = 'webm';
    }
    
    const url = URL.createObjectURL(exportedVideoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${primaryVideoFile.name.split('.')[0]}_shuffled.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Video download started! (${extension.toUpperCase()} format)`);
  };

  // Final Video Preview Component
  const FinalVideoPreview = () => {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const isPlayingRef = useRef(false);

    // Get scenes that will actually be exported (selected + within duration)
    const previewScenes = getScenesWithinDuration(getSelectedShuffledScenes(), maxVideoDuration);

    const playScene = (sceneIndex: number) => {
      if (!videoRef.current || sceneIndex >= previewScenes.length || !isPlayingRef.current) {
        return;
      }
      
      const scene = previewScenes[sceneIndex];
      const video = videoRef.current;
      const videoIndex = scene.videoIndex || 0;
      
      console.log(`Playing scene ${sceneIndex + 1}/${previewScenes.length} from video ${videoIndex + 1}, duration: ${scene.duration}s`);
      
      // Switch video source if needed
      const currentVideoUrl = videoUrls[videoIndex];
      if (video.src !== currentVideoUrl) {
        video.src = currentVideoUrl;
        // Wait for video to load before seeking
        video.onloadedmetadata = () => {
          video.currentTime = scene.startTime;
        };
      } else {
        video.currentTime = scene.startTime;
      }
      
      // Wait for seek to complete, then play
      const handleSeeked = () => {
        video.removeEventListener('seeked', handleSeeked);
        if (isPlayingRef.current) {
          video.play().catch(console.error);
          
          // Stop at scene end and move to next
          timeoutRef.current = setTimeout(() => {
            if (!isPlayingRef.current) return;
            
            video.pause();
            const nextIndex = sceneIndex + 1;
            
            if (nextIndex < previewScenes.length) {
              setCurrentSceneIndex(nextIndex);
              // Small delay to ensure state update
              setTimeout(() => playScene(nextIndex), 100);
            } else {
              // End of preview
              setIsPlaying(false);
              isPlayingRef.current = false;
              setCurrentSceneIndex(0);
              console.log("Preview completed");
            }
          }, scene.duration * 1000);
        }
      };
      
      video.addEventListener('seeked', handleSeeked);
    };

    const startPreview = () => {
      console.log("Starting preview...");
      setIsPlaying(true);
      isPlayingRef.current = true;
      setCurrentSceneIndex(0);
      
      // Small delay to ensure state updates
      setTimeout(() => playScene(0), 100);
    };

    const stopPreview = () => {
      console.log("Stopping preview...");
      setIsPlaying(false);
      isPlayingRef.current = false;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setCurrentSceneIndex(0);
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
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
    );
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
            {currentStep === 'results' && `${shuffledScenes.length} scenes ready for export • Final video: ${formatDuration(getTotalDuration())}`}
              </p>
            </div>

          {/* Video Preview */}
        <VideoPreview ref={videoPreviewRef} videoUrl={primaryVideoUrl} />

        {/* Analysis Step */}
        {currentStep === 'analyze' && (
          <div className="space-y-6">
            {/* Flirty Message - Always visible during analysis */}
            {isAnalyzing && (
              <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-base text-foreground">It's safe to leave the tab while processing, but don't close it 😉</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Feel free to browse other tabs - your video will keep processing in the background!
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Scene Detection in Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span>Analyzing video for scene changes...</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Enhanced detection analyzes every 0.5s with improved sensitivity to find more scenes.<br/>
                      Scenes are filtered to 1.8-7.7s, trimmed by 0.8s (transitions removed), then capped at 6.9s max.
                    </p>
                  </div>
                ) : (
                  <p className="text-center">Analysis complete!</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

          {/* Scene Detection Component */}
        {isAnalyzing && (
            <SceneDetector
          videoUrl={videoUrls[currentVideoIndex]}
              onScenesDetected={handleScenesDetected}
          isAnalyzing={true}
          segmentLength={120}
          frameInterval={0.5}
          delayMs={25}
          key={`scene-detector-${currentVideoIndex}`}
        />
        )}

        {/* Results Step */}
        {currentStep === 'results' && (
          <div className="space-y-6">
            {/* Final Video Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Final Video Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <FinalVideoPreview />
              </CardContent>
            </Card>

            {/* Scene Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Scene Selection & Preview</CardTitle>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {getSelectedShuffledScenes().length} of {shuffledScenes.length} scenes selected
                      {videoFiles.length > 1 && (
                        <>
                          <br />
                          <span className="text-primary font-medium">
                            {getVideoMixingStats(getSelectedShuffledScenes())}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2"
                    >
                      {scenes.every(scene => scene.selected) ? (
                        <>
                          <SquareIcon className="w-4 h-4" />
                          Deselect All
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-4 h-4" />
                          Select All
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-3">
                  {shuffledScenes.map((scene, index) => (
                    <div key={`shuffled-${scene.id}-${index}`} className="relative group">
                      <div 
                        className={`relative rounded-lg border-2 cursor-pointer transition-all ${
                          scene.selected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-300 bg-gray-100 opacity-60'
                        }`}
                        onClick={() => toggleSceneSelection(scene.id)}
                      >
                        <img
                          src={scene.thumbnail}
                          alt={`Scene ${index + 1}`}
                          className={`w-full aspect-video object-cover rounded-lg transition-opacity ${
                            scene.selected ? 'opacity-100' : 'opacity-50'
                          }`}
                        />
                        
                        {/* Selection Checkbox */}
                        <div className="absolute top-1 left-1">
                          <Checkbox
                            checked={scene.selected}
                            onCheckedChange={() => toggleSceneSelection(scene.id)}
                            className="bg-white/90 border-gray-400"
                          />
                        </div>
                        
                        {/* Scene Number */}
                        <div className={`absolute bottom-1 left-1 text-white text-xs px-1 rounded ${
                          scene.selected ? 'bg-primary' : 'bg-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        
                        {/* Video Indicator */}
                        {videoFiles.length > 1 && (
                          <div className="absolute top-1 right-1 bg-secondary text-primary text-xs px-1 rounded font-bold">
                            V{(scene.videoIndex || 0) + 1}
                          </div>
                        )}
                        
                        {/* Hover Info */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="text-white text-xs font-medium text-center">
                            Scene {index + 1}
                            {videoFiles.length > 1 && (
                              <>
                                <br />
                                <span className="text-xs bg-primary/80 px-1 rounded">
                                  Video {(scene.videoIndex || 0) + 1}
                                </span>
                              </>
                            )}
                            <br />
                            {scene.duration.toFixed(1)}s
                            <br />
                            <span className={`text-xs px-1 rounded ${
                              scene.selected ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              {scene.selected ? 'Selected' : 'Deselected'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Max Duration Control */}
            <Card>
              <CardHeader>
                <CardTitle>Video Length Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Max Video Duration</label>
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(maxVideoDuration)} / {formatDuration(getSelectedShuffledScenes().reduce((sum, scene) => sum + scene.duration, 0))}
                    </span>
                  </div>

                  <Slider
                    value={[maxVideoDuration]}
                    onValueChange={(value) => setMaxVideoDuration(value[0])}
                    max={getSelectedShuffledScenes().reduce((sum, scene) => sum + scene.duration, 0)}
                    min={Math.min(60, getSelectedShuffledScenes().reduce((sum, scene) => sum + scene.duration, 0))} // Min 1 minute or total if less
                          step={0.1}
                    className="w-full"
                  />
              
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatDuration(Math.min(60, getSelectedShuffledScenes().reduce((sum, scene) => sum + scene.duration, 0)))}</span>
                    <span>{formatDuration(getSelectedShuffledScenes().reduce((sum, scene) => sum + scene.duration, 0))}</span>
                  </div>

                  {getScenesWithinDuration(getSelectedShuffledScenes(), maxVideoDuration).length < getSelectedShuffledScenes().length && (
                    <div className="text-center text-sm text-muted-foreground bg-card border border-border p-2 rounded">
                      <Film className="w-4 h-4 inline mr-1" />
                      {getSelectedShuffledScenes().length - getScenesWithinDuration(getSelectedShuffledScenes(), maxVideoDuration).length} selected scenes will be excluded to fit duration limit
                    </div>
                  )}
                  </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Export Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Format Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileVideo className="w-4 h-4" />
                    Video Format
                  </label>
                  <Select value={exportFormat} onValueChange={(value: 'mp4' | 'webm') => setExportFormat(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select video format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp4">MP4</SelectItem>
                      <SelectItem value="webm">WebM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center space-y-2">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">
                      {getScenesWithinDuration(getSelectedShuffledScenes(), maxVideoDuration).length} scenes
                    </div>
                    <div className="text-xl font-semibold text-muted-foreground">
                      Final video: {formatDuration(getTotalDuration())}
                    </div>
                <div className="text-sm text-muted-foreground">
                      {getExtractionPercentage().toFixed(1)}% of original video extracted
                      {originalVideoDuration > 0 && (
                        <span className="ml-2">
                          (from {formatDuration(originalVideoDuration)} original)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                                    <Button 
                    variant="outline" 
                    onClick={reshuffleScenes}
                    disabled={getSelectedShuffledScenes().length < 2}
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Reshuffle Selected ({getSelectedShuffledScenes().length})
                  </Button>
                  <Button onClick={exportVideo} size="lg">
                    <Download className="w-4 h-4 mr-2" />
                    Export Video (HD {exportFormat.toUpperCase()})
                </Button>
                </div>
                
                <div className="text-center">
                  <Button variant="ghost" onClick={onReset}>
                    Upload Different Video
                </Button>
                </div>
              </CardContent>
            </Card>
        </div>
        )}

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
              <DialogTitle>Export in Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
                <p>Processing {getScenesWithinDuration(getSelectedShuffledScenes(), maxVideoDuration).length} selected scenes within duration limit...</p>
                <p>Quality: HD 720p (1280x720) • Format: MP4/WebM • Bitrate: 8 Mbps</p>
            </div>
            
            {isExporting && (
              <div className="space-y-2">
                <Progress value={exportProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {exportProgress.toFixed(0)}% complete
                </p>
                </div>
              )}

              {exportedVideoBlob && (
                <div className="space-y-2">
                  <p className="text-sm text-center text-green-600">
                    Export completed successfully!
                  </p>
                  <Button onClick={downloadVideo} className="w-full">
                    Download Shuffled Video
                  </Button>
                </div>
              )}
                
                {/* Export Logs */}
              {exportLogs.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
                  <h4 className="text-sm font-medium mb-2">Processing Logs:</h4>
                  <div className="text-xs space-y-1">
                    {exportLogs.map((log, index) => (
                      <div key={index} className="text-gray-600">
                        {log}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
              </div>
    </div>
  );
};

export default VideoProcessor;
