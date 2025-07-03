import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Blog = () => {
  const posts = [
    {
      title: "The Future of AI-Powered Video Editing",
      excerpt: "Discover how artificial intelligence is revolutionizing the way we create and edit video content.",
      date: "March 15, 2024",
      category: "Technology",
      readTime: "5 min read"
    },
    {
      title: "10 Tips for Creating Engaging Short-Form Content",
      excerpt: "Master the art of creating compelling short videos that capture and hold your audience's attention.",
      date: "March 12, 2024", 
      category: "Content Creation",
      readTime: "7 min read"
    },
    {
      title: "How Scene Detection Technology Works",
      excerpt: "A deep dive into the computer vision algorithms that power Video Splitter's intelligent scene detection.",
      date: "March 8, 2024",
      category: "Technical",
      readTime: "6 min read"
    },
    {
      title: "Content Creator Success Stories",
      excerpt: "Real stories from creators who transformed their workflow and increased engagement using Video Splitter.",
      date: "March 5, 2024",
      category: "Case Studies",
      readTime: "4 min read"
    },
    {
      title: "Video Format Guide: What You Need to Know",
      excerpt: "Understanding different video formats, codecs, and quality settings for optimal content creation.",
      date: "March 1, 2024",
      category: "Education",
      readTime: "8 min read"
    },
    {
      title: "The Psychology of Video Engagement",
      excerpt: "Learn about the psychological factors that make videos engaging and how to apply them to your content.",
      date: "February 28, 2024",
      category: "Strategy", 
      readTime: "6 min read"
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
                Video Splitter
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Blog</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Insights, tips, and stories from the world of AI-powered video editing and content creation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Card key={index} className="border-0 shadow-card bg-card/80 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {post.readTime}
                      </span>
                    </div>
                    <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {post.date}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-16">
              <p className="text-muted-foreground mb-4">
                Want to stay updated with our latest posts?
              </p>
              <p className="text-foreground">
                Follow us or subscribe to our newsletter for weekly insights.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;