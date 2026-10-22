"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Library, History, Settings } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/summaries", label: "My Summaries", icon: Library },
  { href: "/history", label: "History", icon: History },
];

function Item({ href, label, icon: Icon, active }: (typeof nav)[0] & { active: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined}
      className="relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground">
      {active && <motion.span layoutId="nav-pill" transition={{ duration: 0.18 }}
        className="absolute inset-0 rounded-lg bg-muted" />}
      <Icon className={`relative size-4 ${active ? "text-primary" : ""}`} />
      <span className="relative">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const path = usePathname();
  const is = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card p-4 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-1 px-1 pt-2">
        <Image src="/logo-mark.svg" alt="logo" width={55} height={55} />
        <span>
          <span className="block font-serif text-lg font-semibold leading-none">YTBrief</span>
          <span className="text-[11px] text-muted-foreground">YouTube AI Video Summarizer</span>
        </span>
      </Link>
      <nav className="flex flex-col gap-1" aria-label="Main">
        {nav.map((n) => <Item key={n.href} {...n} active={is(n.href)} />)}
      </nav>
      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3">
        <Item href="/settings" label="Settings" icon={Settings} active={is("/settings")} />
        {/* TODO: replace with <UserMenu /> once auth exists */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="grid size-8 place-items-center rounded-full bg-muted text-xs font-semibold">R</span>
          <div className="text-sm leading-tight"><p className="font-medium">Guest</p>
            <Link href="/login" className="text-xs text-primary hover:underline">Log in</Link></div>
        </div>
      </div>
    </aside>
  );
}
