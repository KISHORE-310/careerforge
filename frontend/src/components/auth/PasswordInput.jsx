import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordInput({
  value,
  onChange,
  name = "password",
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-normal text-stone-300">
        Password
      </label>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="Enter password"
          required
          className="w-full rounded-lg bg-[#0e0e0e] border border-stone-800 px-3.5 py-2.5 pr-10 text-xs text-stone-200 placeholder:text-stone-600 outline-none focus:border-[#d4af37]/70 transition font-light"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
        >
          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;