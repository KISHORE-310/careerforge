function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-normal text-stone-300">
        {label}
      </label>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-lg bg-[#0e0e0e] border border-stone-800 px-3.5 py-2.5 text-xs text-stone-200 placeholder:text-stone-600 outline-none focus:border-[#d4af37]/70 transition font-light"
      />
    </div>
  );
}

export default AuthInput;