import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordInput({
  value,
  onChange,
  name = "password",
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="block text-gray-300 mb-2">
        Password
      </label>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="Enter your password"
          className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 pr-12 text-white outline-none focus:border-blue-500 transition"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;