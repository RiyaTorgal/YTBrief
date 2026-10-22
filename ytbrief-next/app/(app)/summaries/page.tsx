import type { Metadata } from "next";
import { SummariesLibrary } from "@/components/summaries-library";

export const metadata: Metadata = { title: "My Summaries" };

export default function SummariesPage() {
  return (
    <>
      <h1 className="font-serif text-4xl font-semibold tracking-tight">My Summaries</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Your saved YouTube summaries.</p>
      <SummariesLibrary />
    </>
  );
}
