import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, BellOff, ExternalLink, Loader2, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { clearMyMemory, getMemoryStats } from "@/lib/memory.functions";
import { disablePush, enablePush, getPushAvailability, getStoredPushToken, type PushAvailability } from "@/lib/push-client";
import { getPushStatus, registerPushToken, unregisterPush } from "@/lib/push.functions";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

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
  const [account, setAccount] = useState<{ id: string; email: string; verified: boolean } | null>(null);
  const voices = useSpeechVoices();
  const { locale, setLocale, machine, t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setAccount({
        id: data.user.id,
        email: data.user.email ?? "",
        verified: Boolean(data.user.email_confirmed_at),
      });
    });
  }, []);

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

      <section id="account" className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Account</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="break-all font-medium">{account?.email ?? "…"}</dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-muted-foreground">Email confirmed</dt>
            <dd className="font-medium">{account ? (account.verified ? "Yes" : "Not yet") : "…"}</dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-muted-foreground">Account ID</dt>
            <dd className="break-all font-mono text-xs text-muted-foreground">{account?.id ?? "…"}</dd>
          </div>
        </dl>
        <Button variant="outline" className="mt-4 w-full sm:w-auto" onClick={() => void handleSignOut()}>
          <LogOut className="mr-2 size-4" /> Log out
        </Button>
      </section>


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
              {AFRICAN_LANGUAGES.filter((l) => l.code !== "en").map((l) => (
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
              {AFRICAN_LANGUAGES.filter((l) => l.code !== "en").map((l) => (
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

      <MemoryAndNotifications />
    </div>
  );
}

function MemoryAndNotifications() {
  const [memory, setMemory] = useState<number | null>(null);
  const [devices, setDevices] = useState<number | null>(null);
  const [pushAvailability, setPushAvailability] = useState<PushAvailability | null>(null);
  const [thisDevice, setThisDevice] = useState(false);
  const [busy, setBusy] = useState<"memory" | "push" | null>(null);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(() => {
    setLoadError(false);
    Promise.all([getMemoryStats(), getPushStatus(), getPushAvailability()])
      .then(([m, p, availability]) => {
        setMemory(m.count);
        setDevices(p.devices);
        setPushAvailability(availability);
        setThisDevice(Boolean(getStoredPushToken()) && availability === "ready" && Notification.permission === "granted");
      })
      .catch(() => setLoadError(true));
  }, []);
  useEffect(load, [load]);

  async function clearMemory() {
    if (!window.confirm("Clear everything Nuru remembers about you? Your chats stay.")) return;
    setBusy("memory");
    try { await clearMyMemory(); setMemory(0); toast.success("Memory cleared"); }
    catch { toast.error("Could not clear your memory. Please try again."); }
    finally { setBusy(null); }
  }

  async function togglePush(on: boolean) {
    setBusy("push");
    try {
      if (!on) {
        const token = await disablePush();
        if (token) await unregisterPush({ data: { token } });
        setThisDevice(false);
        setDevices((count) => Math.max(0, (count ?? 1) - (token ? 1 : 0)));
        toast.success("Notifications turned off on this device");
        return;
      }
      const result = await enablePush();
      if (result.status === "registered") {
        await registerPushToken({ data: { token: result.token } });
        setThisDevice(true);
        setDevices((count) => Math.max(1, count ?? 0));
        setPushAvailability("ready");
        toast.success("Notifications are on for this device");
      }
      else if (result.status === "open-in-new-tab") toast.error("Open Nuru in its own browser tab to allow notifications.");
      else if (result.status === "denied") toast.error("Notifications are blocked. Allow them in your browser's site settings.");
      else if (result.status === "unsupported") toast.error("This browser doesn't support notifications.");
      else toast.error("Notifications aren't fully set up yet.");
    } catch { toast.error("Could not change notifications. Please try again."); }
    finally { setBusy(null); }
  }

  return (
    <section className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-5">
      {loadError && (
        <div role="alert" className="flex items-center justify-between gap-2 text-sm text-destructive">
          Couldn't load these settings. <Button size="sm" variant="outline" onClick={load}>Retry</Button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Memory</h2>
          <p className="text-xs text-muted-foreground">{memory === null ? "Loading…" : `Nuru remembers ${memory} note${memory === 1 ? "" : "s"} from your chats.`}</p>
        </div>
        <Button variant="outline" size="sm" disabled={busy !== null || !memory} onClick={() => void clearMemory()}>
          {busy === "memory" && <Loader2 className="mr-1 size-4 animate-spin" />} Clear my memory
        </Button>
      </div>
      <div className="space-y-3 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {thisDevice ? <Bell className="mt-0.5 size-5 shrink-0 text-primary" /> : <BellOff className="mt-0.5 size-5 shrink-0 text-muted-foreground" />}
            <div>
              <Label htmlFor="push-switch" className="text-sm font-semibold">Notifications on this device</Label>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {pushAvailability === null && "Checking notification support…"}
                {pushAvailability === "ready" && (thisDevice ? "This device can receive Nuru alerts." : "Allow Nuru to send important alerts to this browser.")}
                {pushAvailability === "open-in-new-tab" && "Open Nuru in its own browser tab to allow notifications."}
                {pushAvailability === "denied" && "Notifications are blocked in this browser's site settings."}
                {pushAvailability === "unsupported" && "This browser does not support web notifications."}
                {pushAvailability === "not-configured" && "Browser notifications are not ready yet."}
              </p>
            </div>
          </div>
          <Switch
            id="push-switch"
            disabled={busy !== null || devices === null || pushAvailability !== "ready"}
            checked={thisDevice}
            onCheckedChange={(value) => void togglePush(value)}
          />
        </div>
        {pushAvailability === "open-in-new-tab" && (
          <Button asChild size="sm" variant="outline">
            <a href="/app/settings" target="_blank" rel="noreferrer">Open in a new tab <ExternalLink className="ml-2 size-4" /></a>
          </Button>
        )}
        {(devices ?? 0) > 0 && (
          <p className="text-xs text-muted-foreground">
            Enabled on {devices} device{devices === 1 ? "" : "s"} for your account.
          </p>
        )}
      </div>
    </section>
  );
}
