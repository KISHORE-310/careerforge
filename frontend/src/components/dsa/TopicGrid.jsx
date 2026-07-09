import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import TopicCard from "./TopicCard";

function TopicGrid({ topics }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");

  const groups = useMemo(
    () => ["All", ...new Set(topics.map((topic) => topic.group))],
    [topics],
  );

  const filteredTopics = useMemo(
    () =>
      topics.filter((topic) => {
        const text = `${topic.title} ${topic.group} ${topic.description}`.toLowerCase();

        return (
          text.includes(query.toLowerCase()) &&
          (group === "All" || topic.group === group)
        );
      }),
    [group, query, topics],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Topic Roadmap</h2>
          <p className="mt-2 text-zinc-400">
            Curated by patterns, difficulty, and placement relevance.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-4">
            <Search size={18} className="text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search topics"
              className="w-full bg-transparent text-white outline-none placeholder:text-zinc-600"
            />
          </div>

          <select
            value={group}
            onChange={(event) => setGroup(event.target.value)}
            className="min-h-12 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-white outline-none transition focus:border-red-500"
          >
            {groups.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredTopics.map((topic) => (
          <TopicCard key={topic.slug} {...topic} />
        ))}
      </div>
    </section>
  );
}

export default TopicGrid;
