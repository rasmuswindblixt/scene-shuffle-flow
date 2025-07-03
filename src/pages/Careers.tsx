import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Careers = () => {
  const openPositions = [
    {
      title: "Senior AI/ML Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Lead development of our AI-powered scene detection algorithms and machine learning infrastructure.",
      requirements: ["5+ years ML/AI experience", "Python, TensorFlow/PyTorch", "Computer Vision expertise"]
    },
    {
      title: "Frontend Developer",
      department: "Engineering", 
      location: "Remote",
      type: "Full-time",
      description: "Build beautiful, responsive user interfaces for our video editing platform using React and modern web technologies.",
      requirements: ["3+ years React experience", "TypeScript proficiency", "Design system experience"]
    },
    {
      title: "DevOps Engineer",
      department: "Infrastructure",
      location: "Remote",
      type: "Full-time", 
      description: "Scale our video processing infrastructure and ensure reliable, fast service for thousands of users.",
      requirements: ["AWS/GCP experience", "Docker/Kubernetes", "CI/CD pipeline expertise"]
    },
    {
      title: "Product Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      description: "Drive go-to-market strategy and growth initiatives for our video editing tools.",
      requirements: ["3+ years product marketing", "SaaS experience", "Content creation background"]
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote", 
      type: "Full-time",
      description: "Help our creator community succeed and grow their engagement using Video Splitter.",
      requirements: ["Customer success experience", "Video/creator industry knowledge", "Excellent communication"]
    }
  ];

  const benefits = [
    {
      icon: "🏠",
      title: "Remote-First",
      description: "Work from anywhere in the world with flexible hours"
    },
    {
      icon: "💰",
      title: "Competitive Salary",
      description: "Market-rate compensation with equity upside"
    },
    {
      icon: "🏥",
      title: "Health & Wellness",
      description: "Comprehensive health insurance and wellness stipend"
    },
    {
      icon: "📚",
      title: "Learning Budget",
      description: "$2,000 annual budget for courses, conferences, and books"
    },
    {
      icon: "🌴",
      title: "Unlimited PTO",
      description: "Take time off when you need it, no questions asked"
    },
    {
      icon: "💻",
      title: "Equipment Stipend",
      description: "Top-tier equipment and home office setup budget"
    }
  ];

  const values = [
    {
      title: "Innovation First",
      description: "We push the boundaries of what's possible with AI and video technology."
    },
    {
      title: "Creator-Centric",
      description: "Every decision we make prioritizes the success of content creators."
    },
    {
      title: "Transparent Culture",
      description: "Open communication, honest feedback, and shared decision-making."
    },
    {
      title: "Quality Obsessed",
      description: "We ship products that we're proud to use ourselves every day."
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
                Join Our
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Team</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Help us revolutionize video editing and empower creators worldwide. We're building the future of AI-powered content creation.
              </p>
            </div>

            {/* Company Mission */}
            <Card className="border-2 border-primary/20 shadow-glow bg-gradient-to-br from-card via-card to-primary/5 mb-16">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">🚀 Our Mission</h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
                  We're on a mission to democratize professional video editing by making it accessible, fast, and intelligent. 
                  Join us in building tools that help creators focus on what they do best - creating amazing content.
                </p>
              </CardContent>
            </Card>

            {/* Company Values */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">💡 Our Values</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {values.map((value, index) => (
                  <Card key={index} className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">🎁 Benefits & Perks</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border-0 shadow-card bg-card/80 backdrop-blur-sm text-center">
                    <CardContent className="p-6">
                      <div className="text-3xl mb-3">{benefit.icon}</div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Open Positions */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-12">💼 Open Positions</h2>
              <div className="space-y-6">
                {openPositions.map((position, index) => (
                  <Card key={index} className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{position.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{position.department}</Badge>
                            <Badge variant="outline">{position.location}</Badge>
                            <Badge variant="outline">{position.type}</Badge>
                          </div>
                        </div>
                        <Button variant="hero" className="mt-4 md:mt-0">
                          Apply Now
                        </Button>
                      </div>
                      <p className="text-muted-foreground mb-4">{position.description}</p>
                      <div>
                        <h4 className="font-medium mb-2">Key Requirements:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {position.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Don't see a fit */}
            <Card className="border-2 border-primary/20 shadow-glow bg-gradient-to-br from-card via-card to-primary/5 mt-16">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Don't See a Perfect Fit?</h3>
                <p className="text-muted-foreground mb-6">
                  We're always looking for talented people who share our passion for innovation and creativity. 
                  Send us your resume and tell us how you'd like to contribute to Video Splitter.
                </p>
                <Button variant="outline" size="lg">
                  Send Open Application
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;