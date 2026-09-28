import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadWorkouts, type Workout } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MYO — Lancer une séance" },
      { name: "description", content: "Lancez vos séances de musculation." },
      { property: "og:title", content: "MYO — Lancer une séance" },
      { property: "og:description", content: "Lancez vos séances de musculation." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setWorkouts(loadWorkouts());
  }, []);

  const filtered = workouts.filter((w) =>
    w.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background px-5 pb-32 pt-10">
      <header className="border-b border-border pb-5">
        <p className="label-tech">[ MYO ]</p>
        <h1 className="mt-1 text-3xl font-bold uppercase tracking-[0.25em]">
          Lancer une séance
        </h1>
      </header>

      <div className="mt-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="RECHERCHER…"
          className="field w-full px-4 py-3 text-sm uppercase tracking-widest placeholder:text-muted-foreground"
        />
      </div>

      <section className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-xs uppercase tracking-widest text-muted-foreground">
            {workouts.length === 0
              ? "Aucune séance — configurez-en une"
              : "Aucun résultat"}
          </p>
        )}
        {filtered.map((w) => (
          <article key={w.id} className="panel px-4 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold uppercase tracking-wider">
                {w.name}
              </h2>
              <span className="tag">{w.exercises.length} EXO</span>
            </div>
            <Link
              to="/run/$id"
              params={{ id: w.id }}
              className="mt-4 block bg-primary py-2.5 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground"
            >
              Lancer
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
