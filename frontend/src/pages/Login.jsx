import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import PasswordInput from "../components/auth/PasswordInput";
import AuthInput from "../components/auth/AuthInput";

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

        localStorage.setItem(
          "token",
          data.access_token
        );

        navigate("/dashboard");

      } else {

        setError(data.message);

      }

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Login failed."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <AuthLayout>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl">

        <h2 className="text-4xl font-bold text-white">
          Welcome Back
        </h2>

        <p className="text-gray-400 mt-3">
          Sign in to continue your CareerForge journey.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6"
        >

          <AuthInput
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-gray-400 mt-8">

          Don't have an account?

          <Link
            to="/signup"
            className="text-blue-500 ml-2 hover:underline"
          >
            Sign Up
          </Link>

        </p>

      </div>

    </AuthLayout>

  );

}

export default Login;