import { useCallback, useEffect, useRef, useState } from "react";

type SR = any;

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SR | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    setSupported(!!Ctor);
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec: SR = new Ctor();
    rec.lang = "en-ZA";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) t += e.results[i][0].transcript + " ";
      }
      if (t.trim()) onTranscript(t.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    try { rec.start(); setListening(true); } catch { /* already running */ }
  }, [onTranscript]);

  const stop = useCallback(() => {
    recRef.current?.stop?.();
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
}
