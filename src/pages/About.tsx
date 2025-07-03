import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold">
                About
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Video Splitter</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Revolutionizing video editing with AI-powered scene detection and intelligent content creation tools.
              </p>
            </div>

            <div className="space-y-12">
              <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We believe that creating engaging video content shouldn't require years of editing experience or expensive software. 
                    Video Splitter was born from the frustration of spending hours manually cutting and arranging video scenes. 
                    Our mission is to democratize professional video editing by making it accessible, fast, and intelligent.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Our Technology</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    At the heart of Video Splitter is our proprietary AI engine that can analyze video content with over 95% accuracy. 
                    Our technology identifies scene changes, cuts, and transitions automatically, then applies intelligent algorithms 
                    to create engaging, shuffled content that maintains viewer interest.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We've processed over 10,000 videos and helped content creators save thousands of hours in editing time, 
                    while increasing their engagement rates by an average of 300%.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Our Team</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Video Splitter is built by a team of passionate engineers, designers, and video enthusiasts who understand 
                    the challenges of modern content creation. We're committed to continuous innovation and building tools that 
                    empower creators to focus on what they do best - creating amazing content.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Why Video Splitter?</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">🚀 Speed & Efficiency</h3>
                      <p className="text-muted-foreground text-sm">
                        What takes hours manually takes minutes with our AI
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">🎯 Precision</h3>
                      <p className="text-muted-foreground text-sm">
                        95%+ accuracy in scene detection and content analysis
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">💡 Innovation</h3>
                      <p className="text-muted-foreground text-sm">
                        Cutting-edge technology that evolves with your needs
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">🤝 Support</h3>
                      <p className="text-muted-foreground text-sm">
                        24/7 support from a team that understands video creation
                      </p>
                    </div>
                  </div>
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

export default About;