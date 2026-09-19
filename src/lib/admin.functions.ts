import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

/**
 * Admin-only server functions.
 *
 * Every handler re-verifies the caller's admin role against the database with
 * their own session (never a client-supplied id, never a role claim from the
 * browser). Privileged writes use the service-role client only AFTER that
 * check passes.
 */
type AuthedContext = { supabase: SupabaseClient<Database>; userId: string };

async function requireAdmin(context: AuthedContext) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (data !== true) throw new Error("Forbidden");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await requireAdmin(context);

    const count = async (table: "aom_problems" | "aom_research" | "aom_submissions" | "conversations" | "messages", filter?: { column: string; value: string }) => {
      let q = db.from(table).select("id", { count: "exact", head: true });
      if (filter) q = q.eq(filter.column, filter.value);
      const { count: c } = await q;
      return c ?? 0;
    };

    const [problems, published, research, submissions, pending, conversations, messages] =
      await Promise.all([
        count("aom_problems"),
        count("aom_problems", { column: "status", value: "published" }),
        count("aom_research"),
        count("aom_submissions"),
        count("aom_submissions", { column: "status", value: "pending" }),
        count("conversations"),
        count("messages"),
      ]);

    const { data: users } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const { count: agentSeats } = await db
      .from("mcp_access")
      .select("id", { count: "exact", head: true })
      .is("revoked_at", null);

    return {
      problems,
      published,
      research,
      submissions,
      pending,
      conversations,
      messages,
      agentSeats: agentSeats ?? 0,
      accounts: users?.users?.length ?? 0,
    };
  });

export const adminListProblems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await requireAdmin(context);
    const { data } = await db
      .from("aom_problems")
      .select("id, title, category, country, status, severity, opportunity_score, updated_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    return { items: data ?? [] };
  });

export const adminSetProblemStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["published", "draft", "archived"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = await requireAdmin(context);
    const { error } = await db
      .from("aom_problems")
      .update({ status: data.status })
      .eq("id", data.id);
    return { ok: !error };
  });

export const adminDeleteProblem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = await requireAdmin(context);
    const { error } = await db.from("aom_problems").delete().eq("id", data.id);
    return { ok: !error };
  });

export const adminListResearch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await requireAdmin(context);
    const { data } = await db
      .from("aom_research")
      .select("id, title, category, country, source, year, updated_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    return { items: data ?? [] };
  });

export const adminDeleteResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = await requireAdmin(context);
    const { error } = await db.from("aom_research").delete().eq("id", data.id);
    return { ok: !error };
  });

export const adminListSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await requireAdmin(context);
    const { data } = await db
      .from("aom_submissions")
      .select("id, title, summary, category, country, status, evidence_url, contact_email, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    return { items: data ?? [] };
  });

export const adminSetSubmissionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "reviewing", "accepted", "rejected"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = await requireAdmin(context);
    const { error } = await db
      .from("aom_submissions")
      .update({ status: data.status })
      .eq("id", data.id);
    return { ok: !error };
  });

/** Promote an accepted submission into the published problem database. */
export const adminPublishSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = await requireAdmin(context);
    const { data: row } = await db
      .from("aom_submissions")
      .select("title, summary, category, country")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) return { ok: false };

    const { error } = await db.from("aom_problems").insert({
      title: row.title,
      summary: row.summary,
      category: row.category,
      country: row.country,
      status: "published",
    });
    if (error) return { ok: false };
    await db.from("aom_submissions").update({ status: "accepted" }).eq("id", data.id);
    return { ok: true };
  });

export const adminDeleteSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = await requireAdmin(context);
    const { error } = await db.from("aom_submissions").delete().eq("id", data.id);
    return { ok: !error };
  });

export const adminListPeople = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await requireAdmin(context);
    const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
    const { data: roles } = await db.from("user_roles").select("user_id, role");
    const { data: access } = await db.from("mcp_access").select("user_id, revoked_at");

    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role]);
    }
    const accessSet = new Set(
      (access ?? []).filter((a) => a.revoked_at === null).map((a) => a.user_id),
    );

    return {
      items: (list?.users ?? []).map((u) => ({
        id: u.id,
        email: u.email ?? "",
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        roles: roleMap.get(u.id) ?? [],
        agentAccess: accessSet.has(u.id),
      })),
    };
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["admin", "moderator", "user"]),
        grant: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = await requireAdmin(context);

    // An admin can never remove their own admin role — prevents locking the
    // platform out of administration entirely.
    if (!data.grant && data.role === "admin" && data.userId === context.userId) {
      return { ok: false, error: "You cannot remove your own admin access." };
    }

    if (data.grant) {
      const { error } = await db
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      return { ok: !error, error: error ? "Could not update the role." : null };
    }

    const { error } = await db
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    return { ok: !error, error: error ? "Could not update the role." : null };
  });

export const adminSetAgentAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), grant: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = await requireAdmin(context);
    const { error } = await db.from("mcp_access").upsert(
      {
        user_id: data.userId,
        granted_by: context.userId,
        revoked_at: data.grant ? null : new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    return { ok: !error };
  });

/** Used by the UI gate: is the signed-in person an administrator? */
export const isCurrentUserAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { admin: data === true };
  });
