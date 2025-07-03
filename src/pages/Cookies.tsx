import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Cookies = () => {
  const lastUpdated = "March 1, 2024";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold">
                Cookie
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Policy</span>
              </h1>
              <p className="text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            </div>

            <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 prose prose-gray max-w-none">
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
                    <p className="text-muted-foreground">
                      Cookies are small text files that are stored on your device when you visit our website. 
                      They help us provide you with a better experience by remembering your preferences and 
                      analyzing how you use our service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>
                    
                    <div className="space-y-6">
                      <div className="border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2 text-green-600">Essential Cookies</h3>
                        <p className="text-muted-foreground mb-3">
                          These cookies are necessary for the website to function properly. They enable core functionality 
                          such as security, network management, and accessibility.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Authentication and login state</li>
                          <li>• Session management</li>
                          <li>• Security tokens</li>
                          <li>• Load balancing</li>
                        </ul>
                        <p className="text-xs text-muted-foreground mt-3">
                          <strong>These cannot be disabled as they are essential for the service to work.</strong>
                        </p>
                      </div>

                      <div className="border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2 text-blue-600">Functional Cookies</h3>
                        <p className="text-muted-foreground mb-3">
                          These cookies allow us to remember choices you make and provide enhanced, more personal features.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• User preferences and settings</li>
                          <li>• Language and region settings</li>
                          <li>• Theme preferences (dark/light mode)</li>
                          <li>• Video quality preferences</li>
                        </ul>
                      </div>

                      <div className="border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2 text-purple-600">Analytics Cookies</h3>
                        <p className="text-muted-foreground mb-3">
                          These cookies help us understand how visitors interact with our website by collecting 
                          and reporting information anonymously.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Page views and user behavior</li>
                          <li>• Feature usage statistics</li>
                          <li>• Performance monitoring</li>
                          <li>• Error tracking and debugging</li>
                        </ul>
                      </div>

                      <div className="border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2 text-orange-600">Marketing Cookies</h3>
                        <p className="text-muted-foreground mb-3">
                          These cookies track your activity across websites to help advertisers deliver more relevant advertising.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Advertising personalization</li>
                          <li>• Campaign effectiveness</li>
                          <li>• Social media integration</li>
                          <li>• Cross-site tracking prevention</li>
                        </ul>
                        <p className="text-xs text-muted-foreground mt-3">
                          <strong>Currently, we do not use marketing cookies.</strong>
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
                    <p className="text-muted-foreground mb-4">
                      We may use third-party services that set their own cookies:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• <strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                      <li>• <strong>Stripe:</strong> For secure payment processing</li>
                      <li>• <strong>Supabase:</strong> For backend services and authentication</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">Managing Your Cookie Preferences</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Browser Settings</h3>
                        <p className="text-muted-foreground">
                          You can control and/or delete cookies as you wish through your browser settings. 
                          You can delete all cookies that are already on your computer and set most browsers 
                          to prevent them from being placed.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Our Cookie Preferences</h3>
                        <p className="text-muted-foreground mb-4">
                          You can manage your cookie preferences for our website using the controls below:
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-border rounded">
                            <span className="font-medium">Essential Cookies</span>
                            <span className="text-sm text-muted-foreground">Always Active</span>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-border rounded">
                            <span className="font-medium">Functional Cookies</span>
                            <Button variant="outline" size="sm">Manage</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-border rounded">
                            <span className="font-medium">Analytics Cookies</span>
                            <Button variant="outline" size="sm">Manage</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">Cookie Retention</h2>
                    <p className="text-muted-foreground mb-4">
                      Different cookies have different lifespans:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• <strong>Session cookies:</strong> Deleted when you close your browser</li>
                      <li>• <strong>Persistent cookies:</strong> Remain for a set period (typically 30 days to 2 years)</li>
                      <li>• <strong>Authentication cookies:</strong> Last until you log out or they expire (30 days)</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
                    <p className="text-muted-foreground">
                      We may update this cookie policy from time to time to reflect changes in our practices or 
                      for other operational, legal, or regulatory reasons.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                    <p className="text-muted-foreground">
                      If you have any questions about our use of cookies, please contact us at:
                    </p>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-foreground">
                        <strong>Email:</strong> privacy@videosplitter.com<br />
                        <strong>Subject:</strong> Cookie Policy Inquiry
                      </p>
                    </div>
                  </section>
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

export default Cookies;