import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Documentation = () => {
  const sections = [
    {
      title: "API Reference",
      description: "Complete API documentation for developers",
      badge: "Technical",
      items: [
        "Authentication & API Keys",
        "Video Upload Endpoints",
        "Scene Detection API",
        "Export Management",
        "Webhook Configuration",
        "Rate Limits & Quotas"
      ]
    },
    {
      title: "Video Processing",
      description: "Technical specifications and capabilities",
      badge: "Core Features",
      items: [
        "Supported Video Formats",
        "Resolution & Quality Limits",
        "Processing Performance",
        "AI Model Specifications",
        "Output Format Options",
        "Batch Processing Guidelines"
      ]
    },
    {
      title: "Integration Guide",
      description: "How to integrate Video Splitter into your workflow",
      badge: "Integration",
      items: [
        "JavaScript SDK",
        "Python Library",
        "REST API Examples",
        "Webhook Implementation",
        "Third-party Integrations",
        "Custom Solution Development"
      ]
    },
    {
      title: "Advanced Features",
      description: "Detailed documentation for power users",
      badge: "Advanced",
      items: [
        "Custom Scene Detection Rules",
        "Algorithm Parameter Tuning",
        "Bulk Operations",
        "Custom Export Pipelines",
        "Performance Optimization",
        "Enterprise Features"
      ]
    }
  ];

  const quickStart = [
    {
      step: "1",
      title: "Get API Key",
      description: "Generate your API key from the dashboard"
    },
    {
      step: "2", 
      title: "Upload Video",
      description: "Send video file via POST request"
    },
    {
      step: "3",
      title: "Process Scenes",
      description: "AI analyzes and detects scene changes"
    },
    {
      step: "4",
      title: "Export Result",
      description: "Download your processed video"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold">
                Developer
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Documentation</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Complete technical documentation, API references, and integration guides for Video Splitter.
              </p>
            </div>

            {/* Quick Start */}
            <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm mb-16">
              <CardHeader>
                <CardTitle className="text-2xl">🚀 Quick Start</CardTitle>
                <CardDescription>
                  Get up and running with Video Splitter API in minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  {quickStart.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-3">
                        {item.step}
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Code Example */}
            <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm mb-16">
              <CardHeader>
                <CardTitle className="text-xl">💻 Example API Call</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm">
                    <code>{`curl -X POST "https://api.videosplitter.com/v1/process" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "video=@your-video.mp4" \\
  -F "min_duration=1" \\
  -F "max_duration=6" \\
  -F "shuffle=true"`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Documentation Sections */}
            <div className="grid md:grid-cols-2 gap-8">
              {sections.map((section, index) => (
                <Card key={index} className="border-0 shadow-card bg-card/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{section.badge}</Badge>
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-3 p-2 rounded hover:bg-accent/50 cursor-pointer transition-colors">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-sm text-foreground hover:text-primary transition-colors">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-4">📚</div>
                  <h3 className="font-semibold mb-2">Tutorials</h3>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step guides and video tutorials
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-4">🔧</div>
                  <h3 className="font-semibold mb-2">SDKs & Libraries</h3>
                  <p className="text-sm text-muted-foreground">
                    Official libraries for popular languages
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-4">💬</div>
                  <h3 className="font-semibold mb-2">Developer Forum</h3>
                  <p className="text-sm text-muted-foreground">
                    Community discussions and support
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Documentation;