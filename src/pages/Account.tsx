import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, BarChart3, HelpCircle, RefreshCw, Settings, ExternalLink, MessageSquare, Bug, CheckCircle, Clock, AlertTriangle, Sparkles, MousePointer, Upload, Youtube, FileVideo } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { track } from "@vercel/analytics";

import ContactForm from "@/components/ContactForm";

const Account = () => {
  const { user, loading, subscribed, subscriptionTier, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const [isBugReportFormOpen, setIsBugReportFormOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showAllBugs, setShowAllBugs] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<Set<number>>(new Set());
  const [expandedBugs, setExpandedBugs] = useState<Set<number>>(new Set());

  // New features data
  const newFeatures = [
    {
      id: 2,
      title: "Video Format Selection",
      description: "Choose between MP4 (H.264) and WebM (VP9) formats for video export. MP4 offers better compatibility and smaller file sizes, while WebM provides better quality with open source codecs.",
      date: "2025.08.22",
      status: "new" as const,
      icon: <FileVideo className="w-4 h-4" />
    },
    {
      id: 3,
      title: "Enhanced Video Upload Limits",
      description: "Increased upload capacity to 3 videos (up from 2) with extended duration limit of 60 minutes per video (up from 40 minutes) for more content variety.",
      date: "2025.08.18",
      status: "new" as const,
      icon: <Upload className="w-4 h-4" />
    },
    {
      id: 4,
      title: "Scene Selection & Deselection",
      description: "Select and deselect individual clips before export. All scenes are selected by default, with easy toggle controls and visual indicators.",
      date: "2025.08.18",
      status: "new" as const,
      icon: <MousePointer className="w-4 h-4" />
    },
    {
      id: 5,
      title: "YouTube Video Downloader",
      description: "Feature development paused due to technical limitations. CORS policies and YouTube's ToS compliance require server-side infrastructure. UI/UX completed and ready for future implementation when proper backend is available.",
      date: "",
      status: "planned" as const,
      icon: <Youtube className="w-4 h-4" />
    }
  ];

  // Bug status data
  const bugs = [
    {
      id: 1,
      title: "Users cannot cancel subscriptions",
      date: "2025.08.05",
      status: "fixed" as const
    },
    {
      id: 2,
      title: "Page reloads and video processing interrupts when switching tabs",
      date: "2025.08.07",
      status: "fixed" as const
    },
    {
      id: 3,
      title: "Some users experience slow video export",
      date: "2025.08.06",
      status: "investigating" as const
    },
    {
      id: 4,
      title: "Ability to upload more than 2 videos",
      date: "2025.08.18",
      status: "fixed" as const
    },
    {
      id: 5,
      title: "Upload videos longer than 30 minutes",
      date: "2025.08.18",
      status: "fixed" as const
    },
    {
      id: 6,
      title: "Add more formats when exporting videos (MP4, AVI, etc.)",
      date: "2025.08.22",
      status: "fixed" as const
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'fixed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'investigating':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'under_development':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'planned':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Bug className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'fixed':
        return 'Fixed';
      case 'investigating':
        return 'Investigating';
      case 'under_development':
        return 'Under Development';
      case 'planned':
        return 'Planned';
      default:
        return 'Reported';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'fixed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_development':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper functions for showing limited items
  const getDisplayedFeatures = () => {
    return showAllFeatures ? newFeatures : newFeatures.slice(0, 5);
  };

  const getSortedBugs = () => {
    // Sort by status priority, then by date within each status
    const statusPriority = {
      'under_development': 1,
      'investigating': 2,
      'fixed': 3
    };

    return [...bugs].sort((a, b) => {
      // First sort by status priority
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by date (newest first within same status)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const getDisplayedBugs = () => {
    const sortedBugs = getSortedBugs();
    return showAllBugs ? sortedBugs : sortedBugs.slice(0, 5);
  };

  // Helper functions for read more/less
  const toggleFeatureExpanded = (id: number) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFeatures(newExpanded);
  };

  const toggleBugExpanded = (id: number) => {
    const newExpanded = new Set(expandedBugs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedBugs(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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

  // Add a delay before redirecting to prevent tab switch issues
  useEffect(() => {
    if (!loading && !user) {
      // Add delay to prevent navigation during temporary auth state changes (tab switching)
      const timer = setTimeout(() => {
        // Double-check that user is still null after delay
        if (!user) {
          navigate('/auth');
        }
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

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

          {/* Subscription CTA - Only show for non-subscribed users */}
          {!subscribed && (
            <Card className="bg-card/60 backdrop-blur-sm border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Subscription Required</span>
                  <Button 
                    onClick={() => navigate('/onboarding')}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Upgrade
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You can try all features in the app. To export videos, please subscribe to ClipMixPRO Premium.
                </p>
              </CardContent>
            </Card>
          )}

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


          {/* Subtle Support Button */}
          <div className="text-center mt-12">
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
        </div>
      </main>

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={isContactFormOpen} 
        onClose={() => setIsContactFormOpen(false)} 
      />

      {/* Feedback Form Modal */}
      <ContactForm 
        isOpen={isFeedbackFormOpen} 
        onClose={() => setIsFeedbackFormOpen(false)} 
      />

      {/* Bug Report Form Modal */}
      <ContactForm 
        isOpen={isBugReportFormOpen} 
        onClose={() => setIsBugReportFormOpen(false)}
        initialMessage="BUG: "
        title="Report a Bug"
      />
    </div>
  );
};

export default Account; 