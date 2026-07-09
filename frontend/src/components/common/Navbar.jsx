import { useState } from "react";
import { Menu, X } from "lucide-react";
import Button from "../common/Button";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Why CareerForge", href: "#why-careerforge" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "#contact" },
];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-gray-800 bg-black/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <a
            href="#home"
            className="text-3xl font-bold text-white"
          >
            Career<span className="text-blue-500">Forge</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">

            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white transition duration-300"
              >
                {link.name}
              </a>
            ))}

          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">

          <Link to="/login">
  <Button variant="ghost">
    Login
  </Button>
</Link>

            <Link to="/signup">
  <Button>
    Get Started Free
  </Button>
</Link>

          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Menu */}

      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">

          <div className="flex flex-col px-6 py-6 gap-6">

            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-white transition"
              >
                {link.name}
              </a>
            ))}

            <Button variant="ghost">
              Login
            </Button>

            <Button>
              Get Started
            </Button>

          </div>

        </div>
      )}
    </nav>
  );
}

export default Navbar;