import { generateText } from "ai";
import { z } from "zod";
import { nuruTextModel } from "./nuru-model.server";
import { getDepartment, type DepartmentId } from "./departments";

export const specialistIds = [
  "languages", "voice", "vision", "business", "education", "agriculture",
  "research", "developer", "creative", "documents", "opportunities", "hub",
] as const;

export type SpecialistId = typeof specialistIds[number];

const specialistSchema = z.enum(specialistIds);

export function buildSpecialistCouncilTool() {
  return {
    consult_specialists: {
      description:
        "Quietly consult up to four Nuru specialists on a difficult request. Use this when the task needs domain expertise, file/document reasoning, coding, planning, research, agriculture, education, business, language, vision or multiple domains. The specialists return findings; Nuru remains the single voice to the user.",
      inputSchema: z.object({
        specialists: z.array(specialistSchema).min(1).max(4),
        task: z.string().min(5).max(12000),
        expected_output: z.string().min(3).max(1000).optional(),
      }),
      execute: async ({ specialists, task, expected_output }: { specialists: SpecialistId[]; task: string; expected_output?: string }) => {
        const model = nuruTextModel();
        const results = await Promise.all(specialists.map(async (id) => {
          const department = getDepartment(id as DepartmentId);
          const result = await generateText({
            model: model.model,
            system: [
              `You are Nuru's internal ${department.name} specialist.`,
              department.expertise ?? department.tagline,
              "You are an internal consultant, not the final assistant. Give concise, actionable findings, assumptions, risks and concrete next actions.",
              "Never invent facts, citations, files or completed actions.",
            ].join("\n"),
            prompt: `Task:\n${task}\n\n${expected_output ? `Expected output:\n${expected_output}` : ""}`,
            providerOptions: model.providerOptions,
          });
          return { specialist: id, findings: result.text };
        }));
        return { specialists, results };
      },
    },
  };
}
