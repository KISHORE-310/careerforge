import {
  Bell,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

function Topbar() {
  return (
    <header className="sticky top-3 z-20 px-6 my-2">
      <div className="apple-liquid-glass rounded-2xl h-14 px-5 flex items-center justify-between shadow-xl">
        {/* Left Welcome */}
        <div className="flex items-center gap-3">
          <h2 className="text-xs sm:text-sm font-normal text-stone-100">
            Overview Dashboard
          </h2>
          <span className="hidden sm:inline-block text-stone-600 text-xs">•</span>
          <span className="hidden sm:inline-block text-xs text-stone-400 font-light">
            CareerForge Intelligence
          </span>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-black/40 border border-stone-800/80 rounded-full px-3 py-1.5 w-60">
            <Search size={13} className="text-stone-500" />
            <input
              type="text"
              placeholder="Search topics, roadmap..."
              className="flex-1 bg-transparent outline-none text-xs text-stone-200 placeholder:text-stone-600 font-light"
            />
          </div>

          {/* Notifications */}
          <button className="relative w-8 h-8 rounded-full bg-black/40 border border-stone-800/80 flex items-center justify-center text-stone-400 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition">
            <Bell size={13} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#d4af37]"></span>
          </button>

          {/* Profile Mini Chip */}
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-full border border-stone-800/80 bg-black/40 pl-1.5 pr-3 py-1 hover:border-[#d4af37]/40 transition"
          >
            <div className="w-6 h-6 rounded-full bg-[#d4af37] text-black flex items-center justify-center text-[10px] font-bold">
              KR
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-normal text-stone-200 leading-tight">Kishore</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
