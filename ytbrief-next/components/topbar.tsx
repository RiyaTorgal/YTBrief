"use client";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu } from "lucide-react";
import Link from "next/link";

export function Topbar() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur sm:px-8">
      {/* TODO: wire to a Sheet drawer containing <Sidebar /> content on mobile */}
      <button aria-label="Open navigation" className="rounded-lg p-2 hover:bg-muted lg:hidden"><Menu className="size-5" /></button>
      <span className="font-serif font-semibold lg:hidden">YTBrief</span>
      <div className="ml-auto flex items-center gap-2">
        <button aria-label="Toggle theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Sun className="size-4 dark:hidden" /><Moon className="hidden size-4 dark:block" />
        </button>
        <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted">Log in</Link>
        <Link href="/signup" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark">Sign up</Link>
      </div>
    </header>
  );
}
