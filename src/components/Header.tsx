import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user, signOut, subscribed, freeExportsUsed } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">🎬</span>
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Video Splitter
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-foreground/80 hover:text-foreground transition-colors">
            FAQ
          </a>
          <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">
            Demo
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm text-foreground/80 hidden sm:block">
                <div>{user.email}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    subscribed 
                      ? 'bg-gradient-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {subscribed ? 'Pro' : 'Free'}
                  </span>
                  <span>
                    {subscribed ? 'Unlimited exports' : `${3 - freeExportsUsed}/3 exports left`}
                  </span>
                </div>
              </div>
              <Button variant="ghost" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setAuthDialogOpen(true)} className="hidden sm:inline-flex">
                Sign In
              </Button>
              <Button variant="hero" asChild>
                <a href="/app">Get Started</a>
              </Button>
            </>
          )}
        </div>
      </div>
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </header>
  );
};

export default Header;