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
      console.error("Error fetching skills:", err);
      setSkills([]);
    }
  };

  const categories = ["all", "Languages", "Backend", "Cloud & DevOps", "Databases", "Architecture"];

  const filteredSkills = skills.filter(
    (s) => activeCategory === "all" || s.category === activeCategory
  );
  const categorySummary = Object.values(
    skills.reduce((groups, skill) => {
      const category = skill.category || "Uncategorized";
      const current = groups[category] || { cat: category, count: 0, total: 0 };
      current.count += 1;
      current.total += Number(skill.proficiency) || 0;
      groups[category] = current;
      return groups;
    }, {})
  ).map((group) => ({
    ...group,
    score: group.count ? Math.round(group.total / group.count) : 0,
  }));

  // Match by skill name or unique ID rather than filtered array index
  const handleProficiencyChange = async (skillIdentifier, newLevel) => {
    const updated = skills.map((s, i) => {
      if (s.name === skillIdentifier || s.id === skillIdentifier || i === skillIdentifier) {
        return { ...s, proficiency: newLevel };
      }
      return s;
    });
    setSkills(updated);
    try {
      await updateSkills(updated);
    } catch (err) {
      console.error("Error updating skill proficiency:", err);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const newSk = {
      name: newSkillName.trim(),
      category: newCategory,
      proficiency: 50,
      market_demand: "High",
      salary_impact: "+$12k/yr",
    };
    const updated = [...skills, newSk];
    setSkills(updated);
    setNewSkillName("");
    try {
      await updateSkills(updated);
    } catch (err) {
      console.error("Error adding new skill:", err);
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
              Live proficiency vectors benchmarked against top-tier market percentiles and compensation premiums.
            </p>
          </div>
        </div>

        {/* Top Summary row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1 gold-card rounded-2xl p-5 flex flex-col justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400">
              Proficiency Benchmark
            </h3>
            <div className="my-auto py-2">
              <CompetencyRadarChart skills={skills} />
            </div>
            <p className="text-[10px] text-stone-500 font-mono text-center">
              Evaluated across {skills.length} tracked competencies
            </p>
          </div>

          <div className="md:col-span-2 gold-card rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400">
              Domain Competency Rollups
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categorySummary.map((cat, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800/80 space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-200">{cat.cat}</span>
                    <span className="font-mono text-[#f5d77f] font-bold">{cat.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d4af37] to-[#f5d77f] rounded-full"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">
                    {cat.count} verified skills
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Add Skill Form */}
            <form onSubmit={handleAddSkill} className="pt-2 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Kubernetes, Rust, GraphQL)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
              >
                {categories
                  .filter((c) => c !== "all")
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#f5d77f] transition flex items-center justify-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </form>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs border transition ${
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
          {filteredSkills.map((sk) => (
            <div
              key={sk.id || sk.name}
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
                    onChange={(e) => handleProficiencyChange(sk.name, Number(e.target.value))}
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
