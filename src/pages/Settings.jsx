import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import {
  Bell,
  Key,
  Check,
  Save,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  getUserSettings,
  updateUserSettings,
  exportUserData,
  deleteAccount,
} from "../services/api";

function Settings() {
  const navigate = useNavigate();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await getUserSettings();
        if (res.success && res.settings) {
          setMarketAlerts(res.settings.jobMatchAlerts ?? true);
          setInterviewReminders(res.settings.interviewReminders ?? true);
          setEmailNotifs(res.settings.weeklyDigest ?? true);
        }
      } catch (err) {
        console.error("Failed to load user settings:", err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUserSettings({
        jobMatchAlerts: marketAlerts,
        interviewReminders,
        weeklyDigest: emailNotifs,
      });
      if (res.success) {
        setSaved(true);
        setStatusMessage("Settings updated successfully.");
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to update settings:", err);
      setStatusMessage("Failed to save settings.");
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    setStatusMessage("");
    try {
      const res = await exportUserData();
      if (res.success && res.export) {
        const dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(res.export, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        const fileName = `careerforge_archive_${res.export.user?.id || "export"}_${new Date().toISOString().split("T")[0]}.json`;
        downloadAnchor.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setStatusMessage("Archive exported successfully.");
      } else {
        setStatusMessage(res.message || "Failed to generate export.");
      }
    } catch (err) {
      console.error("Export error:", err);
      setStatusMessage("Unable to download export archive.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        localStorage.clear();
        navigate("/login");
      } else {
        setStatusMessage(res.message || "Failed to delete account.");
      }
    } catch (err) {
      console.error("Account deletion error:", err);
      setStatusMessage("Error deleting account. Please try again.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
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
            Configure notification consent, privacy, career archive export, and account lifecycle.
          </p>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-[#f5d77f] font-mono">
            {statusMessage}
          </div>
        )}

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
                  <span className="text-stone-400 text-[11px] font-light">
                    Receive alerts when jobs matching high compatibility with your skill profile are indexed.
                  </span>
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
                  <span className="text-stone-400 text-[11px] font-light">
                    Get reminders for scheduled mock interviews and review rubrics.
                  </span>
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
                  <span className="text-stone-400 text-[11px] font-light">
                    Summary of your application pipeline throughput and readiness score changes.
                  </span>
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
              CareerForge AI uses Google Gemini for high-speed resume ATS parsing, rubric scoring, and career coaching recommendations. All AI operations are securely executed server-side.
            </p>
          </div>

          {/* Data Export & Privacy */}
          <div className="gold-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Download size={16} className="text-[#d4af37]" />
              Data Privacy & Portability (GDPR & CCPA)
            </h3>
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-medium text-stone-200 block">Export Full Career Archive</span>
                <span className="text-[11px] text-stone-400 font-light">
                  Download your verified resume versions, applications, notes, learning logs, and DSA progress as sanitized JSON.
                </span>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                disabled={exporting}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 transition disabled:opacity-50"
              >
                {exporting ? "Exporting..." : "Export JSON"}
              </button>
            </div>
          </div>

          {/* Danger Zone: Account Erasure */}
          <div className="rounded-2xl p-6 border border-rose-900/50 bg-rose-950/10 space-y-4">
            <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
              <Trash2 size={16} className="text-rose-400" />
              Account Erasure & Right to be Forgotten
            </h3>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              Permanently delete your CareerForge account and remove all personal information, uploaded resumes, interview transcripts, and application records. This action cannot be undone.
            </p>
            {confirmDelete ? (
              <div className="p-4 rounded-xl bg-stone-950 border border-rose-800 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                  <AlertTriangle size={15} />
                  Are you absolutely sure you want to permanently delete your account?
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
                  >
                    {deleting ? "Deleting..." : "Yes, Permanently Delete My Account"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-xs font-medium text-rose-300 transition"
              >
                Delete Account
              </button>
            )}
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
