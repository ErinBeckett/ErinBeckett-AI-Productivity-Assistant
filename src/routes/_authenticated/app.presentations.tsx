import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell, Field, ToolHeader } from "@/components/AppShell";
import { SaveControls } from "@/components/OutputPanel";
import { VoiceButton } from "@/components/VoiceButton";
import { generatePresentation, type Slide } from "@/lib/ai.functions";
import { useGeneration, useProfile, useSaveGeneration, useUpdateGeneration, useDeleteGeneration } from "@/lib/generations";
import { profileSystemContext, type Profile } from "@/lib/profile";
import { downloadPptx } from "@/lib/pptx";
import { Presentation, Loader2, Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const search = z.object({ id: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/app/presentations")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Slides · Sawubona AI" }] }),
  component: PresPage,
});

interface Deck { title: string; slides: Slide[] }

function PresPage() {
  const { id } = useSearch({ from: "/_authenticated/app/presentations" });
  const navigate = useNavigate();
  const fn = useServerFn(generatePresentation);
  const { data: profile } = useProfile();
  const existing = useGeneration(id);
  const save = useSaveGeneration(); const update = useUpdateGeneration(); const del = useDeleteGeneration();

  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [slideCount, setSlideCount] = useState(7);
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    if (existing.data) {
      try {
        const parsed = JSON.parse(existing.data.content) as Deck;
        setDeck(parsed);
        const m = (existing.data.metadata ?? {}) as any;
        setTopic(m.topic ?? ""); setAudience(m.audience ?? ""); setSlideCount(m.slideCount ?? 7);
      } catch { /* ignore */ }
    }
  }, [existing.data]);

  const mutation = useMutation({
    mutationFn: (v: { topic: string; audience?: string; slides: number }) =>
      fn({ data: { ...v, context: profileSystemContext(profile as Profile | null) } }),
    onSuccess: (r) => setDeck(r as Deck),
    onError: (e: any) => toast.error(e?.message ?? "Failed to generate deck"),
  });

  const onSave = async () => {
    if (!deck) return;
    const r = await save.mutateAsync({
      type: "presentation", title: deck.title || topic || "Untitled deck",
      content: JSON.stringify(deck), metadata: { topic, audience, slideCount },
    });
    toast.success("Saved");
    navigate({ to: "/_authenticated/app/presentations", search: { id: r.id } });
  };
  const onUpdate = async () => {
    if (!id || !deck) return;
    await update.mutateAsync({ id, patch: { title: deck.title, content: JSON.stringify(deck), metadata: { topic, audience, slideCount } } });
    toast.success("Updated");
  };
  const onDelete = async () => {
    if (!id) return;
    await del.mutateAsync(id); toast.success("Deleted");
    navigate({ to: "/_authenticated/app/presentations", search: {} });
  };

  const patchSlide = (i: number, p: Partial<Slide>) => {
    if (!deck) return;
    const slides = deck.slides.map((s, idx) => (idx === i ? { ...s, ...p } : s));
    setDeck({ ...deck, slides });
  };
  const addSlide = () => deck && setDeck({ ...deck, slides: [...deck.slides, { title: "New slide", bullets: [""] }] });
  const removeSlide = (i: number) => deck && setDeck({ ...deck, slides: deck.slides.filter((_, idx) => idx !== i) });

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <ToolHeader icon={Presentation} title="Slide Deck Builder" subtitle="Generate vibrant, editable decks and download as PowerPoint." accent="bg-brand" />

        <div className="grid lg:grid-cols-[1fr_2fr] gap-6 mt-8">
          <form className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-5 h-fit"
            onSubmit={(e) => { e.preventDefault(); if (topic.trim().length < 3) return; mutation.mutate({ topic, audience, slides: slideCount }); }}>
            <Field label="Topic" right={<VoiceButton onText={(t) => setTopic((p) => (p ? p + " " + t : t))} />}>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3}
                placeholder="e.g. Introducing photosynthesis to a Grade 8 Life Sciences class"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-input resize-y focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Audience (optional)">
              <input value={audience} onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Grade 8 learners, Cape Town"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label={`Slides: ${slideCount}`}>
              <input type="range" min={3} max={15} value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} className="w-full" />
            </Field>
            <button type="submit" disabled={mutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand text-primary-foreground font-medium shadow-pop hover:opacity-90 disabled:opacity-60 transition">
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Presentation className="size-4" />}
              {mutation.isPending ? "Designing…" : id ? "Regenerate" : "Generate deck"}
            </button>
            {deck && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                <button type="button" onClick={() => downloadPptx(deck.title, deck.slides)}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-sun text-primary-foreground hover:opacity-90">
                  <Download className="size-3.5" />Download .pptx
                </button>
                <SaveControls savedId={id ?? null} saving={save.isPending || update.isPending}
                  onSave={onSave} onUpdate={onUpdate} onDelete={onDelete} />
              </div>
            )}
          </form>

          <div className="space-y-3">
            {!deck && !mutation.isPending && (
              <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
                Your deck will appear here as editable slide cards.
              </div>
            )}
            {mutation.isPending && (
              <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">Designing your slides…</div>
            )}
            {deck && (
              <>
                <input value={deck.title} onChange={(e) => setDeck({ ...deck, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-card border border-border font-display text-2xl focus:outline-none focus:ring-2 focus:ring-ring" />
                <div className="space-y-3">
                  {deck.slides.map((s, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">Slide {i + 1}</span>
                        <button onClick={() => removeSlide(i)} className="ml-auto text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <input value={s.title} onChange={(e) => patchSlide(i, { title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-input font-medium focus:outline-none focus:ring-2 focus:ring-ring mb-2" />
                      <textarea value={s.bullets.join("\n")} onChange={(e) => patchSlide(i, { bullets: e.target.value.split("\n") })}
                        rows={Math.max(3, s.bullets.length)} placeholder="One bullet per line"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  ))}
                  <button onClick={addSlide} className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-2xl border border-dashed border-border text-sm text-muted-foreground hover:bg-secondary">
                    <Plus className="size-4" />Add slide
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
