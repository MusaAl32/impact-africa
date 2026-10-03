import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000),
  instructions: z.string().trim().max(8000),
});
const projectIdSchema = z.object({ projectId: z.string().uuid() });

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("projects")
      .select("id, name, description, instructions, archived, created_at, updated_at, project_files(id, file_name, mime_type, size_bytes, status, error_message, created_at), project_conversations(conversation_id)")
      .eq("user_id", context.userId).eq("archived", false).order("updated_at", { ascending: false });
    if (error) throw new Error("Projects could not be loaded.");
    return data ?? [];
  });

export const createProject = createServerFn({ method: "POST" })
  .inputValidator(projectSchema)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: project, error } = await context.supabase.from("projects")
      .insert({ ...data, user_id: context.userId }).select("id, name, description, instructions, archived, created_at, updated_at").single();
    if (error || !project) throw new Error("Project could not be created.");
    return project;
  });

export const archiveProject = createServerFn({ method: "POST" })
  .inputValidator(projectIdSchema)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("projects").update({ archived: true })
      .eq("id", data.projectId).eq("user_id", context.userId);
    if (error) throw new Error("Project could not be archived.");
    return { ok: true };
  });

export const addProjectFileRecord = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    projectId: z.string().uuid(), storagePath: z.string().min(1).max(500), fileName: z.string().min(1).max(200),
    mimeType: z.enum(["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "image/jpeg", "image/png", "image/webp"]),
    sizeBytes: z.number().int().min(1).max(10 * 1024 * 1024), extractedText: z.string().max(100000).default(""),
  }))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: owned } = await context.supabase.from("projects").select("id").eq("id", data.projectId).eq("user_id", context.userId).maybeSingle();
    if (!owned || !data.storagePath.startsWith(`${context.userId}/${data.projectId}/`)) throw new Error("Project not found.");
    const { error } = await context.supabase.from("project_files").insert({
      project_id: data.projectId, user_id: context.userId, storage_path: data.storagePath,
      file_name: data.fileName, mime_type: data.mimeType, size_bytes: data.sizeBytes,
      status: data.extractedText ? "ready" : "uploaded", extracted_text: data.extractedText,
    });
    if (error) throw new Error("File details could not be saved.");
    return { ok: true };
  });