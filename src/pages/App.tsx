import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VideoUpload from "@/components/VideoUpload";
import VideoProcessor from "@/components/VideoProcessor";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import ContactForm from "@/components/ContactForm";
import { usePageVisibility } from '@/hooks/usePageVisibility';

const VideoApp = () => {
  const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const { user, loading, subscribed, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const isPageVisible = usePageVisibility();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Cleanup video URLs when component unmounts
  useEffect(() => {
    return () => {
      // Only cleanup video URLs if the component is actually unmounting, not just hidden
      if (isPageVisible || document.hidden === false) {
        videoUrls.forEach(url => {
          try {
            URL.revokeObjectURL(url);
          } catch (error) {
            // Ignore errors if URL was already revoked
          }
        });
      }
    };
  }, [videoUrls, isPageVisible]);

  useEffect(() => {
    // Handle Stripe success/cancel redirects
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Payment Successful!",
        description: "Your subscription is now active. Start shuffling videos!",
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

  const handleVideoUpload = (files: File[]) => {
    setUploadedVideos(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setVideoUrls(urls);
  };

  const handleReset = () => {
    // Reset state first
    setUploadedVideos([]);
    setVideoUrls([]);
    
    // Clean up object URLs after a small delay to allow components to unmount
    setTimeout(() => {
      videoUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          // Ignore errors if URL was already revoked
          console.log('URL already revoked:', error);
        }
      });
    }, 100);
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

  // Simple header component
  const SimpleHeader = () => (
    <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-semibold cursor-pointer" onClick={() => navigate('/')}>ClipMixPRO</h1>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );

  // Subscription paywall
  if (!subscribed) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">ClipMixPRO</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Mix and shuffle video scenes to avoid YouTube's reused content policies
              </p>
            </div>
            
            <Card className="card-hover bg-card/80 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="gradient-text">Subscription Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  ClipMixPRO is a paid service. Subscribe to start mixing your videos.
                </p>
                <ul className="text-left space-y-2">
                  <li>✅ Automatic scene detection</li>
                  <li>✅ Smart 1-6 second filtering</li>
                  <li>✅ Intelligent shuffling algorithm</li>
                  <li>✅ HD video export</li>
                  <li>✅ Unlimited video processing</li>
                </ul>
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-primary hover:opacity-90 shadow-primary"
                    onClick={() => navigate('/checkout')}
                  >
                    Subscribe Now - $12.95/month
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <main className="pt-6">
        {uploadedVideos.length === 0 && (
          <>
            <VideoUpload onVideoUpload={handleVideoUpload} />
            
            {/* Subtle Support Button */}
            <div className="text-center mt-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsContactFormOpen(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Need help? Contact Support
              </Button>
            </div>
          </>
        )}
        
        {uploadedVideos.length > 0 && videoUrls.length > 0 && (
          <VideoProcessor 
            videoFiles={uploadedVideos} 
            videoUrls={videoUrls} 
            onReset={handleReset}
          />
        )}
      </main>

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={isContactFormOpen} 
        onClose={() => setIsContactFormOpen(false)} 
      />
    </div>
  );
};

export default VideoApp;
