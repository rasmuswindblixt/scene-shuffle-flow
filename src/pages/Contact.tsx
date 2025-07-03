import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold">
                Get in
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Touch</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have questions, feedback, or need support? We'd love to hear from you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your question or feedback..."
                      rows={5}
                    />
                  </div>
                  <Button variant="hero" className="w-full">
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">📧 Email Support</h3>
                    <p className="text-muted-foreground mb-2">
                      For general inquiries and support:
                    </p>
                    <a href="mailto:support@videosplitter.com" className="text-primary hover:underline">
                      support@videosplitter.com
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">💼 Business Inquiries</h3>
                    <p className="text-muted-foreground mb-2">
                      For partnerships and business opportunities:
                    </p>
                    <a href="mailto:business@videosplitter.com" className="text-primary hover:underline">
                      business@videosplitter.com
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">⚡ Response Time</h3>
                    <p className="text-muted-foreground">
                      We typically respond to all inquiries within 2-4 hours during business days 
                      (Monday-Friday, 9 AM - 6 PM EST).
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">🔄 Status Updates</h3>
                    <p className="text-muted-foreground mb-2">
                      Check our system status and service updates:
                    </p>
                    <a href="/status" className="text-primary hover:underline">
                      status.videosplitter.com
                    </a>
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

export default Contact;