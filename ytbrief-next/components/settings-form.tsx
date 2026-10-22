"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Check } from "lucide-react";
import type { Lang, SummaryType } from "@/lib/api";

type Prefs = { name: string; email: string; lang: Lang; type: SummaryType; autoSavePdf: boolean; emailNotify: boolean };
const DEFAULTS: Prefs = { name: "", email: "", lang: "en", type: "quick", autoSavePdf: false, emailNotify: false };
const KEY = "ytbrief:prefs"; // TODO: replace with a Flask settings endpoint once auth exists
const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border py-8 md:grid-cols-[200px_1fr]">
      <div><h2 className="font-medium">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{hint}</p></div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Toggle({ label, desc, on, set }: { label: string; desc: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div><p className="text-sm font-medium">{label}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
      <button role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export function SettingsForm() {
  const { theme, setTheme } = useTheme();
  const [p, setP] = useState<Prefs>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const up = <K extends keyof Prefs>(k: K, v: Prefs[K]) => { setSaved(false); setP((x) => ({ ...x, [k]: v })); };

  useEffect(() => {
    setMounted(true);
    try { const raw = localStorage.getItem(KEY); if (raw) setP({ ...DEFAULTS, ...JSON.parse(raw) }); } catch {}
  }, []);

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
    setSaved(true);
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }}>
      <Section title="Profile" hint="How you appear in YTBrief.">
        <label className="block text-sm">Name<input className={`${input} mt-1.5`} value={p.name} onChange={(e) => up("name", e.target.value)} autoComplete="name" /></label>
        <label className="block text-sm">Email<input type="email" className={`${input} mt-1.5`} value={p.email} onChange={(e) => up("email", e.target.value)} autoComplete="email" /></label>
      </Section>

      <Section title="Appearance" hint="Choose how YTBrief looks.">
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme">
          {([["light", "Light", Sun], ["dark", "Dark", Moon], ["system", "System", Monitor]] as const).map(([v, l, I]) => {
            const on = mounted && theme === v;
            return (
              <button key={v} type="button" role="radio" aria-checked={on} onClick={() => setTheme(v)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm ${on ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground/40"}`}>
                <I className={`size-5 ${on ? "text-primary" : "text-muted-foreground"}`} />{l}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Language" hint="Default language for new summaries.">
        <select aria-label="Default language" className={input} value={p.lang} onChange={(e) => up("lang", e.target.value as Lang)}>
          <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option>
        </select>
      </Section>

      <Section title="Summary preferences" hint="Defaults applied on the dashboard.">
        <label className="block text-sm">Default summary type
          <select className={`${input} mt-1.5`} value={p.type} onChange={(e) => up("type", e.target.value as SummaryType)}>
            <option value="quick">Quick Summary</option><option value="detailed">Detailed Summary</option>
            <option value="key-points">Key Points</option><option value="chapters">Chapter Summary</option>
          </select>
        </label>
        <Toggle label="Auto-save summaries as PDF" desc="Keep a PDF copy of every summary you generate." on={p.autoSavePdf} set={(v) => up("autoSavePdf", v)} />
      </Section>

      <Section title="Notifications" hint="Choose what we email you.">
        <Toggle label="Email notifications" desc="Get an email when a long summary finishes." on={p.emailNotify} set={(v) => up("emailNotify", v)} />
      </Section>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark">Save changes</button>
        <span role="status" className="flex items-center gap-1.5 text-sm text-muted-foreground">{saved && <><Check className="size-4 text-primary" />Saved</>}</span>
      </div>
    </form>
  );
}
