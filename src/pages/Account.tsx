import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, BarChart3, HelpCircle, RefreshCw, Settings, ExternalLink, MessageSquare, Bug, CheckCircle, Clock, Code } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePageVisibility } from '@/hooks/usePageVisibility';

import ContactForm from "@/components/ContactForm";

const Account = () => {
  const { user, loading, subscribed, subscriptionTier, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [contactFormSubject, setContactFormSubject] = useState("");
  const isPageVisible = usePageVisibility();
  const [hasEverAuthed, setHasEverAuthed] = useState(false);
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    try {
      await checkSubscription();
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Error creating customer portal session:', error);
        toast.error('Failed to open subscription management. Please try again.');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        toast.error('No portal URL received. Please try again.');
      }
    } catch (error) {
      console.error('Error invoking customer portal:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setManagingSubscription(false);
    }
  };

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
    }
  }, [user, loading, navigate, isPageVisible, initialAuthCheck, hasEverAuthed]);

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

  // Debug logging
  console.log('Account page - subscribed:', subscribed, 'subscriptionTier:', subscriptionTier);
  console.log('Should show subscription management:', subscribed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced Header */}
      <header className="border-b border-border/50 backdrop-blur-md bg-background/90 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-black to-gray-800 flex items-center justify-center cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/')}>
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/')}>ClipMixPRO</h1>
            </div>
            <div className="flex items-center space-x-4">
              <UserMenu />
              <Button variant="outline" onClick={() => navigate('/app')} className="hover:bg-primary/10 transition-colors border-primary/20">
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Account & <span className="gradient-text">Billing</span>
              </h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your subscription and billing information
            </p>
          </div>

          {/* Account Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Account Information */}
            <Card className="bg-card/60 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Email Address</span>
                    <span className="font-semibold">{user.email}</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">User ID</span>
                    <span className="font-mono text-sm bg-black/10 px-2 py-1 rounded">{user.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-card/60 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  Account Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                    <div className="text-2xl font-bold gradient-text">∞</div>
                    <div className="text-xs text-muted-foreground mt-1">Videos Processed</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                    <div className="text-2xl font-bold gradient-text">HD</div>
                    <div className="text-xs text-muted-foreground mt-1">Export Quality</div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${subscribed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-muted border-border'}`}>
                  <div className={`flex items-center justify-between gap-2 ${subscribed ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${subscribed ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`}></div>
                      <span className="text-sm font-medium">{subscribed ? `${subscriptionTier} Active` : 'Free Plan'}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshSubscription}
                      disabled={refreshing}
                      className="h-6 px-2 py-1 text-xs hover:bg-white/10"
                    >
                      <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Management */}
          {subscribed && (
            <Card className="bg-card/60 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  Subscription Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-primary/10">
                  <h4 className="font-semibold mb-2">Manage Your Subscription</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update payment method, view billing history, or cancel your subscription through Stripe's secure customer portal.
                  </p>
                  <Button
                    onClick={handleManageSubscription}
                    disabled={managingSubscription}
                    className="bg-gradient-primary hover:opacity-90 text-white"
                  >
                    {managingSubscription ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Opening Portal...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Manage Subscription
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback & Feature Requests */}
          <Card className="bg-card/60 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                Feedback & Feature Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/5 to-red-500/5 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-4">
                  Your voice means everything to us! ❤️<br />
                  We're a small team of YouTube automation experts and developers dedicated to making faceless content creation easier, faster, and more efficient. If you spot a bug—or have an idea for a helpful feature—please let us know. ClipMixPRO is a shared journey, built by creators, for creators.
                </p>
                <Button
                  onClick={() => setIsFeedbackFormOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Share Feedback
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Identified Bugs and Status */}
          <Card className="bg-gradient-to-r from-blue-900/10 to-indigo-900/10 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Bug className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Identified Bugs and Status</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Transparency in our ongoing bug fixes and improvements. We're constantly working to improve your experience.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <p className="font-medium">Users cannot cancel subscriptions</p>
                    <p className="text-sm text-muted-foreground">Identified: 2025.08.05</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Fixed
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <p className="font-medium">Page reloads and video processing interrupts when switching tabs</p>
                    <p className="text-sm text-muted-foreground">Identified: 2025.08.07</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="w-4 h-4 mr-1" />
                    Investigating
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <p className="font-medium">Some users experience slow video export</p>
                    <p className="text-sm text-muted-foreground">Identified: 2025.08.06</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="w-4 h-4 mr-1" />
                    Investigating
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <p className="font-medium">Ability to upload more than 2 videos</p>
                    <p className="text-sm text-muted-foreground">Identified: 2025.08.09</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <Code className="w-4 h-4 mr-1" />
                    Under Development
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <p className="font-medium">Upload videos longer than 30 minutes</p>
                    <p className="text-sm text-muted-foreground">Identified: 2025.08.08</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <Code className="w-4 h-4 mr-1" />
                    Under Development
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <p className="font-medium">Add more formats when exporting videos (MP4, AVI, etc.)</p>
                    <p className="text-sm text-muted-foreground">Identified: 2025.08.08</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <Code className="w-4 h-4 mr-1" />
                    Under Development
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <p className="font-medium">Implement free trial</p>
                    <p className="text-sm text-muted-foreground">Identified: 2025.08.01</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="w-4 h-4 mr-1" />
                    Investigating
                  </Badge>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  setContactFormSubject("Bug Report: ");
                  setIsContactFormOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report Bug
              </Button>
            </CardContent>
          </Card>

          {/* Subtle Support Button */}
          <div className="text-center mt-12">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setContactFormSubject("");
                setIsContactFormOpen(true);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Need help? Contact Support
            </Button>
          </div>
        </div>
      </main>

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={isContactFormOpen} 
        onClose={() => {
          setIsContactFormOpen(false);
          setContactFormSubject("");
        }}
        initialSubject={contactFormSubject}
      />

      {/* Feedback Form Modal */}
      <ContactForm 
        isOpen={isFeedbackFormOpen} 
        onClose={() => setIsFeedbackFormOpen(false)} 
        initialSubject="Feedback & Feature Request: "
      />
    </div>
  );
};

export default Account; 