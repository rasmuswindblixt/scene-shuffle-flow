import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { usePageVisibility } from '@/hooks/usePageVisibility';

const Checkout = () => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPageVisible = usePageVisibility();
  const [hasEverAuthed, setHasEverAuthed] = useState(false);
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);

  // Track when user is authenticated to prevent unnecessary redirects
  useEffect(() => {
    if (user && !hasEverAuthed) {
      setHasEverAuthed(true);
    }
  }, [user, hasEverAuthed]);

  // Handle authentication redirects with improved logic to prevent tab-switch issues
  useEffect(() => {
    if (loading) return; // Don't redirect while loading
    
    // Mark that we've done the initial auth check
    if (!initialAuthCheck) {
      setInitialAuthCheck(true);
    }
    
    // Only redirect if:
    // 1. Not loading
    // 2. No user
    // 3. Page is currently visible (prevents tab-switch redirects)
    // 4. We've completed initial auth check (prevents race conditions)
    // 5. User has never been authenticated in this session
    if (!user && isPageVisible && initialAuthCheck && !hasEverAuthed) {
      navigate('/auth');
      return;
    }

    if (session && !isRedirecting && !error) {
      handleCheckout();
    }
  }, [user, loading, session, isRedirecting, error, isPageVisible, initialAuthCheck, hasEverAuthed]);

  const handleCheckout = async () => {
    if (!session) return;
    
    setIsRedirecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create checkout session";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRedirecting(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              {isRedirecting && !error && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold">Redirecting to Payment</h2>
                  <p className="text-muted-foreground">
                    Please wait while we redirect you to our secure payment processor...
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>Secured by Stripe</span>
                  </div>
                </>
              )}

              {error && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive flex items-center justify-center">
                    <span className="text-white text-2xl">⚠</span>
                  </div>
                  <h2 className="text-2xl font-bold">Payment Error</h2>
                  <p className="text-muted-foreground">
                    There was an issue setting up your payment. Please try again.
                  </p>
                  <div className="flex flex-col space-y-3">
                    <Button onClick={handleCheckout} className="w-full">
                      Try Again
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/app')}
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to App
                    </Button>
                  </div>
                </>
              )}

              {!isRedirecting && !error && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-white font-bold text-xl">C</span>
                  </div>
                  <h2 className="text-2xl font-bold">Starting Checkout</h2>
                  <p className="text-muted-foreground">
                    Initializing your subscription...
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;