import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEFAULTS, loadSettings, saveSettings, type Settings } from "@/lib/settings";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "MYO — Paramètres" },
      { name: "description", content: "Réglages MYO : sons, vibrations, minuteur." },
      { property: "og:title", content: "MYO — Paramètres" },
      { property: "og:description", content: "Réglages MYO : sons, vibrations, minuteur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
    saveSettings(next);
  };

  return (
    <main className="myo-page bg-background">
      <header className="border-b border-border pb-6">
        <p className="label-tech mb-3">[ MYO / 04 ]</p>
        <h1 className="myo-title">
          Paramètres
        </h1>
      </header>

      <section className="mt-8 divide-y divide-border border-y border-border">
        <div className="flex items-center justify-between gap-4 py-5">
          <div>
            <p className="myo-section-title">Sons</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Impact de basse à la reprise
            </p>
          </div>
          <Button
            variant={s.sound ? "default" : "outline"}
            size="sm"
            role="switch"
            aria-checked={s.sound}
            aria-label="Sons"
            onClick={() => update({ sound: !s.sound })}
            className="w-14 shrink-0 font-mono text-xs"
          >
            {s.sound ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 py-5">
          <div>
            <p className="myo-section-title">Vibrations</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Retour haptique sur les validations
            </p>
          </div>
          <Button
            variant={s.haptics ? "default" : "outline"}
            size="sm"
            role="switch"
            aria-checked={s.haptics}
            aria-label="Vibrations"
            onClick={() => update({ haptics: !s.haptics })}
            className="w-14 shrink-0 font-mono text-xs"
          >
            {s.haptics ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="min-w-0">
            <p className="myo-section-title">Repos auto</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Délai d'inactivité avant le minuteur
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Diminuer le délai"
              onClick={() => update({ autoRestDelay: Math.max(0, s.autoRestDelay - 1) })}
            >
              −
            </Button>
            <span className="w-12 text-center font-mono text-sm font-bold">
              {s.autoRestDelay}s
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Augmenter le délai"
              onClick={() => update({ autoRestDelay: Math.min(30, s.autoRestDelay + 1) })}
            >
              +
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
