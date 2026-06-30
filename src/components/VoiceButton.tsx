import { Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "@/lib/use-voice-input";

export function VoiceButton({ onText, label = "Dictate" }: { onText: (t: string) => void; label?: string }) {
  const { listening, supported, start, stop } = useVoiceInput(onText);
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
        listening
          ? "bg-destructive text-destructive-foreground border-destructive animate-pulse"
          : "bg-card hover:bg-secondary border-border text-muted-foreground"
      }`}
      aria-label={listening ? "Stop dictation" : "Start dictation"}
    >
      {listening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
      {listening ? "Listening…" : label}
    </button>
  );
}
