import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-lg shadow-md">
              🎁
            </div>
            <span className="text-xl font-semibold text-purple-600">
              CareerFlow
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">
              Features
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">
              Analytics
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">
              Pricing
            </a>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-purple-600 font-medium hover:underline">
              Login
            </a>
            <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium shadow-md hover:opacity-90 transition">
              Sign Up Free
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="flex flex-col px-6 py-4 space-y-4">
            <a href="#" className="text-gray-700 font-medium">
              Features
            </a>
            <a href="#" className="text-gray-700 font-medium">
              Analytics
            </a>
            <a href="#" className="text-gray-700 font-medium">
              Pricing
            </a>
            <hr />
            <a href="#" className="text-purple-600 font-medium">
              Login
            </a>
            <button className="w-full px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium shadow-md">
              Sign Up Free
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
