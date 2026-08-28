import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { runDetection, runTranslation } from "./translate.server";

const TranslateInput = z.object({
  text: z.string().min(1).max(8000),
  source: z.string().min(1),
  target: z.string().min(1),
});

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranslateInput.parse(input))
  .handler(async ({ data }) => runTranslation(data));

export const detectLanguage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ text: z.string().min(1).max(4000) }).parse(input))
  .handler(async ({ data }) => runDetection(data.text));
