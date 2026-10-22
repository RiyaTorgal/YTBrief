"use client";
import Link from "next/link";
import { History as Icon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { TYPE_LABEL, groupLabel, useSummaries } from "@/lib/use-summaries";

const ORDER = ["Today", "Yesterday", "Previous 7 days", "Older"];

export function HistoryList() {
  const { items, error, reload } = useSummaries();
  if (items === null) return <div className="space-y-3" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div>;
  if (error) return <div role="alert" className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">{error} <button onClick={reload} className="ml-2 font-medium text-primary underline">Retry</button></div>;
  if (!items.length) return <EmptyState icon={Icon} title="No history yet" text="Videos you summarize will be listed here by date." />;

  const sorted = [...items].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return (
    <div className="space-y-10">
      {ORDER.map((g) => {
        const rows = sorted.filter((s) => groupLabel(s.createdAt) === g);
        if (!rows.length) return null;
        return (
          <section key={g} aria-labelledby={`h-${g}`}>
            <h2 id={`h-${g}`} className="mb-3 text-sm font-medium text-muted-foreground">{g}</h2>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {rows.map((s) => (
                <li key={s.id} className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.video.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {s.video.channel} · {TYPE_LABEL[s.type]} · {new Date(s.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  <Link href={`/summary/${s.id}`} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">Open</Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
