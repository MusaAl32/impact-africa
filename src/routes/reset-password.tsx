import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { NuruWordmark } from "@/components/nuru-logo";
import { PasswordField } from "@/components/password-field";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose a new password — Nuru AI" },
      { name: "description", content: "Set a new password for your Nuru AI account." },
      { property: "og:title", content: "Choose a new password — Nuru AI" },
      { property: "og:description", content: "Set a new password for your Nuru AI account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setHasSession(Boolean(data.session));
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
      setReady(true);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const next: typeof errors = {};
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "The two passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success("Password updated.");
      setTimeout(() => navigate({ to: "/app", replace: true }), 1500);
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
        <h1 className="text-xl font-semibold tracking-tight">Choose a new password</h1>

        {!ready ? (
          <p className="mt-4 text-sm text-muted-foreground">Checking your reset link…</p>
        ) : done ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>Your password is updated. Taking you to Nuru…</span>
          </div>
        ) : !hasSession ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              This reset link is no longer valid. Request a new one and open it from the same device.
            </p>
            <Button asChild className="mt-5 w-full">
              <Link to="/auth">Request a new link</Link>
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <PasswordField
              id="new-password"
              label="New password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              error={errors.password ?? null}
              hint="At least 8 characters."
            />
            <PasswordField
              id="confirm-new-password"
              label="Confirm new password"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              error={errors.confirm ?? null}
            />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
