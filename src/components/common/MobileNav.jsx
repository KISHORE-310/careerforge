import { LayoutDashboard, Briefcase, FileText, Bot, User, Menu, X } from "lucide-react";
import { NavLink, Link } from "react-router-dom";

function MobileNav({ onToggleDrawer, onOpenCoach }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-xl border-t border-[#d4af37]/20 px-3 py-2">
      <div className="flex items-center justify-around">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              isActive ? "text-[#f5d77f]" : "text-stone-400 hover:text-stone-200"
            }`
          }
        >
          <LayoutDashboard size={18} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/jobs"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              isActive ? "text-[#f5d77f]" : "text-stone-400 hover:text-stone-200"
            }`
          }
        >
          <Briefcase size={18} />
          <span>Jobs</span>
        </NavLink>

        <NavLink
          to="/resume"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              isActive ? "text-[#f5d77f]" : "text-stone-400 hover:text-stone-200"
            }`
          }
        >
          <FileText size={18} />
          <span>Resume</span>
        </NavLink>

        <button
          onClick={onOpenCoach}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-[#d4af37]"
        >
          <Bot size={18} />
          <span>Coach</span>
        </button>

        <button
          onClick={onToggleDrawer}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-stone-400 hover:text-stone-200"
        >
          <Menu size={18} />
          <span>More</span>
        </button>
      </div>
    </div>
  );
}

export default MobileNav;
