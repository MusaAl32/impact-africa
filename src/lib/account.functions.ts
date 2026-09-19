import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type NuruProfile = {
  id: string;
  display_name: string | null;
  country: string;
  language: string;
  ui_language: string;
  tone: string;
  voice_uri: string;
  voice_rate: number;
};

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NuruProfile | null> => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, display_name, country, language, ui_language, tone, voice_uri, voice_rate")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data) return data as NuruProfile;

    const { data: created, error: insertError } = await context.supabase
      .from("profiles")
      .insert({ id: context.userId })
      .select("id, display_name, country, language, ui_language, tone, voice_uri, voice_rate")
      .single();

    if (insertError) throw new Error(insertError.message);
    return created as NuruProfile;
  });

const ProfileInput = z.object({
  display_name: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  language: z.string().max(20).optional(),
  ui_language: z.string().max(20).optional(),
  tone: z.enum(["concise", "balanced", "detailed"]).optional(),
  voice_uri: z.string().max(200).optional(),
  voice_rate: z.number().min(0.5).max(2).optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProfileInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, ...data }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
