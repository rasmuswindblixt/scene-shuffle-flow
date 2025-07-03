import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-video-splitter.jpg";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary-glow rounded-full blur-3xl opacity-15"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                🎬 Video Editing Made Simple
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Split Videos Into
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Perfect Scenes</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Automatically detect scene changes, filter by duration, and create perfectly shuffled video content. 
                Transform your raw footage into engaging content with AI-powered scene detection.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Free 7-day trial
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <Card className="overflow-hidden border-0 shadow-glow bg-gradient-to-br from-card via-card to-accent/10">
              <img 
                src={heroImage} 
                alt="Video Splitter Interface" 
                className="w-full h-auto object-cover"
              />
            </Card>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-primary font-semibold">
              AI-Powered
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card border shadow-card px-4 py-2 rounded-lg font-medium">
              🚀 Instant Processing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;