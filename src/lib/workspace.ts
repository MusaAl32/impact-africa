export type WorkspaceItem = {
  id: string;
  title: string;
  body: string;
  kind: "project" | "note" | "output";
  createdAt: string;
};

export type NuruPreferences = {
  language: string;
  country: string;
  tone: "concise" | "balanced" | "detailed";
  /** Read-aloud voice, chosen from the voices this device supports. "" = device default. */
  voiceURI: string;
  /** Read-aloud speed. */
  voiceRate: number;
};

const ITEMS_KEY = "nuru.workspace.items";
const PREFS_KEY = "nuru.preferences";

export const DEFAULT_PREFERENCES: NuruPreferences = {
  language: "en",
  country: "",
  tone: "balanced",
  voiceURI: "",
  voiceRate: 1,
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function loadItems() {
  return read<WorkspaceItem[]>(ITEMS_KEY, []);
}

export function saveItems(items: WorkspaceItem[]) {
  write(ITEMS_KEY, items);
}

export function loadPreferences() {
  return { ...DEFAULT_PREFERENCES, ...read<Partial<NuruPreferences>>(PREFS_KEY, {}) };
}

export function savePreferences(prefs: NuruPreferences) {
  write(PREFS_KEY, prefs);
}

export function buildProjectContext(prefs: NuruPreferences, items: WorkspaceItem[]) {
  const projects = items.filter((i) => i.kind === "project").slice(0, 3);
  return [
    prefs.country ? `User country: ${prefs.country}.` : "",
    `Preferred answer style: ${prefs.tone}.`,
    projects.length
      ? `Active projects:\n${projects.map((p) => `- ${p.title}: ${p.body}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
