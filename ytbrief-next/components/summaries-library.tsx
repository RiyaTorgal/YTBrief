"use client";
import { useMemo, useState } from "react";
import { LayoutGrid, List, Search, Library } from "lucide-react";
import { FileCard } from "@/components/file-card";
import { EmptyState } from "@/components/empty-state";
import { TYPE_LABEL, useSummaries } from "@/lib/use-summaries";
import type { SummaryType } from "@/lib/api";

const field = "rounded-lg border border-border bg-card px-3 py-2 text-sm";

export function SummariesLibrary() {
  const { items, error, reload, remove } = useSummaries();
  const [q, setQ] = useState("");
  const [type, setType] = useState<SummaryType | "all">("all");
  const [sort, setSort] = useState<"new" | "old" | "title">("new");
  const [list, setList] = useState(false);

  const shown = useMemo(() => {
    const r = (items ?? []).filter((s) =>
      (type === "all" || s.type === type) &&
      `${s.video.title} ${s.video.channel}`.toLowerCase().includes(q.toLowerCase()));
    return r.sort((a, b) => sort === "title" ? a.video.title.localeCompare(b.video.title)
      : (+new Date(b.createdAt) - +new Date(a.createdAt)) * (sort === "new" ? 1 : -1));
  }, [items, q, type, sort]);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input aria-label="Search summaries" placeholder="Search by title or channel" value={q}
            onChange={(e) => setQ(e.target.value)} className={`${field} w-full pl-9`} />
        </div>
        <select aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value as SummaryType | "all")} className={field}>
          <option value="all">All types</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={field}>
          <option value="new">Newest first</option><option value="old">Oldest first</option><option value="title">Title A–Z</option>
        </select>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5" role="group" aria-label="Layout">
          {[false, true].map((l) => (
            <button key={String(l)} aria-label={l ? "List view" : "Grid view"} aria-pressed={list === l} onClick={() => setList(l)}
              className={`rounded-md p-1.5 ${list === l ? "bg-muted text-foreground" : "text-muted-foreground"}`}>
              {l ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
            </button>
          ))}
        </div>
      </div>

      {items === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
          {error} <button onClick={reload} className="ml-2 font-medium text-primary underline">Retry</button>
        </div>
      ) : shown.length === 0 ? (
        <EmptyState icon={Library} cta={!items.length}
          title={items.length ? "No matches" : "No saved summaries yet"}
          text={items.length ? "Try a different search or filter." : "Summarize a video and save it. It will show up here."} />
      ) : (
        <div className={list ? "flex flex-col gap-3" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
          {shown.map((s) => <FileCard key={s.id} s={s} list={list} onDelete={remove} />)}
        </div>
      )}
    </>
  );
}
