import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell, Field, ToolHeader } from "@/components/AppShell";
import { OutputPanel, SaveControls, useCopy } from "@/components/OutputPanel";
import { VoiceButton } from "@/components/VoiceButton";
import { summarizeNotes } from "@/lib/ai.functions";
import { useGeneration, useProfile, useSaveGeneration, useUpdateGeneration, useDeleteGeneration } from "@/lib/generations";
import { profileSystemContext, type Profile } from "@/lib/profile";
import { NotebookPen, Loader2 } from "lucide-react";
import { toast } from "sonner";

const search = z.object({ id: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/app/notes")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Meeting Notes · Sawubona AI" }] }),
  component: NotesPage,
});

function NotesPage() {
  const { id } = useSearch({ from: "/_authenticated/app/notes" });
  const navigate = useNavigate();
  const fn = useServerFn(summarizeNotes);
  const { data: profile } = useProfile();
  const existing = useGeneration(id);
  const save = useSaveGeneration();
  const update = useUpdateGeneration();
  const del = useDeleteGeneration();

  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [title, setTitle] = useState("Meeting summary");
  const { copied, copy } = useCopy();

  useEffect(() => {
    if (existing.data) {
      const m = (existing.data.metadata ?? {}) as any;
      setNotes(m.notes ?? "");
      setOutput(existing.data.content);
      setTitle(existing.data.title);
    }
  }, [existing.data]);

  const mutation = useMutation({
    mutationFn: (v: { notes: string }) => fn({ data: { ...v, context: profileSystemContext(profile as Profile | null) } }),
    onSuccess: (r) => setOutput(r?.summary ?? ""),
    onError: (e: any) => toast.error(e?.message ?? "Summary failed"),
  });

  const onSave = async () => {
    const r = await save.mutateAsync({ type: "notes", title, content: output, metadata: { notes } });
    toast.success("Saved"); navigate({ to: "/_authenticated/app/notes", search: { id: r.id } });
  };
  const onUpdate = async () => {
    if (!id) return;
    await update.mutateAsync({ id, patch: { title, content: output, metadata: { notes } } });
    toast.success("Updated");
  };
  const onDelete = async () => {
    if (!id) return;
    await del.mutateAsync(id);
    toast.success("Deleted");
    navigate({ to: "/_authenticated/app/notes", search: {} });
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ToolHeader icon={NotebookPen} title="Meeting Notes Summariser" subtitle="Paste your raw notes — get a clean, structured brief." accent="bg-leaf" />
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <form className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-5"
            onSubmit={(e) => { e.preventDefault(); if (notes.trim().length < 10) return; mutation.mutate({ notes }); }}>
            <Field label="Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Raw notes or transcript" right={<VoiceButton onText={(t) => setNotes((p) => (p ? p + "\n" + t : t))} />}>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={14}
                placeholder="Paste meeting notes, bullets or a transcript…"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-input resize-y focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm" />
            </Field>
            <button type="submit" disabled={mutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand text-primary-foreground font-medium shadow-pop hover:opacity-90 disabled:opacity-60 transition">
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <NotebookPen className="size-4" />}
              {mutation.isPending ? "Summarising…" : id ? "Re-summarise" : "Summarise"}
            </button>
          </form>
          <div className="space-y-3">
            <OutputPanel title="Summary" empty="Your structured summary will appear here."
              loading={mutation.isPending} error={mutation.error?.message}
              content={output} onCopy={output ? () => copy(output) : undefined} copied={copied}
              actions={output ? <SaveControls savedId={id ?? null} saving={save.isPending || update.isPending} onSave={onSave} onUpdate={onUpdate} onDelete={onDelete} /> : null} />
            {output && (
              <textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={10}
                className="w-full rounded-2xl bg-card border border-border p-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-ring" />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
