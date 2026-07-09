import Card from "./Card";

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-gray-400 text-sm">
            {title}
          </p>

          <h3 className="text-3xl font-bold mt-2 text-white">
            {value}
          </h3>
        </div>

        <div className="text-blue-500">
          {icon}
        </div>

      </div>
    </Card>
  );
}

export default StatCard;