import { streamText } from "ai";
import { createClient } from "@supabase/supabase-js";

import { describeGatewayFailure } from "./ai-gateway.server";
import { nuruUtilityModel } from "./nuru-model.server";
import { getDepartment, type DepartmentId } from "./departments";
import { NURU_IDENTITY } from "./prompts";
import type { Database } from "@/integrations/supabase/types";

export function publicDb() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export async function runItemAnalysis(input: {
  department: DepartmentId;
  itemType: "problem" | "research" | "submission";
  title: string;
  body: string;
  meta?: string;
}) {
  const dept = getDepartment(input.department);
  const analysisModel = nuruUtilityModel();

  let streamError: unknown;
  const result = streamText({
    onError: ({ error }) => { streamError = error; },
    model: analysisModel.model,
    providerOptions: analysisModel.providerOptions,
    system: [
      NURU_IDENTITY,
      `Active department: ${dept.name}. ${dept.expertise ?? dept.tagline}`,
      "You are analysing an entry from the Africa Opportunity Map. Return markdown with these sections, in order: **Problem in context**, **Root drivers**, **Opportunity**, **Who should build it**, **First 90 days**, **What to verify locally**. Be concrete and specific to the named country. Never invent statistics, prices or citations.",
    ].join("\n\n"),
    prompt: `Entry type: ${input.itemType}\nTitle: ${input.title}\n${input.meta ? `${input.meta}\n` : ""}\nDetails:\n${input.body}`,
  });

  let raw: string;
  try {
    raw = await result.text;
  } catch (error) {
    throw new Error(describeGatewayFailure(streamError ?? error, "analysis"));
  }

  const analysis = raw.trim();
  return { analysis, model: analysisModel.modelId };
}
