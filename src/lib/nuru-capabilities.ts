export const NURU_CAPABILITY_IDS = ["fast", "nuru-1", "nuru-2", "nuru-3", "vision", "voice"] as const;

export type NuruCapabilityId = (typeof NURU_CAPABILITY_IDS)[number];

export type NuruCapability = {
  id: NuruCapabilityId;
  name: string;
  description: string;
  input: "text" | "vision" | "voice";
  reasoning: "minimal" | "low";
};

const DEFAULT_NURU_CAPABILITY: NuruCapability = {
  id: "nuru-2",
  name: "Nuru 2",
  description: "Deeper analysis, planning and complex questions",
  input: "text",
  reasoning: "low",
};

/** Product capability modes. These configure connected AI services; they are not separate foundation models. */
export const NURU_CAPABILITIES: NuruCapability[] = [
  { id: "fast", name: "Nuru Fast", description: "Quick everyday conversations and simple tasks", input: "text", reasoning: "minimal" },
  { id: "nuru-1", name: "Nuru 1", description: "Writing, learning, translation and everyday work", input: "text", reasoning: "minimal" },
  DEFAULT_NURU_CAPABILITY,
  { id: "nuru-3", name: "Nuru 3", description: "Demanding research, coding and professional work", input: "text", reasoning: "low" },
  { id: "vision", name: "Nuru Vision", description: "Images, screenshots, diagrams and visual documents", input: "vision", reasoning: "low" },
  { id: "voice", name: "Nuru Voice", description: "Natural spoken conversations", input: "voice", reasoning: "minimal" },
];

export function getNuruCapability(id: string | undefined) {
  return NURU_CAPABILITIES.find((capability) => capability.id === id) ?? DEFAULT_NURU_CAPABILITY;
}

export function detectCapability(text: string, hasVisual: boolean): string {
  if (hasVisual) return "vision";
  const value = text.toLowerCase();
  if (/translate|translation|chichewa|kiswahili|swahili|somali|français|french/.test(value)) return "languages";
  if (/maize|crop|farm|soil|plant|livestock|pest|harvest|fertili/.test(value)) return "agriculture";
  if (/business|market|customer|pricing|profit|sales|strategy|company/.test(value)) return "business";
  if (/lesson|study|explain|teach|homework|mathemat|science|exam/.test(value)) return "education";
  if (/code|program|debug|api|software|typescript|python/.test(value)) return "developer";
  if (/research|evidence|sources|latest|current|report/.test(value)) return "research";
  return "platform";
}