import DashboardPreview from "./DashboardPreview";
import Button from "../common/Button";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden min-h-[90vh] bg-[#070707] text-stone-200 pt-28 pb-16"
    >
      {/* Subtle Ambient Gold Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-[#d4af37]/5 rounded-full blur-[140px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-12 items-center gap-12">
        {/* Left Side */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37] text-xs tracking-widest uppercase font-light">
            <span>Career Intelligence Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light leading-[1.18] tracking-tight text-white">
            Refine your resume.
            <br />
            Bridge your skills.
            <br />
            <span className="text-[#d4af37] italic">Accelerate your tech career.</span>
          </h1>

          <p className="max-w-lg text-sm sm:text-base text-stone-400 leading-relaxed font-light">
            CareerForge evaluates your engineering profile, performs precise ATS keyword matching, 
            and delivers custom week-by-week roadmaps to help you secure software engineering roles.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/signup">
              <Button variant="primary" size="md">
                Start Career Analysis
              </Button>
            </Link>

            <Link to="/dashboard">
              <Button variant="secondary" size="md">
                Explore Dashboard
              </Button>
            </Link>
          </div>

          {/* Minimal Key Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-900 max-w-md">
            <div>
              <p className="text-2xl font-light text-[#d4af37]">94%</p>
              <p className="text-xs text-stone-500 font-light mt-0.5">ATS Match Rate</p>
            </div>

            <div>
              <p className="text-2xl font-light text-[#d4af37]">500+</p>
              <p className="text-xs text-stone-500 font-light mt-0.5">Curated DSA Problems</p>
            </div>

            <div>
              <p className="text-2xl font-light text-[#d4af37]">6-Week</p>
              <p className="text-xs text-stone-500 font-light mt-0.5">Custom Roadmaps</p>
            </div>
          </div>
        </div>

        {/* Right Side Preview */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

export default Hero;