import { Link, Outlet } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-hero">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="size-8 rounded-lg bg-brand grid place-items-center shadow-glow">
              <Sparkles className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display text-xl tracking-tight">Flowdesk</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <NavLink to="/email">Email</NavLink>
            <NavLink to="/notes">Notes</NavLink>
            <NavLink to="/tasks">Tasks</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children ?? <Outlet />}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Flowdesk · AI Workplace Productivity Assistant
      </footer>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      activeProps={{ className: "px-3 py-1.5 rounded-md text-foreground bg-secondary" }}
    >
      {children}
    </Link>
  );
}
