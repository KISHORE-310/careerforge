import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import Button from "../components/common/Button";

import { signup } from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await signup(formData);

      if (data.success) {
        setMessage(data.message);
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-[#0c0c0c] border border-[#d4af37]/20 rounded-2xl p-7 sm:p-8 shadow-2xl space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-light text-white tracking-tight">
            Create CareerForge Account
          </h2>
          <p className="text-xs text-stone-400 font-light">
            Start your AI-guided technical preparation journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Full Name"
            name="full_name"
            placeholder="Kishore Reddy"
            value={formData.full_name}
            onChange={handleChange}
          />

          <AuthInput
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />

          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && (
            <p className="text-amber-400 text-xs bg-amber-950/20 border border-amber-900/30 rounded-lg p-2.5 font-light">
              {error}
            </p>
          )}

          {message && (
            <p className="text-emerald-400 text-xs bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-2.5 font-light">
              {message}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-stone-400 font-light pt-2 border-t border-stone-900">
          Already have an account?{" "}
          <Link to="/login" className="text-[#d4af37] hover:underline ml-1">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Signup;