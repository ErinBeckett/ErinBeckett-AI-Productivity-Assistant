import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Mail, ListChecks, NotebookPen, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flowdesk · AI Workplace Productivity Assistant" },
      { name: "description", content: "Three AI tools that handle the busywork: smart email drafts, meeting summaries, and prioritized task plans." },
    ],
  }),
  component: Index,
});

const tools = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    desc: "Draft polished, on-tone emails in seconds — describe the situation, pick a tone, get a ready-to-send message.",
  },
  {
    to: "/notes",
    icon: NotebookPen,
    title: "Meeting Notes Summarizer",
    desc: "Paste raw notes or a transcript and get a clean brief with decisions, action items, and open questions.",
  },
  {
    to: "/tasks",
    icon: ListChecks,
    title: "AI Task Planner",
    desc: "Turn a goal and a timeframe into a focused, prioritized plan — with effort estimates and the one task to start with.",
  },
] as const;

function Index() {
  return (
    <AppShell>
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-6">
            <Sparkles className="size-3.5" />
            Powered by Lovable AI
          </div>
          <h1 className="text-5xl md:text-7xl leading-[1.05]">
            The workday,<br />
            <span className="italic text-primary">handled.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Flowdesk pairs three focused AI tools so you can write faster, capture meetings cleanly,
            and plan your week without the friction.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/email"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-brand text-primary-foreground font-medium shadow-glow hover:opacity-90 transition"
            >
              Start with an email <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border bg-card hover:bg-secondary transition font-medium"
            >
              Plan my day
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-5">
          {tools.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all"
            >
              <span className="inline-flex size-10 rounded-xl bg-accent text-accent-foreground items-center justify-center mb-4">
                <t.icon className="size-5" />
              </span>
              <h3 className="text-2xl mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
