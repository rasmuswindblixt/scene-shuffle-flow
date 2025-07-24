import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, BarChart3, HelpCircle } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import SubscriptionManager from "@/components/SubscriptionManager";
import ContactForm from "@/components/ContactForm";

const Account = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
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
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Premium Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Subscription Manager */}
          <div className="mt-8">
            <SubscriptionManager />
          </div>

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
    </div>
  );
};

export default Account; 