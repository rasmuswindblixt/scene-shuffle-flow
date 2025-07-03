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
                Video Splitter
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
              <a href="#" className="block hover:text-foreground transition-colors">Features</a>
              <a href="#" className="block hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="block hover:text-foreground transition-colors">Demo</a>
              <a href="#" className="block hover:text-foreground transition-colors">API</a>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <div className="space-y-2 text-muted-foreground">
              <a href="#" className="block hover:text-foreground transition-colors">About</a>
              <a href="#" className="block hover:text-foreground transition-colors">Blog</a>
              <a href="#" className="block hover:text-foreground transition-colors">Careers</a>
              <a href="#" className="block hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <div className="space-y-2 text-muted-foreground">
              <a href="#" className="block hover:text-foreground transition-colors">Help Center</a>
              <a href="#" className="block hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="block hover:text-foreground transition-colors">Community</a>
              <a href="#" className="block hover:text-foreground transition-colors">Status</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 Video Splitter. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;