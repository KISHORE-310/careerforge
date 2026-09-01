import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Briefcase, ArrowRight, Layers } from "lucide-react";
import { getApplications } from "../../services/api";

function CustomFunnelTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#0e0e0e]/95 border border-[#d4af37]/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1">
        <p className="text-white font-semibold font-mono border-b border-stone-800 pb-1">{d.stage}</p>
        <p className="text-[#f5d77f] font-mono flex items-center justify-between gap-4">
          <span>Candidate Volume:</span>
          <strong>{d.count} Roles</strong>
        </p>
        <p className="text-emerald-400 font-mono flex items-center justify-between gap-4 text-[11px]">
          <span>Throughput Rate:</span>
          <span>{d.rate}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function ApplicationFunnelChart({ applications: propApps }) {
  const [apps, setApps] = useState(propApps || null);
  const [loading, setLoading] = useState(!propApps);

  useEffect(() => {
    if (propApps) {
      setApps(propApps);
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function load() {
      try {
        const res = await getApplications();
        if (isMounted && res?.success && Array.isArray(res.applications)) {
          setApps(res.applications);
        }
      } catch (err) {
        console.error("Failed to load applications for funnel chart:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();

    return () => {
      isMounted = false;
    };
  }, [propApps]);

  const funnelData = useMemo(() => {
    if (!apps || apps.length === 0) return [];

    const total = apps.length;
    // Stages mapping based on actual application status values in DB:
    // status can be: "saved" | "applied" | "screening" | "interviewing" / "interview" | "offer" | "rejected"
    const savedCount = apps.filter((a) => a.status === "saved").length;
    const appliedCount = apps.filter((a) => a.status === "applied").length;
    const screeningCount = apps.filter((a) => a.status === "screening").length;
    const interviewingCount = apps.filter((a) => a.status === "interviewing" || a.status === "interview").length;
    const offerCount = apps.filter((a) => a.status === "offer").length;
    const rejectedCount = apps.filter((a) => a.status === "rejected").length;

    // Cumulative funnel progression:
    // 1. Total Sourced/Tracked
    // 2. Sent Applications (applied + screening + interviewing + offer + rejected)
    // 3. Screen / Recruiter Stage (screening + interviewing + offer)
    // 4. Technical / Final Loop (interviewing + offer)
    // 5. Offers Received (offer)
    const stage1_total = total;
    const stage2_sent = appliedCount + screeningCount + interviewingCount + offerCount + rejectedCount;
    const stage3_screen = screeningCount + interviewingCount + offerCount;
    const stage4_tech = interviewingCount + offerCount;
    const stage5_offer = offerCount;

    return [
      {
        stage: "Tracked / Sourced",
        count: stage1_total,
        rate: "100%",
        color: "#f5d77f",
      },
      {
        stage: "Applications Sent",
        count: stage2_sent,
        rate: stage1_total > 0 ? `${Math.round((stage2_sent / stage1_total) * 100)}%` : "0%",
        color: "#e4c660",
      },
      {
        stage: "Recruiter Screen",
        count: stage3_screen,
        rate: stage2_sent > 0 ? `${Math.round((stage3_screen / stage2_sent) * 100)}%` : "0%",
        color: "#d4af37",
      },
      {
        stage: "Technical Loop",
        count: stage4_tech,
        rate: stage3_screen > 0 ? `${Math.round((stage4_tech / stage3_screen) * 100)}%` : "0%",
        color: "#b89628",
      },
      {
        stage: "Offers / Finals",
        count: stage5_offer,
        rate: stage4_tech > 0 ? `${Math.round((stage5_offer / stage4_tech) * 100)}%` : "0%",
        color: "#806516",
      },
    ];
  }, [apps]);

  return (
    <div className="apple-liquid-glass rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
            Pipeline Efficiency
          </span>
          <h3 className="text-base sm:text-lg font-serif-header text-white mt-1">
            Application Stage Conversion Funnel
          </h3>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            Stage-by-stage throughput calculated directly from your real job application tracking pipeline.
          </p>
        </div>
        {apps && apps.length > 0 && (
          <span className="text-xs font-mono text-[#f5d77f] bg-stone-900/80 px-3 py-1 rounded-lg border border-stone-800 self-start sm:self-auto">
            {apps.length} Total Roles Tracked
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs text-stone-500 font-mono">
          Loading pipeline conversion data...
        </div>
      ) : funnelData.length === 0 || apps?.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-stone-800 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 text-[#d4af37] flex items-center justify-center">
            <Briefcase size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">No Applications Tracked Yet</h4>
            <p className="text-xs text-stone-400 max-w-sm mt-1">
              Add job opportunities to your application board to visualize stage progression, screen throughput, and conversion rates.
            </p>
          </div>
          <Link
            to="/applications"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#e4c660] transition"
          >
            <span>Track Application</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={funnelData}
              margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
              <XAxis
                type="number"
                stroke="#666"
                tickLine={false}
                allowDecimals={false}
                tick={{ fill: "#888", fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                type="category"
                dataKey="stage"
                stroke="#666"
                tickLine={false}
                tick={{ fill: "#d6d3d1", fontSize: 11 }}
              />
              <Tooltip content={<CustomFunnelTooltip />} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={22}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
