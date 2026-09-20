export type DepartmentId =
  | "platform"
  | "languages"
  | "voice"
  | "vision"
  | "business"
  | "education"
  | "agriculture"
  | "research"
  | "developer"
  | "creative"
  | "documents"
  | "opportunities"
  | "hub"
  | "workspace"
  | "settings";

export type Department = {
  id: DepartmentId;
  name: string;
  path: string;
  icon: string;
  tagline: string;
  /** System prompt fragment used when this department drives the conversation. */
  expertise?: string;
  suggestions?: string[];
};

export const DEPARTMENTS: Department[] = [
  {
    id: "platform",
    name: "AI Platform",
    path: "/app",
    icon: "Sparkles",
    tagline: "One universal assistant that coordinates every Nuru capability.",
    expertise:
      "You are the universal Nuru assistant. Coordinate specialist knowledge across agriculture, business, research, education, documents and languages.",
    suggestions: [
      "I want to start a small farming business",
      "Draft a 12-month business plan for a poultry farm",
      "Explain how mobile money works",
    ],
  },
  {
    id: "languages",
    name: "African Languages",
    path: "/app/languages",
    icon: "Languages",
    tagline: "Translation, detection and conversation across African languages.",
    expertise:
      "You are a multilingual African language specialist covering translation, transliteration, grammar, idiom and cultural nuance.",
    suggestions: [
      "Translate this health notice into Chichewa",
      "Explain the difference between isiZulu and isiXhosa greetings",
      "Write a market advert in Kiswahili",
    ],
  },
  {
    id: "business",
    name: "Business AI",
    path: "/app/business",
    icon: "Briefcase",
    tagline: "Plans, pricing, finance and go-to-market for African markets.",
    expertise:
      "You are a business strategist for African SMEs: business plans, unit economics, pricing, registration, funding and market entry.",
    suggestions: [
      "Build a business plan for a solar kiosk",
      "What steps do I follow to register a company?",
    ],
  },
  {
    id: "agriculture",
    name: "Agriculture AI",
    path: "/app/agriculture",
    icon: "Sprout",
    tagline: "Crops, livestock, soil, inputs, weather-aware planning.",
    expertise:
      "You are an agronomist for African smallholder and commercial farming: crop calendars, inputs, pests, irrigation and post-harvest.",
    suggestions: ["Help me plan a maize planting calendar", "Treat fall armyworm organically"],
  },
  {
    id: "voice",
    name: "Voice AI",
    path: "/app/voice",
    icon: "Mic",
    tagline: "Speak to Nuru, and have Nuru speak back.",
    expertise:
      "You handle spoken input transcripts. Keep answers short, clear and easy to read aloud.",
    suggestions: ["Summarise what I just said", "Turn my notes into action points"],
  },
  {
    id: "vision",
    name: "Vision AI",
    path: "/app/vision",
    icon: "Eye",
    tagline: "Understand photos: crops, documents, products, signage.",
    expertise:
      "You analyse images in African contexts: crop disease, livestock, receipts, signage, product photos and handwriting.",
    suggestions: ["What crop disease is this?", "Read the text in this photo"],
  },
  {
    id: "education",
    name: "Education AI",
    path: "/app/education",
    icon: "GraduationCap",
    tagline: "Tutoring, curricula and study material in local languages.",
    expertise:
      "You are a patient tutor aligned to African curricula (WAEC, KCSE, MSCE, NSC). Explain step by step.",
    suggestions: ["Explain photosynthesis for Form 2", "Create a 5-question quiz on fractions"],
  },
  {
    id: "research",
    name: "Research AI",
    path: "/app/research",
    icon: "Microscope",
    tagline: "Structured research, evidence synthesis and citations.",
    expertise:
      "You are a research analyst. Structure findings, state assumptions, flag uncertainty and never invent citations.",
    suggestions: ["Research the fertiliser market in East Africa", "Summarise evidence on agroforestry yields"],
  },
  {
    id: "developer",
    name: "Developer AI",
    path: "/app/developer",
    icon: "Code2",
    tagline: "Code, APIs, data pipelines and technical architecture.",
    expertise:
      "You are a senior software engineer. Give working code with short explanations.",
    suggestions: ["Write a USSD menu flow in Node.js", "Design a schema for an agri-marketplace"],
  },
  {
    id: "creative",
    name: "Creative AI",
    path: "/app/creative",
    icon: "Palette",
    tagline: "Copy, campaigns, scripts and generated imagery.",
    expertise:
      "You are a creative director producing campaign copy, scripts and naming with African cultural fluency.",
    suggestions: ["Radio advert script for a maize mill", "Ten brand names for a fintech in Accra"],
  },
  {
    id: "documents",
    name: "Document AI",
    path: "/app/documents",
    icon: "FileText",
    tagline: "Summarise, extract and draft documents and presentations.",
    expertise:
      "You read uploaded documents and produce summaries, extractions, drafts and slide outlines.",
    suggestions: ["Summarise this PDF into one page", "Turn this report into a 10-slide outline"],
  },
  {
    id: "opportunities",
    name: "Opportunity Map",
    path: "/app/opportunities",
    icon: "Map",
    tagline: "Africa's mapped problems, research and submissions — analysed by Nuru.",
  },
  {
    id: "hub",
    name: "Africa Business Hub",
    path: "/app/hub",
    icon: "Building2",
    tagline: "Businesses, suppliers, buyers and trade opportunities.",
  },
  {
    id: "workspace",
    name: "My Workspace",
    path: "/app/workspace",
    icon: "FolderKanban",
    tagline: "Projects, conversations, files and generated outputs.",
  },
  {
    id: "settings",
    name: "Settings",
    path: "/app/settings",
    icon: "Settings",
    tagline: "Account, language preference and AI behaviour.",
  },
];

export const AGENT_DEPARTMENTS = DEPARTMENTS.filter((d) => d.expertise);

export function getDepartment(id: DepartmentId): Department {
  return DEPARTMENTS.find((d) => d.id === id) ?? DEPARTMENTS[0]!;
}

export type QuickAction = {
  label: string;
  icon: string;
  path: string;
  prompt?: string;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { label: "Translate Text", icon: "Languages", path: "/app/languages" },
  { label: "Voice to Text", icon: "Mic", path: "/app/voice" },
  { label: "Image Analysis", icon: "Eye", path: "/app/vision" },
  {
    label: "PDF Summarizer",
    icon: "FileText",
    path: "/app/documents",
    prompt: "Summarise the attached document into a one-page brief with key numbers and next steps.",
  },
  {
    label: "Business Plan Generator",
    icon: "Briefcase",
    path: "/app/business",
    prompt: "Generate a complete business plan. Ask me for the business idea, country and budget first.",
  },
  {
    label: "Create Document",
    icon: "FilePlus2",
    path: "/app/documents",
    prompt: "Help me draft a professional document. Ask what type and audience first.",
  },
  {
    label: "Create Presentation",
    icon: "Presentation",
    path: "/app/documents",
    prompt: "Create a slide-by-slide presentation outline. Ask me for the topic and audience first.",
  },
  { label: "Generate Image", icon: "Image", path: "/app/creative" },
];
