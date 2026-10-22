import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, text, cta = true }:
  { icon: LucideIcon; title: string; text: string; cta?: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-muted"><Icon className="size-5 text-primary" /></span>
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {cta && <Link href="/" className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">Summarize a video</Link>}
    </div>
  );
}
