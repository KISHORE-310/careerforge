import { Link } from "react-router-dom";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#070707] grid lg:grid-cols-12 text-stone-200">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-[#0a0a0a] border-r border-[#d4af37]/15 relative overflow-hidden">
        {/* Subtle gold ambient glow */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div>
          <Link to="/" className="text-xl font-normal tracking-tight text-white inline-flex items-center gap-1">
            <span>Career</span>
            <span className="text-[#d4af37]">Forge</span>
          </Link>

          <div className="mt-16 space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-light">
              Career Intelligence
            </span>
            <h2 className="text-3xl font-light text-white leading-tight tracking-tight">
              Precision Resume & Skill Analytics
            </h2>
            <p className="text-xs text-stone-400 font-light leading-relaxed max-w-sm">
              Calibrate your engineering profile against current job requirements and follow personalized roadmaps.
            </p>
          </div>
        </div>

        <div className="space-y-3 border-t border-stone-900 pt-6 text-xs text-stone-400 font-light">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
            <span>ATS Compatibility Evaluation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
            <span>Automated Skill Gap Detection</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
            <span>6-Week Technical Roadmaps</span>
          </div>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;