import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, ToolHeader } from "@/components/AppShell";
import { useGenerations, useDeleteGeneration } from "@/lib/generations";
import { History, Mail, NotebookPen, ListChecks, Presentation, Workflow, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/history")({
  head: () => ({ meta: [{ title: "Saved · Sawubona AI" }] }),
  component: HistoryPage,
});

const ICONS: Record<string, any> = {
  email: Mail, notes: NotebookPen, tasks: ListChecks, presentation: Presentation, diagram: Workflow,
};
const ROUTES: Record<string, string> = {
  email: "/_authenticated/app/email",
  notes: "/_authenticated/app/notes",
  tasks: "/_authenticated/app/tasks",
  presentation: "/_authenticated/app/presentations",
  diagram: "/_authenticated/app/diagrams",
};
const ACCENTS: Record<string, string> = {
  email: "bg-sun", notes: "bg-leaf", tasks: "bg-sky-grad", presentation: "bg-brand", diagram: "bg-grape",
};

function HistoryPage() {
  const { data, isLoading } = useGenerations();
  const del = useDeleteGeneration();

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ToolHeader icon={History} title="Saved work" subtitle="Everything you save is here — and stays available offline." accent="bg-brand" />
        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && (data?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground sm:col-span-2">Nothing saved yet — generate something and tap Save.</p>
          )}
          {data?.map((g) => {
            const Icon = ICONS[g.type] ?? History;
            return (
              <div key={g.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft flex gap-3">
                <span className={`size-10 rounded-xl ${ACCENTS[g.type]} grid place-items-center shrink-0`}>
                  <Icon className="size-5 text-primary-foreground" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{g.type}</p>
                  <p className="font-medium truncate">{g.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(g.updated_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Johannesburg" })}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Link to={ROUTES[g.type] as any} search={{ id: g.id }}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-accent">
                      <Pencil className="size-3.5" />Open & edit
                    </Link>
                    <button onClick={async () => { await del.mutateAsync(g.id); toast.success("Deleted"); }}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-destructive hover:text-destructive-foreground">
                      <Trash2 className="size-3.5" />Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
