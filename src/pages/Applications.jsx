import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  KanbanSquare,
  List,
  Plus,
  Trash2,
  Edit2,
  Building2,
  Calendar,
  DollarSign,
  ChevronRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  getApplications,
  addApplication,
  updateApplication,
  deleteApplication,
} from "../services/api";

const STAGES = ["Wishlist", "Applied", "Screening", "Interview", "Offer", "Rejected"];

function Applications() {
  const [applications, setApplications] = useState([]);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "table"
  const [showAddModal, setShowAddModal] = useState(false);
  const [newApp, setNewApp] = useState({
    company: "",
    role: "Senior Full Stack Engineer",
    status: "Wishlist",
    salary_range: "$180,000 - $220,000",
    next_step: "Submit tailored resume",
    notes: "",
  });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await getApplications();
      if (res.success) {
        setApplications(res.applications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newApp.company.trim()) return;
    try {
      const res = await addApplication(newApp);
      if (res.success) {
        setApplications([...applications, res.application]);
        setShowAddModal(false);
        setNewApp({
          company: "",
          role: "Senior Full Stack Engineer",
          status: "Wishlist",
          salary_range: "$180,000 - $220,000",
          next_step: "Submit tailored resume",
          notes: "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplication(appId, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (appId) => {
    try {
      await deleteApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
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
                Application Lifecycle
              </span>
            </div>
            <h1 className="text-2xl font-serif-header text-white">
              Application Tracker
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Manage your high-priority pipeline from Wishlist to Offer negotiation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-900 border border-stone-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  viewMode === "kanban"
                    ? "bg-[#d4af37] text-black font-semibold"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <KanbanSquare size={13} />
                Board
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  viewMode === "table"
                    ? "bg-[#d4af37] text-black font-semibold"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <List size={13} />
                Table
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#f5d77f] transition flex items-center gap-1.5 shadow-lg"
            >
              <Plus size={15} />
              Add Application
            </button>
          </div>
        </div>

        {/* KANBAN VIEW */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const stageApps = applications.filter((a) => a.status === stage);
              return (
                <div
                  key={stage}
                  className="bg-[#101010] border border-stone-800/90 rounded-2xl p-3 flex flex-col min-w-[200px]"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-800">
                    <span className="text-xs font-semibold text-stone-200">{stage}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-900 text-stone-400 border border-stone-800">
                      {stageApps.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {stageApps.map((app) => (
                      <div
                        key={app.id}
                        className="p-3 rounded-xl bg-[#171717] border border-stone-800 hover:border-[#d4af37]/40 transition space-y-2 group shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-white">{app.company}</h4>
                            <p className="text-[11px] text-[#f5d77f] truncate">{app.role}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="text-stone-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-0.5"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <div className="text-[10px] text-stone-400 font-mono">
                          {app.salary_range}
                        </div>

                        {app.next_step && (
                          <div className="text-[10px] text-stone-300 bg-black/40 p-1.5 rounded-lg border border-stone-800/80 font-light">
                            <span className="text-[#d4af37] font-medium block">Next Step:</span>
                            {app.next_step}
                          </div>
                        )}

                        {/* Quick stage mover */}
                        <div className="pt-1.5 border-t border-stone-800/60 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-stone-500">
                            Fit: {app.match_score || 90}%
                          </span>

                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="bg-stone-900 border border-stone-800 text-[10px] text-stone-300 rounded px-1.5 py-0.5 outline-none"
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}

                    {stageApps.length === 0 && (
                      <div className="text-center py-8 text-[11px] text-stone-600 font-light">
                        No applications
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === "table" && (
          <div className="gold-card rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161616] text-stone-400 font-medium border-b border-stone-800">
                <tr>
                  <th className="p-3.5 pl-5">Company & Role</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Compensation</th>
                  <th className="p-3.5">Next Step</th>
                  <th className="p-3.5">Applied Date</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-900">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-stone-900/40 transition">
                    <td className="p-3.5 pl-5">
                      <div className="font-semibold text-white">{app.company}</div>
                      <div className="text-stone-400 text-[11px]">{app.role}</div>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-lg px-2 py-1 outline-none font-mono"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5 font-mono text-stone-300">{app.salary_range}</td>
                    <td className="p-3.5 text-stone-300">{app.next_step || "—"}</td>
                    <td className="p-3.5 text-stone-400 font-mono text-[11px]">
                      {app.applied_date || "Recent"}
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-stone-500 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="apple-liquid-glass rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#d4af37]/40 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif-header text-white">Track New Application</h3>
                <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newApp.company}
                    onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                    placeholder="e.g. Stripe, Figma, Databricks"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Role Title</label>
                  <input
                    type="text"
                    value={newApp.role}
                    onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-stone-400 block mb-1">Initial Stage</label>
                    <select
                      value={newApp.status}
                      onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-2 text-stone-200 outline-none"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Salary Range</label>
                    <input
                      type="text"
                      value={newApp.salary_range}
                      onChange={(e) => setNewApp({ ...newApp, salary_range: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Next Step Action</label>
                  <input
                    type="text"
                    value={newApp.next_step}
                    onChange={(e) => setNewApp({ ...newApp, next_step: e.target.value })}
                    placeholder="e.g. Prep for System Design round"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f5d77f]"
                  >
                    Add to Pipeline
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Applications;
