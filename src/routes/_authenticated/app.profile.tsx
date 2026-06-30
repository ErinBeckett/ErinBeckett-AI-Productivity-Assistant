import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Field, ToolHeader } from "@/components/AppShell";
import { useProfile } from "@/lib/generations";
import { upsertProfile } from "@/lib/generations";
import { LEARNING_STYLES, ROLES, PROVINCES } from "@/lib/profile";
import { User, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/profile")({
  head: () => ({ meta: [{ title: "Profile · Sawubona AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data, refetch } = useProfile();
  const [full_name, setName] = useState("");
  const [learning_style, setLS] = useState<string>("multimodal");
  const [role, setRole] = useState<string>("professional");
  const [institution, setInst] = useState("");
  const [province, setProv] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) {
      setName(data.full_name ?? "");
      setLS(data.learning_style ?? "multimodal");
      setRole(data.role ?? "professional");
      setInst(data.institution ?? "");
      setProv(data.province ?? "");
    }
  }, [data]);

  async function save() {
    setBusy(true);
    try {
      await upsertProfile({ full_name, learning_style, role, institution, province });
      toast.success("Profile saved — AI will tailor future outputs to you.");
      refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <ToolHeader icon={User} title="Your profile" subtitle="Set once — every tool tailors its output to your role, learning style and SA context." accent="bg-brand" />
        <div className="mt-8 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-5">
          <Field label="Full name">
            <input value={full_name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>

          <Field label="I am a…">
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button key={r.id} type="button" onClick={() => setRole(r.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${role === r.id ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-secondary"}`}>{r.label}</button>
              ))}
            </div>
          </Field>

          <Field label="Preferred learning style" hint="The AI will adapt format, examples and tone to this.">
            <div className="grid sm:grid-cols-2 gap-2">
              {LEARNING_STYLES.map((s) => (
                <button key={s.id} type="button" onClick={() => setLS(s.id)}
                  className={`text-left p-3 rounded-2xl border transition ${learning_style === s.id ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-secondary"}`}>
                  <p className="font-medium text-sm">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Institution / Company (optional)">
              <input value={institution} onChange={(e) => setInst(e.target.value)}
                placeholder="e.g. University of Cape Town"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Province">
              <select value={province} onChange={(e) => setProv(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select…</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <button onClick={save} disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand text-primary-foreground font-medium shadow-pop hover:opacity-90 disabled:opacity-60 transition">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save profile
          </button>

          <p className="text-xs text-muted-foreground">
            We use your profile only to tailor outputs you generate. Your data is private to you and protected by row-level access controls.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
