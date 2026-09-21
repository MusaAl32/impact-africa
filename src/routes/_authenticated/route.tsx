import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  staticData: { sitemap: "exclude-subtree" },
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => <Outlet />,
  // Catches any error bubbling out of the workspace subtree — including values
  // that are not Error instances — so the screen never goes blank.
  errorComponent: WorkspaceError,
});

function WorkspaceError() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-lg font-semibold">This page didn&apos;t load</h1>
      <p className="text-sm text-muted-foreground">
        Something interrupted Nuru while opening this page. Your conversations are safe.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button className="min-h-11" onClick={() => window.location.reload()}>Try again</Button>
        <Button asChild variant="outline" className="min-h-11"><Link to="/app">Back to Nuru</Link></Button>
      </div>
    </div>
  );
}
