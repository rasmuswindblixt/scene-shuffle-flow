import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { parseMarkdownFile, BlogPostMeta } from "@/lib/utils";

const BlogPreview = () => {
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);

  useEffect(() => {
    // Vite's import.meta.glob for markdown files
    const files = import.meta.glob("../blog-posts/*.md", { query: "?raw", import: "default" });
    const loadPosts = async () => {
      const entries = await Promise.all(
        Object.entries(files).map(async ([path, loader]) => {
          const slug = path.split("/").pop()?.replace(/\.md$/, "") || "";
          const content = await loader();
          return parseMarkdownFile(content as string, slug);
        })
      );
      // Sort by date descending
      entries.sort((a, b) => (b.date > a.date ? 1 : -1));
      setPosts(entries.slice(0, 3));
    };
    loadPosts();
  }, []);

  return (
    <section className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            📚 From the Blog
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Latest Insights & SEO Tips
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn how to grow your channel, automate your workflow, and master AI-powered video editing.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-8">
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
                  <div className="text-sm text-muted-foreground" itemProp="datePublished">
                    {post.date}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <div className="text-center">
          <Link to="/blog" className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg shadow hover:opacity-90 transition">
            Read More Blog Posts
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview; 