import { createFileRoute, redirect } from "@tanstack/react-router";

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
    const { conversationId } = await getLatestOrCreateConversation();
    throw redirect({ to: "/app/chat/$conversationId", params: { conversationId } });
  },
  component: () => null,
});
