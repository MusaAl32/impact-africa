import { streamText } from "ai";

import {
  NURU_MODEL,
  createLovableAiGatewayProvider,
  requireLovableApiKey,
} from "./ai-gateway.server";
import { AFRICAN_LANGUAGES, languageLabel } from "./languages";

function model() {
  return createLovableAiGatewayProvider(requireLovableApiKey())(NURU_MODEL);
}

export async function runTranslation(input: {
  text: string;
  source: string;
  target: string;
}) {
  const sourceLabel = input.source === "auto" ? "auto-detect the source language" : languageLabel(input.source);

  const result = streamText({
    model: model(),
    system:
      "You are Nuru AI's translation engine for African languages. Return ONLY the translation — no notes, no quotes, no explanation. Preserve meaning, tone, numbers, names and line breaks. Use natural everyday phrasing a native speaker would use.",
    prompt: `Source language: ${sourceLabel}\nTarget language: ${languageLabel(input.target)}\n\nText:\n${input.text}`,
  });

  const text = (await result.text).trim();
  return { text };
}

export async function runDetection(text: string) {
  const codes = AFRICAN_LANGUAGES.map((l) => `${l.code}=${l.name}`).join(", ");
  const result = streamText({
    model: model(),
    system: `You detect languages. Reply with ONLY one language code from this list: ${codes}. If none fit, reply "unknown".`,
    prompt: text.slice(0, 2000),
  });

  const raw = (await result.text).trim().toLowerCase().replace(/[^a-z-]/g, "");
  const match = AFRICAN_LANGUAGES.find((l) => l.code === raw);
  return { code: match?.code ?? null, name: match?.name ?? null };
}
