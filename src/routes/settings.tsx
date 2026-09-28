import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const SETTINGS_KEY = "myo_settings";

type Settings = {
  sound: boolean;
  haptics: boolean;
  autoRestDelay: number;
};

const DEFAULTS: Settings = { sound: true, haptics: true, autoRestDelay: 5 };

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "MYO — Paramètres" },
      { name: "description", content: "Réglages MYO : sons, vibrations, minuteur." },
      { property: "og:title", content: "MYO — Paramètres" },
      { property: "og:description", content: "Réglages MYO : sons, vibrations, minuteur." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    setS(loadSettings());
  }, []);

  const update = (patch: Partial<Settings>) => {
    const next = { ...s, ...patch };
    setS(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  return (
    <main className="min-h-screen bg-background px-5 pb-32 pt-10">
      <header className="border-b border-border pb-5">
        <p className="label-tech">[ SYSTÈME ]</p>
        <h1 className="mt-1 text-3xl font-bold uppercase tracking-[0.25em]">
          Paramètres
        </h1>
      </header>

      <section className="mt-8 space-y-3">
        <div className="panel flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm uppercase tracking-widest">Sons</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Impact de basse à la reprise
            </p>
          </div>
          <button
            onClick={() => update({ sound: !s.sound })}
            className={`tag ${s.sound ? "bg-primary text-primary-foreground" : ""}`}
          >
            {s.sound ? "ON" : "OFF"}
          </button>
        </div>

        <div className="panel flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm uppercase tracking-widest">Vibrations</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Retour haptique sur les validations
            </p>
          </div>
          <button
            onClick={() => update({ haptics: !s.haptics })}
            className={`tag ${s.haptics ? "bg-primary text-primary-foreground" : ""}`}
          >
            {s.haptics ? "ON" : "OFF"}
          </button>
        </div>

        <div className="panel flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm uppercase tracking-widest">Repos auto</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Délai d'inactivité avant le minuteur
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => update({ autoRestDelay: Math.max(0, s.autoRestDelay - 1) })}
              className="tag"
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-bold">
              {s.autoRestDelay}s
            </span>
            <button
              onClick={() => update({ autoRestDelay: Math.min(30, s.autoRestDelay + 1) })}
              className="tag"
            >
              +
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
