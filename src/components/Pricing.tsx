import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Pricing = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            💎 Simple Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            One Plan,
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Unlimited Potential</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No complex tiers or hidden fees. Just powerful video splitting tools 
            at an affordable monthly price.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary/20 shadow-glow bg-gradient-to-br from-card via-card to-primary/5 relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-gradient-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold shadow-primary">
                Most Popular
              </div>
            </div>

            <CardHeader className="text-center pt-12 pb-8">
              <CardTitle className="text-3xl font-bold">Pro Plan</CardTitle>
              <CardDescription className="text-lg">
                Perfect for content creators and video editors
              </CardDescription>
              <div className="mt-6">
                <div className="text-5xl font-bold">
                  $10
                  <span className="text-xl text-muted-foreground font-normal">/month</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Billed monthly • Cancel anytime
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  "Unlimited video uploads",
                  "AI-powered scene detection",
                  "Smart duration filtering",
                  "Intelligent scene shuffling",
                  "Real-time preview",
                  "HD video export",
                  "Priority support",
                  "No watermarks"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Button variant="premium" size="lg" className="w-full text-lg py-6">
                  Start Free 7-Day Trial
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  No credit card required for trial
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-muted-foreground">
            Questions about pricing? <a href="#" className="text-primary hover:underline">Contact our team</a>
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              30-day money back guarantee
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;