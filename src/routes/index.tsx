import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadWorkouts, type Workout } from "@/lib/storage";
import { ArrowRight, Dumbbell, Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MYO — Lancer une séance" },
      { name: "description", content: "Lancez vos séances de musculation." },
      { property: "og:title", content: "MYO — Lancer une séance" },
      { property: "og:description", content: "Lancez vos séances de musculation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
    <main className="myo-page bg-background">
      <header className="border-b border-border pb-6">
        <p className="label-tech mb-3">[ MYO / 01 ]</p>
        <h1 className="myo-title">Lancer une séance</h1>
      </header>

      {workouts.length > 0 && <div className="relative mt-7">
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-label="Rechercher une séance"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une séance"
          className="field w-full py-3 pl-11 pr-4 text-base placeholder:text-muted-foreground"
        />
      </div>}

      {workouts.length === 0 ? (
        <section className="myo-empty px-4">
          <Dumbbell size={56} strokeWidth={1} aria-hidden="true" className="mb-7 text-muted-foreground" />
          <h2 className="myo-section-title">Aucune séance</h2>
          <p className="mt-3 max-w-xs text-lg leading-snug text-muted-foreground">Aucun entraînement disponible pour le moment.</p>
          <Link to="/configure" className="mt-6 inline-flex items-center gap-2 border-b border-foreground pb-1 text-base font-semibold text-foreground transition-opacity hover:opacity-70">
            Configurer une séance <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      ) : <section className="mt-7 space-y-3">
        {filtered.length === 0 && <p className="py-10 text-center text-base text-muted-foreground">Aucun résultat</p>}
        {filtered.map((w) => (
          <article key={w.id} className="panel px-5 py-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="myo-section-title break-words">
                {w.name}
              </h2>
              <span className="tag">{w.exercises.length} EXO</span>
            </div>
            <Link
              to="/run/$id"
              params={{ id: w.id }}
              className="mt-5 flex items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold uppercase text-primary-foreground"
            >
              Lancer <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </section>}
    </main>
  );
}
