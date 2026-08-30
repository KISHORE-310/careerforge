import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import CompetencyRadarChart from "../components/charts/CompetencyRadarChart";
import {
  Cpu,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Layers,
  Zap,
} from "lucide-react";
import { getSkills, updateSkills } from "../services/api";
import { Link } from "react-router-dom";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [newSkillName, setNewSkillName] = useState("");
  const [newCategory, setNewCategory] = useState("Backend");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await getSkills();
      if (res && res.success) {
        setSkills(Array.isArray(res.skills) ? res.skills : []);
      } else {
        setSkills([]);
      }
    } catch (err) {
      console.error(err);
      setSkills([]);
    }
  };

  const categories = ["all", "Languages", "Backend", "Cloud & DevOps", "Databases", "Architecture"];

  const filteredSkills = skills.filter(
    (s) => activeCategory === "all" || s.category === activeCategory
  );

  const handleProficiencyChange = async (idx, newLevel) => {
    const updated = [...skills];
    updated[idx].proficiency = newLevel;
    setSkills(updated);
    try {
      await updateSkills(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const newSk = {
      name: newSkillName,
      category: newCategory,
      proficiency: 80,
      market_demand: "High",
      salary_impact: "+15%",
    };
    const updated = [...skills, newSk];
    setSkills(updated);
    setNewSkillName("");
    try {
      await updateSkills(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
                Skill Intelligence Matrix
              </span>
            </div>
            <h1 className="text-2xl font-serif-header text-white">
              Skill Graph & Gap Intelligence
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Proficiency calibrations, verified market demand multipliers, and role gap analyzers.
            </p>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddSkill} className="flex items-center gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add skill (e.g. Rust, gRPC)..."
              className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none focus:border-[#d4af37]"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-2 text-xs text-stone-200 outline-none"
            >
              <option>Backend</option>
              <option>Languages</option>
              <option>Cloud & DevOps</option>
              <option>Databases</option>
              <option>Architecture</option>
            </select>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f5d77f] transition flex items-center gap-1"
            >
              <Plus size={14} />
              Add
            </button>
          </form>
        </div>

        {/* 6-Axis Competency Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <CompetencyRadarChart />
          </div>
          <div className="lg:col-span-6 apple-liquid-glass rounded-2xl p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] font-mono text-[#f5d77f] uppercase tracking-wider">
                Category Proficiency Index
              </span>
              <h3 className="text-base font-serif-header text-white mt-0.5">
                Technical Stack Calibration
              </h3>
              <p className="text-xs text-stone-400 font-light">
                Evaluated against Staff / Principal interview criteria at FAANG & Tier-1 unicorns.
              </p>
            </div>

            <div className="space-y-3.5 pt-1 text-xs">
              {[
                { cat: "Distributed Systems & Raft", count: "4 Skills", score: 94, color: "#d4af37" },
                { cat: "Backend & Event Streaming", count: "5 Skills", score: 91, color: "#f5d77f" },
                { cat: "Cloud & Kubernetes Multi-Cluster", count: "3 Skills", score: 86, color: "#e4c660" },
                { cat: "Modern TypeScript & React 19", count: "4 Skills", score: 95, color: "#d4af37" },
                { cat: "PostgreSQL & Database Engines", count: "3 Skills", score: 88, color: "#a1811d" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-stone-300">
                    <span className="font-medium">{item.cat}</span>
                    <span className="font-mono text-[#f5d77f] font-semibold">{item.score}% ({item.count})</span>
                  </div>
                  <div className="h-2 w-full bg-stone-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.score}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                activeCategory === cat
                  ? "bg-[#d4af37] text-black border-[#d4af37] font-semibold"
                  : "bg-stone-900/80 border-stone-800 text-stone-400 hover:text-white"
              }`}
            >
              {cat === "all" ? "All Competencies" : cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((sk, idx) => (
            <div
              key={idx}
              className="gold-card rounded-2xl p-4.5 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{sk.name}</h3>
                    <span className="text-[10px] font-mono text-stone-500">{sk.category}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/30">
                    {sk.salary_impact}
                  </span>
                </div>

                {/* Proficiency Slider */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Proficiency Level</span>
                    <span className="font-mono text-stone-200">{sk.proficiency}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={sk.proficiency}
                    onChange={(e) => handleProficiencyChange(idx, Number(e.target.value))}
                    className="w-full accent-[#d4af37] bg-stone-800 rounded-lg cursor-pointer h-1.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
                <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                  <Zap size={12} className="text-[#d4af37]" /> Demand: {sk.market_demand}
                </span>

                <Link
                  to="/learning"
                  className="text-[11px] text-[#f5d77f] hover:underline flex items-center gap-1"
                >
                  Learning Path <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default Skills;
