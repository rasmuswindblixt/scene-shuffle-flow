import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HelpCenter = () => {
  const categories = [
    {
      title: "Getting Started",
      description: "Learn the basics of Video Splitter",
      icon: "🚀",
      articles: [
        "How to upload your first video",
        "Understanding the interface",
        "Basic scene splitting workflow",
        "Account setup and profile"
      ]
    },
    {
      title: "AI Scene Detection",
      description: "Master our intelligent features",
      icon: "🤖",
      articles: [
        "How AI scene detection works",
        "Improving detection accuracy",
        "Manual scene adjustment",
        "Troubleshooting detection issues"
      ]
    },
    {
      title: "Video Processing",
      description: "Export and quality settings",
      icon: "⚙️",
      articles: [
        "Export formats and quality",
        "Processing time expectations", 
        "Batch processing multiple videos",
        "Download and sharing options"
      ]
    },
    {
      title: "Account & Billing",
      description: "Subscription and payment help",
      icon: "💳",
      articles: [
        "Managing your subscription",
        "Payment methods and billing",
        "Cancellation and refunds",
        "Account security settings"
      ]
    },
    {
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: "🔧",
      articles: [
        "Video upload problems",
        "Processing failures",
        "Browser compatibility",
        "Performance optimization"
      ]
    },
    {
      title: "Advanced Features",
      description: "Pro tips and advanced usage",
      icon: "⭐",
      articles: [
        "Custom duration filtering",
        "Scene shuffling algorithms",
        "Batch operations",
        "API documentation"
      ]
    }
  ];

  const popularArticles = [
    "How to get the best AI scene detection results",
    "Understanding video processing time",
    "Supported video formats and sizes",
    "How to cancel your subscription",
    "Troubleshooting upload issues"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold">
                Help
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Center</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Find answers to your questions and learn how to get the most out of Video Splitter.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="flex gap-4">
                <Input 
                  placeholder="Search for help articles, guides, and FAQs..."
                  className="flex-1"
                />
                <Button variant="outline">Search</Button>
              </div>
            </div>

            {/* Popular Articles */}
            <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm mb-16">
              <CardHeader>
                <CardTitle className="text-2xl">🔥 Popular Articles</CardTitle>
                <CardDescription>
                  Most frequently accessed help topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularArticles.map((article, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-foreground hover:text-primary transition-colors">{article}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Categories */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <Card key={index} className="border-0 shadow-card bg-card/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <div key={articleIndex} className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                          • {article}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Support */}
            <Card className="border-2 border-primary/20 shadow-glow bg-gradient-to-br from-card via-card to-primary/5 mt-16">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
                <p className="text-muted-foreground mb-6">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" asChild>
                    <a href="/contact">Contact Support</a>
                  </Button>
                  <Button variant="outline">
                    Live Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;