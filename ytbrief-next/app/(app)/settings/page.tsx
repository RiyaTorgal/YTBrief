import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Settings</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Manage your profile and how YTBrief behaves.</p>
      <SettingsForm />
    </>
  );
}
