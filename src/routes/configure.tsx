import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
    <main className="myo-page bg-background">
      <header className="border-b border-border pb-6">
        <p className="label-tech mb-3">[ MYO / 02 ]</p>
        <h1 className="myo-title">Configurer</h1>
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

      {workouts.length > 0 && <Link
        to="/workout/$id"
        params={{ id: "new" }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold uppercase text-primary-foreground"
      >
        <Plus size={18} aria-hidden="true" /> Nouvelle séance
      </Link>}

      {workouts.length === 0 ? <section className="myo-empty px-4">
        <SlidersHorizontal size={56} strokeWidth={1} aria-hidden="true" className="mb-7 text-muted-foreground" />
        <h2 className="myo-section-title">Aucune séance</h2>
        <p className="mt-3 max-w-xs text-lg leading-snug text-muted-foreground">Créez votre première séance pour commencer.</p>
        <Link to="/workout/$id" params={{ id: "new" }} className="mt-6 inline-flex items-center gap-2 border-b border-foreground pb-1 text-base font-semibold text-foreground hover:opacity-70">
          Créer une séance <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section> : <section className="mt-7 space-y-3">
        {filtered.length === 0 && <p className="py-10 text-center text-base text-muted-foreground">Aucun résultat</p>}
        {filtered.map((w) => (
          <article key={w.id} className="panel px-5 py-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="myo-section-title break-words">
                {w.name}
              </h2>
              <span className="tag">{w.exercises.length} EXO</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                to="/workout/$id"
                params={{ id: w.id }}
                className="rounded-md bg-primary py-3 text-center text-sm font-semibold uppercase text-primary-foreground"
              >
                Éditer
              </Link>
              <Button
                variant="outline"
                onClick={() => remove(w.id)}
                className="h-auto border-border py-3 text-sm font-semibold uppercase text-muted-foreground hover:border-destructive hover:text-destructive"
              >
                Supprimer
              </Button>
            </div>
          </article>
        ))}
      </section>}
    </main>
  );
}
