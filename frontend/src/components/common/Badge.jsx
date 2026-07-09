function Badge({
  children,
  color = "red",
}) {

  const colors = {
    red: "bg-red-600/20 text-red-400",
    blue: "bg-blue-600/20 text-blue-400",
    green: "bg-green-600/20 text-green-400",
    purple: "bg-purple-600/20 text-purple-400",
  };

  return (
    <span
      className={`
        px-4
        py-2
        rounded-full
        text-sm
        font-medium
        ${colors[color]}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;