import { Copy, Check, Save, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

export function OutputPanel({
  title, empty, loading, error, content, onCopy, copied, actions,
}: {
  title: string; empty: string; loading: boolean; error?: string;
  content?: string; onCopy?: () => void; copied?: boolean; actions?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft min-h-[200px] flex flex-col">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          {actions}
          {onCopy && (
            <button onClick={onCopy}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-accent transition">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>
      <div className="p-5 flex-1">
        {error
          ? <p className="text-sm text-destructive">{error}</p>
          : loading
            ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><span className="size-2 rounded-full bg-primary animate-pulse" />Generating…</div>
            : content
              ? <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{content}</pre>
              : <p className="text-sm text-muted-foreground">{empty}</p>}
      </div>
    </div>
  );
}

export function SaveControls({
  savedId, saving, onSave, onUpdate, onDelete,
}: {
  savedId: string | null; saving: boolean;
  onSave: () => Promise<void> | void;
  onUpdate?: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) {
  return (
    <div className="flex items-center gap-2">
      {savedId ? (
        <>
          <button onClick={onUpdate} disabled={saving}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-leaf text-primary-foreground hover:opacity-90 transition disabled:opacity-50">
            <Save className="size-3.5" />Update saved
          </button>
          {onDelete && (
            <button onClick={onDelete}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-destructive hover:text-destructive-foreground transition">
              <Trash2 className="size-3.5" />Delete
            </button>
          )}
        </>
      ) : (
        <button onClick={onSave} disabled={saving}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-brand text-primary-foreground hover:opacity-90 transition disabled:opacity-50">
          <Save className="size-3.5" />Save
        </button>
      )}
    </div>
  );
}

export function useCopy() {
  const [copied, setCopied] = useState(false);
  return {
    copied,
    copy: async (text?: string) => {
      if (!text) return;
      try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }
      catch { toast.error("Could not copy"); }
    },
  };
}
