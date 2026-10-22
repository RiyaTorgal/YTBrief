"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Download, ExternalLink, Pause, Play, Square, Volume2 } from "lucide-react";
import { ApiError, friendlyErrors, getSummary, type Summary } from "@/lib/api";
import { downloadSummaryPdf } from "@/lib/pdf";
import { useSpeech } from "@/lib/use-speech";
import { LANG_LABEL, TYPE_LABEL } from "@/lib/use-summaries";

const btn = "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50";

export function SummaryView({ id }: { id: string }) {
  const [s, setS] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const speech = useSpeech(s?.language ?? "en");

  useEffect(() => {
    let live = true;
    getSummary(id)
      .then((r) => live && setS(r))
      .catch((e) => live && setError(e instanceof ApiError ? e.message : friendlyErrors.api_error));
    return () => { live = false; };
  }, [id]);

  if (error) return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-primary" />
      <span>{error} <Link href="/summaries" className="ml-1 font-medium text-primary underline">Back to My Summaries</Link></span>
    </div>
  );
  if (!s) return <div className="space-y-4" aria-busy="true"><div className="aspect-video max-w-xl animate-pulse rounded-2xl bg-muted" /><div className="h-8 w-2/3 animate-pulse rounded bg-muted" /><div className="h-32 animate-pulse rounded-xl bg-muted" /></div>;

  const spoken = [s.tldr, ...s.takeaways, s.detailed, ...s.chapterSummaries.map((c) => `${c.title}. ${c.text}`)].filter(Boolean).join(". ");

  return (
    <article className="space-y-8">
      <Link href="/summaries" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />My Summaries</Link>

      <header className="flex flex-col gap-5 sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.video.thumbnail} alt="" className="aspect-video w-full rounded-2xl object-cover sm:w-72" />
        <div>
          <h1 className="font-serif text-3xl font-semibold leading-tight">{s.video.title}</h1>
          <p className="mt-2 text-muted-foreground">{s.video.channel}</p>
          <p className="mt-1 text-xs text-muted-foreground">{s.video.duration} · {s.video.views} views · {TYPE_LABEL[s.type]} · {LANG_LABEL[s.language]}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {speech.supported && (!speech.speaking
              ? <button className={btn} onClick={() => speech.start(spoken)}><Volume2 className="size-4" />Read aloud</button>
              : <>
                  <button className={btn} onClick={speech.togglePause}>{speech.paused ? <Play className="size-4" /> : <Pause className="size-4" />}{speech.paused ? "Resume" : "Pause"}</button>
                  <button className={btn} onClick={speech.stop}><Square className="size-4" />Stop</button>
                </>)}
            <button className={btn} onClick={() => downloadSummaryPdf(s)}><Download className="size-4" />Download PDF</button>
            <a className={btn} href={s.video.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />Watch</a>
          </div>
        </div>
      </header>

      {s.tldr && <Section title="Summary"><p className="text-lg leading-relaxed">{s.tldr}</p></Section>}
      {s.takeaways.length > 0 && (
        <Section title="Key takeaways">
          <ul className="space-y-2">{s.takeaways.map((t, i) => <li key={i} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{t}</li>)}</ul>
        </Section>
      )}
      {s.detailed && <Section title="Detailed summary"><div className="space-y-4 leading-relaxed">{s.detailed.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div></Section>}
      {s.chapterSummaries.length > 0 && (
        <Section title="By chapter">
          <div className="space-y-5">{s.chapterSummaries.map((c, i) => <div key={i}><h3 className="font-medium">{c.title}</h3><p className="mt-1 text-muted-foreground">{c.text}</p></div>)}</div>
        </Section>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-border bg-card p-6"><h2 className="mb-3 font-serif text-xl font-semibold">{title}</h2>{children}</section>;
}
