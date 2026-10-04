import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { NuruWordmark } from "@/components/nuru-logo";
import { PasswordField } from "@/components/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { importGuestConversation } from "@/lib/chat.functions";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Sign in — Nuru AI" },
      {
        name: "description",
        content:
          "Sign in to Nuru AI to keep your conversations, preferences and African language settings across devices.",
      },
      { property: "og:title", content: "Sign in — Nuru AI" },
      {
        property: "og:description",
        content: "Your account keeps Nuru conversations and preferences saved.",
      },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match an account.";
  if (m.includes("email not confirmed")) return "Confirm your email address first — check your inbox.";
  if (m.includes("already registered")) return "An account with this email already exists. Try signing in.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts right now. Please wait a moment and try again.";
  return message;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  async function continueAfterSignIn() {
    const raw = window.sessionStorage.getItem("nuru.guest.transcript");
    if (raw) {
      try {
        const messages = JSON.parse(raw) as Array<{ role: "user" | "assistant"; text: string }>;
        const imported = await importGuestConversation({ data: { messages } });
        window.sessionStorage.removeItem("nuru.guest.transcript");
        await navigate({ to: "/app/chat/$conversationId", params: { conversationId: imported.conversationId }, replace: true });
        return;
      } catch { toast.error("Your account is ready, but the guest chat could not be transferred."); }
    }
    await navigate({ to: "/app", replace: true });
  }

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) void continueAfterSignIn();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void continueAfterSignIn();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  function switchMode(next: Mode) {
    setMode(next);
    setSent(null);
    setErrors({});
    setConfirm("");
  }

  function validate() {
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (mode !== "forgot") {
      if (password.length < 8) next.password = "Use at least 8 characters.";
      if (mode === "signup" && confirm !== password) next.confirm = "The two passwords don't match.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("We sent you a link to set a new password. Check your inbox.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          navigate({ to: "/verify-email", search: { email: email.trim() }, replace: true });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(friendlyAuthError((error as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) throw result.error;
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link to="/" aria-label="Nuru AI home" className="mb-8">
        <NuruWordmark />
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h1 className="text-xl font-semibold tracking-tight">
          {mode === "signup"
            ? "Create your Nuru account"
            : mode === "forgot"
              ? "Reset your password"
              : "Welcome back to Nuru"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "forgot"
            ? "We'll email you a link to choose a new password."
            : "Your conversations, languages and preferences stay with your account."}
        </p>

        {sent ? (
          <p className="mt-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">{sent}</p>
        ) : (
          <>
            {mode !== "forgot" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 h-12 w-full gap-3 text-base font-medium"
                  onClick={handleGoogle}
                  disabled={busy}
                >
                  {busy ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  Log in with Google
                </Button>
                <div className="my-5 flex items-center gap-3 text-xs uppercase text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  <span>Or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} noValidate className={mode === "forgot" ? "mt-6 space-y-4" : "space-y-4"}>
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amina"
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>
              {mode !== "forgot" && (
                <PasswordField
                  id="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  error={errors.password ?? null}
                  {...(mode === "signup" ? { hint: "At least 8 characters." } : {})}
                />
              )}
              {mode === "signup" && (
                <PasswordField
                  id="confirm-password"
                  label="Confirm password"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                  error={errors.confirm ?? null}
                />
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 space-y-3 text-center text-sm text-muted-foreground">
          {mode === "signin" && (
            <>
              <Button type="button" variant="link" className="h-auto p-0 text-muted-foreground" onClick={() => switchMode("forgot")}>
                Forgot your password?
              </Button>
              <p>
                New to Nuru?{" "}
                <Button type="button" variant="link" className="h-auto p-0" onClick={() => switchMode("signup")}>
                  Create account
                </Button>
              </p>
            </>
          )}
          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <Button type="button" variant="link" className="h-auto p-0" onClick={() => switchMode("signin")}>
                Log in
              </Button>
            </p>
          )}
          {mode === "forgot" && (
            <Button type="button" variant="link" className="h-auto p-0" onClick={() => switchMode("signin")}>
              Back to log in
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
