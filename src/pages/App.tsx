import { useState } from "react";
import VideoUpload from "@/components/VideoUpload";
import VideoProcessor from "@/components/VideoProcessor";
import Header from "@/components/Header";

const App = () => {
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleVideoUpload = (file: File) => {
    setUploadedVideo(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleReset = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setUploadedVideo(null);
    setVideoUrl(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {!uploadedVideo ? (
          <VideoUpload onVideoUpload={handleVideoUpload} />
        ) : (
          <VideoProcessor 
            videoFile={uploadedVideo} 
            videoUrl={videoUrl!} 
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
};

export default App;