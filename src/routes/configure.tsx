import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  deleteWorkout,
  loadWorkouts,
  type Workout,
} from "@/lib/storage";

export const Route = createFileRoute("/configure")({
  head: () => ({
    meta: [
      { title: "MYO — Configurer une séance" },
      { name: "description", content: "Créez et modifiez vos séances de musculation." },
      { property: "og:title", content: "MYO — Configurer une séance" },
      { property: "og:description", content: "Créez et modifiez vos séances de musculation." },
    ],
  }),
  component: ConfigurePage,
});

function ConfigurePage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setWorkouts(loadWorkouts());
  }, []);

  const remove = (id: string) => {
    deleteWorkout(id);
    setWorkouts(loadWorkouts());
  };

  const filtered = workouts.filter((w) =>
    w.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background px-5 pb-32 pt-10">
      <header className="border-b border-border pb-5">
        <p className="label-tech">[ CONSTRUCTEUR ]</p>
        <h1 className="mt-1 text-3xl font-bold uppercase tracking-[0.25em]">
          Configurer
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

      <Link
        to="/workout/$id"
        params={{ id: "new" }}
        className="mt-4 block w-full border border-dashed border-border py-3 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        + Nouvelle séance
      </Link>

      <section className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-xs uppercase tracking-widest text-muted-foreground">
            {workouts.length === 0
              ? "Aucune séance — créez la première"
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
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                to="/workout/$id"
                params={{ id: w.id }}
                className="bg-primary py-2.5 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground"
              >
                Éditer
              </Link>
              <button
                onClick={() => remove(w.id)}
                className="border border-border py-2.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
              >
                Suppr
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
