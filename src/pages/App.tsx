import { useState } from "react";
import VideoUpload from "@/components/VideoUpload";
import VideoProcessor from "@/components/VideoProcessor";
import VideoModeSelector from "@/components/VideoModeSelector";
import DualVideoUpload from "@/components/DualVideoUpload";
import DualVideoProcessor from "@/components/DualVideoProcessor";
import Header from "@/components/Header";

const App = () => {
  const [mode, setMode] = useState<'select' | 'single' | 'dual'>('select');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [uploadedVideos, setUploadedVideos] = useState<[File, File] | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoUrls, setVideoUrls] = useState<[string, string] | null>(null);

  const handleModeSelect = (selectedMode: 'single' | 'dual') => {
    setMode(selectedMode);
  };

  const handleSingleVideoUpload = (file: File) => {
    setUploadedVideo(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleDualVideosUpload = (files: [File, File]) => {
    setUploadedVideos(files);
    const urls: [string, string] = [
      URL.createObjectURL(files[0]),
      URL.createObjectURL(files[1])
    ];
    setVideoUrls(urls);
  };

  const handleReset = () => {
    // Clean up object URLs
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (videoUrls) {
      videoUrls.forEach(url => URL.revokeObjectURL(url));
    }
    
    // Reset all state
    setMode('select');
    setUploadedVideo(null);
    setUploadedVideos(null);
    setVideoUrl(null);
    setVideoUrls(null);
  };

  const handleBackToModeSelect = () => {
    setMode('select');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {mode === 'select' && (
          <VideoModeSelector onModeSelect={handleModeSelect} />
        )}
        
        {mode === 'single' && !uploadedVideo && (
          <VideoUpload onVideoUpload={handleSingleVideoUpload} onBack={handleBackToModeSelect} />
        )}
        
        {mode === 'dual' && !uploadedVideos && (
          <DualVideoUpload onVideosUpload={handleDualVideosUpload} onBack={handleBackToModeSelect} />
        )}
        
        {uploadedVideo && videoUrl && (
          <VideoProcessor 
            videoFile={uploadedVideo} 
            videoUrl={videoUrl} 
            onReset={handleReset}
          />
        )}
        
        {uploadedVideos && videoUrls && (
          <DualVideoProcessor 
            videoFiles={uploadedVideos} 
            videoUrls={videoUrls} 
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
};

export default App;