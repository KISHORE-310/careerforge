import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import PasswordInput from "../components/auth/PasswordInput";
import AuthInput from "../components/auth/AuthInput";
import Button from "../components/common/Button";

import { login } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
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

    try {
      const data = await login(formData);

      if (data.success) {
        localStorage.setItem("token", data.access_token);
        navigate("/dashboard");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-[#0c0c0c] border border-[#d4af37]/20 rounded-2xl p-7 sm:p-8 shadow-2xl space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-light text-white tracking-tight">
            Sign In to CareerForge
          </h2>
          <p className="text-xs text-stone-400 font-light">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-stone-400 font-light pt-2 border-t border-stone-900">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#d4af37] hover:underline ml-1">
            Create Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;