import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Copy, Eye, Save, Upload, X, Image as ImageIcon, CalendarDays, Clock, ArrowRight, Edit, Trash2, EyeOff } from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
  image: string;
  hidden?: boolean;
}

const BlogAdmin = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "",
    readTime: "",
    content: "",
    featuredImage: null as File | null,
    imagePreview: "" as string
  });

  const [generatedCode, setGeneratedCode] = useState({
    blogListingCode: "",
    blogPostCode: ""
  });

  const [publishedPosts, setPublishedPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Video Editing",
    "YouTube",
    "TikTok",
    "Instagram",
    "Content Creation",
    "AI Technology",
    "YouTube Automation",
    "Social Media",
    "Marketing"
  ];

  // Generate URL-friendly slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Estimate read time based on content length
  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData({
        ...formData,
        featuredImage: file,
        imagePreview: e.target?.result as string
      });
    };
    reader.readAsDataURL(file);
    toast.success("Image uploaded successfully!");
  };

  // Remove uploaded image
  const removeImage = () => {
    setFormData({
      ...formData,
      featuredImage: null,
      imagePreview: ""
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Generate image path for production
  const generateImagePath = (slug: string, file: File) => {
    const extension = file.name.split('.').pop();
    return `/blog-images/${slug}.${extension}`;
  };

  // Parse content and extract title if not provided
  const parseContent = (content: string) => {
    const lines = content.trim().split('\n');
    let title = formData.title;
    let cleanContent = content;

    // If no title provided, try to extract from first # header
    if (!title && lines[0]?.startsWith('# ')) {
      title = lines[0].substring(2).trim();
      // Remove the title line from content since it will be displayed separately
      cleanContent = lines.slice(1).join('\n').trim();
    }

    return { title, cleanContent };
  };

  const publishBlogPost = async () => {
    if (!formData.content.trim()) {
      toast.error("Please enter blog content");
      return;
    }

    const { title, cleanContent } = parseContent(formData.content);
    
    if (!title) {
      toast.error("Please provide a title or start your content with # Title");
      return;
    }

    const slug = generateSlug(title);
    const today = new Date().toISOString().split('T')[0];
    const readTime = formData.readTime || estimateReadTime(cleanContent);
    const excerpt = formData.excerpt || `${cleanContent.split('\n').find(line => line.trim() && !line.startsWith('#'))?.substring(0, 150)}...`;

    // Handle image path
    const imagePath = formData.featuredImage 
      ? generateImagePath(slug, formData.featuredImage)
      : "/api/placeholder/400/250";

    const blogPost: BlogPost = {
      slug,
      title,
      excerpt,
      date: today,
      readTime,
      category: formData.category || "Content Creation",
      content: cleanContent,
      image: imagePath
    };

    try {
      // Load existing posts
      let existingPosts: BlogPost[] = [];
      try {
        const response = await fetch('/blog-posts.json');
        existingPosts = await response.json();
      } catch (error) {
        console.log('No existing posts found, starting with empty array');
      }

      // Check if post with same slug already exists
      const existingIndex = existingPosts.findIndex(p => p.slug === slug);
      
      if (existingIndex >= 0) {
        // Update existing post
        existingPosts[existingIndex] = blogPost;
        toast.success("Blog post updated successfully!");
      } else {
        // Add new post at the beginning (newest first)
        existingPosts.unshift(blogPost);
        toast.success("Blog post published successfully!");
      }

      // Save image if uploaded
      if (formData.featuredImage) {
        // In a real implementation, you'd save the image to the server
        // For now, we'll show instructions
        toast.info(`Please save the image as: public${imagePath}`);
      }

      // In a real implementation, you'd save to server
      // For now, we'll show the JSON that should be saved
      setGeneratedCode({
        blogListingCode: JSON.stringify(existingPosts, null, 2),
        blogPostCode: "Posts saved to blog-posts.json"
      });

      // Update local state
      setPublishedPosts(existingPosts);
      
      // Clear form
      setFormData({
        title: "",
        excerpt: "",
        category: "",
        readTime: "",
        content: "",
        featuredImage: null,
        imagePreview: ""
      });

      setEditingPost(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      console.error('Failed to publish blog post:', error);
      toast.error("Failed to publish blog post. Please try again.");
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} code copied to clipboard!`);
  };

  const downloadImage = () => {
    if (!formData.featuredImage || !formData.imagePreview) return;
    
    const { title } = parseContent(formData.content);
    const slug = generateSlug(title);
    const extension = formData.featuredImage.name.split('.').pop();
    const fileName = `${slug}.${extension}`;
    
    // Create download link
    const link = document.createElement('a');
    link.href = formData.imagePreview;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Image downloaded as ${fileName}`);
  };

  // Load published posts
  useEffect(() => {
    const loadPublishedPosts = async () => {
      try {
        const response = await fetch('/blog-posts.json');
        const posts = await response.json();
        setPublishedPosts(posts);
      } catch (error) {
        console.error('Failed to load published posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPublishedPosts();
  }, []);

  // Edit post
  const editPost = (post: BlogPost) => {
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      readTime: post.readTime,
      content: post.content,
      featuredImage: null,
      imagePreview: ""
    });
    setEditingPost(post.slug);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info(`Editing "${post.title}"`);
  };

  // Delete post
  const deletePost = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const updatedPosts = publishedPosts.filter(p => p.slug !== slug);
      setPublishedPosts(updatedPosts);
      
      // Update generated code to show new JSON
      setGeneratedCode({
        blogListingCode: JSON.stringify(updatedPosts, null, 2),
        blogPostCode: "Post deleted - save updated JSON"
      });
      
      toast.success("Post deleted successfully!");
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error("Failed to delete post");
    }
  };

  // Toggle post visibility (hide/show)
  const togglePostVisibility = async (slug: string) => {
    try {
      const updatedPosts = publishedPosts.map(p => 
        p.slug === slug 
          ? { ...p, hidden: !p.hidden } 
          : p
      );
      setPublishedPosts(updatedPosts);
      
      // Update generated code
      setGeneratedCode({
        blogListingCode: JSON.stringify(updatedPosts, null, 2),
        blogPostCode: "Post visibility updated - save updated JSON"
      });
      
      const post = updatedPosts.find(p => p.slug === slug);
      toast.success(`Post ${post?.hidden ? 'hidden' : 'shown'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle post visibility:', error);
      toast.error("Failed to update post visibility");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setFormData({
      title: "",
      excerpt: "",
      category: "",
      readTime: "",
      content: "",
      featuredImage: null,
      imagePreview: ""
    });
    setEditingPost(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Edit cancelled");
  };

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
            <div className="flex items-center space-x-4">
              <Link to="/blog">
                <Button variant="outline">View Blog</Button>
              </Link>
              <Link to="/">
                <Button variant="ghost">Back to Site</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Blog Admin</h1>
            <p className="text-muted-foreground">
              Create and manage blog posts. Paste your formatted content and generate the code to add to your blog.
            </p>
          </div>

          <div className="grid lg:grid-cols-6 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Blog Post Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title (optional if content starts with # Title)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Your Blog Post Title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt (optional - will auto-generate if empty)</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                      placeholder="A compelling description for the blog listing page..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="readTime">Read Time (optional - will auto-estimate)</Label>
                    <Input
                      id="readTime"
                      value={formData.readTime}
                      onChange={(e) => setFormData({...formData, readTime: e.target.value})}
                      placeholder="5 min read"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Upload Featured Image (optional)</Label>
                    <div className="mt-2">
                      {!formData.imagePreview ? (
                        <div 
                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WebP up to 5MB<br/>
                            <strong>Recommended:</strong> 1200x675px (16:9 ratio)
                          </p>
                        </div>
                      ) : (
                        <div className="relative">
                          <img 
                            src={formData.imagePreview} 
                            alt="Featured image preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    {formData.featuredImage && (
                      <div className="mt-2 space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <p><strong>File:</strong> {formData.featuredImage.name}</p>
                          <p><strong>Size:</strong> {(formData.featuredImage.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadImage}
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Download Optimized Image
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Blog Content</CardTitle>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Formatting Guide:</strong></p>
                    <p>• <code># Title</code> - Main headers</p>
                    <p>• <code>## Section</code> - Section headers</p>
                    <p>• <code>### Subsection</code> - Subsection headers</p>
                    <p>• <code>- List item</code> - Bullet points</p>
                    <p>• <code>**bold text**</code> - Bold formatting</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder={`# Your Blog Post Title

Introduction paragraph explaining what readers will learn.

## Main Section Header

Your content here with regular paragraphs.

### Subsection Header

More detailed content.

## Benefits Include:
- First benefit point
- Second benefit point
- **Important bold point**
- Fourth benefit

## Conclusion

Wrap up with key takeaways and mention ClipMixPRO if relevant.`}
                    rows={20}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button onClick={publishBlogPost} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingPost ? "Update Post" : "Publish Blog Post"}
                </Button>
                {editingPost && (
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
              {editingPost && (
                <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <strong>Editing:</strong> {publishedPosts.find(p => p.slug === editingPost)?.title}
                </div>
              )}
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <p className="text-sm text-muted-foreground">See how your blog post will look</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Blog Card Preview */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Blog Listing Preview:</h4>
                    <Card className="card-hover group max-w-sm">
                      <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                        {formData.imagePreview ? (
                          <img 
                            src={formData.imagePreview} 
                            alt="Featured image preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">Blog Image</span>
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {formData.category || "Category"}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground space-x-2">
                            <div className="flex items-center space-x-1">
                              <CalendarDays className="w-3 h-3" />
                              <span>{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formData.readTime || estimateReadTime(formData.content) || "5 min read"}</span>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {(() => {
                            const { title } = parseContent(formData.content);
                            return formData.title || title || "Your Blog Post Title";
                          })()}
                        </h3>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                          {formData.excerpt || `${formData.content.split('\n').find(line => line.trim() && !line.startsWith('#'))?.substring(0, 100)}...` || "Your blog post excerpt will appear here..."}
                        </p>
                        <Button variant="ghost" size="sm" className="group/btn p-0 h-auto text-xs">
                          Read More
                          <ArrowRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Blog Post Header Preview */}
                  {(formData.title || formData.content) && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Blog Post Header Preview:</h4>
                      <div className="border rounded-lg p-4 bg-muted/20">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {formData.category || "Category"}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground space-x-3">
                            <div className="flex items-center space-x-1">
                              <CalendarDays className="w-3 h-3" />
                              <span>{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formData.readTime || estimateReadTime(formData.content) || "5 min read"}</span>
                            </div>
                          </div>
                        </div>
                        <h1 className="text-lg font-bold mb-2 gradient-text line-clamp-2">
                          {(() => {
                            const { title } = parseContent(formData.content);
                            return formData.title || title || "Your Blog Post Title";
                          })()}
                        </h1>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {formData.excerpt || `${formData.content.split('\n').find(line => line.trim() && !line.startsWith('#'))?.substring(0, 150)}...` || "Your blog post excerpt will appear here..."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Featured Image Preview */}
                  {formData.imagePreview && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Featured Image Preview:</h4>
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={formData.imagePreview} 
                          alt="Featured image preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Updated JSON */}
            <div className="lg:col-span-1 space-y-6">
              {generatedCode.blogListingCode && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Updated blog-posts.json</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedCode.blogListingCode, "Updated JSON")}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy JSON
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-2">
                      Replace the contents of <code>public/blog-posts.json</code> with:
                    </div>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      <code>{generatedCode.blogListingCode}</code>
                    </pre>
                  </CardContent>
                </Card>
              )}

              {generatedCode.blogListingCode && (
                <Card>
                  <CardHeader>
                    <CardTitle>Instructions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Step 1: Update JSON File</h4>
                      <p className="text-sm text-muted-foreground">
                        Copy the JSON above and replace the contents of <code>public/blog-posts.json</code>
                      </p>
                    </div>
                    {formData.featuredImage && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Step 2: Save Featured Image</h4>
                        <p className="text-sm text-muted-foreground">
                          Save the uploaded image to <code>public/blog-images/</code> with the filename shown above
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadImage}
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Download Image
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Step {formData.featuredImage ? '3' : '2'}: View Your Post</h4>
                      <p className="text-sm text-muted-foreground">
                        Your post is now live! Visit the blog to see it.
                      </p>
                    </div>
                    <Link to="/blog">
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Blog
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Published Posts Management */}
          <div className="mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Published Posts ({publishedPosts.length})</span>
                  <Link to="/blog">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Blog
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : publishedPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No blog posts published yet.</p>
                    <p className="text-sm mt-2">Create your first post using the form above!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {publishedPosts.map((post) => (
                      <div
                        key={post.slug}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          post.hidden ? 'opacity-60 bg-muted/50' : 'bg-card'
                        } ${editingPost === post.slug ? 'border-primary bg-primary/5' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{post.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {post.category}
                            </Badge>
                            {post.hidden && (
                              <Badge variant="outline" className="text-xs">
                                Hidden
                              </Badge>
                            )}
                            {editingPost === post.slug && (
                              <Badge variant="default" className="text-xs">
                                Editing
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {new Date(post.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.readTime}
                            </div>
                            <span className="text-xs">/{post.slug}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {post.excerpt}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editPost(post)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePostVisibility(post.slug)}
                            className={`${
                              post.hidden 
                                ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                                : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                            }`}
                          >
                            {post.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePost(post.slug)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogAdmin;
