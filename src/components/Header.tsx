import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, signOut, subscribed, freeExportsUsed, loading } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  console.log('Header render:', { loading, freeExportsUsed, subscribed, user });

  const scrollToSection = (sectionId: string) => {
    // Om vi inte är på landing page, navigera dit först
    if (window.location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    // Om vi redan är på landing page, scrolla till sektionen
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => scrollToSection('hero')} 
          className="flex items-center gap-3 hover:opacity-80 transition"
        >
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">🎬</span>
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ClipMixPRO
          </span>
        </button>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('features')} 
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('pricing')} 
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            Pricing
          </button>
          <button 
            onClick={() => scrollToSection('faq')} 
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            FAQ
          </button>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm text-foreground/80 hidden sm:block">
                <div>{user.email}</div>
                <div className="flex items-center gap-2 text-xs">
                  {window.location.pathname !== '/' && (
                    loading
                      ? <span>Loading...</span>
                      : <>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            subscribed 
                              ? 'bg-gradient-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {subscribed ? 'Pro' : 'Free'}
                          </span>
                          <span>
                            {subscribed
                              ? 'Unlimited exports'
                              : freeExportsUsed >= 3
                                ? '0/3 exports left'
                                : `${3 - freeExportsUsed}/3 exports left`}
                          </span>
                        </>
                  )}
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