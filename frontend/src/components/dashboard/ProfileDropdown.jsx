import {
  User,
  Settings,
  LogOut,
  FileText,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProfileDropdown({ onClose }) {
  const navigate = useNavigate();

  // Dynamic user data (Replace this with API data later)
  const user = {
    name: "Kishore Reddy",
    role: "Backend Developer",
    score: 72,
  };

  const initials = user.name
    .split(" ")
    .map((word) => word[0])
    .join("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    onClose?.();
    navigate("/login");
  };

  const menus = [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: User,
      title: "My Profile",
      path: "/profile",
    },
    {
      icon: FileText,
      title: "Resume",
      path: "/resume",
    },
    {
      icon: Settings,
      title: "Settings",
      path: "/settings",
    },
  ];

  return (
    <div className="absolute right-0 top-24 z-[100] w-80 overflow-hidden rounded-3xl border border-zinc-800 bg-[#111111] shadow-2xl">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-xl font-bold text-white">
            {initials}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              {user.name}
            </h3>

            <p className="text-sm text-zinc-400">
              {user.role}
            </p>
          </div>
        </div>

        {/* Resume Score */}
        <div className="mt-6">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">
              Resume Score
            </span>

            <span className="font-semibold text-red-400">
              {user.score}%
            </span>
          </div>

          <div className="mt-2 h-2 rounded-full bg-zinc-800">
            <div
              className="h-2 rounded-full bg-red-500 transition-all duration-300"
              style={{ width: `${user.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-3">
        {menus.map(({ icon: Icon, title, path }) => (
          <button
            key={title}
            aria-label={title}
            onClick={() => {
              navigate(path);
              onClose?.();
            }}
            className="flex w-full cursor-pointer items-center justify-between px-6 py-4 transition hover:bg-zinc-900"
          >
            <div className="flex items-center gap-4">
              <Icon
                size={18}
                className="text-zinc-300"
              />

              <span className="text-zinc-200">
                {title}
              </span>
            </div>

            <ChevronRight
              size={18}
              className="text-zinc-500"
            />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-zinc-800">
        <button
          aria-label="Logout"
          onClick={logout}
          className="flex w-full cursor-pointer items-center gap-4 px-6 py-5 text-red-400 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut size={18} />

          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileDropdown;