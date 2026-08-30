import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  Sparkles,
  Bot,
  CheckCircle2,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getNotifications, markAllNotificationsRead } from "../../services/api";

function Topbar({ onToggleMobileMenu, onOpenCoach }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unread_count || 0);
      }
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-2 z-20 px-4 sm:px-6 my-2">
      <div className="apple-liquid-glass rounded-xl h-14 px-4 sm:px-5 flex items-center justify-between shadow-2xl">
        {/* Left: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></span>
            <h2 className="text-xs sm:text-sm font-medium text-stone-100">
              Career Command
            </h2>
            <span className="hidden md:inline-block text-stone-600 text-xs">•</span>
            <span className="hidden md:inline-block text-xs text-[#f5d77f]/80 font-light">
              Obsidian Intelligence Core
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center gap-2 bg-black/50 border border-stone-800/90 rounded-full px-3.5 py-1.5 w-64 lg:w-80 focus-within:border-[#d4af37]/50 transition"
        >
          <Search size={13} className="text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs, skills, companies..."
            className="flex-1 bg-transparent outline-none text-xs text-stone-200 placeholder:text-stone-500 font-light"
          />
        </form>

        {/* Right Tools */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Career Readiness Mini Pill */}
          <Link
            to="/progress"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 hover:bg-[#d4af37]/20 transition"
          >
            <Sparkles size={12} className="text-[#d4af37]" />
            <span className="text-[11px] font-medium text-[#f5d77f]">
              Readiness: <strong className="text-white">92%</strong>
            </span>
          </Link>

          {/* AI Coach Trigger */}
          <button
            onClick={onOpenCoach}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/90 border border-stone-800 hover:border-[#d4af37]/40 text-stone-300 hover:text-white text-xs transition"
          >
            <Bot size={14} className="text-[#d4af37]" />
            <span className="hidden sm:inline text-xs font-normal">AI Coach</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-black/40 border border-stone-800/80 text-stone-400 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition"
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#d4af37] ring-2 ring-black"></span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#111111] border border-stone-800 shadow-2xl p-4 z-50 text-stone-200 animate-in fade-in-50 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-[#d4af37]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4af37]/20 text-[#f5d77f] font-medium">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-[#d4af37] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-stone-900 py-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.action_url) {
                            navigate(notif.action_url);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-2.5 rounded-lg my-1 cursor-pointer transition flex items-start gap-2.5 ${
                          notif.read ? "bg-transparent opacity-70 hover:opacity-100 hover:bg-stone-900/40" : "bg-[#181818] border border-[#d4af37]/20"
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-[#d4af37] mt-1.5 shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-stone-100">{notif.title}</p>
                          <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">{notif.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-full border border-stone-800 bg-black/50 p-1 hover:border-[#d4af37]/40 transition"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#d4af37] to-[#80671c] text-black flex items-center justify-center text-[11px] font-bold">
                KR
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#111111] border border-stone-800 shadow-2xl p-2 z-50 text-stone-200">
                <div className="px-3 py-2 border-b border-stone-800 mb-1">
                  <p className="text-xs font-medium text-stone-200">Kishore Reddy</p>
                  <p className="text-[10px] text-stone-500">demo@careerforge.ai</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-stone-300 hover:bg-stone-900 hover:text-white transition"
                >
                  <User size={13} />
                  Profile Details
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-stone-300 hover:bg-stone-900 hover:text-white transition"
                >
                  <Settings size={13} />
                  Settings & APIs
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 transition mt-1 border-t border-stone-900"
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
