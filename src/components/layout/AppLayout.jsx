import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import Topbar from "../dashboard/Topbar";
import MobileNav from "../common/MobileNav";
import CareerCoachDrawer from "../common/CareerCoachDrawer";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  Briefcase,
  Building2,
  TrendingUp,
  FileText,
  Sparkles,
  Cpu,
  Map as MapIcon,
  GraduationCap,
  Mic,
  Code2,
  KanbanSquare,
  BarChart3,
  Bot,
  User,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";

function AppLayout({ children }) {
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinks = [
    { title: "Command Center", path: "/dashboard", icon: <LayoutDashboard size={16} /> },
    { title: "Jobs & Fit", path: "/jobs", icon: <Briefcase size={16} /> },
    { title: "Companies", path: "/companies", icon: <Building2 size={16} /> },
    { title: "Market Intelligence", path: "/market", icon: <TrendingUp size={16} /> },
    { title: "Resume Studio", path: "/resume", icon: <FileText size={16} /> },
    { title: "Application AI", path: "/application-ai", icon: <Sparkles size={16} /> },
    { title: "Skill Intelligence", path: "/skills", icon: <Cpu size={16} /> },
    { title: "Career Roadmap", path: "/roadmap", icon: <MapIcon size={16} /> },
    { title: "Learning Lab", path: "/learning", icon: <GraduationCap size={16} /> },
    { title: "Interview Lab", path: "/interviews", icon: <Mic size={16} /> },
    { title: "Coding Lab / DSA", path: "/dsa", icon: <Code2 size={16} /> },
    { title: "Application Tracker", path: "/applications", icon: <KanbanSquare size={16} /> },
    { title: "Progress & Analytics", path: "/progress", icon: <BarChart3 size={16} /> },
    { title: "AI Career Coach", path: "/coach", icon: <Bot size={16} /> },
    { title: "Profile", path: "/profile", icon: <User size={16} /> },
    { title: "Settings", path: "/settings", icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-stone-200 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Topbar
          onToggleMobileMenu={() => setMobileDrawerOpen(true)}
          onOpenCoach={() => setCoachOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-6 py-4 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        onToggleDrawer={() => setMobileDrawerOpen(true)}
        onOpenCoach={() => setCoachOpen(true)}
      />

      {/* AI Career Coach Drawer */}
      <CareerCoachDrawer
        isOpen={coachOpen}
        onClose={() => setCoachOpen(false)}
      />

      {/* Mobile Full Slideout Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden flex">
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-72 max-w-[80vw] bg-[#0d0d0d] border-r border-[#d4af37]/30 h-full flex flex-col z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#d4af37] text-black flex items-center justify-center font-bold">
                  <ShieldCheck size={16} />
                </div>
                <span className="font-semibold text-sm text-white">CareerForge AI</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-1">
              {navLinks.map((link, idx) => (
                <NavLink
                  key={idx}
                  to={link.path}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? "bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/30"
                        : "text-stone-400 hover:bg-stone-900 hover:text-white"
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.title}</span>
                </NavLink>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-800">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 transition"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLayout;
