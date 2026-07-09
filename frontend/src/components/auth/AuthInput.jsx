function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
}) {
  return (
    <div>
      <label className="block text-gray-300 mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white outline-none focus:border-blue-500 transition"
      />
    </div>
  );
}

export default AuthInput;