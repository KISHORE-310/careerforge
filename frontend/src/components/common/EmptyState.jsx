import { Inbox } from "lucide-react";

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="py-16 text-center">

      <Inbox
        className="mx-auto text-zinc-500"
        size={60}
      />

      <h2 className="mt-6 text-2xl font-semibold">
        {title}
      </h2>

      <p className="text-zinc-500 mt-3">
        {description}
      </p>

    </div>
  );
}

export default EmptyState;