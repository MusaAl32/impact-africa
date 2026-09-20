import { createFileRoute, redirect } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { getLatestOrCreateConversation } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/app/")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Nuru AI Platform — your African AI workspace" },
      {
        name: "description",
        content:
          "Ask Nuru anything. One assistant coordinating agriculture, business, education, research, documents and language specialists across Africa.",
      },
      { property: "og:title", content: "Nuru AI Platform" },
      {
        property: "og:description",
        content: "One universal African AI assistant with specialist departments behind it.",
      },
    ],
  }),
  beforeLoad: async () => {
    const result = await getLatestOrCreateConversation().catch(() => null);
    if (result?.conversationId) {
      throw redirect({ to: "/app/chat/$conversationId", params: { conversationId: result.conversationId } });
    }
  },
  component: StartFallback,
  errorComponent: StartFallback,
});

function StartFallback() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <h1 className="text-lg font-semibold">We couldn&apos;t open your chat</h1>
      <p className="text-sm text-muted-foreground">
        Your connection dropped while loading Nuru. Please try again.
      </p>
      <Button className="min-h-11" onClick={() => window.location.reload()}>Try again</Button>
    </div>
  );
}
