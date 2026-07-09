function ProgressBar({
  value,
  color = "bg-blue-500",
}) {
  return (
    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
      <div
        className={`${color} h-3 rounded-full transition-all duration-700`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}

export default ProgressBar;