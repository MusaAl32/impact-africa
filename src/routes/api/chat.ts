import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, smoothStream, streamText, stepCountIs, tool, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { nuruTextModel } from "@/lib/nuru-model.server";
import { buildSystemPrompt } from "@/lib/prompts";
import { buildLongTermContext, rememberUserTurn } from "@/lib/memory.server";
import { buildSpecialistCouncilTool } from "@/lib/agent-orchestrator.server";
import { searchWeb, webSearchConfigured } from "@/lib/websearch.server";
import type { DepartmentId } from "@/lib/departments";
import type { Database, Json } from "@/integrations/supabase/types";


export const Route = createFileRoute("/api/chat")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          messages: UIMessage[];
          department?: DepartmentId;
          language?: string;
          projectContext?: string;
          webAccess?: boolean;
          conversationId?: string;
        };

        try {
          body = await request.json();
        } catch {
          return new Response("Invalid request body", { status: 400 });
        }

        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response("No messages provided", { status: 400 });
        }

        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
        const token = authHeader.slice(7);
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return new Response("Service unavailable", { status: 503 });
        const userDb = createClient<Database>(url, key, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claims, error: claimsError } = await userDb.auth.getClaims(token);
        const userId = claims?.claims?.sub;
        if (claimsError || !userId) return new Response("Unauthorized", { status: 401 });

        if (body.conversationId) {
          const parsed = z.string().uuid().safeParse(body.conversationId);
          if (!parsed.success) return new Response("Invalid conversation", { status: 400 });
          const { data: owned } = await userDb
            .from("conversations")
            .select("id")
            .eq("id", body.conversationId)
            .eq("user_id", userId)
            .eq("archived", false)
            .maybeSingle();
          if (!owned) return new Response("Conversation not found", { status: 404 });
        }

        const { consumeQuota, limitMessage } = await import("@/lib/billing.server");
        try {
          const quota = await consumeQuota(userId, "message");
          if (!quota.allowed) return new Response(limitMessage(quota), { status: 429 });
        } catch (error) {
          console.error("Nuru quota check failed", error);
        }

        let chatModel: ReturnType<typeof nuruTextModel>;
        try {
          chatModel = nuruTextModel({ fast: true });
        } catch (error) {
          return new Response((error as Error).message, { status: 500 });
        }

        const webEnabled = body.webAccess !== false && webSearchConfigured();
        const latestUserText = [...body.messages].reverse().find((message) => message.role === "user")?.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n")
          .trim() ?? "";
        let longTermContext = "";
        try {
          longTermContext = await buildLongTermContext(userDb, userId, latestUserText);
          if (latestUserText) await rememberUserTurn(userDb, userId, body.conversationId, latestUserText);
        } catch (error) {
          console.error("Nuru long-term memory retrieval failed", error);
        }

        try {
          const councilTools = buildSpecialistCouncilTool();
          const result = streamText({
            model: chatModel.model,
            system: [
              buildSystemPrompt({
                department: body.department ?? "platform",
                ...(body.language ? { language: body.language } : {}),
                ...(body.projectContext ? { projectContext: body.projectContext } : {}),
              }),
              longTermContext ? `Long-term memory context:\n${longTermContext}` : "No relevant long-term memory was retrieved.",
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
            stopWhen: stepCountIs(webEnabled ? 10 : 8),
            abortSignal: request.signal,
            experimental_transform: smoothStream({ chunking: "word" }),
            providerOptions: chatModel.providerOptions,
            tools: {
              ...councilTools,
              generate_image: tool({
                description: "Create an image (picture, sticker, logo, poster, illustration) from a detailed English description. The image is shown to the user automatically; do not repeat it as a link.",
                inputSchema: z.object({ prompt: z.string().min(3).max(2000).describe("Detailed visual description.") }),
                execute: async ({ prompt }) => {
                  try {
                    const { generateNuruImage } = await import("@/lib/image-gen.server");
                    return await generateNuruImage(prompt);
                  } catch (error) {
                    console.error("Nuru image tool error", error);
                    return { error: "The image could not be created right now." };
                  }
                },
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
                           const searchQuota = await consumeQuota(userId, "search");
                           if (!searchQuota.allowed) {
                             return {
                               query,
                               sources: [],
                               count: 0,
                               error: limitMessage(searchQuota),
                             };
                           }
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


          return result.toUIMessageStreamResponse({
            originalMessages: body.messages,
            sendReasoning: true,
            onError: (error) => {
              const status = (error as { statusCode?: number } | undefined)?.statusCode;
              const text = error instanceof Error ? error.message : String(error ?? "");
              console.error("Nuru stream error", status ?? "", text);
              if (status === 402 || /payment required/i.test(text)) return "402 payment required: AI credits exhausted";
              if (status === 429 || /rate limit|quota|high demand|overloaded/i.test(text)) return "429 rate limited";
              if (status === 401 || status === 403) return "401 unauthorized";
              return "Nuru could not complete that response.";
            },
            onFinish: async ({ responseMessage, isAborted }) => {
              if (isAborted || !body.conversationId) return;
              const { error: messageError } = await userDb.from("messages").upsert({
                conversation_id: body.conversationId,
                user_id: userId,
                client_message_id: responseMessage.id,
                role: "assistant",
                parts: responseMessage.parts as unknown as Json,
                department: body.department ?? "platform",
              }, { onConflict: "conversation_id,client_message_id" });
              if (messageError) console.error("Nuru assistant persistence failed");
              await userDb
                .from("conversations")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", body.conversationId)
                .eq("user_id", userId);
            },
          });
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
