import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell, Field, ToolHeader } from "@/components/AppShell";
import { OutputPanel, SaveControls, useCopy } from "@/components/OutputPanel";
import { VoiceButton } from "@/components/VoiceButton";
import { generateEmail } from "@/lib/ai.functions";
import { useGeneration, useProfile, useSaveGeneration, useUpdateGeneration, useDeleteGeneration } from "@/lib/generations";
import { profileSystemContext, type Profile } from "@/lib/profile";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

const search = z.object({ id: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/app/email")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Smart Email · Sawubona AI" }] }),
  component: EmailPage,
});

const tones = ["professional", "friendly", "concise", "persuasive", "apologetic"] as const;

function EmailPage() {
  const { id } = useSearch({ from: "/_authenticated/app/email" });
  const navigate = useNavigate();
  const fn = useServerFn(generateEmail);
  const { data: profile } = useProfile();
  const existing = useGeneration(id);
  const save = useSaveGeneration();
  const update = useUpdateGeneration();
  const del = useDeleteGeneration();

  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<(typeof tones)[number]>("professional");
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopy();

  useEffect(() => {
    if (existing.data) {
      const m = (existing.data.metadata ?? {}) as any;
      setRecipient(m.recipient ?? "");
      setPurpose(m.purpose ?? "");
      setTone(m.tone ?? "professional");
      setOutput(existing.data.content);
    }
  }, [existing.data]);

  const mutation = useMutation({
    mutationFn: (v: { recipient: string; purpose: string; tone: typeof tone }) =>
      fn({ data: { ...v, context: profileSystemContext(profile as Profile | null) } }),
    onSuccess: (r) => setOutput(r?.email ?? ""),
    onError: (e: any) => toast.error(e?.message ?? "Generation failed"),
  });

  const onSave = async () => {
    const r = await save.mutateAsync({
      type: "email",
      title: recipient ? `Email to ${recipient}` : "Untitled email",
      content: output,
      metadata: { recipient, purpose, tone },
    });
    toast.success("Saved to your history");
    navigate({ to: "/_authenticated/app/email", search: { id: r.id } });
  };
  const onUpdate = async () => {
    if (!id) return;
    await update.mutateAsync({ id, patch: { title: recipient ? `Email to ${recipient}` : "Untitled email", content: output, metadata: { recipient, purpose, tone } } });
    toast.success("Updated");
  };
  const onDelete = async () => {
    if (!id) return;
    await del.mutateAsync(id);
    toast.success("Deleted");
    navigate({ to: "/_authenticated/app/email", search: {} });
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ToolHeader icon={Mail} title="Smart Email Generator" subtitle="Describe what you need to say — get a polished, on-tone email." accent="bg-sun" />

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <form className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-5"
            onSubmit={(e) => { e.preventDefault(); if (purpose.trim().length < 1) return; mutation.mutate({ recipient, purpose, tone }); }}>
            <Field label="Recipient">
              <input value={recipient} onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Ms Naidoo, HR Manager"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Purpose / context" right={<VoiceButton onText={(t) => setPurpose((p) => (p ? p + " " + t : t))} />}>
              <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)}
                rows={6} placeholder="What's the email about? Background, what you want to ask, deadlines…"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-input resize-y focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Tone">
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button key={t} type="button" onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-full text-sm capitalize border transition ${tone === t ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-secondary"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <button type="submit" disabled={mutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand text-primary-foreground font-medium shadow-pop hover:opacity-90 disabled:opacity-60 transition">
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
              {mutation.isPending ? "Drafting…" : id ? "Regenerate" : "Draft email"}
            </button>
          </form>

          <div className="space-y-3">
            <OutputPanel
              title="Draft"
              empty="Your draft will appear here. Edit it below before sending or saving."
              loading={mutation.isPending}
              error={mutation.error?.message}
              content={output}
              onCopy={output ? () => copy(output) : undefined}
              copied={copied}
              actions={output ? (
                <SaveControls savedId={id ?? null} saving={save.isPending || update.isPending}
                  onSave={onSave} onUpdate={onUpdate} onDelete={onDelete} />
              ) : null}
            />
            {output && (
              <textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={10}
                className="w-full rounded-2xl bg-card border border-border p-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Edit your draft here…" />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
