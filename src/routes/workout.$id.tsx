import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  emptyWorkout,
  getWorkout,
  uid,
  upsertWorkout,
  type Exercise,
  type Workout,
} from "@/lib/storage";

export const Route = createFileRoute("/workout/$id")({
  head: () => ({
    meta: [
      { title: "MYO — Créateur de séance" },
      {
        name: "description",
        content: "Paramétrez exercices, séries, charges et temps de repos.",
      },
      { property: "og:title", content: "MYO — Créateur de séance" },
      {
        property: "og:description",
        content: "Exercices, séries, charges et repos ciblé par exercice.",
      },
    ],
  }),
  component: Builder,
});

function newExercise(): Exercise {
  return { id: uid(), name: "", sets: 4, load: 40, rest: 90 };
}

function Builder() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    if (id === "new") {
      const w = emptyWorkout();
      w.exercises = [newExercise()];
      setWorkout(w);
    } else {
      setWorkout(getWorkout(id) ?? null);
    }
  }, [id]);

  if (!workout) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="label-tech">[ CHARGEMENT ]</p>
      </main>
    );
  }

  const patch = (p: Partial<Workout>) => setWorkout({ ...workout, ...p });

  const patchEx = (exId: string, p: Partial<Exercise>) =>
    patch({
      exercises: workout.exercises.map((e) => (e.id === exId ? { ...e, ...p } : e)),
    });

  const move = (index: number, dir: -1 | 1) => {
    const next = [...workout.exercises];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const a = next[index]!;
    const b = next[target]!;
    next[index] = b;
    next[target] = a;
    patch({ exercises: next });
  };

  const save = () => {
    upsertWorkout({
      ...workout,
      name: workout.name.trim() || "SÉANCE",
      exercises: workout.exercises.filter((e) => e.name.trim()),
    });
    void navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen bg-background px-5 pb-28 pt-10">
      <button
        onClick={() => void navigate({ to: "/" })}
        className="label-tech transition-colors hover:text-foreground"
      >
        [ ← RETOUR ]
      </button>

      <h1 className="mt-6 text-2xl font-bold uppercase tracking-[0.25em]">
        Créateur
      </h1>

      <div className="mt-6">
        <p className="label-tech">[ NOM_SÉANCE ]</p>
        <input
          value={workout.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="PUSH LOURDS"
          className="field mt-2 uppercase tracking-widest placeholder:text-muted-foreground focus:border-foreground"
        />
      </div>

      <div className="mt-8 space-y-4">
        {workout.exercises.map((ex, i) => (
          <div key={ex.id} className="panel">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="label-tech">
                [ EX_{String(i + 1).padStart(2, "0")} ]
              </span>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <button onClick={() => move(i, -1)} className="hover:text-foreground">
                  ↑
                </button>
                <button onClick={() => move(i, 1)} className="hover:text-foreground">
                  ↓
                </button>
                <button
                  onClick={() =>
                    patch({ exercises: workout.exercises.filter((e) => e.id !== ex.id) })
                  }
                  className="hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-3 p-3">
              <input
                value={ex.name}
                onChange={(e) => patchEx(ex.id, { name: e.target.value })}
                placeholder="DÉVELOPPÉ COUCHÉ"
                className="field uppercase tracking-widest placeholder:text-muted-foreground focus:border-foreground"
              />
              <div className="grid grid-cols-3 gap-3">
                <NumField
                  label="SÉRIES"
                  value={ex.sets}
                  onChange={(v) => patchEx(ex.id, { sets: v })}
                />
                <NumField
                  label="CHARGE_KG"
                  value={ex.load}
                  onChange={(v) => patchEx(ex.id, { load: v })}
                />
                <NumField
                  label="REPOS_S"
                  value={ex.rest}
                  onChange={(v) => patchEx(ex.id, { rest: v })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => patch({ exercises: [...workout.exercises, newExercise()] })}
        className="mt-5 w-full border border-dashed border-border py-4 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        [ + AJOUTER_EXERCICE ]
      </button>

      <button
        onClick={save}
        className="fixed inset-x-5 bottom-6 mx-auto block max-w-md bg-primary py-4 text-sm font-bold uppercase tracking-[0.3em] text-primary-foreground"
      >
        [ ENREGISTRER ]
      </button>
    </main>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="label-tech">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="field mt-1 text-center focus:border-foreground"
      />
    </label>
  );
}
