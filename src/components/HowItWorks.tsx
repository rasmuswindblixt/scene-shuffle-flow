import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Upload Your Video",
      description: "Simply drag and drop your video file or select from your device. We support all major formats up to 4K quality.",
      icon: "📤"
    },
    {
      step: "02", 
      title: "AI Analyzes Scenes",
      description: "Our advanced AI automatically detects scene changes, cuts, and transitions with 95%+ accuracy in seconds.",
      icon: "🤖"
    },
    {
      step: "03",
      title: "Filter & Customize",
      description: "Set your preferred scene duration (1-60 seconds) and let our intelligent algorithm do the heavy lifting.",
      icon: "⚙️"
    },
    {
      step: "04",
      title: "Preview & Export",
      description: "Review your shuffled scenes in real-time, make adjustments, then export in HD quality instantly.",
      icon: "🎬"
    }
  ];

  return (
    <section className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            🎯 How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            From Upload to Export in
            <span className="bg-gradient-primary bg-clip-text text-transparent"> 4 Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our streamlined process makes professional video editing accessible to everyone, 
            regardless of technical experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="border-0 shadow-card bg-card/80 backdrop-blur-sm relative group hover:scale-105 transition-all duration-300">
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-primary">
                {step.step}
              </div>
              
              <CardHeader className="pt-8">
                <div className="text-4xl mb-4 text-center">{step.icon}</div>
                <CardTitle className="text-xl font-semibold text-center group-hover:text-primary transition-colors">
                  {step.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed text-center">
                  {step.description}
                </CardDescription>
              </CardContent>
              
              {/* Arrow connector for larger screens */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-primary/30">
                  →
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Ready to see it in action?
          </p>
          <div className="flex justify-center gap-4">
            <span className="inline-flex items-center gap-2 text-sm text-primary">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Average processing time: 30 seconds
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-primary">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              No technical skills required
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;