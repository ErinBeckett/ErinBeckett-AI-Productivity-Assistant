import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { summarizeNotes } from "@/lib/ai.functions";
import { Field, OutputPanel, ToolHeader } from "./email";
import { NotebookPen, Loader2 } from "lucide-react";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer · Flowdesk" },
      { name: "description", content: "Turn raw meeting notes into a structured brief with decisions, action items, and open questions." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const fn = useServerFn(summarizeNotes);
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: (vars: { notes: string }) => fn({ data: vars }),
  });

  const copy = async () => {
    if (!mutation.data?.summary) return;
    await navigator.clipboard.writeText(mutation.data.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <ToolHeader
          icon={NotebookPen}
          title="Meeting Notes Summarizer"
          subtitle="Paste your raw notes — get a clean, structured brief."
        />

        <div className="grid lg:grid-cols-2 gap-6 mt-10">
          <form
            className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (notes.trim().length < 10) return;
              mutation.mutate({ notes });
            }}
          >
            <Field label="Raw notes or transcript">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={16}
                placeholder="Paste meeting notes, bullet points, or a transcript here…"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
              />
            </Field>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand text-primary-foreground font-medium shadow-glow hover:opacity-90 disabled:opacity-60 transition"
            >
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <NotebookPen className="size-4" />}
              {mutation.isPending ? "Summarizing…" : "Summarize notes"}
            </button>
          </form>

          <OutputPanel
            title="Summary"
            empty="Your structured summary will appear here."
            loading={mutation.isPending}
            error={mutation.error?.message}
            content={mutation.data?.summary}
            onCopy={mutation.data?.summary ? copy : undefined}
            copied={copied}
          />
        </div>
      </div>
    </AppShell>
  );
}
