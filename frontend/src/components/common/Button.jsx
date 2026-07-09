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
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-300 active:scale-95";

  const variants = {
    primary:
      "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20",

    secondary:
      "bg-zinc-900 border border-zinc-700 text-white hover:border-red-500",

    ghost:
      "text-zinc-300 hover:text-white hover:bg-zinc-800",

    success:
      "bg-green-600 text-white hover:bg-green-700",

    danger:
      "bg-red-700 text-white hover:bg-red-800",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {loading && (
        <span className="animate-spin">⏳</span>
      )}

      {!loading && leftIcon}

      {loading ? "Loading..." : children}

      {!loading && rightIcon}
    </button>
  );
}

export default Button;