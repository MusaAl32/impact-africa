import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mcp")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: () =>
        Response.json(
          {
            name: "Nuru AI MCP",
            status: "not-enabled",
            message: "The Nuru-owned MCP service will be enabled after the independent backend is deployed.",
          },
          { status: 503 },
        ),
      POST: () =>
        Response.json(
          { error: "MCP is not enabled in this migration build." },
          { status: 503 },
        ),
    },
  },
});
