"use client";
import { useCallback, useEffect, useState } from "react";
import { ApiError, deleteSummary, friendlyErrors, listSummaries, type Summary } from "@/lib/api";

export function useSummaries() {
  const [items, setItems] = useState<Summary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { setItems(await listSummaries()); }
    catch (e) { setItems([]); setError(e instanceof ApiError ? e.message : friendlyErrors.api_error); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(id: string) {
    const prev = items;
    setItems((p) => p?.filter((s) => s.id !== id) ?? p); // optimistic
    try { await deleteSummary(id); } catch { setItems(prev); }
  }
  return { items, error, reload: load, remove };
}

export const TYPE_LABEL = { quick: "Quick", detailed: "Detailed", "key-points": "Key points", chapters: "Chapters" } as const;
export const LANG_LABEL = { en: "English", es: "Español", fr: "Français" } as const;

export function groupLabel(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  return days < 1 ? "Today" : days < 2 ? "Yesterday" : days < 8 ? "Previous 7 days" : "Older";
}
