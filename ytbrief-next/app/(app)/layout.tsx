import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      {/* usePathname() is request-time data; Suspense keeps dynamic routes like /summary/[id] buildable */}
      <Suspense fallback={<aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block" />}>
        <Sidebar />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<div className="h-14" />}>
          <Topbar />
        </Suspense>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-8 lg:py-14">{children}</main>
      </div>
    </div>
  );
}
