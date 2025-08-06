
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Download, Upload, Cpu, Check, ChevronRight, Play, CheckCircle, Shuffle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import ContactForm from "@/components/ContactForm";

// Import thumbnail images
import thumb1 from "@/assets/thumb-1.jpeg";
import thumb2 from "@/assets/thumb-2.jpeg";
import thumb3 from "@/assets/thumb-3.jpeg";
import thumb4 from "@/assets/thumb-4.jpeg";
import thumb5 from "@/assets/thumb-5.jpeg";

// Demo videos are served from public folder
const demoVideoMp4 = "/clipmixpro_demo_2.mp4";
const demoVideoMov = "/clipmixpro_demo_2.mov";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Scene Detection",
      description: "Advanced algorithms automatically identify scene changes and cuts with 95%+ accuracy in seconds."
    },
    {
      icon: <Shuffle className="w-6 h-6" />,
      title: "Smart Shuffle Algorithm", 
      description: "Intelligent randomization ensures no adjacent scenes maintain their original order, making content unique."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "1-6 Second Filtering",
      description: "Automatically filters clips to the optimal length for short-form content and reused content policies."
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "HD Export Quality",
      description: "Export your shuffled videos in crisp 720p quality ready for immediate upload to any platform."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Copyright Safe",
      description: "Bypass YouTube's reused content detection by creating truly unique video sequences from existing content."
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: "One-Click Processing",
      description: "Upload, analyze, shuffle, and export - all with minimal clicks. Focus on content, not technical details."
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "YouTube Creator",
      content: "ClipMixPRO saved me hours of manual editing. My compilation videos now pass all copyright checks effortlessly.",
      views: "2.3M subscribers"
    },
    {
      name: "Sarah Martinez", 
      role: "Content Agency",
      content: "We process 50+ videos weekly for clients. This tool is essential for avoiding reused content strikes.",
      views: "Content Agency"
    },
    {
      name: "Mike Johnson",
      role: "Shorts Creator",
      content: "Perfect for creating unique shorts from longer content. The shuffle algorithm is incredibly smart.",
      views: "850K subscribers"
    }
  ];

  const faqs = [
    {
      question: "Do I need to make videos for this to work?",
              answer: "No! ClipMixPRO works with any existing video content. Simply upload your video file and our AI handles the rest - detecting scenes, filtering optimal clips, and shuffling them to create unique content."
    },
    {
      question: "What if I want to edit a video before it's processed?",
              answer: "ClipMixPRO is designed for automatic processing to save you time. However, you can always re-shuffle the same video multiple times to get different arrangements until you find the perfect version."
    },
    {
      question: "What if I don't want videos processed automatically?",
              answer: "The automatic processing is what makes ClipMixPRO powerful and time-saving. The AI optimization ensures the best results for avoiding reused content policies while maintaining video quality."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>  
              </div>
              <span className="text-xl font-bold">ClipMixPRO</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              {/* Blog link - hidden for later release */}
              {/* <a href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a> */}
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <UserMenu />
              ) : (
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Log In
                </Button>
              )}
              <Button onClick={() => navigate('/app')} className="bg-gradient-primary hover:opacity-90">
                Start Shuffling
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 hero-glow">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
        <div className="container mx-auto px-6 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Shuffle Videos to Beat{' '}
              <span className="gradient-text">YouTube's Reused Content</span>{' '}
              Policies
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              AI-powered scene detection automatically shuffles your video clips into unique sequences, 
              making them safe from copyright strikes and reused content policies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-4 h-auto shadow-primary"
                onClick={() => navigate('/app')}
              >
                Start Shuffling Videos
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 h-auto border-primary/20 hover:border-primary/40"
                onClick={() => {
                  const demoSection = document.getElementById('demo');
                  if (demoSection) {
                    demoSection.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }}
              >
                Watch Demo
              </Button>
            </div>

            {/* Success Stories - Organic Collage Layout */}
            <div className="relative max-w-5xl mx-auto px-4 py-16 min-h-96">
              {[
                { views: "2.3M views", thumbnail: thumb1, position: "top-4 left-8", rotation: "-rotate-6", zIndex: "z-10" },
                { views: "1.8M views", thumbnail: thumb2, position: "top-12 left-72", rotation: "rotate-3", zIndex: "z-20" },
                { views: "956K views", thumbnail: thumb3, position: "top-0 left-1/2 -translate-x-1/2", rotation: "rotate-1", zIndex: "z-30" },
                { views: "1.2M views", thumbnail: thumb4, position: "top-16 right-64", rotation: "-rotate-2", zIndex: "z-20" },
                { views: "743K views", thumbnail: thumb5, position: "top-8 right-8", rotation: "rotate-4", zIndex: "z-10" }
              ].map((video, i) => (
                <div
                  key={i}
                  className={`absolute cursor-pointer group transition-all duration-500 hover:z-50 ${video.position} ${video.rotation} ${video.zIndex}`}
                >
                  <div className="relative w-72 h-48 transform transition-all duration-500 hover:scale-110 hover:rotate-0 hover:shadow-2xl hover:shadow-primary/30">
                    {/* Thumbnail container */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border-4 border-white/90 bg-white">
                      {/* Actual thumbnail image */}
                      <img 
                        src={video.thumbnail} 
                        alt="Video thumbnail"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Play button - only shows on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      {/* Success indicator - green "Safe" badge */}
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                        ✓ Safe
                      </div>
                      
                      {/* Views overlay */}
                      <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {video.views}
                      </div>
                    </div>
                    
                    {/* Subtle glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                         style={{
                           background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(219, 39, 119, 0.1))',
                           filter: 'blur(20px)',
                           transform: 'scale(1.1)'
                         }}>
                    </div>
                  </div>
                </div>
              ))}
              
                             {/* Background decoration */}
               <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl"></div>
               </div>
             </div>
             
             {/* Success Stats */}
             <div className="text-center mt-12 max-w-4xl mx-auto">
               <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                 Saving YouTube Automation experts <span className="font-semibold gradient-text">15+ hours per week</span> and generating 
                 <span className="font-semibold gradient-text"> 40% more revenue</span> through copyright-safe, unique content that passes all platform policies.
               </p>
               <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-8">
                 <div className="text-center">
                   <div className="text-3xl font-bold gradient-text">15+ hrs</div>
                   <div className="text-sm text-muted-foreground">Weekly Time Saved</div>
                 </div>
                 <div className="hidden sm:block w-px h-12 bg-border"></div>
                 <div className="text-center">
                   <div className="text-3xl font-bold gradient-text">40%+</div>
                   <div className="text-sm text-muted-foreground">Revenue Increase</div>
                 </div>
                 <div className="hidden sm:block w-px h-12 bg-border"></div>
                 <div className="text-center">
                   <div className="text-3xl font-bold gradient-text">100%</div>
                   <div className="text-sm text-muted-foreground">Copyright Safe</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Powerful Features for <span className="gradient-text">Content Creators</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create unique, copyright-safe videos from existing content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover bg-card/50 backdrop-blur border-primary/10">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-6 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 hero-glow opacity-30"></div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Simple <span className="gradient-text">3-Step Process</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              From upload to copyright-safe video in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Upload Video", desc: "Simply upload your video file. We support all major formats up to 40 minutes." },
              { step: "02", title: "AI Analysis", desc: "Our advanced AI detects scene changes, filters clips to 1-6 seconds, and applies smart shuffle algorithms." },
              { step: "03", title: "Download Result", desc: "Get your copyright-safe, uniquely shuffled video in HD quality ready for immediate upload." }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                {/* Connecting line - positioned behind circle */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -translate-x-1/2 z-0"></div>
                )}
                {/* Circle - positioned in front of line */}
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto shadow-primary relative z-10">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 hero-glow opacity-20"></div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              See <span className="gradient-text">ClipMixPRO</span> in Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch how our AI transforms your content in minutes - from upload to copyright-safe, uniquely shuffled video
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            {/* Glow Effect Background */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-2xl blur-2xl scale-105 opacity-60 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl blur-3xl scale-110 opacity-40"></div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary/20 bg-black/10 backdrop-blur-sm">
                {/* Loading State */}
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50 z-10">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-white text-lg">Loading demo video...</p>
                    </div>
                  </div>
                )}
                
                {/* Video Container */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full aspect-video object-cover"
                  style={{ minHeight: '400px' }}
                  onError={(e) => {
                    console.error('Demo video load error:', e);
                    setVideoLoading(false);
                  }}
                  onLoadStart={() => {
                    console.log('Video loading started');
                    setVideoLoading(true);
                  }}
                  onCanPlay={() => {
                    console.log('Video can start playing');
                    setVideoLoading(false);
                  }}
                  preload="metadata"
                >
                  <source src={demoVideoMp4} type="video/mp4" />
                  <source src={demoVideoMov} type="video/quicktime" />
                  <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                    <p className="text-white text-lg">Your browser does not support video playback.</p>
                  </div>
                </video>
              </div>
              
              {/* Decorative Border Glow */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/30 pointer-events-none"></div>
            </div>
            
            {/* Features Below Video */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur border border-primary/10">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">Process 40-minute videos in under 5 minutes</p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur border border-primary/10">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">100% Safe</h3>
                <p className="text-sm text-muted-foreground">Guaranteed to pass YouTube's content policies</p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur border border-primary/10">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">HD Export</h3>
                <p className="text-sm text-muted-foreground">Professional quality ready for immediate upload</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Trusted by <span className="gradient-text">Content Creators</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See what creators are saying about ClipMixPRO
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover bg-card/50 backdrop-blur border-primary/10">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.views}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    {[1,2,3,4,5].map((star) => (
                      <CheckCircle key={star} className="w-4 h-4 text-primary mr-1" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 hero-glow opacity-50"></div>
        <div className="container mx-auto px-6 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Create <span className="gradient-text">Copyright-Safe Videos?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join thousands of creators who trust ClipMixPRO to keep their content safe and unique.
            </p>
            
            <Card className="max-w-lg mx-auto card-hover bg-card/80 backdrop-blur border-primary/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="mb-2">
                    <div className="text-lg line-through text-muted-foreground">$19.95/month</div>
                    <div className="text-4xl font-bold gradient-text">$12.95/month</div>
                    <div className="text-sm text-orange-600 font-medium">🔥 Limited Time Offer</div>
                  </div>
                  <p className="text-muted-foreground">Unlimited video processing</p>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-primary mr-3" />Unlimited video uploads</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-primary mr-3" />AI-powered scene detection</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-primary mr-3" />Smart shuffle algorithm</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-primary mr-3" />HD video exports (720p)</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-primary mr-3" />Up to 30-minute videos</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-primary mr-3" />Mix up to 2 videos together</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-primary mr-3" />Custom video length control</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-primary mr-3" />100% copyright-safe output</li>
                </ul>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-primary hover:opacity-90 shadow-primary"
                  onClick={() => navigate('/app')}
                >
                  Start Shuffling Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur border-primary/10">
                <CardContent className="p-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="text-primary mr-2">+</span>
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed pl-6">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold">ClipMixPRO</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2025 ClipMixPRO</span>
              <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</a>
              <button 
                onClick={() => setIsContactFormOpen(true)}
                className="hover:text-foreground transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={isContactFormOpen} 
        onClose={() => setIsContactFormOpen(false)} 
      />
    </div>
  );
};

export default Landing;
