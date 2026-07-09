function Card({
  children,
  className = "",
  hover = true,
  glow = false,
}) {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/80
        backdrop-blur-xl
        p-8
        shadow-lg
        transition-all
        duration-300

        ${
          hover
            ? "hover:-translate-y-1 hover:border-red-500 hover:shadow-[0_0_35px_rgba(239,68,68,0.15)]"
            : ""
        }

        ${
          glow
            ? "shadow-[0_0_40px_rgba(239,68,68,0.10)]"
            : ""
        }

        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;