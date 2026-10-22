import type { Metadata } from "next";
import { HistoryList } from "@/components/history-list";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <>
      <h1 className="font-serif text-4xl font-semibold tracking-tight">History</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Everything you have summarized, newest first.</p>
      <HistoryList />
    </>
  );
}
