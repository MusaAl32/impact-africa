import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nuru AI — One AI. Built for Africa." },
      {
        name: "description",
        content:
          "Nuru AI is an African AI ecosystem: specialist AI departments, 40+ African languages, voice, vision and a business hub in one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0b0b0d" },
      {
        name: "google-site-verification",
        content: "dncnoXrEN-oufqT7hYkq-b85iCm29gJP8AkuoBItdFA",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// Installed before hydration so a failed/stale module chunk cannot blank the
// screen before React (and any effect-based handler) has mounted.
const MODULE_RECOVERY_SCRIPT = `(function(){
  var KEY = "nuru-module-recovery";
  function recover(){
    try {
      if (sessionStorage.getItem(KEY) === "1") return;
      sessionStorage.setItem(KEY, "1");
    } catch (e) {}
    var url = new URL(window.location.href);
    url.searchParams.set("r", String(Date.now()));
    window.location.replace(url.toString());
  }
  function isModuleFailure(value){
    if (value === undefined || value === null) return true;
    var text = typeof value === "string" ? value : String(value.message || value);
    return /dynamically imported module|Importing a module script failed|error loading dynamically imported|Failed to fetch|ChunkLoadError|MIME type|Unexpected token '<'/i.test(text);
  }
  window.addEventListener("error", function(event){
    var target = event.target;
    if (target && target !== window && (target.tagName === "SCRIPT" || target.tagName === "LINK")) { recover(); return; }
    if (event.message === "Uncaught undefined" && event.error === undefined) { recover(); return; }
    if (event.error && isModuleFailure(event.error)) recover();
  }, true);
  window.addEventListener("unhandledrejection", function(event){
    if (isModuleFailure(event.reason)) recover();
  });
  // Watchdog: some stale-chunk failures blank the page without firing any
  // error event (hydration never starts). If nothing rendered, recover once.
  window.addEventListener("load", function(){
    window.setTimeout(function(){
      try {
        var body = document.body;
        if (!body || (body.innerText || "").trim().length === 0) recover();
      } catch (e) {}
    }, 4000);
  });
  window.setTimeout(function(){
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }, 15000);
})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: MODULE_RECOVERY_SCRIPT }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const router = useRouter();

  useEffect(() => {
    let pendingRefresh: (() => void) | null = null;

    const refreshAfterNavigation = (includeQueries: boolean) => {
      const refresh = () => {
        pendingRefresh?.();
        pendingRefresh = null;
        void router.invalidate();
        if (includeQueries) void queryClient.invalidateQueries();
      };

      if (!router.state.isLoading) {
        refresh();
        return;
      }

      // Invalidating while a protected route is still loading can replace its
      // match before TanStack has cleared the old load promise. Wait for that
      // navigation to settle so auth restoration cannot blank the whole app.
      pendingRefresh?.();
      pendingRefresh = router.subscribe("onResolved", refresh);
    };

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      refreshAfterNavigation(event !== "SIGNED_OUT");
    });
    return () => {
      pendingRefresh?.();
      data.subscription.unsubscribe();
    };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/25">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </div>
        </I18nProvider>
      </TooltipProvider>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
