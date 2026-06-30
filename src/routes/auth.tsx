import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Sparkles, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/app/email" });
  },
  head: () => ({
    meta: [
      { title: "Sign in · Sawubona AI" },
      { name: "description", content: "Sign in or create your free Sawubona AI account to save and reuse your work." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin + "/app/email",
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome! Check your inbox to confirm your email — then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/app/email";
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Could not authenticate");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth/callback" });
    if (r.error) { toast.error(r.error.message); setBusy(false); return; }
    if (!r.redirected) window.location.href = "/app/email";
  }

  return (
    <div className="min-h-screen bg-hero flex flex-col">
      <header className="px-6 py-5">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="size-9 rounded-xl bg-brand grid place-items-center shadow-pop">
            <Sparkles className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl">Sawubona AI</span>
        </Link>
      </header>
      <div className="flex-1 grid place-items-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl bg-card shadow-pop border border-border p-7">
          <h1 className="text-3xl">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signup"
              ? "Free to start. Your generations are saved to your account and available offline."
              : "Sign in to continue where you left off."}
          </p>

          <button onClick={google} disabled={busy}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary transition font-medium">
            <GoogleG /> Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or email <div className="flex-1 h-px bg-border" />
          </div>

          <form className="space-y-3" onSubmit={submit}>
            {mode === "signup" && (
              <input className="w-full px-3 py-2.5 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <input type="email" required autoComplete="email"
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.co.za" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-primary-foreground font-medium shadow-pop hover:opacity-90 transition disabled:opacity-60">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-primary font-medium hover:underline">
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            We protect your privacy — your work is only visible to you, secured by row-level access controls.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="size-5"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 16.3 4.5 9.6 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-2 13.3-5.2l-6.1-5.2c-2 1.4-4.5 2.3-7.2 2.3-5.2 0-9.7-3.1-11.6-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.5-2.6 4.5-4.8 5.9l6.1 5.2C40.8 35.7 43.5 30.3 43.5 24c0-1.2-.1-2.4-.3-3.5z"/></svg>
  );
}
