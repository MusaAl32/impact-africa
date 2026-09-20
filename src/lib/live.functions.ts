import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** The Live model used for real-time voice conversations. */
export const NURU_LIVE_MODEL = "gemini-3.8-live";

/**
 * Mints a short-lived Gemini Live auth token for the signed-in user.
 * The permanent GEMINI_API_KEY never leaves the server.
 */
export const createLiveToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) throw new Error("Live voice is not configured yet.");

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    try {
      const token = await ai.authTokens.create({
        config: {
          uses: 1,
          // Session must be opened soon; it may then run for up to 30 minutes.
          expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          newSessionExpireTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
          httpOptions: { apiVersion: "v1alpha" },
        },
      });
      if (!token.name) throw new Error("no token");
      return { token: token.name, model: NURU_LIVE_MODEL };
    } catch {
      throw new Error("Nuru could not start live voice right now. Please try again in a moment.");
    }
  });
