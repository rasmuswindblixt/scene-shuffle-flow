import { Card, CardContent } from "@/components/ui/card";

const SocialProof = () => {
  const stats = [
    { number: "10,000+", label: "Videos Processed" },
    { number: "500+", label: "Happy Creators" },
    { number: "3,200+", label: "Hours Saved for YouTubers" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      content: "Video Splitter transformed my workflow. What used to take hours now takes minutes. The AI scene detection is incredibly accurate!",
      avatar: "SC"
    },
    {
      name: "Mike Rodriguez", 
      role: "Video Editor",
      content: "The intelligent shuffling feature is a game-changer. My TikTok engagement has increased 300% since using this tool.",
      avatar: "MR"
    },
    {
      name: "Emma Thompson",
      role: "Social Media Manager", 
      content: "Finally, a tool that understands content creation. The scene filtering saves me so much time in post-production.",
      avatar: "ET"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-accent/10 via-background to-accent/5">
      <div className="container mx-auto px-6">
        {/* Stats */}
        <div className="flex flex-col items-center justify-center mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            ⭐ Loved by Creators
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            What Our Users
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Are Saying</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">"{testimonial.content}"</p>
                <div className="flex text-yellow-400 mt-4">
                  {"★".repeat(5)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;