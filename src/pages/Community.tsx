import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Community = () => {
  const discussions = [
    {
      title: "Best practices for TikTok content",
      author: "Sarah Chen",
      replies: 23,
      category: "Tips & Tricks",
      timeAgo: "2 hours ago",
      trending: true
    },
    {
      title: "How to optimize scene detection for documentaries",
      author: "Mike Rodriguez", 
      replies: 15,
      category: "Technical",
      timeAgo: "5 hours ago",
      trending: false
    },
    {
      title: "Show your before/after transformations",
      author: "Emma Thompson",
      replies: 41,
      category: "Showcase",
      timeAgo: "1 day ago",
      trending: true
    },
    {
      title: "Feature request: Custom export presets",
      author: "Alex Kim",
      replies: 8,
      category: "Feature Requests",
      timeAgo: "2 days ago",
      trending: false
    },
    {
      title: "Monthly Creator Challenge: March 2024",
      author: "Video Splitter Team",
      replies: 67,
      category: "Challenges",
      timeAgo: "3 days ago",
      trending: true
    }
  ];

  const stats = [
    { label: "Active Members", value: "5,200+" },
    { label: "Discussions", value: "1,800+" },
    { label: "Videos Shared", value: "850+" },
    { label: "Tips Exchanged", value: "3,400+" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold">
                Creator
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Community</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with fellow creators, share tips, showcase your work, and learn from the best in video editing.
              </p>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-card bg-card/80 backdrop-blur-sm text-center">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Community Guidelines */}
            <Card className="border-2 border-primary/20 shadow-glow bg-gradient-to-br from-card via-card to-primary/5 mb-16">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">🌟 Join Our Community</h2>
                <p className="text-muted-foreground mb-6">
                  Our community is built on collaboration, creativity, and mutual support. Whether you're a beginner 
                  or an expert, there's a place for you here.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="hero">Join Discord</Button>
                  <Button variant="outline">Community Guidelines</Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Discussions */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">💬 Recent Discussions</CardTitle>
                    <CardDescription>
                      Latest conversations from our community
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {discussions.map((discussion, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={discussion.trending ? "default" : "secondary"} className="text-xs">
                              {discussion.category}
                            </Badge>
                            {discussion.trending && (
                              <Badge variant="outline" className="text-xs">
                                🔥 Trending
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{discussion.timeAgo}</span>
                        </div>
                        <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                          {discussion.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>by {discussion.author}</span>
                          <span>{discussion.replies} replies</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>🏆 Top Contributors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: "Sarah Chen", points: "2,450 pts", role: "Video Master" },
                      { name: "Mike Rodriguez", points: "1,890 pts", role: "AI Expert" },
                      { name: "Emma Thompson", points: "1,620 pts", role: "Creative Guru" }
                    ].map((contributor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{contributor.name}</div>
                          <div className="text-xs text-muted-foreground">{contributor.role}</div>
                        </div>
                        <div className="text-sm text-primary">{contributor.points}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>📚 Popular Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      "Scene Detection Best Practices",
                      "Export Quality Guide",
                      "Beginner's Workflow Tutorial",
                      "Advanced Shuffling Techniques"
                    ].map((resource, index) => (
                      <div key={index} className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                        • {resource}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-3">🎯</div>
                    <h3 className="font-semibold mb-2">Weekly Challenge</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a 60-second video using only 2-second scenes
                    </p>
                    <Button variant="outline" size="sm">Participate</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;