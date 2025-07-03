import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-primary-glow rounded-full blur-3xl opacity-15"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <Card className="border-2 border-primary/20 shadow-glow bg-gradient-to-br from-card via-card to-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative p-12 md:p-16 text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                🚀 Ready to Transform Your Videos?
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Start Creating
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Professional Content</span>
                <br />Today
              </h2>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join thousands of content creators who are already using Video Splitter to 
                create engaging, high-quality videos in minutes, not hours.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6" asChild>
                <a href="/app">Get Started Now</a>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-4">
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
        </Card>
      </div>
    </section>
  );
};

export default CTA;