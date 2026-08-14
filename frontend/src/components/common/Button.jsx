function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-normal tracking-wide transition-all duration-200 active:scale-[0.98]";

  const variants = {
    primary:
      "bg-[#d4af37] text-black hover:bg-[#e5c158] hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] font-normal",

    secondary:
      "bg-[#0e0e0e] border border-[#d4af37]/30 text-stone-200 hover:border-[#d4af37]/70 hover:text-white hover:bg-[#151515]",

    ghost:
      "text-stone-300 hover:text-[#d4af37] hover:bg-[#d4af37]/10",

    outline:
      "border border-stone-800 text-stone-300 hover:border-[#d4af37]/50 hover:text-[#d4af37]",

    success:
      "bg-emerald-800/80 border border-emerald-600/40 text-emerald-100 hover:bg-emerald-700",

    danger:
      "bg-rose-950/80 border border-rose-800/50 text-rose-200 hover:bg-rose-900",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${base}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      )}

      {!loading && leftIcon}

      {loading ? "Processing..." : children}

      {!loading && rightIcon}
    </button>
  );
}

export default Button;