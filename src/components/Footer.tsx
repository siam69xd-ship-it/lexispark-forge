import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-6">
            <Link to="/about" className="hover:text-foreground transition-colors">
              About Us
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground mb-2">
            © {new Date().getFullYear()} ShobdoHub
          </p>
          <p className="text-xs text-muted-foreground/70">
            Built to help learners understand language, not memorize it.
          </p>
        </div>
      </div>
    </footer>
  );
}