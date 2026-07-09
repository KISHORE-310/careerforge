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

import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuSections = [
    {
      title: "MAIN",
      items: [
        {
          icon: <LayoutDashboard size={20} />,
          title: "Dashboard",
          path: "/dashboard",
        },
      ],
    },
    {
      title: "AI TOOLS",
      items: [
        {
          icon: <FileText size={20} />,
          title: "Resume Intelligence",
          path: "/resume",
        },
        {
          icon: <BarChart3 size={20} />,
          title: "ATS Analysis",
          path: "/ats",
        },
        {
          icon: <BrainCircuit size={20} />,
          title: "AI Roadmap",
          path: "/roadmap",
        },
      ],
    },
    {
      title: "PLACEMENT HUB",
      items: [
        {
          icon: <Code2 size={20} />,
          title: "DSA Tracker",
          path: "/dsa",
        },
        {
          icon: <Briefcase size={20} />,
          title: "Jobs",
          path: "/jobs",
        },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        {
          icon: <User size={20} />,
          title: "Profile",
          path: "/profile",
        },
        {
          icon: <Settings size={20} />,
          title: "Settings",
          path: "/settings",
        },
      ],
    },
  ];

  return (
    <aside className="sticky top-0 h-screen w-72 shrink-0 bg-[#0A0A0A] border-r border-zinc-800 flex flex-col">

      {/* Logo */}

      <div className="px-8 py-8 border-b border-zinc-800">

        <h1 className="text-3xl font-extrabold text-red-500">
          CareerForge
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          AI Career Platform
        </p>

      </div>

      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto px-4 py-6">

        {menuSections.map((section) => (

          <div key={section.title} className="mb-8">

            <p className="px-3 mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-zinc-600">

              {section.title}

            </p>

            <div className="space-y-2">

              {section.items.map((item) => (

                <NavLink
                  key={item.title}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 ${
                      isActive
                        ? "bg-red-600 text-white shadow-lg"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`
                  }
                >

                  {item.icon}

                  <span className="font-medium">
                    {item.title}
                  </span>

                </NavLink>

              ))}

            </div>

          </div>

        ))}

      </nav>

      {/* Logout */}

      <div className="border-t border-zinc-800 p-4">

        <button
          onClick={logout}
          className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-red-500 transition hover:bg-red-600 hover:text-white"
        >

          <LogOut size={20} />

          Logout

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;