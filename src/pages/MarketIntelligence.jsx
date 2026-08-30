import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import SalaryDistributionChart from "../components/charts/SalaryDistributionChart";
import SkillDemandBarChart from "../components/charts/SkillDemandBarChart";
import {
  TrendingUp,
  DollarSign,
  Award,
  Sparkles,
  BarChart2,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { getMarketTrends } from "../services/api";

function MarketIntelligence() {
  const [marketData, setMarketData] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getMarketTrends();
        if (res.success) {
          setMarketData(res.market);
          if (res.market.trending_roles?.length > 0) {
            setSelectedRole(res.market.trending_roles[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
                Macro Tech Market Intelligence
              </span>
            </div>
            <h1 className="text-2xl font-serif-header text-white">
              Tech Market Trends & Salary Benchmarks
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Live market indices on hiring demand, skill premium multipliers, and tier-1 compensation percentiles.
            </p>
          </div>
        </div>

        {/* 3 Overview Metric Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="gold-card rounded-2xl p-5">
            <span className="text-xs text-stone-400 font-light">Fastest Growing Sector</span>
            <h3 className="text-lg font-bold text-white mt-1">Distributed AI & Infra</h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <ArrowUpRight size={13} /> +34% YoY Hiring Surge
            </p>
          </div>

          <div className="gold-card rounded-2xl p-5">
            <span className="text-xs text-stone-400 font-light">Highest Skill Premium</span>
            <h3 className="text-lg font-bold text-white mt-1">Kafka & Stream Processing</h3>
            <p className="text-xs text-[#f5d77f] mt-1 flex items-center gap-1 font-mono">
              <Zap size={13} /> +22% Salary Multiplier
            </p>
          </div>

          <div className="gold-card rounded-2xl p-5">
            <span className="text-xs text-stone-400 font-light">Senior Benchmark (90th)</span>
            <h3 className="text-lg font-bold text-white mt-1">$235,000 / yr</h3>
            <p className="text-xs text-stone-400 mt-1 flex items-center gap-1 font-mono">
              Base + Equity Standard
            </p>
          </div>
        </div>

        {/* Trending Roles & Salary Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Trending Roles List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-[#d4af37]" />
              High-Demand Engineering Roles
            </h3>

            <div className="space-y-3">
              {marketData?.trending_roles?.map((role, idx) => {
                const isSelected = selectedRole?.role === role.role;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedRole(role)}
                    className={`p-4 rounded-xl cursor-pointer border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[#161616] border-[#d4af37] shadow-lg shadow-black"
                        : "bg-[#121212] border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{role.role}</h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-400">
                          {role.demand_growth}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1">
                        Salary Band: <strong className="text-stone-200 font-mono">{role.avg_salary}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-[#f5d77f] font-mono">
                        {role.top_skills?.[0]}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400 font-mono">
                        {role.top_skills?.[1]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Salary Percentiles (5 cols) */}
          <div className="lg:col-span-5">
            <div className="apple-liquid-glass rounded-2xl p-5 border border-[#d4af37]/30 shadow-2xl space-y-4">
              <div>
                <span className="text-[10px] font-mono text-[#f5d77f] uppercase tracking-wider">
                  Compensation Percentiles
                </span>
                <h3 className="text-lg font-serif-header text-white mt-1">
                  {selectedRole?.role || "Engineering Role"}
                </h3>
                <p className="text-xs text-stone-400 font-light">
                  Standard market distribution across Tier-1 and Tier-2 Tech.
                </p>
              </div>

              {/* Percentiles */}
              <div className="space-y-3 pt-2">
                {[
                  { label: "25th Percentile (Base)", val: "$145,000", pct: 25 },
                  { label: "50th Percentile (Median)", val: "$175,000", pct: 50 },
                  { label: "75th Percentile (Senior)", val: "$205,000", pct: 75 },
                  { label: "90th Percentile (Staff / Top Tier)", val: "$235,000", pct: 90 },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-300">
                      <span>{item.label}</span>
                      <span className="font-mono font-bold text-[#f5d77f]">{item.val}</span>
                    </div>
                    <div className="h-2 w-full bg-stone-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#d4af37] to-[#f5d77f] rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* In-Demand Skill Premiums */}
              <div className="pt-4 border-t border-stone-800">
                <h4 className="text-xs font-semibold text-stone-300 mb-2.5">
                  High-Yield Skill Premiums
                </h4>
                <div className="space-y-2">
                  {marketData?.in_demand_skills?.slice(0, 4).map((sk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-stone-900/80 border border-stone-800 text-xs"
                    >
                      <span className="text-stone-200 font-mono">{sk.skill}</span>
                      <span className="font-mono text-emerald-400 font-bold">{sk.premium}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Compensation Bands Chart */}
        <SalaryDistributionChart />

        {/* Top Skill Demand Growth Chart */}
        <SkillDemandBarChart />
      </div>
    </AppLayout>
  );
}

export default MarketIntelligence;
