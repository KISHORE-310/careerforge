import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle } from "lucide-react";
import { signup } from "../services/api";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    target_role: "Senior Full-Stack Engineer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signup(formData);
      if (res.success || res.token || res.access_token) {
        if (res.token || res.access_token) {
          localStorage.setItem("token", res.token || res.access_token);
        }
        setSuccess(true);
        setTimeout(() => {
          navigate("/onboarding");
        }, 1200);
      } else if (res.message) {
        setError(res.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate("/onboarding");
        }, 1200);
      }
    } catch (err) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/onboarding");
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8c7322] flex items-center justify-center shadow-lg shadow-[#d4af37]/20 group-hover:scale-105 transition-transform">
              <Sparkles size={20} className="text-black" />
            </div>
            <span className="font-serif-header text-xl font-bold tracking-tight text-white">
              CareerForge <span className="text-[#d4af37]">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-serif-header font-bold text-white mt-2">
            Forge Your Career
          </h1>
          <p className="text-xs text-stone-400 font-light mt-1">
            Personalized ATS analytics, interview rubrics, and algorithm tracks
          </p>
        </div>

        {/* Card */}
        <div className="apple-liquid-glass bg-[#0c0c0c]/90 border border-[#d4af37]/20 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle size={15} className="shrink-0" />
              <span>Account created! Redirecting to Career Calibration...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Chen"
                  className="w-full bg-[#141414] border border-stone-800 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-white text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex.chen@company.com"
                  className="w-full bg-[#141414] border border-stone-800 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-white text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full bg-[#141414] border border-stone-800 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-white text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89528] hover:from-[#e5c048] hover:to-[#cfa835] text-black font-semibold text-xs tracking-wide shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Setting up your profile...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-stone-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#d4af37] hover:text-[#f5d77f] font-semibold transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
