import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { parseMarkdownFile, BlogPostMeta } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const Blog = () => {
  const [posts, setPosts] = useState<(BlogPostMeta & { content: string })[]>([]);

  useEffect(() => {
    const files = import.meta.glob("../blog-posts/*.md", { as: "raw" });
    const loadPosts = async () => {
      const entries = await Promise.all(
        Object.entries(files).map(async ([path, loader]) => {
          const slug = path.split("/").pop()?.replace(/\\.md$/, "") || "";
          const content = await loader();
          return parseMarkdownFile(content, slug);
        })
      );
      entries.sort((a, b) => (b.date > a.date ? 1 : -1));
      setPosts(entries);
    };
    loadPosts();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold">
                ClipMixPRO
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Blog</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Insights, tips, and stories from the world of AI-powered video editing and content creation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.length === 0 ? (
                <div className="col-span-3 text-center text-muted-foreground text-lg">No blog posts yet. Add markdown files to <code>src/blog-posts/</code>.</div>
              ) : (
                posts.map((post, index) => (
                  <Card key={index} className="border-0 shadow-card bg-card/80 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer" itemScope itemType="https://schema.org/BlogPosting">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs" itemProp="articleSection">
                          {post.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground" itemProp="timeRequired">
                          {post.readTime}
                        </span>
                      </div>
                      <CardTitle className="text-xl leading-tight hover:text-primary transition-colors" itemProp="headline">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground" itemProp="description">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground mb-4" itemProp="datePublished">
                        {post.date}
                      </div>
                      <div className="prose prose-neutral max-w-none text-sm">
                        <ReactMarkdown>
                          {post.content}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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