"use client";
import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, AlertCircle, Check, Loader2 } from "lucide-react";
import {
  ApiError, generateSummary, getVideoMeta, isYouTubeUrl, friendlyErrors,
  type Lang, type SummaryType, type VideoMeta,
} from "@/lib/api";


const LANGS: { v: Lang; l: string }[] = [{ v: "en", l: "English" }, { v: "es", l: "Español" }, { v: "fr", l: "Français" }];
const TYPES: { v: SummaryType; l: string; d: string }[] = [
  { v: "quick", l: "Quick Summary", d: "The gist in a minute" },
  { v: "detailed", l: "Detailed Summary", d: "Full written breakdown" },
  { v: "key-points", l: "Key Points", d: "Scannable bullet list" },
  { v: "chapters", l: "Chapter Summary", d: "Section by section" },
];
const STAGES = ["Fetching video", "Extracting transcript", "Analyzing content", "Generating summary"];

export function SummarizeFlow() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [video, setVideo] = useState<VideoMeta | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [type, setType] = useState<SummaryType>("quick");
  const [chapters, setChapters] = useState<"all" | number[]>("all");
  const [stage, setStage] = useState(-1); // -1 idle
  const [error, setError] = useState<string | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  function reset() {
  setUrl(""); setVideo(null); setLang("en"); setType("quick");
  setChapters("all"); setStage(-1); setError(null); setLoadingMeta(false);
}

  useLayoutEffect(() => () => reset(), []);

  const fail = (e: unknown) =>
    setError(e instanceof ApiError ? e.message : friendlyErrors.api_error);

  async function preview() {
    setError(null); setVideo(null);
    if (!isYouTubeUrl(url)) return setError(friendlyErrors.invalid_url);
    setLoadingMeta(true);
    try { setVideo(await getVideoMeta(url.trim())); } catch (e) { fail(e); }
    finally { setLoadingMeta(false); }
  }

  async function generate() {
    if (!video) return;
    setError(null); setStage(0);
    // Stages are visual only; replace with streamed progress if Flask supports it.
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2500);
    try {
      const s = await generateSummary({ url: video.url, language: lang, type, chapters });
      router.push(`/summary/${s.id}`);
      setStage(-1);
    } catch (e) { fail(e); setStage(-1); } finally { clearInterval(t); }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); preview(); }}
        className="rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary">
        <label htmlFor="yt-url" className="sr-only">YouTube URL</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="yt-url" value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..." inputMode="url" autoComplete="off"
            className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3.5 text-base outline-none placeholder:text-muted-foreground" />
          <motion.button whileTap={{ scale: 0.97 }} disabled={!url || loadingMeta} type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-medium text-white hover:bg-primary-dark disabled:opacity-50">
            {loadingMeta ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {video ? "Preview again" : "Generate Summary"}
          </motion.button>
        </div>
      </form>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-primary" />{error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {video && stage < 0 && (
          <motion.div key="config" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
            <article className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card sm:flex-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={video.thumbnail} alt="" className="aspect-video w-full object-cover sm:w-64" />
              <div className="p-4 sm:py-4 sm:pl-0">
                <h2 className="font-serif text-xl font-semibold leading-snug">{video.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{video.channel}</p>
                <p className="mt-3 text-xs text-muted-foreground">{video.duration} · {video.views} views</p>
              </div>
            </article>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Language</legend>
              <div className="inline-flex rounded-xl border border-border bg-card p-1">
                {LANGS.map((o) => (
                  <button key={o.v} type="button" aria-pressed={lang === o.v} onClick={() => setLang(o.v)}
                    className={`rounded-lg px-4 py-1.5 text-sm ${lang === o.v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>{o.l}</button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Summary type</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {TYPES.map((o) => (
                  <button key={o.v} type="button" aria-pressed={type === o.v} onClick={() => setType(o.v)}
                    className={`flex items-start justify-between rounded-xl border p-4 text-left transition-colors ${type === o.v ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground/40"}`}>
                    <span><span className="block font-medium">{o.l}</span><span className="text-sm text-muted-foreground">{o.d}</span></span>
                    {type === o.v && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </div>
            </fieldset>

            {video.chapters.length > 0 && (
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Chapters</legend>
                <div className="flex flex-wrap gap-2">
                  <Chip on={chapters === "all"} onClick={() => setChapters("all")}>All Chapters</Chip>
                  {video.chapters.map((c, i) => {
                    const sel = Array.isArray(chapters) && chapters.includes(i);
                    return <Chip key={i} on={sel} onClick={() => setChapters((p) => {
                      const cur = Array.isArray(p) ? p : [];
                      const next = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i];
                      return next.length ? next : "all";
                    })}>{c.title}</Chip>;
                  })}
                </div>
              </fieldset>
            )}

            <motion.button whileTap={{ scale: 0.98 }} onClick={generate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-medium text-white hover:bg-primary-dark sm:w-auto sm:px-8">
              <Sparkles className="size-4" /> Generate Summary
            </motion.button>
          </motion.div>
        )}

        {stage >= 0 && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl border border-border bg-card p-8" role="status" aria-live="polite">
            <h2 className="font-serif text-2xl font-semibold">Analyzing your video...</h2>
            <ol className="mt-6 space-y-4">
              {STAGES.map((s, i) => (
                <li key={s} className={`flex items-center gap-3 text-sm ${i > stage ? "text-muted-foreground/50" : ""}`}>
                  {i < stage ? <Check className="size-4 text-primary" />
                    : i === stage ? <Loader2 className="size-4 animate-spin text-primary" />
                    : <span className="size-4 rounded-full border border-border" />}
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-6 h-1 overflow-hidden rounded-full bg-muted">
              <motion.div className="h-full bg-primary" animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }} transition={{ duration: 0.4 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm ${on ? "border-primary bg-primary/10 text-primary-dark dark:text-primary-dark" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}
