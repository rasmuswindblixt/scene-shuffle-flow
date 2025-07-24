import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md bg-background/90 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-black to-gray-800 flex items-center justify-center cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/')}>
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/')}>ClipMixPRO</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-primary/10 transition-colors border-primary/20">
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
              <p className="text-muted-foreground text-center">Last updated: January 2025</p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing and using ClipMixPRO, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
                  <p className="text-muted-foreground mb-4">
                    ClipMixPRO is a video processing service that allows users to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Upload and analyze video files for scene detection</li>
                    <li>Automatically shuffle and mix video clips</li>
                    <li>Export processed videos in high quality</li>
                    <li>Manage video processing settings and preferences</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. User Accounts and Subscriptions</h2>
                  <p className="text-muted-foreground mb-4">
                    To access our premium features, you must create an account and maintain an active subscription.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>You are responsible for maintaining the confidentiality of your account</li>
                    <li>Subscription fees are billed monthly and are non-refundable</li>
                    <li>You may cancel your subscription at any time</li>
                    <li>Access to premium features ends when your subscription expires</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
                  <p className="text-muted-foreground mb-4">
                    You agree to use ClipMixPRO only for lawful purposes and in accordance with these Terms. You may not:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Upload content that violates copyright or other intellectual property rights</li>
                    <li>Process videos containing illegal, harmful, or offensive material</li>
                    <li>Attempt to reverse engineer or compromise our service</li>
                    <li>Use the service to generate spam or malicious content</li>
                    <li>Share your account credentials with others</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Content and Intellectual Property</h2>
                  <p className="text-muted-foreground mb-4">
                    You retain ownership of all content you upload to ClipMixPRO. However:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>You are solely responsible for ensuring you have rights to upload and process your content</li>
                    <li>We do not store your video files on our servers after processing</li>
                    <li>All processing is done client-side in your browser</li>
                    <li>ClipMixPRO and all related technology remain our intellectual property</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Service Availability</h2>
                  <p className="text-muted-foreground">
                    We strive to maintain high service availability but cannot guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue the service at any time with reasonable notice.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    ClipMixPRO is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
                  <p className="text-muted-foreground">
                    We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
                  <p className="text-muted-foreground">
                    We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service. Continued use after changes constitutes acceptance of the new terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about these Terms of Service, please contact us at{" "}
                    <a href="mailto:pptskolan@gmail.com" className="text-primary hover:underline">
                      pptskolan@gmail.com
                    </a>
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService; 