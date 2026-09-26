import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const INVESTMENT_KINDS = ["savings", "bonds", "shares", "business", "property", "agriculture", "crypto", "other"] as const;

export type Investment = {
  id: string;
  name: string;
  kind: (typeof INVESTMENT_KINDS)[number];
  amount: number;
  currency: string;
  start_date: string;
  expected_annual_return: number;
  status: "active" | "closed";
  notes: string;
  created_at: string;
};

const InvestmentInput = z.object({
  name: z.string().trim().min(1, "Give it a name").max(120),
  kind: z.enum(INVESTMENT_KINDS),
  amount: z.number().positive("Amount must be more than 0").max(1_000_000_000),
  currency: z.string().trim().regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code").transform((v) => v.toUpperCase()),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expected_annual_return: z.number().min(-100).max(1000),
  status: z.enum(["active", "closed"]).default("active"),
  notes: z.string().max(1000).default(""),
});

const COLUMNS = "id, name, kind, amount, currency, start_date, expected_annual_return, status, notes, created_at";

function toDto(row: Record<string, unknown>): Investment {
  return {
    ...(row as unknown as Investment),
    amount: Number(row["amount"]),
    expected_annual_return: Number(row["expected_annual_return"]),
  };
}

export const listInvestments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("investments")
      .select(COLUMNS)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load your investments.");
    return (data ?? []).map((r) => toDto(r as Record<string, unknown>));
  });

export const saveInvestment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InvestmentInput.extend({ id: z.string().uuid().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    const query = id
      ? context.supabase.from("investments").update(fields).eq("id", id).eq("user_id", context.userId)
      : context.supabase.from("investments").insert({ ...fields, user_id: context.userId });
    const { data: row, error } = await query.select(COLUMNS).single();
    if (error || !row) throw new Error("Could not save this investment.");
    return toDto(row as Record<string, unknown>);
  });

export const deleteInvestment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("investments").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error("Could not delete this investment.");
    return { ok: true };
  });

/** Compound growth from start date to today (or 0 days if in the future). */
export function projectValue(inv: Pick<Investment, "amount" | "expected_annual_return" | "start_date">, at = new Date()) {
  const start = new Date(`${inv.start_date}T00:00:00Z`).getTime();
  const years = Math.max(0, (at.getTime() - start) / (365.25 * 86_400_000));
  const value = inv.amount * Math.pow(1 + inv.expected_annual_return / 100, years);
  return { value, gain: value - inv.amount, years };
}
