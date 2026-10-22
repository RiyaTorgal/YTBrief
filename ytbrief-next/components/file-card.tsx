"use client";
import Link from "next/link";
import { useState } from "react";
import { Download, MoreHorizontal, Trash2, ExternalLink } from "lucide-react";
import type { Summary } from "@/lib/api";
import { downloadSummaryPdf } from "@/lib/pdf";
import { LANG_LABEL, TYPE_LABEL } from "@/lib/use-summaries";

export function FileCard({ s, list, onDelete }: { s: Summary; list: boolean; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const date = new Date(s.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return (
    <article className={`group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60 ${list ? "flex" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={s.video.thumbnail} alt="" className={`aspect-video object-cover ${list ? "w-40 shrink-0 sm:w-52" : "w-full"}`} />
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-medium leading-snug">{s.video.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{s.video.channel}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-md bg-muted px-2 py-0.5">{TYPE_LABEL[s.type]}</span>
          <span className="rounded-md bg-muted px-2 py-0.5">{LANG_LABEL[s.language]}</span>
          <span className="py-0.5 text-muted-foreground">{date}</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Link href={`/summary/${s.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background">
            <ExternalLink className="size-3.5" />Open</Link>
          <div className="relative ml-auto">
            <button aria-label="More actions" aria-expanded={open} onClick={() => setOpen((o) => !o)}
              onBlur={(e) => !e.currentTarget.parentElement?.contains(e.relatedTarget) && setOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><MoreHorizontal className="size-4" /></button>
            {open && (
              <div role="menu" className="absolute bottom-full right-0 z-10 mb-1 w-44 rounded-lg border border-border bg-card p-1 text-sm shadow-lg">
                <button role="menuitem" onClick={() => downloadSummaryPdf(s)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"><Download className="size-4" />Download PDF</button>
                <button role="menuitem" onClick={() => onDelete(s.id)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-primary hover:bg-muted"><Trash2 className="size-4" />Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
