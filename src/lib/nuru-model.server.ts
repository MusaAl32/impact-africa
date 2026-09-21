import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import type { SharedV4ProviderOptions } from "@ai-sdk/provider";

import {
  NURU_MODEL,
  createLovableAiGatewayProvider,
  createLovableResponsesProvider,
  requireLovableApiKey,
} from "./ai-gateway.server";

/** Fast direct-Google model used when a Gemini API key is configured. */
export const NURU_GEMINI_MODEL = "gemini-3.8-flash";

function geminiKey() {
  return process.env["GEMINI_API_KEY"]?.trim() || undefined;
}

export function geminiConfigured() {
  return Boolean(geminiKey());
}

export type NuruModelChoice = {
  model: LanguageModel;
  modelId: string;
  /** Provider options to pass to streamText for this model. */
  providerOptions: SharedV4ProviderOptions;
};

/**
 * Primary text model for Nuru.
 *
 * Prefers the project's own Gemini key (direct Google endpoint — lowest
 * latency, independent of gateway credits) and falls back to the Lovable
 * AI Gateway when no Gemini key is configured.
 */
export function nuruTextModel(options?: { runId?: string; fast?: boolean }): NuruModelChoice {
  const key = geminiKey();
  if (key) {
    const google = createGoogleGenerativeAI({ apiKey: key });
    return {
      model: google(NURU_GEMINI_MODEL),
      modelId: NURU_GEMINI_MODEL,
      providerOptions: {
        google: {
          thinkingConfig: { includeThoughts: false, thinkingLevel: options?.fast ? "low" : "medium" },
        },
      },
    };
  }

  const apiKey = requireLovableApiKey();
  const gateway = createLovableResponsesProvider(apiKey, options?.runId);
  return {
    model: gateway.responses(NURU_MODEL),
    modelId: NURU_MODEL,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: options?.fast ? "low" : "medium",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  };
}

/** Short one-shot tasks (translation, detection, analysis). */
export function nuruUtilityModel(): NuruModelChoice {
  const key = geminiKey();
  if (key) {
    const google = createGoogleGenerativeAI({ apiKey: key });
    return {
      model: google(NURU_GEMINI_MODEL),
      modelId: NURU_GEMINI_MODEL,
      providerOptions: {
        google: { thinkingConfig: { includeThoughts: false, thinkingLevel: "low" } },
      },
    };
  }
  return {
    model: createLovableAiGatewayProvider(requireLovableApiKey())(NURU_MODEL),
    modelId: NURU_MODEL,
    providerOptions: {},
  };
}
