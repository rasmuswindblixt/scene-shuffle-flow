import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VideoUpload from "@/components/VideoUpload";
import VideoProcessor from "@/components/VideoProcessor";
import VideoModeSelector from "@/components/VideoModeSelector";
import DualVideoUpload from "@/components/DualVideoUpload";
import DualVideoProcessor from "@/components/DualVideoProcessor";
import Header from "@/components/Header";
import SubscriptionManager from "@/components/SubscriptionManager";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const App = () => {
  const [mode, setMode] = useState<'select' | 'single' | 'dual'>('select');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [uploadedVideos, setUploadedVideos] = useState<[File, File] | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoUrls, setVideoUrls] = useState<[string, string] | null>(null);
  const { user, loading, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Handle Stripe success/cancel redirects
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Payment Successful!",
        description: "Your subscription is now active. Enjoy unlimited exports!",
      });
      checkSubscription();
      // Clean up URL
      window.history.replaceState({}, '', '/app');
    } else if (searchParams.get('canceled') === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again anytime.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/app');
    }
  }, [searchParams, toast, checkSubscription]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to /auth
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {mode === 'select' && (
          <div className="container mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <VideoModeSelector onModeSelect={handleModeSelect} />
              <div className="flex justify-center">
                <SubscriptionManager />
              </div>
            </div>
          </div>
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