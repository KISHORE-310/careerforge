import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  User,
  Mail,
  Briefcase,
  DollarSign,
  MapPin,
  Save,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getProfile, updateProfile } from "../services/api";

function Profile() {
  const [profile, setProfile] = useState({
    full_name: "Kishore Reddy",
    email: "demo@careerforge.ai",
    target_role: "Senior Full Stack Engineer",
    experience_level: "Senior (4-6 years)",
    target_salary: "$180,000 - $220,000",
    career_goal: "Lead high-scale engineering teams and design distributed backend systems.",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getProfile();
        if (res.success && res.user) {
          setProfile((prev) => ({ ...prev, ...res.user }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
              Candidate Profile
            </span>
          </div>
          <h1 className="text-2xl font-serif-header text-white">
            Profile & Career Parameters
          </h1>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            Manage your personal details, seniority level, target compensation, and strategic career targets.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="apple-liquid-glass rounded-2xl p-6 sm:p-8 border border-[#d4af37]/30 shadow-2xl space-y-6">
          {/* Avatar Banner */}
          <div className="flex items-center gap-4 pb-6 border-b border-stone-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#80671c] text-black font-bold text-xl flex items-center justify-center shadow-lg">
              {profile.full_name?.slice(0, 2).toUpperCase() || "KR"}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{profile.full_name}</h3>
              <p className="text-xs text-[#f5d77f] font-mono">{profile.target_role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-stone-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={profile.email || ""}
                className="w-full bg-stone-950 border border-stone-900 rounded-xl px-3.5 py-2.5 text-stone-500 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Target Engineering Role</label>
              <input
                type="text"
                value={profile.target_role || ""}
                onChange={(e) => setProfile({ ...profile, target_role: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Experience Level</label>
              <input
                type="text"
                value={profile.experience_level || ""}
                onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Target Compensation Band</label>
              <input
                type="text"
                value={profile.target_salary || ""}
                onChange={(e) => setProfile({ ...profile, target_salary: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div>
            <label className="text-stone-400 text-xs block mb-1">Strategic 90-Day Career Goal</label>
            <textarea
              rows={3}
              value={profile.career_goal || ""}
              onChange={(e) => setProfile({ ...profile, career_goal: e.target.value })}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-stone-100 outline-none focus:border-[#d4af37] leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-stone-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f5d77f] transition flex items-center gap-1.5 shadow-xl disabled:opacity-50"
            >
              {saved ? (
                <>
                  <Check size={15} />
                  Profile Saved
                </>
              ) : (
                <>
                  <Save size={15} />
                  {saving ? "Saving..." : "Save Profile"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default Profile;
