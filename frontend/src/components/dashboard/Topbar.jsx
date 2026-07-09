import {
  Bell,
  Search,
  Moon,
} from "lucide-react";

function Topbar() {
  return (
    <header className="sticky top-0 z-20 bg-[#090909]/95 backdrop-blur border-b border-zinc-800">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-6">

        {/* Left */}

        <div>

          <h1 className="text-4xl font-bold text-white">
            Welcome Back 👋
          </h1>

          <p className="mt-2 text-zinc-400">
            Ready to improve your career today?
          </p>

        </div>

        {/* Right */}

        <div className="flex items-center gap-4">

          {/* Search */}

          <div className="hidden lg:flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 w-80">

            <Search
              size={18}
              className="text-zinc-500"
            />

            <input
              type="text"
              placeholder="Search anything..."
              className="flex-1 bg-transparent outline-none text-white placeholder:text-zinc-500"
            />

            <kbd className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
              Ctrl K
            </kbd>

          </div>

          {/* Theme */}

          <button className="h-14 w-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition">

            <Moon />

          </button>

          {/* Notification */}

          <button className="relative h-14 w-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition">

            <Bell />

            <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-red-500"></span>

          </button>

          {/* Profile */}

          <button className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-3 hover:bg-zinc-800 transition">

            <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center text-lg font-bold text-white">

              KR

            </div>

            <div className="text-left">

              <p className="font-semibold text-white">
                Kishore Reddy
              </p>

              <p className="text-sm text-zinc-400">
                Backend Developer
              </p>

            </div>

            <div className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">

              72%

            </div>

          </button>

        </div>

      </div>

    </header>
  );
}

export default Topbar;
