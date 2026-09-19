import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { UI_KEYS, UI_STRINGS } from "./i18n-strings";
import { languageLabel } from "./languages";

const Input = z.object({ locale: z.string().min(2).max(20) });

/**
 * Interface wording for a locale. English is returned directly; other locales are
 * read from the shared cache and machine-filled once, then cached for everyone.
 */
export const getUiTranslations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<{ locale: string; strings: Record<string, string>; machine: boolean }> => {
    const locale = data.locale.trim().toLowerCase();
    if (!locale || locale === "en") {
      return { locale: "en", strings: { ...UI_STRINGS }, machine: false };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows } = await supabaseAdmin
      .from("ui_translations")
      .select("key, text")
      .eq("locale", locale);

    const strings: Record<string, string> = { ...UI_STRINGS };
    let machine = false;
    for (const row of rows ?? []) {
      if (row.key in UI_STRINGS && typeof row.text === "string" && row.text.trim()) {
        strings[row.key] = row.text;
        machine = true;
      }
    }

    const missing = UI_KEYS.filter((k) => !(rows ?? []).some((r) => r.key === k));
    if (missing.length === 0) return { locale, strings, machine };

    try {
      const { runTranslation } = await import("./translate.server");
      const payload = missing.map((k) => `${k}\t${UI_STRINGS[k]}`).join("\n");
      const { text } = await runTranslation({
        text: `Translate ONLY the text after each tab character. Keep every line, keep the key before the tab exactly as it is.\n${payload}`,
        source: "en",
        target: locale,
      });

      const fresh: { locale: string; key: string; text: string; machine: boolean }[] = [];
      for (const line of text.split("\n")) {
        const tab = line.indexOf("\t");
        if (tab < 1) continue;
        const key = line.slice(0, tab).trim();
        const value = line.slice(tab + 1).trim();
        if (!value || !(key in UI_STRINGS)) continue;
        strings[key] = value;
        fresh.push({ locale, key, text: value, machine: true });
      }

      if (fresh.length) {
        machine = true;
        await supabaseAdmin.from("ui_translations").upsert(fresh, { onConflict: "locale,key" });
      }
    } catch (error) {
      console.error(`Interface translation failed for ${languageLabel(locale)}`, error);
    }

    return { locale, strings, machine };
  });
