import { Link, useRouterState } from "@tanstack/react-router";

export function GlassNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/run") || path.startsWith("/workout")) return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="glass fixed inset-x-4 bottom-5 z-50 mx-auto flex max-w-md items-center justify-between rounded-full p-1.5"
    >
      <Link
        to="/"
        className="flex-1 rounded-full py-3 text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-colors"
        activeProps={{ className: "glass-active text-foreground" }}
        activeOptions={{ exact: true }}
      >
        Séances
      </Link>
      <Link
        to="/workout/$id"
        params={{ id: "new" }}
        aria-label="Nouvelle séance"
        className="ml-1.5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground"
      >
        +
      </Link>
    </nav>
  );
}
