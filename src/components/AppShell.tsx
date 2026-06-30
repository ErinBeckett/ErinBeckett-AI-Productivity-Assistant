import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { Sparkles, Mail, NotebookPen, ListChecks, Presentation, Workflow, History, User, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/generations";

const NAV = [
  { to: "/app/email", label: "Email", icon: Mail },
  { to: "/app/notes", label: "Notes", icon: NotebookPen },
  { to: "/app/tasks", label: "Tasks", icon: ListChecks },
  { to: "/app/presentations", label: "Slides", icon: Presentation },
  { to: "/app/diagrams", label: "Diagrams", icon: Workflow },
  { to: "/app/history", label: "Saved", icon: History },
] as const;

export function AppShell({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: profile } = useProfile();
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const u = () => setOnline(navigator.onLine);
    u(); window.addEventListener("online", u); window.addEventListener("offline", u);
    return () => { window.removeEventListener("online", u); window.removeEventListener("offline", u); };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col bg-hero">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/75 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="size-9 rounded-xl bg-brand grid place-items-center shadow-pop">
              <Sparkles className="size-5 text-primary-foreground" />
            </span>
            <span className="font-display text-2xl tracking-tight">Sawubona AI</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 text-sm">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to}
                className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors inline-flex items-center gap-1.5"
                activeProps={{ className: "px-3 py-1.5 rounded-lg text-foreground bg-secondary inline-flex items-center gap-1.5" }}
              >
                <n.icon className="size-4" />{n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {!online && <span className="hidden sm:inline-flex text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">Offline</span>}
            <Link to="/app/profile" className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-secondary text-sm">
              <User className="size-4" />
              <span className="max-w-[120px] truncate">{profile?.full_name ?? "Profile"}</span>
            </Link>
            <button onClick={signOut} className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-secondary">
              <LogOut className="size-3.5" />Sign out
            </button>
            <button className="lg:hidden p-2 -mr-2" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-2 gap-1.5">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm hover:bg-secondary inline-flex items-center gap-2">
                  <n.icon className="size-4" />{n.label}
                </Link>
              ))}
              <Link to="/app/profile" onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm hover:bg-secondary inline-flex items-center gap-2">
                <User className="size-4" />Profile
              </Link>
              <button onClick={() => { setOpen(false); signOut(); }}
                className="px-3 py-2.5 rounded-lg text-sm hover:bg-secondary inline-flex items-center gap-2 text-left">
                <LogOut className="size-4" />Sign out
              </button>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">{children ?? <Outlet />}</main>
      <footer className="border-t border-border py-6 px-4 text-center text-xs text-muted-foreground">
        Sawubona AI · Built for South African workplaces & classrooms · Your saved work stays on your device for offline access.
      </footer>
    </div>
  );
}

export function ToolHeader({ icon: Icon, title, subtitle, accent = "bg-brand" }: { icon: any; title: string; subtitle: string; accent?: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className={`size-12 rounded-2xl ${accent} grid place-items-center shadow-pop shrink-0`}>
        <Icon className="size-6 text-primary-foreground" />
      </span>
      <div>
        <h1 className="text-3xl md:text-4xl leading-tight">{title}</h1>
        <p className="text-muted-foreground mt-1 max-w-xl">{subtitle}</p>
      </div>
    </div>
  );
}

export function Field({ label, hint, children, right }: { label: string; hint?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {right}
      </span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
