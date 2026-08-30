import { useState, useEffect } from "react";
import {
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
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { NavLink, useNavigate, Link } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    full_name: "Kishore Reddy",
    target_role: "Senior Full Stack Engineer",
    avatar: "KR",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setUserProfile((prev) => ({
          ...prev,
          full_name: u.full_name || prev.full_name,
          target_role: u.target_role || prev.target_role,
          avatar: (u.full_name || "KR").slice(0, 2).toUpperCase(),
        }));
      }
    } catch {}
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navSections = [
    {
      group: "HOME",
      items: [
        {
          icon: <LayoutDashboard size={15} />,
          title: "Command Center",
          path: "/dashboard",
        },
      ],
    },
    {
      group: "DISCOVER",
      items: [
        {
          icon: <Briefcase size={15} />,
          title: "Jobs & Fit",
          path: "/jobs",
        },
        {
          icon: <Building2 size={15} />,
          title: "Companies",
          path: "/companies",
        },
        {
          icon: <TrendingUp size={15} />,
          title: "Market Intelligence",
          path: "/market",
        },
      ],
    },
    {
      group: "BUILD",
      items: [
        {
          icon: <FileText size={15} />,
          title: "Resume Studio",
          path: "/resume",
          badge: "ATS AI",
        },
        {
          icon: <Sparkles size={15} />,
          title: "Application AI",
          path: "/application-ai",
        },
      ],
    },
    {
      group: "DEVELOP",
      items: [
        {
          icon: <Cpu size={15} />,
          title: "Skill Intelligence",
          path: "/skills",
        },
        {
          icon: <MapIcon size={15} />,
          title: "Career Roadmap",
          path: "/roadmap",
        },
        {
          icon: <GraduationCap size={15} />,
          title: "Learning Lab",
          path: "/learning",
        },
      ],
    },
    {
      group: "PREPARE",
      items: [
        {
          icon: <Mic size={15} />,
          title: "Interview Lab",
          path: "/interviews",
          badge: "AI Mock",
        },
        {
          icon: <Code2 size={15} />,
          title: "Coding Lab / DSA",
          path: "/dsa",
        },
      ],
    },
    {
      group: "TRACK",
      items: [
        {
          icon: <KanbanSquare size={15} />,
          title: "Applications",
          path: "/applications",
        },
        {
          icon: <BarChart3 size={15} />,
          title: "Progress & Analytics",
          path: "/progress",
        },
      ],
    },
    {
      group: "ADVISORY",
      items: [
        {
          icon: <Bot size={15} className="text-[#d4af37]" />,
          title: "AI Career Coach",
          path: "/coach",
          highlight: true,
        },
      ],
    },
    {
      group: "ACCOUNT",
      items: [
        {
          icon: <User size={15} />,
          title: "Profile",
          path: "/profile",
        },
        {
          icon: <Settings size={15} />,
          title: "Settings",
          path: "/settings",
        },
      ],
    },
  ];

  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 bg-[#0c0c0c] border-r border-[#d4af37]/20 flex flex-col justify-between select-none z-30 hidden lg:flex">
      {/* Brand Header */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="px-5 py-4 border-b border-stone-900 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#9e8334] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0b0b] rounded-[6px] flex items-center justify-center">
                <ShieldCheck size={16} className="text-[#d4af37]" />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-white flex items-center gap-1">
                <span>Career</span>
                <span className="text-[#d4af37]">Forge</span>
                <span className="text-[9px] uppercase px-1 py-0.2 bg-[#d4af37]/20 text-[#f5d77f] rounded font-medium ml-1">AI</span>
              </div>
              <p className="text-[10px] text-stone-500 font-light tracking-wide">
                Career Operating System
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-4">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] uppercase font-medium tracking-wider text-stone-500 font-sans">
                {sec.group}
              </p>
              <div className="space-y-0.5">
                {sec.items.map((item, i) => (
                  <NavLink
                    key={i}
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-normal transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 text-white border border-[#d4af37]/40 shadow-sm shadow-black"
                          : item.highlight
                          ? "text-[#f5d77f] bg-[#d4af37]/10 hover:bg-[#d4af37]/15 border border-[#d4af37]/25"
                          : "text-stone-400 hover:text-stone-100 hover:bg-stone-900/60"
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="shrink-0 transition-colors group-hover:text-[#d4af37]">
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-medium border border-[#d4af37]/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-stone-900 bg-[#090909]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-stone-950/80 border border-stone-800/80">
          <Link to="/profile" className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#80671c] text-black font-bold text-xs flex items-center justify-center shrink-0">
              {userProfile.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-stone-200 truncate">
                {userProfile.full_name}
              </p>
              <p className="text-[10px] text-stone-500 truncate">
                {userProfile.target_role}
              </p>
            </div>
          </Link>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-md text-stone-500 hover:text-rose-400 hover:bg-stone-900 transition"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
