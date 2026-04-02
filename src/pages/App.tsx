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
// Removed trial banner as trial feature is deprecated
import ContactForm from "@/components/ContactForm";

const VideoApp = () => {
  const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const { user, loading, subscribed, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Redirect unauthenticated users to auth page
  useEffect(() => {
    if (!loading && !user) {
      console.log('[APP] No user found, redirecting to auth');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Cleanup video URLs when component unmounts
  useEffect(() => {
    return () => {
      videoUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          // Ignore errors if URL was already revoked
        }
      });
    };
  }, [videoUrls]);

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
  }, [searchParams, toast]);

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

  // Subscription paywall - access is granted only to subscribed (premium) users
  const hasAccess = subscribed;
  
  console.log('[APP] Access check:', { subscribed, hasAccess });
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full border border-red-500/20 mb-4">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">SUBSCRIPTION REQUIRED</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Scale Your 
                <span className="gradient-text"> Content Creation</span>?
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Subscribe to unlock unlimited video processing and advanced features to dominate YouTube's algorithm.
              </p>
            </div>

            {/* Limited Time Offer Banner */}
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🔥</span>
                <h3 className="text-xl font-bold text-orange-400">LIMITED TIME OFFER</h3>
                <span className="text-2xl">🔥</span>
              </div>
              <p className="text-lg font-semibold mb-2">Get 50% OFF Your First Month!</p>
              <p className="text-sm text-muted-foreground">Join now and pay only <span className="line-through">$12.95</span> <span className="text-green-400 font-bold">$6.47</span> for your first month</p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-card/60 backdrop-blur border-primary/20 text-left">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-green-400">✅ What You Get</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Unlimited video processing</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Process videos up to 60 minutes</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Upload up to 3 videos at once</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>HD/4K video export (MP4 & WebM)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Advanced scene selection</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Priority processing speed</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur border-orange-500/20 text-left">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-orange-400">🚀 Success Metrics</h3>
                  <div className="space-y-4">
                    <div className="bg-orange-500/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-400">95%</div>
                      <div className="text-sm text-muted-foreground">Content approval rate</div>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">3x</div>
                      <div className="text-sm text-muted-foreground">Faster content creation</div>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">$1000+</div>
                      <div className="text-sm text-muted-foreground">Average monthly savings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full max-w-md mx-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 text-lg shadow-lg"
                onClick={() => navigate('/checkout')}
              >
                🔥 Claim 50% OFF - Start Now ($6.47/month)
              </Button>
              <p className="text-sm text-muted-foreground">
                Cancel anytime • No setup fees • Instant access
              </p>
              <p className="text-xs text-muted-foreground">
                Offer expires in 24 hours. Regular price $12.95/month after first month.
              </p>
            </div>
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