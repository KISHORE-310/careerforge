import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  Building2,
  Search,
  TrendingUp,
  Users,
  MapPin,
  ExternalLink,
  Briefcase,
  Star,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getCompanies } from "../services/api";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getCompanies();
        if (res.success) {
          setCompanies(res.companies);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tech_stack.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
                Company Intelligence
              </span>
            </div>
            <h1 className="text-2xl font-serif-header text-white">
              Target Company Intelligence
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Engineering culture benchmarks, compensation bands, verified tech stacks, and hiring velocity.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2 w-full sm:w-72">
            <Search size={14} className="text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies or tech stacks..."
              className="bg-transparent text-xs text-stone-200 outline-none w-full placeholder:text-stone-500 font-light"
            />
          </div>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((comp) => (
            <div
              key={comp.id}
              className="gold-card rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center font-bold text-sm text-[#f5d77f] font-mono shadow-inner">
                      {comp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                        {comp.name}
                        {comp.verified_fit_score >= 90 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-mono">
                            Top Fit
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-stone-400">{comp.headquarters}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/30">
                    {comp.verified_fit_score}% Fit
                  </span>
                </div>

                <p className="text-xs text-stone-400 mt-3 font-light leading-relaxed">
                  {comp.culture_summary}
                </p>

                {/* Metrics Table */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-800/80 text-xs">
                  <div className="p-2 rounded-lg bg-stone-900/60 border border-stone-800/60">
                    <span className="text-[10px] text-stone-500 block">Hiring Velocity</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <TrendingUp size={11} /> {comp.hiring_velocity}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-stone-900/60 border border-stone-800/60">
                    <span className="text-[10px] text-stone-500 block">Senior Band</span>
                    <span className="font-semibold text-stone-200 font-mono mt-0.5 block">
                      {comp.median_comp}
                    </span>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-mono text-stone-500 tracking-wider">
                    Core Engineering Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {comp.tech_stack.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Open Positions info */}
              <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <span className="text-xs text-stone-400 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-[#d4af37]" />
                  <strong className="text-stone-200">{comp.open_roles_count}</strong> active engineering roles
                </span>

                <button
                  onClick={() => setSelectedCompany(comp)}
                  className="px-3 py-1 rounded-lg bg-stone-900 hover:bg-[#d4af37] hover:text-black text-xs font-medium text-stone-300 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Company Detail Modal */}
        {selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="apple-liquid-glass rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#d4af37]/40 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-serif-header text-white">{selectedCompany.name}</h3>
                  <p className="text-xs text-[#f5d77f] font-mono">{selectedCompany.headquarters} • {selectedCompany.hiring_velocity} Hiring</p>
                </div>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                <span className="font-semibold text-white block mb-1">Culture & Assessment Strategy:</span>
                {selectedCompany.culture_summary}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-stone-200 mb-2">Verified Engineering Stack</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCompany.tech_stack.map((t, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/30 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                <span className="text-xs text-stone-400">Compensation: <strong className="text-white font-mono">{selectedCompany.median_comp}</strong></span>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#d4af37] text-black text-xs font-semibold hover:bg-[#f5d77f]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Companies;
