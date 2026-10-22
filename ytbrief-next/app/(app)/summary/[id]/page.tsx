import type { Metadata } from "next";
import { Suspense } from "react";
import { SummaryView } from "@/components/summary-view";

export const metadata: Metadata = { title: "Summary" };

// params is a Promise in Next 16 and is request-time data, so it is read inside <Suspense>.
async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SummaryView id={id} />;
}

export default function SummaryPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" aria-busy="true" />}>
      <Content params={params} />
    </Suspense>
  );
}
