import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[#050505] border-t border-[#d4af37]/15 text-stone-300 py-12 px-6"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="text-lg font-normal text-white inline-block">
              Career<span className="text-[#d4af37]">Forge</span>
            </Link>

            <p className="text-xs text-stone-400 leading-relaxed font-light">
              Career intelligence and preparation platform for software engineers.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#d4af37] font-light">
              Navigation
            </h4>

            <div className="space-y-2 text-xs font-light">
              <a href="#home" className="block text-stone-400 hover:text-[#d4af37] transition">
                Overview
              </a>
              <a href="#features" className="block text-stone-400 hover:text-[#d4af37] transition">
                Features
              </a>
              <a href="#how-it-works" className="block text-stone-400 hover:text-[#d4af37] transition">
                Methodology
              </a>
              <a href="#faq" className="block text-stone-400 hover:text-[#d4af37] transition">
                FAQ
              </a>
            </div>
          </div>

          {/* Application */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#d4af37] font-light">
              Modules
            </h4>

            <div className="space-y-2 text-xs font-light">
              <Link to="/dashboard" className="block text-stone-400 hover:text-[#d4af37] transition">
                Dashboard
              </Link>
              <Link to="/resume" className="block text-stone-400 hover:text-[#d4af37] transition">
                Resume Analyzer
              </Link>
              <Link to="/dsa" className="block text-stone-400 hover:text-[#d4af37] transition">
                DSA Tracker
              </Link>
              <Link to="/roadmap" className="block text-stone-400 hover:text-[#d4af37] transition">
                Role Roadmaps
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#d4af37] font-light">
              Contact
            </h4>

            <div className="flex items-center gap-2 text-xs text-stone-400 font-light">
              <Mail size={14} className="text-[#d4af37]" />
              <span>kishorerdy.1210@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-500 font-light">
          <p>© {new Date().getFullYear()} CareerForge. All rights reserved.</p>
          <p>Built with precision for engineering careers.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;