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
        to="/configure"
        className="flex-1 rounded-full py-3 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors"
        activeProps={{ className: "glass-active text-foreground" }}
      >
        Configurer
      </Link>
      <Link
        to="/"
        aria-label="Lancer une séance"
        activeOptions={{ exact: true }}
        className="mx-1.5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 4l14 8-14 8V4z" />
        </svg>
      </Link>
      <Link
        to="/settings"
        className="flex-1 rounded-full py-3 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors"
        activeProps={{ className: "glass-active text-foreground" }}
      >
        Paramètres
      </Link>
    </nav>
  );
}
