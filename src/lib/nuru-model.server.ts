import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import type { SharedV4ProviderOptions } from "@ai-sdk/provider";

import { NURU_MODEL, requireGeminiApiKey } from "./ai-gateway.server";

export const NURU_GEMINI_MODEL = NURU_MODEL;

export type NuruModelChoice = {
  model: LanguageModel;
  modelId: string;
  providerOptions: SharedV4ProviderOptions;
};

function googleModel(options?: { fast?: boolean }): NuruModelChoice {
  const google = createGoogleGenerativeAI({ apiKey: requireGeminiApiKey() });
  return {
    model: google(NURU_GEMINI_MODEL),
    modelId: NURU_GEMINI_MODEL,
    providerOptions: {
      google: {
        thinkingConfig: {
          includeThoughts: false,
          thinkingLevel: options?.fast ? "minimal" : "low",
        },
      },
    },
  };
}

export function geminiConfigured() {
  return Boolean(process.env["GEMINI_API_KEY"]?.trim());
}

export function nuruTextModel(options?: { fast?: boolean }): NuruModelChoice {
  return googleModel(options);
}

export function nuruUtilityModel(): NuruModelChoice {
  return googleModel({ fast: true });
}
