import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Play,
  Award,
  Sparkles,
  Clock,
  ChevronRight,
  HelpCircle,
  X,
  Check,
} from "lucide-react";
import { getLearning, updateLearningProgress } from "../services/api";

function Learning() {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    fetchLearning();
  }, []);

  const fetchLearning = async () => {
    try {
      const res = await getLearning();
      if (res.success) {
        setModules(res.modules);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLessonToggle = async (modId, lessonIdx) => {
    const targetMod = modules.find((m) => m.id === modId);
    if (!targetMod) return;

    const updatedLessons = [...targetMod.lessons];
    updatedLessons[lessonIdx].completed = !updatedLessons[lessonIdx].completed;

    const completedCount = updatedLessons.filter((l) => l.completed).length;
    const progress = Math.round((completedCount / updatedLessons.length) * 100);

    const updatedMod = { ...targetMod, lessons: updatedLessons, progress };
    setModules((prev) => prev.map((m) => (m.id === modId ? updatedMod : m)));
    if (selectedModule?.id === modId) setSelectedModule(updatedMod);

    try {
      await updateLearningProgress(modId, { progress, lessons: updatedLessons });
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
                Skill Acceleration Lab
              </span>
            </div>
            <h1 className="text-2xl font-serif-header text-white">
              Learning Lab & Deep Dives
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Curated masterclasses and interactive assessments targeted to close your active role skill gaps.
            </p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="gold-card rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#d4af37]">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
                      <span className="text-[10px] font-mono text-[#f5d77f]">{mod.target_skill}</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-stone-900 border border-stone-800">
                    {mod.progress}%
                  </span>
                </div>

                <p className="text-xs text-stone-400 mt-3 font-light leading-relaxed">
                  {mod.description}
                </p>

                {/* Progress bar */}
                <div className="mt-3.5 space-y-1">
                  <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d4af37] to-[#f5d77f] rounded-full transition-all duration-300"
                      style={{ width: `${mod.progress}%` }}
                    />
                  </div>
                </div>

                {/* Lessons summary */}
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-stone-500 tracking-wider">
                    Syllabus Overview
                  </span>
                  {mod.lessons?.map((les, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleLessonToggle(mod.id, idx)}
                      className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800/80 cursor-pointer hover:border-[#d4af37]/30 transition text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={14}
                          className={les.completed ? "text-emerald-400" : "text-stone-600"}
                        />
                        <span className={les.completed ? "line-through text-stone-500" : "text-stone-200"}>
                          {les.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-500">{les.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <Clock size={12} className="text-[#d4af37]" /> {mod.estimated_hours} hrs total
                </span>

                <button
                  onClick={() => {
                    setSelectedModule(mod);
                    setQuizSubmitted(false);
                    setQuizAnswer(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-[#d4af37] hover:text-black text-xs font-semibold text-stone-200 transition flex items-center gap-1"
                >
                  <Sparkles size={13} />
                  Take Assessment
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Assessment Modal */}
        {selectedModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="apple-liquid-glass rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#d4af37]/40 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#f5d77f] uppercase tracking-wider">
                    Quick Assessment
                  </span>
                  <h3 className="text-base font-serif-header text-white mt-0.5">
                    {selectedModule.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="text-stone-400 hover:text-white p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
                <p className="text-xs font-semibold text-stone-100">
                  Question: In Kafka, how does a consumer group ensure strictly ordered processing across partitions?
                </p>

                <div className="space-y-2 text-xs">
                  {[
                    { id: 0, text: "A. By assigning multiple consumers to read from the exact same partition concurrently." },
                    { id: 1, text: "B. Each partition within a topic is consumed by exactly one consumer instance in the group." },
                    { id: 2, text: "C. By using round-robin polling without message keys." },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setQuizAnswer(opt.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition ${
                        quizAnswer === opt.id
                          ? "bg-[#d4af37]/20 border-[#d4af37] text-white"
                          : "bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700"
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>

              {quizSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Correct! Key-partition mapping guarantees strict intra-partition FIFO ordering.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={quizAnswer === null}
                  className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f5d77f] disabled:opacity-50"
                >
                  Submit Assessment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Learning;
