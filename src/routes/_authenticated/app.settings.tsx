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
import { speak, useSpeechVoices } from "@/hooks/use-speech";
import { getProfile, updateProfile } from "@/lib/account.functions";
import { useI18n } from "@/lib/i18n";
import { AFRICAN_LANGUAGES } from "@/lib/languages";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type NuruPreferences,
} from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/app/settings")({
  staticData: { sitemap: false },
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
  const [displayName, setDisplayName] = useState("");
  const voices = useSpeechVoices();
  const { locale, setLocale, machine, t } = useI18n();

  useEffect(() => {
    setPrefs(loadPreferences());
    getProfile()
      .then((profile) => {
        if (!profile) return;
        setDisplayName(profile.display_name ?? "");
        setPrefs((prev) => ({
          ...prev,
          country: profile.country || prev.country,
          language: profile.language || prev.language,
          tone: (profile.tone as NuruPreferences["tone"]) || prev.tone,
          voiceURI: profile.voice_uri || prev.voiceURI,
          voiceRate: Number(profile.voice_rate) || prev.voiceRate,
        }));
      })
      .catch(() => {
        /* fall back to this device's saved preferences */
      });
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">{t("settings.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your preferences are saved to your account and shape how Nuru answers you.
      </p>

      <div className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-2">
          <Label htmlFor="display-name">Your name</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Amina"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ui-language">{t("settings.uiLanguage")}</Label>
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger id="ui-language">
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
          {machine && <p className="text-xs text-muted-foreground">{t("settings.machineNote")}</p>}
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="voice">Reading voice</Label>
          <Select
            value={prefs.voiceURI || "device"}
            onValueChange={(v) => setPrefs({ ...prefs, voiceURI: v === "device" ? "" : v })}
          >
            <SelectTrigger id="voice">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="device">Device default</SelectItem>
              {voices.map((v) => (
                <SelectItem key={v.voiceURI} value={v.voiceURI}>
                  {v.name} · {v.lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {voices.length === 0
              ? "This device has not offered any reading voices yet."
              : "Used when Nuru reads an answer aloud."}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rate">Reading speed · {prefs.voiceRate.toFixed(1)}x</Label>
          <input
            id="rate"
            type="range"
            min={0.6}
            max={1.6}
            step={0.1}
            value={prefs.voiceRate}
            onChange={(e) => setPrefs({ ...prefs, voiceRate: Number(e.target.value) })}
            className="w-full accent-[hsl(var(--primary))]"
          />
        </div>

        <div className="flex gap-2">
        <Button
          onClick={() => {
            savePreferences(prefs);
            updateProfile({
              data: {
                display_name: displayName,
                country: prefs.country,
                language: prefs.language,
                ui_language: locale,
                tone: prefs.tone,
                voice_uri: prefs.voiceURI,
                voice_rate: prefs.voiceRate,
              },
            })
              .then(() => toast.success(t("settings.saved")))
              .catch(() => toast.error("Saved on this device, but we could not reach your account."));
          }}
        >
          {t("settings.save")}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const ok = speak("Muli bwanji. This is how Nuru will read answers to you.", prefs.language, {
              voiceURI: prefs.voiceURI,
              rate: prefs.voiceRate,
            });
            if (!ok) toast.error("Reading aloud is not supported in this browser.");
          }}
        >
          Test voice
        </Button>
        </div>
      </div>
    </div>
  );
}
