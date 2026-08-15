import {
  LayoutDashboard,
  FileText,
  BarChart3,
  BrainCircuit,
  Code2,
  Briefcase,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate, Link } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuSections = [
    {
      title: "Core",
      items: [
        {
          icon: <LayoutDashboard size={16} />,
          title: "Dashboard",
          path: "/dashboard",
        },
      ],
    },
    {
      title: "Intelligence",
      items: [
        {
          icon: <FileText size={16} />,
          title: "Resume Analyzer",
          path: "/resume",
        },
        {
          icon: <BarChart3 size={16} />,
          title: "ATS Scorer",
          path: "/ats",
        },
        {
          icon: <BrainCircuit size={16} />,
          title: "Role Roadmap",
          path: "/roadmap",
        },
      ],
    },
    {
      title: "Practice",
      items: [
        {
          icon: <Code2 size={16} />,
          title: "DSA Tracker",
          path: "/dsa",
        },
        {
          icon: <Briefcase size={16} />,
          title: "Job Board",
          path: "/jobs",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          icon: <User size={16} />,
          title: "Profile",
          path: "/profile",
        },
        {
          icon: <Settings size={16} />,
          title: "Settings",
          path: "/settings",
        },
      ],
    },
  ];

  return (
    <aside className="sticky top-0 h-screen w-60 shrink-0 bg-[#0a0a0a] border-r border-[#d4af37]/15 flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-5 border-b border-stone-900">
          <Link to="/" className="text-base font-normal tracking-tight text-white inline-flex items-center gap-1">
            <span>Career</span>
            <span className="text-[#d4af37]">Forge</span>
          </Link>
          <p className="text-[11px] text-stone-500 mt-0.5 font-light">
            Career Intelligence Platform
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-2.5 text-[10px] uppercase tracking-widest text-[#d4af37]/60 font-light mb-1">
                {section.title}
              </p>

              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-light transition duration-150 ${
                        isActive
                          ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 font-normal"
                          : "text-stone-400 hover:bg-stone-900/70 hover:text-stone-200"
                      }`
                    }
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-stone-900">
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-stone-400 hover:text-rose-400 hover:bg-rose-950/20 transition duration-150 font-light"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;