import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VideoModeSelectorProps {
  onModeSelect: (mode: 'single' | 'dual') => void;
}

const VideoModeSelector = ({ onModeSelect }: VideoModeSelectorProps) => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Mode
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select whether you want to work with one video or mash two videos together.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="cursor-pointer transition-all duration-300 hover:shadow-glow hover:border-primary/50 group">
            <CardContent className="p-8 text-center" onClick={() => onModeSelect('single')}>
              <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl text-primary-foreground">🎬</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Single Video</h3>
              <p className="text-muted-foreground mb-6">
                Upload one video to detect scenes, apply filters, and create a shuffled compilation.
              </p>
              <Button variant="hero" size="lg" className="w-full">
                Select Single Video
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-300 hover:shadow-glow hover:border-primary/50 group">
            <CardContent className="p-8 text-center" onClick={() => onModeSelect('dual')}>
              <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl text-primary-foreground">🎭</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Dual Video Mash</h3>
              <p className="text-muted-foreground mb-6">
                Upload two videos to mash their scenes together with intelligent segment mixing.
              </p>
              <Button variant="premium" size="lg" className="w-full">
                Select Dual Video
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="text-center p-6 border-0 shadow-card">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="font-semibold mb-2">Smart Segments</h3>
            <p className="text-sm text-muted-foreground">
              Configure how many segments to divide your videos into for mixing
            </p>
          </Card>
          
          <Card className="text-center p-6 border-0 shadow-card">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🔀</span>
            </div>
            <h3 className="font-semibold mb-2">Intelligent Mixing</h3>
            <p className="text-sm text-muted-foreground">
              Proportional scene distribution based on video lengths
            </p>
          </Card>
          
          <Card className="text-center p-6 border-0 shadow-card">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="font-semibold mb-2">Same Controls</h3>
            <p className="text-sm text-muted-foreground">
              All filtering and export options work with both modes
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoModeSelector;