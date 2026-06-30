import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, NotebookPen, ListChecks, Presentation, Workflow, ArrowRight, Sparkles, Wifi, ShieldCheck, MapPin, Clock, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sawubona AI · SA Workplace & Study Productivity" },
      { name: "description", content: "South African AI assistant for work and study: emails, meeting summaries, task plans, slide decks and diagrams — tailored to your learning style and saved for offline access." },
      { property: "og:title", content: "Sawubona AI · SA Workplace & Study Productivity" },
      { property: "og:description", content: "Emails, summaries, plans, slides and diagrams tailored to South African workplaces and classrooms." },
    ],
  }),
  component: Index,
});

const TOOLS = [
  { to: "/app/email", icon: Mail, title: "Smart Emails", desc: "Polished, on-tone emails in seconds — pick a tone, get a ready-to-send message.", grad: "bg-sun" },
  { to: "/app/notes", icon: NotebookPen, title: "Meeting Notes", desc: "Paste raw notes — get a clean brief with decisions, action items and open questions.", grad: "bg-leaf" },
  { to: "/app/tasks", icon: ListChecks, title: "Task Planner", desc: "Turn a goal into a prioritised plan with effort, dates and the single task to start with.", grad: "bg-sky-grad" },
  { to: "/app/presentations", icon: Presentation, title: "Slides", desc: "Generate vibrant slide decks, edit any slide, then download as a real .pptx file.", grad: "bg-brand" },
  { to: "/app/diagrams", icon: Workflow, title: "Diagrams", desc: "Flowcharts, mind maps and timelines — creatively designed and instantly editable.", grad: "bg-grape" },
] as const;

const FEATURES = [
  { icon: ShieldCheck, title: "Private by default", desc: "Your work is locked to your account by row-level access controls." },
  { icon: Wifi, title: "Works offline", desc: "Everything you save is mirrored to your device — keep reading without internet." },
  { icon: GraduationCap, title: "Learning-style aware", desc: "Choose visual, auditory, reading or kinesthetic and the AI adapts." },
  { icon: MapPin, title: "South African context", desc: "ZAR, SAST, local examples, CAPS curriculum — built for SA classrooms & teams." },
  { icon: Clock, title: "Knows the date & time", desc: "Plans, due-dates and 'this week' always reflect today in Johannesburg." },
  { icon: Sparkles, title: "Edit, don't redo", desc: "Every output is editable. Reopen a saved item to refine it in-place." },
] as const;

function Index() {
  return (
    <div className="min-h-screen bg-hero">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="size-9 rounded-xl bg-brand grid place-items-center shadow-pop">
              <Sparkles className="size-5 text-primary-foreground" />
            </span>
            <span className="font-display text-2xl">Sawubona AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="px-3 py-1.5 text-sm rounded-lg hover:bg-secondary">Sign in</Link>
            <Link to="/auth" className="px-4 py-1.5 text-sm rounded-lg bg-brand text-primary-foreground shadow-pop font-medium">Get started</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
          <Sparkles className="size-3.5" />Built for South African workplaces & classrooms
        </div>
        <h1 className="text-5xl md:text-7xl leading-[1.02] max-w-3xl">
          The workday and the lecture hall,<br />
          <span className="italic bg-brand bg-clip-text text-transparent">handled.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          Five focused AI tools — emails, meeting summaries, task plans, slide decks and diagrams — tailored to your learning style and the South African context. Sign up free, save everything, edit anytime, even offline.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/auth" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand text-primary-foreground font-medium shadow-pop hover:opacity-90 transition">
            Create free account <ArrowRight className="size-4" />
          </Link>
          <Link to="/auth" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card hover:bg-secondary transition font-medium">
            I already have one
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to}
              className="group rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all">
              <span className={`inline-flex size-12 rounded-2xl ${t.grad} text-primary-foreground items-center justify-center mb-4 shadow-pop`}>
                <t.icon className="size-6" />
              </span>
              <h3 className="text-2xl mb-1.5">{t.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <h2 className="text-3xl md:text-4xl mb-8">Why Sawubona AI</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl bg-card border border-border p-5">
              <f.icon className="size-5 text-primary mb-3" />
              <h3 className="text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-6 px-4 text-center text-xs text-muted-foreground">
        Sawubona AI · Made in South Africa · <Link to="/auth" className="underline">Sign in</Link>
      </footer>
    </div>
  );
}
