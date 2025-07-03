import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const TermsOfService = () => {
  const lastUpdated = "March 1, 2024";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-bold">
                Terms of
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Service</span>
              </h1>
              <p className="text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            </div>

            <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8 prose prose-gray max-w-none">
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                    <p className="text-muted-foreground">
                      By accessing and using Video Splitter, you accept and agree to be bound by the terms and provision of this agreement. 
                      If you do not agree to abide by the above, please do not use this service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">2. Service Description</h2>
                    <p className="text-muted-foreground mb-4">
                      Video Splitter provides AI-powered video processing services including:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Automated scene detection and video splitting</li>
                      <li>• Intelligent scene shuffling and filtering</li>
                      <li>• Video export and download services</li>
                      <li>• Real-time preview and editing tools</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Account Creation</h3>
                        <p className="text-muted-foreground">
                          You must provide accurate and complete information when creating an account. 
                          You are responsible for maintaining the security of your account credentials.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Account Termination</h3>
                        <p className="text-muted-foreground">
                          We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">4. Acceptable Use</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Permitted Use</h3>
                        <p className="text-muted-foreground">
                          You may use Video Splitter for lawful content creation, editing, and processing purposes.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Prohibited Content</h3>
                        <p className="text-muted-foreground mb-2">You may not upload or process content that:</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Violates copyright or intellectual property rights</li>
                          <li>• Contains illegal, harmful, or offensive material</li>
                          <li>• Includes malware, viruses, or malicious code</li>
                          <li>• Violates privacy rights of individuals</li>
                          <li>• Is used for spam or fraudulent purposes</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">5. Subscription and Payment</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Subscription Terms</h3>
                        <p className="text-muted-foreground">
                          Subscriptions are billed monthly and automatically renew unless cancelled. 
                          You can cancel your subscription at any time through your account settings.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Refund Policy</h3>
                        <p className="text-muted-foreground">
                          Refunds are handled on a case-by-case basis. Contact our support team for refund requests.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Your Content</h3>
                        <p className="text-muted-foreground">
                          You retain ownership of your uploaded videos. You grant us a limited license to process 
                          your content solely for providing our services.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Our Service</h3>
                        <p className="text-muted-foreground">
                          Video Splitter and its technology are protected by intellectual property laws. 
                          You may not reverse engineer, copy, or distribute our software.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">7. Data and Privacy</h2>
                    <p className="text-muted-foreground">
                      Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                      use, and protect your information.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">8. Service Availability</h2>
                    <p className="text-muted-foreground">
                      We strive to maintain high service availability but cannot guarantee uninterrupted access. 
                      We reserve the right to modify or discontinue services with reasonable notice.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                    <p className="text-muted-foreground">
                      Video Splitter is provided "as is" without warranties. We are not liable for any indirect, 
                      incidental, or consequential damages arising from use of our service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
                    <p className="text-muted-foreground">
                      We may update these terms from time to time. We will notify users of material changes 
                      and continued use constitutes acceptance of updated terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
                    <p className="text-muted-foreground">
                      For questions about these terms, please contact us at:
                    </p>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-foreground">
                        <strong>Email:</strong> legal@videosplitter.com<br />
                        <strong>Subject:</strong> Terms of Service Inquiry
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

export default TermsOfService;