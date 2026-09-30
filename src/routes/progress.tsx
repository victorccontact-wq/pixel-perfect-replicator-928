import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { loadSessions, type WorkoutSession } from "@/lib/storage";
import { ArrowRight, ChartNoAxesCombined } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "MYO — Progression" },
      { name: "description", content: "Historique des séances, évolution des charges, volume et records personnels MYO." },
      { property: "og:title", content: "MYO — Progression" },
      { property: "og:description", content: "Suivez vos séances terminées, vos charges, votre volume et vos records personnels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProgressPage,
});

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

function ProgressPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    setSessions(loadSessions().filter((session) => session.completedAt).sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)));
  }, []);

  const exercises = useMemo(() => {
    const map = new Map<string, { name: string; points: { at: number; load: number }[]; record: number; sets: number }>();
    for (const session of [...sessions].reverse()) {
      for (const set of session.sets) {
        const key = set.exerciseName.trim().toLocaleLowerCase("fr-FR");
        const current = map.get(key) ?? { name: set.exerciseName, points: [], record: 0, sets: 0 };
        current.points.push({ at: set.completedAt, load: set.load });
        current.record = Math.max(current.record, set.load);
        current.sets += 1;
        map.set(key, current);
      }
    }
    return [...map.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name, "fr-FR"));
  }, [sessions]);

  const activeKey = exercises.some(([key]) => key === selected) ? selected : exercises[0]?.[0];
  const active = exercises.find(([key]) => key === activeKey)?.[1];
  const trendPoints = active?.points.map((point, index) => {
    const loads = active.points.map((p) => p.load);
    const low = Math.min(...loads);
    const high = Math.max(...loads);
    return {
      x: active.points.length === 1 ? 160 : 16 + index * 288 / (active.points.length - 1),
      y: high === low ? 56 : 96 - (point.load - low) / (high - low) * 80,
      ...point,
    };
  }) ?? [];
  const totalSets = sessions.reduce((sum, session) => sum + session.sets.length, 0);
  const volume = sessions.reduce((sum, session) => sum + session.sets.reduce((subtotal, set) => subtotal + set.load, 0), 0);

  return (
    <main className="myo-page bg-background">
      <header className="border-b border-border pb-6">
        <p className="label-tech mb-3">[ MYO / 03 ]</p>
        <h1 className="myo-title">Progression</h1>
      </header>

      {sessions.length === 0 ? (
        <section className="myo-empty px-4">
          <ChartNoAxesCombined size={56} strokeWidth={1} aria-hidden="true" className="mb-7 text-muted-foreground" />
          <h2 className="myo-section-title">Aucune séance terminée</h2>
          <p className="mt-3 max-w-xs text-lg leading-snug text-muted-foreground">Vos résultats apparaîtront ici après votre première séance.</p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 border-b border-foreground pb-1 text-base font-semibold text-foreground hover:opacity-70">Lancer une séance <ArrowRight size={18} aria-hidden="true" /></Link>
        </section>
      ) : (
        <>
          <section aria-label="Résumé" className="grid grid-cols-3 border-b border-border py-6">
            <Stat label="SÉANCES" value={number.format(sessions.length)} />
            <Stat label="SÉRIES" value={number.format(totalSets)} />
            <Stat label="VOLUME" value={`${number.format(volume)} kg`} />
          </section>

           <section className="mt-10">
            <SectionTitle index="01" title="ÉVOLUTION DES CHARGES" />
            <label className="mt-5 block">
              <span className="label-tech">[ EXERCICE ]</span>
              <select className="field mt-2 text-sm uppercase" value={activeKey ?? ""} onChange={(event) => setSelected(event.target.value)}>
                {exercises.map(([key, exercise]) => <option key={key} value={key}>{exercise.name}</option>)}
              </select>
            </label>
            {active && (
              <div className="mt-5 border border-border p-4 sm:p-6">
                <div className="flex items-end justify-between gap-3 border-b border-border pb-4">
                   <div><p className="label-tech">[ DERNIÈRE CHARGE ]</p><p className="mt-1 font-mono text-2xl font-bold">{number.format(active.points.at(-1)?.load ?? 0)} <span className="text-sm text-muted-foreground">KG</span></p></div>
                  <p className="text-xs text-muted-foreground">{active.points.length} SÉRIE{active.points.length > 1 ? "S" : ""}</p>
                </div>
                <div aria-label={`Évolution de ${active.name}`} className="mt-6 border-b border-border">
                  <svg viewBox="0 0 320 112" className="h-32 w-full text-foreground" role="img" aria-label={`${active.points.length} charges enregistrées, de ${number.format(active.points[0]?.load ?? 0)} à ${number.format(active.points.at(-1)?.load ?? 0)} kg`}>
                    <path d={`M ${trendPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`} fill="none" stroke="currentColor" strokeWidth="2" />
                    {trendPoints.map((point, index) => (
                      <circle key={`${point.at}-${index}`} cx={point.x} cy={point.y} r="3.5" fill="currentColor" />
                    ))}
                  </svg>
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>{date.format(active.points[0]?.at ?? 0)}</span>
                  <span>{date.format(active.points.at(-1)?.at ?? 0)}</span>
                </div>
              </div>
            )}
          </section>

          <section className="mt-10">
            <SectionTitle index="02" title="RECORDS PERSONNELS" />
            <div className="mt-4 divide-y divide-border border-y border-border">
              {exercises.map(([key, exercise]) => (
                <div key={key} className="flex items-center justify-between gap-3 py-4 text-sm">
                  <span className="min-w-0 break-words uppercase">{exercise.name}</span>
                   <span className="shrink-0 font-mono font-bold">{number.format(exercise.record)} KG</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle index="03" title="HISTORIQUE" />
            <div className="mt-4 divide-y divide-border border-y border-border">
              {sessions.map((session) => {
                const details = new Map<string, { name: string; count: number; max: number; volume: number }>();
                for (const set of session.sets) {
                  const key = set.exerciseId;
                  const item = details.get(key) ?? { name: set.exerciseName, count: 0, max: 0, volume: 0 };
                  item.count += 1;
                  item.max = Math.max(item.max, set.load);
                  item.volume += set.load;
                  details.set(key, item);
                }
                return (
                  <details key={session.id} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                       <div className="min-w-0"><p className="truncate text-lg font-semibold uppercase">{session.workoutName}</p><p className="mt-1 text-xs text-muted-foreground">{date.format(session.completedAt ?? 0)} · {time.format(session.completedAt ?? 0)}</p></div>
                      <div className="flex shrink-0 items-center gap-3 text-xs"><span>{session.sets.length} SÉRIES</span><span className="text-muted-foreground group-open:rotate-180">⌄</span></div>
                    </summary>
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="label-tech mb-3">[ VOLUME {number.format(session.sets.reduce((sum, set) => sum + set.load, 0))} KG ]</p>
                      {[...details.values()].map((item) => (
                        <div key={item.name} className="flex justify-between gap-3 py-2 text-xs">
                          <span className="min-w-0 break-words uppercase">{item.name} <span className="text-muted-foreground">× {item.count}</span></span>
                          <span className="shrink-0">MAX {number.format(item.max)} KG</span>
                        </div>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function SectionTitle({ index, title }: { index: string; title: string }) {
   return <div className="flex items-baseline gap-3 border-b border-border pb-3"><span className="label-tech">[{index}]</span><h2 className="myo-section-title">{title}</h2></div>;
}

function Stat({ label, value }: { label: string; value: string }) {
   return <div className="min-w-0 border-r border-border px-2 first:pl-0 last:border-0 last:pr-0 sm:px-5"><p className="label-tech">{label}</p><p className="mt-2 break-words font-mono text-base font-bold sm:text-2xl">{value}</p></div>;
}