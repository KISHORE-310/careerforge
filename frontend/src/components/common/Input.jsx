function Input({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error = "",
  leftIcon,
  rightIcon,
  disabled = false,
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>

      {label && (
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {label}
        </label>
      )}

      <div
        className={`
          flex items-center gap-3
          rounded-2xl
          border
          border-zinc-700
          bg-zinc-900
          px-4
          py-3
          transition-all
          duration-300

          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "focus-within:border-red-500 focus-within:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          }
        `}
      >

        {leftIcon}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="
            w-full
            bg-transparent
            outline-none
            text-white
            placeholder:text-zinc-500
          "
        />

        {rightIcon}

      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">
          {error}
        </p>
      )}

    </div>
  );
}

export default Input;