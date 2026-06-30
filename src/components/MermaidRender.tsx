import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let inited = false;
function init() {
  if (inited) return;
  mermaid.initialize({ startOnLoad: false, securityLevel: "loose", theme: "default", fontFamily: "Inter, sans-serif" });
  inited = true;
}

export function MermaidRender({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`m-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    init();
    let cancelled = false;
    setError(null);
    if (!code.trim()) { if (ref.current) ref.current.innerHTML = ""; return; }
    mermaid.render(idRef.current, code)
      .then(({ svg }) => { if (!cancelled && ref.current) ref.current.innerHTML = svg; })
      .catch((e) => { if (!cancelled) setError(e?.message ?? "Could not render diagram"); });
    return () => { cancelled = true; };
  }, [code]);

  if (error) return <pre className="text-xs text-destructive whitespace-pre-wrap">{error}</pre>;
  return <div ref={ref} className="mermaid-host w-full overflow-auto [&_svg]:max-w-full [&_svg]:h-auto" />;
}
