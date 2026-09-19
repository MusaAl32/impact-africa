import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { lovable } from "@/integrations/lovable";
import { NuruWordmark } from "@/components/nuru-logo";
import { PasswordField } from "@/components/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import "@lovable.dev/cloud-auth-js/styles.css";

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
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) navigate({ to: "/app", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate({ to: "/app", replace: true });
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
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(String(result.error));
      if (result.redirected) return;
      navigate({ to: "/app", replace: true });
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
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
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

            {mode !== "forgot" && (
              <>
                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                </div>
                <button
                  type="button"
                  className="lovable-auth-button w-full"
                  onClick={handleGoogle}
                  disabled={busy}
                >
                  Continue with Google
                </button>
              </>
            )}
          </>
        )}

        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          {mode === "signin" && (
            <>
              <button type="button" className="hover:text-foreground" onClick={() => switchMode("signup")}>
                New to Nuru? <span className="text-primary">Create an account</span>
              </button>
              <br />
              <button type="button" className="hover:text-foreground" onClick={() => switchMode("forgot")}>
                Forgot your password?
              </button>
            </>
          )}
          {mode !== "signin" && (
            <button type="button" className="hover:text-foreground" onClick={() => switchMode("signin")}>
              Back to <span className="text-primary">sign in</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
