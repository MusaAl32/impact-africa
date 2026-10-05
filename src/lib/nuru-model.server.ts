import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import type { SharedV4ProviderOptions } from "@ai-sdk/provider";

import { NURU_MODEL, requireGeminiApiKey } from "./ai-gateway.server";
import { getNuruCapability, type NuruCapabilityId } from "./nuru-capabilities";

export const NURU_GEMINI_MODEL = NURU_MODEL;

export type NuruModelChoice = {
  model: LanguageModel;
  modelId: string;
  providerOptions: SharedV4ProviderOptions;
};

type ThinkingLevel = "minimal" | "low" | "medium" | "high";

/** Each Nuru capability mode is backed by a distinct connected model and reasoning depth. */
export const NURU_CAPABILITY_MODELS: Record<NuruCapabilityId, { modelId: string; thinking: ThinkingLevel }> = {
  fast: { modelId: "gemini-3.1-flash-lite", thinking: "minimal" },
  "nuru-1": { modelId: "gemini-3.5-flash-lite", thinking: "low" },
  "nuru-2": { modelId: "gemini-3.8-flash", thinking: "medium" },
  "nuru-3": { modelId: "gemini-3.8-flash", thinking: "high" },
  vision: { modelId: "gemini-3.8-flash", thinking: "medium" },
  voice: { modelId: "gemini-3.1-flash-lite", thinking: "minimal" },
};

function googleModel(modelId: string, thinking: ThinkingLevel): NuruModelChoice {
  const google = createGoogleGenerativeAI({ apiKey: requireGeminiApiKey() });
  return {
    model: google(modelId),
    modelId,
    providerOptions: {
      google: { thinkingConfig: { includeThoughts: false, thinkingLevel: thinking } },
    },
  };
}

export function geminiConfigured() {
  return Boolean(process.env["GEMINI_API_KEY"]?.trim());
}

export function nuruTextModel(options?: { fast?: boolean; capability?: NuruCapabilityId }): NuruModelChoice {
  if (options?.fast) return googleModel(NURU_GEMINI_MODEL, "minimal");
  const capability = getNuruCapability(options?.capability);
  const choice = NURU_CAPABILITY_MODELS[capability.id];
  return googleModel(choice.modelId, choice.thinking);
}

export function nuruUtilityModel(): NuruModelChoice {
  return googleModel(NURU_GEMINI_MODEL, "minimal");
}
