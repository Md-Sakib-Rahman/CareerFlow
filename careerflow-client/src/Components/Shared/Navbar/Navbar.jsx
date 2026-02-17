import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Highly recommended for professional UI
import { Link } from "react-router";
import ThemeController from "../ThemeController/ThemeController";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Animation variants for a smooth dropdown
  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.07, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -10 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <nav className="w-full bg-base-100/80 shadow-sm fixed top-0 left-0 z-50 backdrop-blur-xl border-b border-base-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 flex items-center justify-center rounded-box bg-primary text-primary-content font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
              🎁
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">
              CareerFlow
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Analytics", "Pricing"].map((item) => (
              <a
                key={item}
                href={`/#${item.toLowerCase()}`}
                className="text-base-content/80 hover:text-primary font-medium transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                {item}
              </a>
            ))}
            <Link
              to="/our-story"
              className="text-base-content/80 hover:text-primary font-medium transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
            >
              Our Story
            </Link>
            <Link
              to="/faq"
              className="text-base-content/80 hover:text-primary font-medium transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
            >
              FAQ
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-5">
            <button className="btn btn-outline btn-sm font-semibold text-primary">
              Login
            </button>
            <button className="btn btn-primary btn-sm px-6 shadow-lg">
              Sign Up Free
            </button>
            <div className="divider divider-horizontal mx-0"></div>
            <ThemeController />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeController />
            <button
              className="btn btn-ghost btn-circle text-base-content"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown with Smooth Transition */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="absolute top-full left-0 w-full bg-base-100 shadow-xl border-t border-base-300 md:hidden overflow-hidden"
          >
            <div className="flex flex-col px-6 py-8 space-y-6">
              <motion.div variants={itemVariants} className="flex flex-col space-y-4">
                {["Features", "Analytics", "Pricing"].map((item) => (
                  <a key={item} href={`/#${item.toLowerCase()}`} className="text-lg font-semibold text-base-content/80 hover:text-primary transition-colors">
                    {item}
                  </a>
                ))}
                <Link to="/our-story" className="text-lg font-semibold text-base-content/80 hover:text-primary transition-colors">
                  Our Story
                </Link>
                <Link to="/faq" className="text-lg font-semibold text-base-content/80 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4 border-t border-base-300 space-y-4">
                <button className="btn btn-outline btn-primary w-full rounded-box">
                  Login
                </button>
                <button className="btn btn-primary w-full rounded-box shadow-md">
                  Sign Up Free
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center text-xs text-base-content/40">
                © 2026 CareerFlow — Track Smarter.
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}