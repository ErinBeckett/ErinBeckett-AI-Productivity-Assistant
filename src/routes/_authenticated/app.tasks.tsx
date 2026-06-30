import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell, Field, ToolHeader } from "@/components/AppShell";
import { OutputPanel, SaveControls, useCopy } from "@/components/OutputPanel";
import { VoiceButton } from "@/components/VoiceButton";
import { planTasks } from "@/lib/ai.functions";
import { useGeneration, useProfile, useSaveGeneration, useUpdateGeneration, useDeleteGeneration } from "@/lib/generations";
import { profileSystemContext, type Profile } from "@/lib/profile";
import { ListChecks, Loader2 } from "lucide-react";
import { toast } from "sonner";

const search = z.object({ id: z.string().uuid().optional() });
const timeframes = ["Today", "This week", "Next 2 weeks", "This month", "This term"];

export const Route = createFileRoute("/_authenticated/app/tasks")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Task Planner · Sawubona AI" }] }),
  component: TasksPage,
});

function TasksPage() {
  const { id } = useSearch({ from: "/_authenticated/app/tasks" });
  const navigate = useNavigate();
  const fn = useServerFn(planTasks);
  const { data: profile } = useProfile();
  const existing = useGeneration(id);
  const save = useSaveGeneration(); const update = useUpdateGeneration(); const del = useDeleteGeneration();

  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState(timeframes[1]);
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopy();

  useEffect(() => {
    if (existing.data) {
      const m = (existing.data.metadata ?? {}) as any;
      setGoal(m.goal ?? ""); setTimeframe(m.timeframe ?? timeframes[1]);
      setOutput(existing.data.content);
    }
  }, [existing.data]);

  const mutation = useMutation({
    mutationFn: (v: { goal: string; timeframe: string }) =>
      fn({ data: { ...v, context: profileSystemContext(profile as Profile | null) } }),
    onSuccess: (r) => setOutput(r?.plan ?? ""),
    onError: (e: any) => toast.error(e?.message ?? "Plan failed"),
  });

  const onSave = async () => {
    const r = await save.mutateAsync({ type: "tasks", title: goal.slice(0, 60) || "Task plan", content: output, metadata: { goal, timeframe } });
    toast.success("Saved"); navigate({ to: "/_authenticated/app/tasks", search: { id: r.id } });
  };
  const onUpdate = async () => {
    if (!id) return;
    await update.mutateAsync({ id, patch: { title: goal.slice(0, 60) || "Task plan", content: output, metadata: { goal, timeframe } } });
    toast.success("Updated");
  };
  const onDelete = async () => {
    if (!id) return;
    await del.mutateAsync(id); toast.success("Deleted");
    navigate({ to: "/_authenticated/app/tasks", search: {} });
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ToolHeader icon={ListChecks} title="AI Task Planner" subtitle="A focused plan, prioritised for impact — with SAST dates and effort." accent="bg-sky-grad" />
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <form className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-5"
            onSubmit={(e) => { e.preventDefault(); if (goal.trim().length < 3) return; mutation.mutate({ goal, timeframe }); }}>
            <Field label="What do you want to accomplish?" right={<VoiceButton onText={(t) => setGoal((p) => (p ? p + " " + t : t))} />}>
              <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={5}
                placeholder="e.g. Finish my CAPS Grade 11 Maths lesson plan and mark all term tests by Friday."
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-input resize-y focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Timeframe">
              <div className="flex flex-wrap gap-2">
                {timeframes.map((t) => (
                  <button key={t} type="button" onClick={() => setTimeframe(t)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${timeframe === t ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-secondary"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <button type="submit" disabled={mutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand text-primary-foreground font-medium shadow-pop hover:opacity-90 disabled:opacity-60 transition">
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <ListChecks className="size-4" />}
              {mutation.isPending ? "Planning…" : id ? "Rebuild plan" : "Build my plan"}
            </button>
          </form>
          <div className="space-y-3">
            <OutputPanel title="Plan" empty="Your prioritised plan will appear here."
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
