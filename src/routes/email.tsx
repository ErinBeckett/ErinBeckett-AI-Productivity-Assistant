import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { generateEmail } from "@/lib/ai.functions";
import { Mail, Copy, Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator · Flowdesk" },
      { name: "description", content: "Draft professional emails in seconds with AI — pick a tone and a purpose, get a ready-to-send message." },
    ],
  }),
  component: EmailPage,
});

const tones = ["professional", "friendly", "concise", "persuasive", "apologetic"] as const;

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<(typeof tones)[number]>("professional");
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: (vars: { recipient: string; purpose: string; tone: typeof tone }) =>
      fn({ data: vars }),
  });

  const copy = async () => {
    if (!mutation.data?.email) return;
    await navigator.clipboard.writeText(mutation.data.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <ToolHeader icon={Mail} title="Smart Email Generator" subtitle="Describe the situation. We'll draft the email." />

        <div className="grid lg:grid-cols-2 gap-6 mt-10">
          <form
            className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!recipient.trim() || !purpose.trim()) return;
              mutation.mutate({ recipient, purpose, tone });
            }}
          >
            <Field label="Recipient">
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Sarah, my product manager"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="What's this about?">
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={6}
                placeholder="Asking to push our 1:1 to Thursday and share the Q3 roadmap update beforehand."
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Tone">
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-full text-sm capitalize border transition ${
                      tone === t
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
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
              {mutation.isPending ? "Drafting…" : "Generate email"}
            </button>
          </form>

          <OutputPanel
            title="Draft"
            empty="Your generated email will appear here."
            loading={mutation.isPending}
            error={mutation.error?.message}
            content={mutation.data?.email}
            onCopy={mutation.data?.email ? copy : undefined}
            copied={copied}
          />
        </div>
      </div>
    </AppShell>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function ToolHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="size-12 rounded-xl bg-brand grid place-items-center shadow-glow shrink-0">
        <Icon className="size-5 text-primary-foreground" />
      </span>
      <div>
        <h1 className="text-4xl">{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export function OutputPanel({
  title,
  empty,
  loading,
  error,
  content,
  onCopy,
  copied,
}: {
  title: string;
  empty: string;
  loading: boolean;
  error?: string;
  content?: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft min-h-[420px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        {onCopy && (
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-md hover:bg-secondary transition"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <div className="flex-1 text-sm leading-relaxed whitespace-pre-wrap">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Thinking…
          </div>
        )}
        {error && <div className="text-destructive text-sm">{error}</div>}
        {!loading && !error && !content && <div className="text-muted-foreground">{empty}</div>}
        {!loading && content && <div>{content}</div>}
      </div>
    </div>
  );
}
