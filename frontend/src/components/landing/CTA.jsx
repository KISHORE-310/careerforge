import Button from "../common/Button";
import { Link } from "react-router-dom";

function CTA() {
  return (
    <section id="cta" className="bg-[#070707] text-stone-200 py-20 px-6 border-t border-stone-900">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-[#d4af37]/25 bg-[#0f0f0f] p-10 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          {/* Subtle gold accent light */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#d4af37]/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-light">
              Get Started Today
            </span>

            <h2 className="text-2xl sm:text-3xl font-light leading-snug tracking-tight text-white">
              Elevate Your Engineering Profile
            </h2>

            <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed font-light">
              Upload your resume for immediate ATS score evaluation, gap detection, and personalized study roadmaps.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap justify-center items-center gap-3 pt-2">
            <Link to="/signup">
              <Button variant="primary" size="md">
                Create Free Account
              </Button>
            </Link>

            <Link to="/dashboard">
              <Button variant="secondary" size="md">
                View Dashboard Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTA;