import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  Settings as SettingsIcon,
  Bell,
  Key,
  ShieldCheck,
  Check,
  Save,
  Download,
  Trash2,
} from "lucide-react";

function Settings() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ user: "Kishore Reddy", exported_at: new Date().toISOString() }, null, 2)
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "careerforge_data_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
              System Settings
            </span>
          </div>
          <h1 className="text-2xl font-serif-header text-white">
            Settings & Preferences
          </h1>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            Configure notifications, AI advisory integration, data exports, and platform security.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Notifications Card */}
          <div className="apple-liquid-glass rounded-2xl p-6 border border-[#d4af37]/25 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bell size={16} className="text-[#d4af37]" />
              Notification Preferences
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-stone-900/60 border border-stone-800 cursor-pointer">
                <div>
                  <span className="font-medium text-stone-200 block">Job Match Alerts</span>
                  <span className="text-stone-400 text-[11px] font-light">Receive alerts when jobs matching &gt;90% of your stack are posted.</span>
                </div>
                <input
                  type="checkbox"
                  checked={marketAlerts}
                  onChange={(e) => setMarketAlerts(e.target.checked)}
                  className="accent-[#d4af37] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-stone-900/60 border border-stone-800 cursor-pointer">
                <div>
                  <span className="font-medium text-stone-200 block">Interview Reminders</span>
                  <span className="text-stone-400 text-[11px] font-light">Get sprint reminders for scheduled mock interviews and review rubrics.</span>
                </div>
                <input
                  type="checkbox"
                  checked={interviewReminders}
                  onChange={(e) => setInterviewReminders(e.target.checked)}
                  className="accent-[#d4af37] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-stone-900/60 border border-stone-800 cursor-pointer">
                <div>
                  <span className="font-medium text-stone-200 block">Weekly Career Velocity Digest</span>
                  <span className="text-stone-400 text-[11px] font-light">Summary of your application pipeline throughput and readiness score changes.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="accent-[#d4af37] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* AI Configuration */}
          <div className="gold-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Key size={16} className="text-[#d4af37]" />
              AI Intelligence Engine
            </h3>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              CareerForge AI uses Google Gemini 2.5 Flash for high-speed resume ATS parsing, rubric scoring, and career coaching recommendations. All AI operations are securely executed server-side.
            </p>
          </div>

          {/* Data Export & Privacy */}
          <div className="gold-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Download size={16} className="text-[#d4af37]" />
              Data Privacy & Portability
            </h3>
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-medium text-stone-200 block">Export Full Career Archive</span>
                <span className="text-[11px] text-stone-400 font-light">Download your resume versions, applications, notes, and DSA progress as JSON.</span>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 transition"
              >
                Export JSON
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f5d77f] transition flex items-center gap-1.5 shadow-xl"
            >
              {saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? "Saved" : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default Settings;
