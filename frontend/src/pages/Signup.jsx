import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";

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
        }, 1500);

      } else {

        setError(data.message);

      }

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Something went wrong."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <AuthLayout>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl">

        <h2 className="text-4xl font-bold text-white">
          Create Account
        </h2>

        <p className="text-gray-400 mt-3">
          Join CareerForge and start building your dream career.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6"
        >

          <AuthInput
            label="Full Name"
            name="full_name"
            placeholder="Enter your full name"
            value={formData.full_name}
            onChange={handleChange}
          />

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

          {message && (

            <p className="text-green-500 text-sm">
              {message}
            </p>

          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="text-center text-gray-400 mt-8">

          Already have an account?

          <Link
            to="/login"
            className="text-blue-500 ml-2 hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </AuthLayout>

  );

}

export default Signup;