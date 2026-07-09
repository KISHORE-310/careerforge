function SectionTitle({
  badge,
  title,
  description,
}) {
  return (
    <div className="text-center max-w-4xl mx-auto">

      <p className="text-blue-500 uppercase tracking-[6px] font-semibold">
        {badge}
      </p>

      <h2 className="text-5xl md:text-6xl font-bold mt-5 leading-tight">
        {title}
      </h2>

      <p className="text-gray-400 text-lg leading-8 mt-8">
        {description}
      </p>

    </div>
  );
}

export default SectionTitle;