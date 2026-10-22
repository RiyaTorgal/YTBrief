"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/api";

const VOICE_LANG: Record<Lang, string> = { en: "en-US", es: "es-ES", fr: "fr-FR" };

// Read Aloud via the browser's speechSynthesis. Text is queued sentence by sentence because
// Chrome silently stops long single utterances after ~15 seconds.
export function useSpeech(lang: Lang = "en") {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const runId = useRef(0);

  const stop = useCallback(() => {
    if (!supported) return;
    runId.current++; // invalidates callbacks from the utterances being cancelled
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, [supported]);

  const start = useCallback((text: string) => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const id = ++runId.current;
    const chunks = text.match(/[^.!?\n]+[.!?]*/g)?.map((c) => c.trim()).filter(Boolean) ?? [text];
    chunks.forEach((chunk, i) => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = VOICE_LANG[lang];
      if (i === chunks.length - 1) u.onend = () => { if (runId.current === id) { setSpeaking(false); setPaused(false); } };
      u.onerror = () => { if (runId.current === id) { setSpeaking(false); setPaused(false); } };
      window.speechSynthesis.speak(u);
    });
    setSpeaking(true);
    setPaused(false);
  }, [supported, lang]);

  const togglePause = useCallback(() => {
    if (!supported || !speaking) return;
    if (paused) { window.speechSynthesis.resume(); setPaused(false); }
    else { window.speechSynthesis.pause(); setPaused(true); }
  }, [supported, speaking, paused]);

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  return { supported, speaking, paused, start, stop, togglePause };
}
