import { useParams, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  content: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogPost = async () => {
      try {
        const response = await fetch('/blog-posts.json');
        const posts: BlogPost[] = await response.json();
        const foundPost = posts.find(p => p.slug === slug);
        setPost(foundPost || null);
      } catch (error) {
        console.error('Failed to load blog post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadBlogPost();
    } else {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      // Set page title for SEO
      document.title = `${post.title} | ClipMixPRO Blog`;
      
      // Set meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = post.excerpt;
        document.head.appendChild(meta);
      }
    }
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
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
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link to="/app">
                <Button className="bg-gradient-primary hover:opacity-90">Start Shuffling</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Back to Blog */}
      <div className="container mx-auto px-6 py-6">
        <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <article className="container mx-auto px-6 pb-16">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary">{post.category}</Badge>
            <div className="flex items-center text-sm text-muted-foreground space-x-4">
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            {post.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {post.excerpt}
          </p>
        </header>

        {/* Featured Image */}
        <div className="aspect-video bg-muted rounded-lg mb-8 overflow-hidden">
          {post.image && !post.image.includes('placeholder') ? (
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-muted-foreground">Featured Image</span>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {(() => {
              const lines = post.content.split('\n');
              const elements: JSX.Element[] = [];
              let currentList: string[] = [];
              let listIndex = 0;

              const flushList = () => {
                if (currentList.length > 0) {
                  elements.push(
                    <ul key={`list-${listIndex++}`} className="list-disc list-inside mb-6 space-y-2">
                      {currentList.map((item, idx) => (
                        <li key={idx} className="text-muted-foreground leading-relaxed">
                          {item.includes('**') 
                            ? item.split('**').map((part, i) => 
                                i % 2 === 1 ? <strong key={i} className="text-foreground font-semibold">{part}</strong> : part
                              )
                            : item
                          }
                        </li>
                      ))}
                    </ul>
                  );
                  currentList = [];
                }
              };

              lines.forEach((line, index) => {
                const trimmedLine = line.trim();
                
                if (trimmedLine.startsWith('# ')) {
                  flushList();
                  elements.push(
                    <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-foreground">
                      {trimmedLine.substring(2)}
                    </h1>
                  );
                } else if (trimmedLine.startsWith('## ')) {
                  flushList();
                  elements.push(
                    <h2 key={index} className="text-2xl font-semibold mt-8 mb-4 text-foreground">
                      {trimmedLine.substring(3)}
                    </h2>
                  );
                } else if (trimmedLine.startsWith('### ')) {
                  flushList();
                  elements.push(
                    <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-foreground">
                      {trimmedLine.substring(4)}
                    </h3>
                  );
                } else if (trimmedLine.startsWith('- ')) {
                  currentList.push(trimmedLine.substring(2));
                } else if (trimmedLine === '') {
                  flushList();
                  elements.push(<div key={index} className="mb-4" />);
                } else if (trimmedLine.length > 0) {
                  flushList();
                  // Handle bold text with **
                  const content = trimmedLine.includes('**') 
                    ? trimmedLine.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="text-foreground font-semibold">{part}</strong> : part
                      )
                    : trimmedLine;
                  
                  elements.push(
                    <p key={index} className="mb-4 text-muted-foreground leading-relaxed text-base">
                      {content}
                    </p>
                  );
                }
              });

              flushList(); // Flush any remaining list items
              return elements;
            })()}
          </div>

          {/* CTA within article */}
          <Card className="my-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Video Editing?</h3>
              <p className="text-muted-foreground mb-6">
                Experience the power of AI-driven video editing with ClipMixPRO. Start creating engaging content today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/app">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-primary hover:opacity-90">
                    Start Shuffling
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
        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t">
          <div className="flex justify-between items-center">
            <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Posts
            </Link>
            <Link to="/app" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
              Try ClipMixPRO
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </footer>
      </article>

      {/* Final CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Thousands of Content Creators</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your video editing workflow with AI-powered tools designed for modern creators
          </p>
          <Link to="/app">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
              Start Shuffling
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}