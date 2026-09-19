import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { lovable } from "@/integrations/lovable";
import { NuruWordmark } from "@/components/nuru-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import "@lovable.dev/cloud-auth-js/styles.css";

export const Route = createFileRoute("/auth")({
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

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("We sent you a link to set a new password. Check your inbox.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent("Almost there — confirm your email address to finish creating your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error((error as Error).message);
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
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                />
              </div>
              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
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
              <button type="button" className="hover:text-foreground" onClick={() => { setMode("signup"); setSent(null); }}>
                New to Nuru? <span className="text-primary">Create an account</span>
              </button>
              <br />
              <button type="button" className="hover:text-foreground" onClick={() => { setMode("forgot"); setSent(null); }}>
                Forgot your password?
              </button>
            </>
          )}
          {mode !== "signin" && (
            <button type="button" className="hover:text-foreground" onClick={() => { setMode("signin"); setSent(null); }}>
              Back to <span className="text-primary">sign in</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
