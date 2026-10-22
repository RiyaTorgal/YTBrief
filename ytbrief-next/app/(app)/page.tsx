import type { Metadata } from "next";
import { SummarizeFlow } from "@/components/summarize-flow";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <section className="mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-primary">YouTube AI Video Summarizer</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Turn YouTube videos <em className="text-primary not-italic">into knowledge.</em>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Summarize videos, extract key insights, and save what matters.
        </p>
      </section>
      <SummarizeFlow />
    </>
  );
}
