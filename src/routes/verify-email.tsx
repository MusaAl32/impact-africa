import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { NuruWordmark } from "@/components/nuru-logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/verify-email")({
  staticData: { sitemap: false },
  ssr: false,
  validateSearch: z.object({ email: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Confirm your email — Nuru AI" },
      {
        name: "description",
        content: "Confirm your email address to finish creating your Nuru AI account.",
      },
      { property: "og:title", content: "Confirm your email — Nuru AI" },
      {
        property: "og:description",
        content: "Confirm your email address to finish creating your Nuru AI account.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/app", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function resend() {
    if (!email || busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/app` },
      });
      if (error) throw error;
      toast.success("We sent the confirmation email again.");
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
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-xl">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <MailCheck className="size-6" />
        </span>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Confirm your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {email
            ? `We sent a confirmation link to ${email}. Open it to finish creating your Nuru AI account.`
            : "Open the confirmation link we emailed you to finish creating your Nuru AI account."}
        </p>
        {email && (
          <Button variant="outline" className="mt-5 w-full" onClick={() => void resend()} disabled={busy}>
            {busy ? "Sending…" : "Send the email again"}
          </Button>
        )}
        <Button asChild variant="ghost" className="mt-2 w-full">
          <Link to="/auth">Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
