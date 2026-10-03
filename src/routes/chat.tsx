import { createFileRoute } from "@tanstack/react-router";

import { NuruChat } from "@/components/nuru-chat";

export const Route = createFileRoute("/chat")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Try Nuru AI — Guest Chat" },
    { name: "description", content: "Ask Nuru AI a question before creating an account. Guest access is limited and conversations are not saved." },
    { property: "og:title", content: "Try Nuru AI" },
    { property: "og:description", content: "Start a limited guest conversation with Nuru AI." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: GuestChatPage,
});

function GuestChatPage() {
  return (
    <main className="chat-workspace flex min-h-screen bg-background text-foreground">
      <NuruChat department="platform" guest heading="What would you like to explore?" className="min-h-screen" />
    </main>
  );
}