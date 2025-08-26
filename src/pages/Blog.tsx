import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  content: string;
  hidden?: boolean;
}

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        // Load directly from Supabase
        const { data: posts, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error loading blog posts:', error);
          setBlogPosts([]);
        } else {
          // Convert Supabase format to BlogPost format and filter out hidden posts
          const formattedPosts: BlogPost[] = (posts || [])
            .filter(post => !post.hidden) // Filter out hidden posts (handles both false and null)
            .map(post => ({
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              date: post.date,
              readTime: post.read_time,
              category: post.category,
              content: post.content,
              image: post.image,
              hidden: post.hidden
            }));

          setBlogPosts(formattedPosts);
        }
      } catch (error) {
        console.error('Failed to load blog posts:', error);
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold">ClipMixPRO</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link to="/blog" className="text-foreground font-medium">Blog</Link>
              <Link to="/app">
                <Button className="bg-gradient-primary hover:opacity-90">Try Free</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 hero-glow relative">
        <div className="container mx-auto px-6 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Master <span className="gradient-text">AI-Powered Video Editing</span> with Expert Insights
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover proven strategies, advanced techniques, and insider secrets from top creators. Learn how ClipMixPRO's AI transforms your content creation workflow.
            </p>
            
            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full border border-green-500/20 mb-8">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Free Resources • Expert Tips • Proven Results</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-4 h-auto shadow-primary"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 h-auto border-primary/20 hover:border-primary/40"
                onClick={() => {
                  const postsSection = document.querySelector('#blog-posts');
                  if (postsSection) {
                    postsSection.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }}
              >
                Explore Guides
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section id="blog-posts" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Latest Blog Posts</h2>
          {loading && <div className="text-center">Loading blog posts...</div>}
          {!loading && blogPosts.length === 0 && <div className="text-center">No blog posts found.</div>}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="block">
                <Card className="card-hover group cursor-pointer h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-card/70 backdrop-blur-lg border-primary/20 shadow-xl hover:shadow-2xl hover:shadow-primary/20">
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    {post.image && !post.image.includes('placeholder') ? (
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to gradient if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ${post.image && !post.image.includes('placeholder') ? 'hidden' : ''}`}>
                      <span className="text-muted-foreground">Blog Image</span>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground space-x-3">
                        <div className="flex items-center space-x-1">
                          <CalendarDays className="w-4 h-4" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-primary font-medium">
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 hero-glow opacity-50"></div>
        <div className="container mx-auto px-6 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to <span className="gradient-text">Automate Your Editing?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join hundreds of creators who trust ClipMixPRO to save time and increase revenue with copyright-safe, AI-powered video editing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/app">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-4 h-auto shadow-primary"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 h-auto border-primary/20 hover:border-primary/40"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Success Stats */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">15+ hrs</div>
                <div className="text-sm text-muted-foreground">Weekly Time Saved</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-border"></div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">76%+</div>
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
      </section>
    </div>
  );
}