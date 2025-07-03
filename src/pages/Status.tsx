import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Status = () => {
  const services = [
    {
      name: "Video Processing API",
      status: "operational",
      uptime: "99.98%",
      responseTime: "125ms"
    },
    {
      name: "AI Scene Detection", 
      status: "operational",
      uptime: "99.96%",
      responseTime: "1.2s"
    },
    {
      name: "File Upload Service",
      status: "operational", 
      uptime: "99.99%",
      responseTime: "89ms"
    },
    {
      name: "Export & Download",
      status: "operational",
      uptime: "99.94%",
      responseTime: "156ms"
    },
    {
      name: "Authentication",
      status: "operational",
      uptime: "99.97%",
      responseTime: "45ms"
    },
    {
      name: "Dashboard & UI",
      status: "operational",
      uptime: "99.95%",
      responseTime: "78ms"
    }
  ];

  const incidents = [
    {
      date: "March 15, 2024",
      title: "Planned Maintenance - AI Model Updates",
      status: "completed",
      duration: "45 minutes",
      description: "Scheduled maintenance to deploy improved scene detection algorithms."
    },
    {
      date: "March 10, 2024", 
      title: "Brief Processing Delays",
      status: "resolved",
      duration: "12 minutes",
      description: "Temporary slowdown in video processing due to high demand. All services restored."
    },
    {
      date: "March 5, 2024",
      title: "Upload Service Intermittent Issues",
      status: "resolved", 
      duration: "8 minutes",
      description: "Some users experienced upload failures. Issue identified and resolved quickly."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'partial': return 'bg-orange-500';
      case 'major': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational': return <Badge className="bg-green-100 text-green-800">Operational</Badge>;
      case 'completed': return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'resolved': return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold">
                System
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Status</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Real-time status of Video Splitter services and recent incident reports.
              </p>
            </div>

            {/* Overall Status */}
            <Card className="border-2 border-green-200 shadow-glow bg-gradient-to-br from-green-50 to-green-100/50 mb-12">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-green-800">All Systems Operational</h2>
                </div>
                <p className="text-green-700">
                  All Video Splitter services are running normally with optimal performance.
                </p>
              </CardContent>
            </Card>

            {/* Service Status */}
            <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">🔧 Service Status</CardTitle>
                <CardDescription>
                  Current status of all Video Splitter services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`}></div>
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {service.uptime} uptime • {service.responseTime} avg response
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">99.97%</div>
                  <div className="text-sm text-muted-foreground">Overall Uptime (30 days)</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">156ms</div>
                  <div className="text-sm text-muted-foreground">Average Response Time</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">2.1s</div>
                  <div className="text-sm text-muted-foreground">Avg Processing Time</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Incidents */}
            <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">📋 Recent Incidents</CardTitle>
                <CardDescription>
                  Past incidents and maintenance activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {incidents.map((incident, index) => (
                  <div key={index} className="border-l-4 border-l-primary pl-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{incident.title}</h3>
                        {getStatusBadge(incident.status)}
                      </div>
                      <span className="text-sm text-muted-foreground">{incident.date}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{incident.description}</p>
                    <p className="text-xs text-muted-foreground">Duration: {incident.duration}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Subscribe to Updates */}
            <Card className="border-2 border-primary/20 shadow-glow bg-gradient-to-br from-card via-card to-primary/5 mt-12">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-4">📨 Stay Updated</h3>
                <p className="text-muted-foreground mb-6">
                  Subscribe to status updates and be the first to know about any service changes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    📧 Email Notifications
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    📱 SMS Alerts
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    🔔 RSS Feed
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Status;