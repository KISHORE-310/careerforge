import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Button from "../common/Button";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Overview", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Methodology", href: "#how-it-works" },
    { name: "Curriculum", href: "#why-careerforge" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-4 sm:top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        className={`pointer-events-auto w-full max-w-5xl transition-all duration-300 rounded-full ${
          scrolled ? "apple-liquid-glass-dense" : "apple-liquid-glass"
        } px-5 sm:px-6 py-2.5 flex items-center justify-between`}
      >
        {/* Logo */}
        <Link
          to="/"
          className="text-base tracking-tight text-white font-normal inline-flex items-center gap-1 hover:opacity-90 transition"
        >
          <span>Career</span>
          <span className="text-[#d4af37]">Forge</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[11px] uppercase tracking-widest text-stone-300 hover:text-[#d4af37] hover:bg-[#d4af37]/10 px-3 py-1.5 rounded-full transition-all duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/login">
            <button className="text-xs text-stone-300 hover:text-white px-3.5 py-1.5 rounded-full transition hover:bg-white/5 font-light">
              Sign In
            </button>
          </Link>

          <Link to="/signup">
            <Button variant="primary" size="sm" className="!rounded-full !px-4 !py-1.5 !text-xs">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-stone-300 hover:text-[#d4af37] p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="pointer-events-auto absolute top-16 left-4 right-4 apple-liquid-glass-dense rounded-2xl p-5 md:hidden space-y-4 shadow-2xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-xs uppercase tracking-wider text-stone-300 hover:text-[#d4af37] py-2 px-3 rounded-lg hover:bg-white/5 transition"
              >
                {link.name}
              </a>
            ))}

            <div className="flex gap-2.5 pt-3 border-t border-stone-800/80">
              <Link to="/login" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full !rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="flex-1">
                <Button variant="primary" size="sm" className="w-full !rounded-xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;