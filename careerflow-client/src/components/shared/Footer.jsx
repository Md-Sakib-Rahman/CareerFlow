import { Twitter, Linkedin, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-indigo-900 via-purple-900 to-purple-700 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1 - Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-lg">
                🎁
              </div>
              <h2 className="text-xl font-semibold text-white">
                CareerFlow
              </h2>
            </div>

            <p className="text-sm leading-relaxed mb-4 text-gray-400">
              Helping students and tech enthusiasts land their dream jobs,
              one application at a time.
            </p>

            <div className="text-xl mb-6">🚀</div>

            {/* Social Icons */}
            <div className="flex gap-4">
              <div className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Twitter size={18} />
              </div>
              <div className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Linkedin size={18} />
              </div>
              <div className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Instagram size={18} />
              </div>
              <div className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <MessageCircle size={18} />
              </div>
            </div>
          </div>

          {/* Column 2 - Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-white transition cursor-pointer">Features</li>
              <li className="hover:text-white transition cursor-pointer">Pricing</li>
              <li className="hover:text-white transition cursor-pointer">Chrome Extension</li>
              <li className="hover:text-white transition cursor-pointer">Mobile App</li>
              <li className="hover:text-white transition cursor-pointer">Changelog</li>
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-white transition cursor-pointer">Blog</li>
              <li className="hover:text-white transition cursor-pointer">Interview Prep Guide</li>
              <li className="hover:text-white transition cursor-pointer">Resume Templates</li>
              <li className="hover:text-white transition cursor-pointer">Community Forum</li>
              <li className="hover:text-white transition cursor-pointer">Help Center</li>
            </ul>
          </div>

          {/* Column 4 - Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-white transition cursor-pointer">About Us</li>
              <li className="hover:text-white transition cursor-pointer">Student Stories</li>
              <li className="hover:text-white transition cursor-pointer">We're Hiring!</li>
              <li className="hover:text-white transition cursor-pointer">Contact</li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/20 mt-12 pt-6">

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">

            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
              <span className="hover:text-white cursor-pointer">Cookie Policy</span>
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
