import { User } from "lucide-react";

function Avatar({
  image,
  name = "User",
  role = "",
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 hover:border-red-500 transition">

      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center overflow-hidden">

        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="text-white" size={24} />
        )}

      </div>

      <div>
        <h3 className="font-semibold text-white">
          {name}
        </h3>

        <p className="text-zinc-400 text-sm">
          {role}
        </p>
      </div>

    </div>
  );
}

export default Avatar;