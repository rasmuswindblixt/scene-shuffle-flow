import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicy = () => {
  const lastUpdated = "March 1, 2024";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold">
                Privacy
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
                    <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                        <p className="text-muted-foreground">
                          When you create an account, we collect your email address, password, and any profile information you choose to provide.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Video Content</h3>
                        <p className="text-muted-foreground">
                          We temporarily process your uploaded videos to provide our scene detection and splitting services. Videos are automatically deleted after 24 hours.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Usage Data</h3>
                        <p className="text-muted-foreground">
                          We collect information about how you use Video Splitter, including features accessed, processing time, and general usage patterns.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Provide and improve our video processing services</li>
                      <li>• Process your videos using our AI algorithms</li>
                      <li>• Communicate with you about your account and our services</li>
                      <li>• Analyze usage patterns to improve our technology</li>
                      <li>• Prevent fraud and ensure security</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">3. Data Storage and Security</h2>
                    <p className="text-muted-foreground mb-4">
                      We implement industry-standard security measures to protect your data:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• All data is encrypted in transit and at rest</li>
                      <li>• Videos are automatically deleted after 24 hours</li>
                      <li>• Access to user data is strictly limited to authorized personnel</li>
                      <li>• Regular security audits and monitoring</li>
                      <li>• SOC 2 Type II compliance (in progress)</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">4. Data Sharing</h2>
                    <p className="text-muted-foreground mb-4">
                      We do not sell or rent your personal information. We may share data only in these limited circumstances:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• With your explicit consent</li>
                      <li>• To comply with legal obligations</li>
                      <li>• To protect our rights and prevent fraud</li>
                      <li>• With trusted service providers under strict confidentiality agreements</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
                    <p className="text-muted-foreground mb-4">You have the right to:</p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Access your personal data</li>
                      <li>• Correct inaccurate information</li>
                      <li>• Delete your account and associated data</li>
                      <li>• Export your data</li>
                      <li>• Opt out of marketing communications</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
                    <p className="text-muted-foreground">
                      We use necessary cookies to provide our services and optional cookies for analytics and improvement. 
                      You can control cookie preferences through your browser settings.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">7. International Transfers</h2>
                    <p className="text-muted-foreground">
                      Your data may be processed in countries where we or our service providers operate. 
                      We ensure appropriate safeguards are in place for international data transfers.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">8. Changes to This Policy</h2>
                    <p className="text-muted-foreground">
                      We may update this privacy policy from time to time. We will notify you of any material changes 
                      via email or through our service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
                    <p className="text-muted-foreground">
                      If you have any questions about this privacy policy or our data practices, please contact us at:
                    </p>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-foreground">
                        <strong>Email:</strong> privacy@videosplitter.com<br />
                        <strong>Subject:</strong> Privacy Policy Inquiry
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

export default PrivacyPolicy;