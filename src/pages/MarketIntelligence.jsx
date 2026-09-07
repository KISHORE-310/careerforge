import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { DollarSign, TrendingUp } from "lucide-react";
import { getMarketTrends } from "../services/api";

function MarketIntelligence() {
  const [market, setMarket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMarketTrends().then((result) => {
      if (!result.success) throw new Error(result.message || "Market data could not be loaded.");
      setMarket(result.market);
    }).catch((err) => setError(err.message || "Market data could not be loaded."));
  }, []);

  const skills = market?.top_paying_skills || [];
  return <AppLayout><div className="space-y-6">
    <div><span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">Job Listing Signals</span><h1 className="mt-2 text-2xl font-serif-header text-white">Market Signals</h1><p className="mt-1 text-xs text-stone-400">Calculated from active, ingested CareerForge job listings. This is not a market-wide salary survey.</p></div>
    {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-rose-200">{error}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Metric label="Active listing demand index" value="Not available" note="Requires a labor-market provider and historical volume." />
      <Metric label="Salary percentile benchmarks" value="Not available" note="CareerForge does not currently license compensation survey data." />
      <Metric label="Live listing salary signals" value={String(skills.length)} note="Skills with a computable average from active listings." />
    </div>
    <div className="apple-liquid-glass rounded-2xl p-5 border border-[#d4af37]/30 shadow-xl"><h2 className="flex items-center gap-2 text-base font-semibold text-white"><DollarSign size={16} className="text-[#d4af37]" />Highest-paying skill signals</h2>{skills.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{skills.map((item) => <div key={item.skill} className="rounded-xl border border-stone-800 bg-stone-950/60 p-4"><p className="font-mono text-sm text-stone-100">{item.skill}</p><p className="mt-2 text-xs text-[#f5d77f]">Average listed salary: {item.avg_salary}</p><p className="mt-1 text-[10px] text-stone-500">Based only on active listings that disclose salary.</p></div>)}</div> : <p className="mt-4 text-sm text-stone-400">No active listings with usable salary data yet. Run the job sync or wait for providers to publish salary ranges.</p>}</div>
    <div className="rounded-2xl border border-stone-800 bg-[#111] p-5 text-sm text-stone-400"><div className="flex items-center gap-2 text-stone-200"><TrendingUp size={16} />What is intentionally unavailable</div><p className="mt-2">Growth rates, skill-premium percentages, compensation bands, and city benchmarks remain unavailable until a verified labor-market data provider is connected.</p></div>
  </div></AppLayout>;
}

function Metric({ label, value, note }) { return <div className="gold-card rounded-2xl p-5"><span className="text-xs text-stone-400">{label}</span><p className="mt-2 text-lg font-semibold text-stone-200">{value}</p><p className="mt-1 text-[11px] text-stone-500">{note}</p></div>; }

export default MarketIntelligence;
