import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">🎬</span>
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ClipMixPRO
              </span>
            </div>
            <p className="text-muted-foreground">
              Transform your videos with AI-powered scene detection and intelligent splitting.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold">Product</h3>
            <div className="space-y-2 text-muted-foreground">
              <a href="#features" className="block hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="block hover:text-foreground transition-colors">Pricing</a>
              <a href="#faq" className="block hover:text-foreground transition-colors">FAQ</a>
              <Link to="/documentation" className="block hover:text-foreground transition-colors">API</Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <div className="space-y-2 text-muted-foreground">
              <Link to="/about" className="block hover:text-foreground transition-colors">About</Link>
              <Link to="/blog" className="block hover:text-foreground transition-colors">Blog</Link>
              <Link to="/careers" className="block hover:text-foreground transition-colors">Careers</Link>
              <Link to="/contact" className="block hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <div className="space-y-2 text-muted-foreground">
              <Link to="/help-center" className="block hover:text-foreground transition-colors">Help Center</Link>
              <Link to="/documentation" className="block hover:text-foreground transition-colors">Documentation</Link>
              <Link to="/community" className="block hover:text-foreground transition-colors">Community</Link>
              <Link to="/status" className="block hover:text-foreground transition-colors">Status</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 ClipMixPRO. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;