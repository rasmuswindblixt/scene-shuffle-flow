import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

interface BlogCTAProps {
  variant?: "default" | "compact" | "featured";
  title?: string;
  description?: string;
}

export default function BlogCTA({ 
  variant = "default",
  title = "Ready to Transform Your Video Editing?",
  description = "Experience the power of AI-driven video editing with ClipMix Pro. Try the app now — exporting requires a subscription."
}: BlogCTAProps) {
  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-2 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium">Try the app now — export with Premium</span>
        <Link to="/app">
          <Button size="sm" variant="outline">
            Open App
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <Card className="my-12 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-3xl font-bold mb-4 gradient-text">{title}</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app">
              <Button size="lg" className="w-full sm:w-auto group">
                Open App
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/#pricing">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Preview is free • Export requires subscription</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground mb-6">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/app">
            <Button size="lg" className="w-full sm:w-auto">
              Open App
            </Button>
          </Link>
          <Link to="/#pricing">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Pricing
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}