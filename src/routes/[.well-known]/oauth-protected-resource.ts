import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/.well-known/oauth-protected-resource")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: () =>
        Response.json(
          {
            resource: "/mcp",
            message: "OAuth metadata will be configured when the Nuru-owned MCP service is deployed.",
          },
          { status: 503 },
        ),
    },
  },
});
