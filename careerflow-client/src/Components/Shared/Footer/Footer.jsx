import { Twitter, Linkedin, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router";

export default function Footer() {
  return (
    // Replaced hardcoded dark gradient with theme-aware base color
    <footer className="bg-base-100 text-base-content border-t border-base-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1 - Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* Logo uses theme primary color */}
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-primary-content font-bold text-lg shadow-md">
                🎁
              </div>
              <h2 className="text-xl font-semibold text-base-content">
                CareerFlow
              </h2>
            </div>

            <p className="text-sm leading-relaxed mb-4 text-base-content/60">
              Helping students and tech enthusiasts land their dream jobs,
              one application at a time.
            </p>

            <div className="text-xl mb-6">🚀</div>

            {/* Social Icons - Uses base-300 for theme consistency */}
            <div className="flex gap-4">
              {[Twitter, Linkedin, Instagram, MessageCircle].map((Icon, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-base-200 text-base-content/70 hover:bg-primary hover:text-primary-content transition-all cursor-pointer shadow-sm"
                >
                  <Icon size={18} />
                </div>
              ))}
            </div>
          </div>

          {/* Column 2 - Product */}
          <div>
            <h3 className="text-base-content font-bold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              {["Features", "Pricing", "Chrome Extension", "Mobile App", "Changelog"].map((item) => (
                <li key={item} className="text-base-content/70 hover:text-primary transition cursor-pointer">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h3 className="text-base-content font-bold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              {["Blog", "Interview Prep Guide", "Resume Templates", "Community Forum"].map((item) => (
                <li key={item} className="text-base-content/70 hover:text-primary transition cursor-pointer">
                  {item}
                </li>
              ))}
              <li className="text-base-content/70 hover:text-primary transition cursor-pointer">
                <Link to="/faq">Help Center & FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Company */}
          <div>
            <h3 className="text-base-content font-bold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li className="text-base-content/70 hover:text-primary transition cursor-pointer">
                <Link to="/our-story">Our Story</Link>
              </li>
              {["Student Stories", "We're Hiring!", "Contact"].map((item) => (
                <li key={item} className="text-base-content/70 hover:text-primary transition cursor-pointer">
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider - Uses base-300 variable */}
        <div className="border-t border-base-300 mt-12 pt-6">

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-base-content/50">

            <div className="flex gap-6">
              <span className="hover:text-primary cursor-pointer transition">Privacy Policy</span>
              <span className="hover:text-primary cursor-pointer transition">Terms of Service</span>
              <span className="hover:text-primary cursor-pointer transition">Cookie Policy</span>
            </div>

            <div className="text-center md:text-right">
              © 2026 CareerFlow. Made with 💜 for students everywhere.
            </div>

          </div>

        </div>

      </div>
    </footer>
  );
}