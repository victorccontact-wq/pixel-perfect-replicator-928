import { Link, useRouterState } from "@tanstack/react-router";
import { ChartNoAxesCombined, Play, Settings2, SlidersHorizontal } from "lucide-react";

const items = [
  { to: "/progress", label: "Progression", Icon: ChartNoAxesCombined },
  { to: "/configure", label: "Configurer", Icon: SlidersHorizontal },
  { to: "/", label: "Lancer", Icon: Play },
  { to: "/settings", label: "Paramètres", Icon: Settings2 },
] as const;

export function GlassNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/run") || path.startsWith("/workout")) return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="glass fixed inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto grid max-w-md grid-cols-4 items-stretch rounded-full p-1.5"
    >
      {items.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={to}
          aria-label={label === "Lancer" ? "Lancer une séance" : label}
          activeOptions={{ exact: true }}
          className="flex min-w-0 flex-col items-center justify-center rounded-full px-0.5 py-2.5 text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          activeProps={{ className: "glass-active text-foreground" }}
        >
          <Icon size={21} strokeWidth={1.8} fill={to === "/" ? "currentColor" : "none"} aria-hidden="true" />
        </Link>
      ))}
    </nav>
  );
}
