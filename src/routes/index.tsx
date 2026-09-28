import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { deleteWorkout, loadWorkouts, type Workout } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MYO — Séances" },
      {
        name: "description",
        content:
          "MYO : créateur de séances de musculation et minuteur de repos automatique, 100% local.",
      },
      { property: "og:title", content: "MYO — Séances" },
      {
        property: "og:description",
        content: "Créez vos séances, exécutez-les, le repos se lance seul.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const router = useRouter();

  useEffect(() => {
    setWorkouts(loadWorkouts());
  }, []);

  const remove = (id: string) => {
    deleteWorkout(id);
    setWorkouts(loadWorkouts());
    router.invalidate();
  };

  return (
    <main className="min-h-screen bg-background px-5 pb-32 pt-10">
      <header className="border-b border-border pb-5">
        <p className="label-tech">[ MYO ]</p>
        <h1 className="mt-1 text-3xl font-bold uppercase tracking-[0.25em]">
          Lancer une séance
        </h1>
      </header>

      <section className="mt-8 space-y-3">
        {workouts.length === 0 && (
          <div className="panel p-8 text-center">
            <p className="label-tech">[ AUCUNE_SÉANCE ]</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Créez votre première séance avant d'entrer dans la salle.
            </p>
          </div>
        )}

        {workouts.map((w, i) => (
          <article key={w.id} className="panel">
            <div className="flex items-start justify-between border-b border-border px-4 py-3">
              <div>
                <p className="label-tech">
                  [ PRG_{String(i + 1).padStart(2, "0")} ]
                </p>
                <h2 className="mt-1 text-lg font-medium uppercase tracking-wider">
                  {w.name || "SANS_NOM"}
                </h2>
              </div>
              <span className="tag">{w.exercises.length} EX</span>
            </div>
            <div className="grid grid-cols-3">
              <Link
                to="/run/$id"
                params={{ id: w.id }}
                className="border-r border-border bg-primary py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
              >
                Lancer
              </Link>
              <Link
                to="/workout/$id"
                params={{ id: w.id }}
                className="border-r border-border py-3 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Éditer
              </Link>
              <button
                onClick={() => remove(w.id)}
                className="py-3 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
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
