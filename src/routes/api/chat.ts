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

        const webEnabled = body.webAccess !== false && webSearchConfigured();

        try {
          const result = streamText({
            model: gateway(NURU_MODEL),
            system: [
              buildSystemPrompt({
                department: body.department ?? "platform",
                ...(body.language ? { language: body.language } : {}),
                ...(body.projectContext ? { projectContext: body.projectContext } : {}),
              }),
              webEnabled
                ? [
                    "You can browse the live web with the search_web tool.",
                    "Use it whenever the answer depends on current facts: prices, policies, news, statistics, programmes, funding, market data, dates, or anything you are not certain about.",
                    "Base factual claims only on what the returned sources actually say. Never invent a statistic, organisation, price or citation, and never fabricate a URL.",
                    "Cite inline with numbered markers like [1], [2] that match the order of the sources returned, and end the answer with a **Sources** list of the numbered titles and their links.",
                    "If the search returns nothing useful, say so plainly and explain what the user should check locally instead.",
                  ].join(" ")
                : "You have no live web access in this reply. Do not present uncertain figures as current fact; say what the user should verify locally.",
            ].join("\n\n"),
            messages: await convertToModelMessages(body.messages),
            stopWhen: stepCountIs(webEnabled ? 8 : 6),
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
              ...(webEnabled
                ? {
                    search_web: tool({
                      description:
                        "Search the live public web and return citable sources (title, url, snippet, date). Use this before stating any current fact, figure or programme.",
                      inputSchema: z.object({
                        query: z
                          .string()
                          .min(2)
                          .max(300)
                          .describe("A focused search query, in English where possible."),
                        limit: z
                          .number()
                          .int()
                          .min(1)
                          .max(8)
                          .optional()
                          .describe("How many sources to return (default 5)."),
                      }),
                      execute: async ({ query, limit }) => {
                        try {
                          const sources = await searchWeb(query, limit ?? 5);
                          return { query, sources, count: sources.length };
                        } catch (error) {
                          console.error("Nuru web search error", error);
                          return {
                            query,
                            sources: [],
                            count: 0,
                            error:
                              "Web search is temporarily unavailable. Answer from general knowledge and say the figures are unverified.",
                          };
                        }
                      },
                    }),
                  }
                : {}),
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
