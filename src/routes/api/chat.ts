import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from "ai";
import { z } from "zod";

import {
  NURU_MODEL,
  createLovableAiGatewayProvider,
  getLovableAiGatewayRunId,
  requireLovableApiKey,
} from "@/lib/ai-gateway.server";
import { buildSystemPrompt } from "@/lib/prompts";
import { searchWeb, webSearchConfigured } from "@/lib/websearch.server";
import type { DepartmentId } from "@/lib/departments";


export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          messages: UIMessage[];
          department?: DepartmentId;
          language?: string;
          projectContext?: string;
          webAccess?: boolean;
        };

        try {
          body = await request.json();
        } catch {
          return new Response("Invalid request body", { status: 400 });
        }

        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response("No messages provided", { status: 400 });
        }

        let apiKey: string;
        try {
          apiKey = requireLovableApiKey();
        } catch (error) {
          return new Response((error as Error).message, { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(apiKey, getLovableAiGatewayRunId(request));

        try {
          const result = streamText({
            model: gateway(NURU_MODEL),
            system: buildSystemPrompt({
              department: body.department ?? "platform",
              ...(body.language ? { language: body.language } : {}),
              ...(body.projectContext ? { projectContext: body.projectContext } : {}),
            }),
            messages: await convertToModelMessages(body.messages),
            stopWhen: stepCountIs(6),
            abortSignal: request.signal,
            tools: {
              activate_agents: tool({
                description:
                  "Declare which Nuru specialist agents are being coordinated for this request, before answering.",
                inputSchema: z.object({
                  agents: z
                    .array(z.string())
                    .describe("Specialist names, e.g. Business AI, Agriculture AI"),
                  plan: z.string().describe("One sentence describing how they will be combined"),
                }),
                execute: async ({ agents, plan }) => ({ activated: agents, plan }),
              }),
            },
          });

          return result.toUIMessageStreamResponse();
        } catch (error) {
          if ((error as Error)?.name === "AbortError") {
            return new Response(null, { status: 499 });
          }
          console.error("Nuru chat error", error);
          return new Response("Nuru AI could not complete this request.", { status: 500 });
        }
      },
    },
  },
});
