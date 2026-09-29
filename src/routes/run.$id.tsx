import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { getWorkout, saveSession, uid, upsertWorkout, type Workout, type WorkoutSession } from "@/lib/storage";
import { loadSettings } from "@/lib/settings";
import { bassImpact, haptic, primeAudio, tick } from "@/lib/feedback";

export const Route = createFileRoute("/run/$id")({
  head: () => ({
    meta: [
      { title: "MYO — Exécution" },
      {
        name: "description",
        content:
          "Exécution de séance avec minuteur de repos automatique déclenché par inactivité.",
      },
      { property: "og:title", content: "MYO — Exécution" },
      {
        property: "og:description",
        content: "Posez le téléphone, le repos se lance tout seul.",
      },
    ],
  }),
  component: Run,
});

type Phase = "work" | "arming" | "rest" | "done";


function fmt(s: number) {
  const m = Math.floor(Math.max(s, 0) / 60);
  const r = Math.max(s, 0) % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function Run() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exIndex, setExIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("work");
  const [armDelay, setArmDelay] = useState(5);
  const [arm, setArm] = useState(5);
  const [rest, setRest] = useState(0);
  const lastTick = useRef(0);
  const session = useRef<WorkoutSession | null>(null);

  useEffect(() => {
    setWorkout(getWorkout(id) ?? null);
    setArmDelay(loadSettings().autoRestDelay);
    session.current = { id: uid(), workoutId: id, workoutName: getWorkout(id)?.name ?? "SÉANCE", startedAt: Date.now(), sets: [] };
  }, [id]);

  const exercise = workout?.exercises[exIndex];

  // Inactivity detection: any touch while arming resets the 5s delay.
  useEffect(() => {
    if (phase !== "arming") return;
    const reset = () => setArm(armDelay);
    window.addEventListener("pointerdown", reset);
    window.addEventListener("keydown", reset);
    return () => {
      window.removeEventListener("pointerdown", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [phase, armDelay]);

  // Countdown tick (pure updater, no side effects inside).
  useEffect(() => {
    if (phase !== "arming") return;
    const t = window.setInterval(() => setArm((a) => a - 1), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  // Transition to rest when countdown reaches 0.
  useEffect(() => {
    if (phase === "arming" && arm <= 0) {
      setPhase("rest");
      setRest(exercise?.rest ?? 90);
      haptic(30);
    }
  }, [phase, arm, exercise]);

  useEffect(() => {
    if (phase !== "rest") return;
    const t = window.setInterval(() => setRest((r) => r - 1), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "rest") return;
    if (rest <= 0) {
      bassImpact();
      haptic([200, 100, 400]);
      lastTick.current = 0;
      setPhase("work");
    } else if (rest <= 3 && rest !== lastTick.current) {
      lastTick.current = rest;
      tick();
      haptic(20);
    }
  }, [phase, rest]);

  const validateSet = useCallback(() => {
    if (!workout || !exercise || phase !== "work") return;
    primeAudio();
    haptic(40);
    const isLastSet = setIndex + 1 >= exercise.sets;
    const isLastEx = exIndex + 1 >= workout.exercises.length;
    const current = session.current;
    if (current) {
      const now = Date.now();
      const updated: WorkoutSession = {
        ...current,
        sets: [...current.sets, { exerciseId: exercise.id, exerciseName: exercise.name, load: exercise.load, completedAt: now }],
        ...(isLastSet && isLastEx ? { completedAt: now } : {}),
      };
      session.current = updated;
      saveSession(updated);
    }

    if (isLastSet && isLastEx) {
      setPhase("done");
      bassImpact();
      haptic([300, 120, 300]);
      return;
    }
    if (isLastSet) {
      setExIndex(exIndex + 1);
      setSetIndex(0);
    } else {
      setSetIndex(setIndex + 1);
    }
    setArm(armDelay);
    setPhase("arming");
  }, [workout, exercise, setIndex, exIndex, armDelay, phase]);

  const changeLoad = (delta: number) => {
    if (!workout || !exercise) return;
    const load = Math.max(0, Math.round((exercise.load + delta) * 10) / 10);
    const next = {
      ...workout,
      exercises: workout.exercises.map((e, i) => (i === exIndex ? { ...e, load } : e)),
    };
    setWorkout(next);
    upsertWorkout(next);
    haptic(15);
  };

  if (!workout) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="label-tech">[ SÉANCE_INTROUVABLE ]</p>
        <button onClick={() => void navigate({ to: "/" })} className="tag">
          RETOUR
        </button>
      </main>
    );
  }

  if (workout.exercises.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="label-tech">[ AUCUN_EXERCICE ]</p>
        <button onClick={() => void navigate({ to: "/workout/$id", params: { id } })} className="tag">
          CONFIGURER
        </button>
      </main>
    );
  }

  if (phase === "done") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="label-tech">[ SESSION_TERMINÉE ]</p>
        <h1 className="text-4xl font-bold uppercase tracking-[0.25em]">
          {workout.name}
        </h1>
        <button
          onClick={() => void navigate({ to: "/" })}
          className="border border-foreground px-8 py-4 text-xs font-bold uppercase tracking-[0.3em] transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          [ SORTIR ]
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background px-5 pb-8 pt-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          onClick={() => void navigate({ to: "/" })}
          className="label-tech hover:text-foreground"
        >
          [ ✕ ]
        </button>
        <span className="label-tech">{workout.name}</span>
        <span className="tag">
          {exIndex + 1}/{workout.exercises.length}
        </span>
      </div>

      <div className="mt-8">
        <p className="label-tech">
          [ SET_{String(setIndex + 1).padStart(2, "0")} / {exercise?.sets} ]
        </p>
        <h1 className="mt-2 text-3xl font-bold uppercase leading-tight tracking-[0.15em]">
          {exercise?.name}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">REPOS {exercise?.rest}s</p>
        <div className="mt-4 flex items-stretch border border-border">
          <button
            onClick={() => changeLoad(-2.5)}
            aria-label="Diminuer la charge"
            className="w-16 border-r border-border text-2xl font-bold hover:bg-secondary"
          >
            −
          </button>
          <div className="flex flex-1 flex-col items-center py-3">
            <span className="label-tech">[ CHARGE_KG ]</span>
            <span className="mt-1 text-3xl font-bold">{exercise?.load}</span>
          </div>
          <button
            onClick={() => changeLoad(2.5)}
            aria-label="Augmenter la charge"
            className="w-16 border-l border-border text-2xl font-bold hover:bg-secondary"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-10 flex flex-1 flex-col items-center justify-center border border-border">
        {phase === "work" && (
          <>
            <p className="label-tech">[ SÉRIE_EN_COURS ]</p>
            <p className="mt-4 text-6xl font-bold tracking-tight">--:--</p>
            <p className="mt-4 px-8 text-center text-xs text-muted-foreground">
              Validez la série puis posez le téléphone.
            </p>
          </>
        )}
        {phase === "arming" && (
          <>
            <p className="label-tech">[ ARMEMENT_MINUTEUR ]</p>
            <p className="mt-4 text-6xl font-bold tracking-tight text-muted-foreground">
              {arm}
            </p>
            <p className="mt-4 px-8 text-center text-xs text-muted-foreground">
              Inactivité détectée dans {arm}s — le repos démarrera seul.
            </p>
          </>
        )}
        {phase === "rest" && (
          <>
            <p className="label-tech">[ REPOS ]</p>
            <p className="mt-4 text-7xl font-bold tracking-tight">{fmt(rest)}</p>
            <div className="mt-6 h-px w-2/3 bg-border">
              <div
                className="h-px bg-foreground transition-all duration-1000"
                style={{
                  width: `${100 - (rest / Math.max(exercise?.rest ?? 1, 1)) * 100}%`,
                }}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {phase === "rest" ? (
          <>
            <button
              onClick={() => setRest((r) => r + 30)}
              className="border border-border py-4 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
            >
              [ +30s ]
            </button>
            <button
              onClick={() => {
                setPhase("work");
                haptic(40);
              }}
              className="bg-primary py-4 text-xs font-bold uppercase tracking-[0.25em] text-primary-foreground"
            >
              [ REPRENDRE ]
            </button>
          </>
        ) : (
          <button
            onClick={validateSet}
            disabled={phase !== "work"}
            className="col-span-2 bg-primary py-5 text-sm font-bold uppercase tracking-[0.3em] text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            [ VALIDER_SÉRIE ]
          </button>
        )}
      </div>
    </main>
  );
}
