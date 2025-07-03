import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: "🎯",
      title: "Smart Scene Detection",
      description: "Advanced AI automatically identifies scene changes and cuts in your videos with precision.",
      highlight: "AI-Powered"
    },
    {
      icon: "⏱️",
      title: "Duration Filtering",
      description: "Filter scenes by length to keep only the clips that fit your content strategy (1-6 seconds).",
      highlight: "Customizable"
    },
    {
      icon: "🔀",
      title: "Intelligent Shuffling",
      description: "Randomize scene order while preserving time segments and preventing sequential duplicates.",
      highlight: "Smart Logic"
    },
    {
      icon: "📽️",
      title: "Segment Preservation",
      description: "Maintain original video structure by keeping scenes within their time-based segments.",
      highlight: "Structure"
    },
    {
      icon: "👁️",
      title: "Real-time Preview",
      description: "Preview your scenes and their new order before exporting. Toggle audio on/off instantly.",
      highlight: "Interactive"
    },
    {
      icon: "⚡",
      title: "Lightning Export",
      description: "Generate your final shuffled video quickly with professional quality output.",
      highlight: "Fast"
    }
  ];

  return (
    <section className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            ✨ Powerful Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything You Need to
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Transform Videos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From scene detection to final export, our intelligent platform handles every step 
            of the video splitting process with precision and speed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-card hover:shadow-primary transition-all duration-300 bg-card/80 backdrop-blur-sm group hover:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {feature.highlight}
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;