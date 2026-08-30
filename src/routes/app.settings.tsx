import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AFRICAN_LANGUAGES } from "@/lib/languages";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type NuruPreferences,
} from "@/lib/workspace";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Nuru AI preferences" },
      {
        name: "description",
        content:
          "Set your country, preferred African language and answer style so Nuru AI responds the way you work.",
      },
      { property: "og:title", content: "Settings — Nuru AI" },
      { property: "og:description", content: "Country, language and answer-style preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [prefs, setPrefs] = useState<NuruPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    setPrefs(loadPreferences());
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Preferences are stored on this device and shape how Nuru answers you.
      </p>

      <div className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-2">
          <Label htmlFor="country">Country or market</Label>
          <Input
            id="country"
            value={prefs.country}
            onChange={(e) => setPrefs({ ...prefs, country: e.target.value })}
            placeholder="e.g. Malawi"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Preferred language</Label>
          <Select
            value={prefs.language}
            onValueChange={(language) => setPrefs({ ...prefs, language })}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="en">English</SelectItem>
              {AFRICAN_LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.name} · {l.nativeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Answer style</Label>
          <Select
            value={prefs.tone}
            onValueChange={(tone) => setPrefs({ ...prefs, tone: tone as NuruPreferences["tone"] })}
          >
            <SelectTrigger id="tone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            savePreferences(prefs);
            toast.success("Preferences saved");
          }}
        >
          Save preferences
        </Button>
      </div>
    </div>
  );
}
