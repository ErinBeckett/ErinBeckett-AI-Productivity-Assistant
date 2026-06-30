import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell, Field, ToolHeader } from "@/components/AppShell";
import { SaveControls, useCopy } from "@/components/OutputPanel";
import { VoiceButton } from "@/components/VoiceButton";
import { MermaidRender } from "@/components/MermaidRender";
import { generateDiagram } from "@/lib/ai.functions";
import { useGeneration, useProfile, useSaveGeneration, useUpdateGeneration, useDeleteGeneration } from "@/lib/generations";
import { profileSystemContext, type Profile } from "@/lib/profile";
import { Workflow, Loader2, Copy, Check, Download } from "lucide-react";
import { toast } from "sonner";

const search = z.object({ id: z.string().uuid().optional() });
const kinds = ["flowchart", "mindmap", "sequence", "timeline", "class"] as const;

export const Route = createFileRoute("/_authenticated/app/diagrams")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Diagrams · Sawubona AI" }] }),
  component: DiagramPage,
});

function DiagramPage() {
  const { id } = useSearch({ from: "/_authenticated/app/diagrams" });
  const navigate = useNavigate();
  const fn = useServerFn(generateDiagram);
  const { data: profile } = useProfile();
  const existing = useGeneration(id);
  const save = useSaveGeneration(); const update = useUpdateGeneration(); const del = useDeleteGeneration();

  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<(typeof kinds)[number]>("flowchart");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("Untitled diagram");
  const { copied, copy } = useCopy();

  useEffect(() => {
    if (existing.data) {
      const m = (existing.data.metadata ?? {}) as any;
      setDescription(m.description ?? ""); setKind(m.kind ?? "flowchart");
      setCode(existing.data.content); setTitle(existing.data.title);
    }
  }, [existing.data]);

  const mutation = useMutation({
    mutationFn: (v: { description: string; kind: typeof kind }) =>
      fn({ data: { ...v, context: profileSystemContext(profile as Profile | null) } }),
    onSuccess: (r) => setCode(r?.mermaid ?? ""),
    onError: (e: any) => toast.error(e?.message ?? "Failed to draw diagram"),
  });

  const onSave = async () => {
    const r = await save.mutateAsync({ type: "diagram", title, content: code, metadata: { description, kind } });
    toast.success("Saved"); navigate({ to: "/_authenticated/app/diagrams", search: { id: r.id } });
  };
  const onUpdate = async () => {
    if (!id) return;
    await update.mutateAsync({ id, patch: { title, content: code, metadata: { description, kind } } });
    toast.success("Updated");
  };
  const onDelete = async () => {
    if (!id) return;
    await del.mutateAsync(id); toast.success("Deleted");
    navigate({ to: "/_authenticated/app/diagrams", search: {} });
  };

  const downloadSvg = () => {
    const svg = document.querySelector(".mermaid-host svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${title.replace(/[^a-z0-9-]+/gi, "_")}.svg`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <ToolHeader icon={Workflow} title="Creative Diagram Builder" subtitle="Describe an idea, get a diagram. Edit the source, save and download." accent="bg-grape" />
        <div className="grid lg:grid-cols-[1fr_2fr] gap-6 mt-8">
          <form className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-5 h-fit"
            onSubmit={(e) => { e.preventDefault(); if (description.trim().length < 5) return; mutation.mutate({ description, kind }); }}>
            <Field label="Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="What should it show?" right={<VoiceButton onText={(t) => setDescription((p) => (p ? p + " " + t : t))} />}>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                placeholder="e.g. The water cycle for a Grade 5 class, with arrows between sun, evaporation, clouds, rain and rivers."
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-input resize-y focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Type">
              <div className="flex flex-wrap gap-2">
                {kinds.map((k) => (
                  <button key={k} type="button" onClick={() => setKind(k)}
                    className={`px-3 py-1.5 rounded-full text-sm capitalize border transition ${kind === k ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-secondary"}`}>{k}</button>
                ))}
              </div>
            </Field>
            <button type="submit" disabled={mutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand text-primary-foreground font-medium shadow-pop hover:opacity-90 disabled:opacity-60 transition">
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Workflow className="size-4" />}
              {mutation.isPending ? "Drawing…" : id ? "Regenerate" : "Draw diagram"}
            </button>
            {code && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                <button type="button" onClick={() => copy(code)} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-accent">
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied ? "Copied" : "Copy code"}
                </button>
                <button type="button" onClick={downloadSvg} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-sun text-primary-foreground hover:opacity-90">
                  <Download className="size-3.5" />SVG
                </button>
                <SaveControls savedId={id ?? null} saving={save.isPending || update.isPending} onSave={onSave} onUpdate={onUpdate} onDelete={onDelete} />
              </div>
            )}
          </form>

          <div className="space-y-3">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft min-h-[260px] grid place-items-center">
              {code ? <MermaidRender code={code} />
                : <p className="text-sm text-muted-foreground">Your diagram will render here.</p>}
            </div>
            {code && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Source (edit freely)</label>
                <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={10}
                  className="w-full font-mono text-xs px-3 py-2.5 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
