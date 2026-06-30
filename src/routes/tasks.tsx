import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { planTasks } from "@/lib/ai.functions";
import { Field, OutputPanel, ToolHeader } from "./email";
import { ListChecks, Loader2 } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner · Flowdesk" },
      { name: "description", content: "Turn any goal into a prioritized task plan with effort estimates and a clear focus." },
    ],
  }),
  component: TasksPage,
});

const timeframes = ["Today", "This week", "Next 2 weeks", "This month", "This quarter"];

function TasksPage() {
  const fn = useServerFn(planTasks);
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState(timeframes[1]);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: (vars: { goal: string; timeframe: string }) => fn({ data: vars }),
  });

  const copy = async () => {
    if (!mutation.data?.plan) return;
    await navigator.clipboard.writeText(mutation.data.plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <ToolHeader
          icon={ListChecks}
          title="AI Task Planner"
          subtitle="A focused plan, prioritized for impact — not just a longer to-do list."
        />

        <div className="grid lg:grid-cols-2 gap-6 mt-10">
          <form
            className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (goal.trim().length < 3) return;
              mutation.mutate({ goal, timeframe });
            }}
          >
            <Field label="What do you want to accomplish?">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={6}
                placeholder="e.g. Launch the beta of our new onboarding flow and gather feedback from 10 customers."
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Timeframe">
              <div className="flex flex-wrap gap-2">
                {timeframes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                      timeframe === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-secondary"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand text-primary-foreground font-medium shadow-glow hover:opacity-90 disabled:opacity-60 transition"
            >
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <ListChecks className="size-4" />}
              {mutation.isPending ? "Planning…" : "Build my plan"}
            </button>
          </form>

          <OutputPanel
            title="Plan"
            empty="Your prioritized plan will appear here."
            loading={mutation.isPending}
            error={mutation.error?.message}
            content={mutation.data?.plan}
            onCopy={mutation.data?.plan ? copy : undefined}
            copied={copied}
          />
        </div>
      </div>
    </AppShell>
  );
}
