import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { runDetection, runTranslation } from "./translate.server";

const TranslateInput = z.object({
  text: z.string().min(1).max(8000),
  source: z.string().min(1),
  target: z.string().min(1),
});

export type TranslateResult = { text: string; error?: string };
export type DetectResult = { code: string | null; name: string | null; error?: string };

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranslateInput.parse(input))
  .handler(async ({ data }): Promise<TranslateResult> => {
    try {
      return await runTranslation(data);
    } catch (error) {
      return { text: "", error: (error as Error).message || "Translation failed. Try again." };
    }
  });

export const detectLanguage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ text: z.string().min(1).max(4000) }).parse(input))
  .handler(async ({ data }): Promise<DetectResult> => {
    try {
      return await runDetection(data.text);
    } catch (error) {
      return {
        code: null,
        name: null,
        error: (error as Error).message || "Detection failed.",
      };
    }
  });
