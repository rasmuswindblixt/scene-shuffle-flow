import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-video-splitter-new.jpg";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import demoVideo from "@/assets/clipmixpro_demo.mov";
import React from "react";

const Hero = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative py-12 md:py-24 flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary-glow rounded-full blur-3xl opacity-15"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                🎬 YouTube Automation Made Simple
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Instantly Split & Mix Your Videos
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Into Viral Segments</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Effortlessly turn long videos into dozens of short, viral-ready clips. Mix, segment, and shuffle scenes with AI—perfect for YouTube Automation creators who want to save hours and maximize engagement.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6" asChild>
                <a href="/app">Get Started Now</a>
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    Watch Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full">
                  <div className="w-full" style={{ aspectRatio: '16/9', minHeight: '480px' }}>
                    <video src={demoVideo} controls autoPlay playsInline className="w-full h-full rounded-lg" />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Instant access
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Professional quality
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