export type LanguageStatus = "supported" | "beta" | "experimental";

export type LanguageCapability =
  | "translation"
  | "understanding"
  | "conversation"
  | "detection"
  | "generation"
  | "voice-input"
  | "text-to-speech";

export type AfricanLanguage = {
  code: string;
  /** BCP-47 tag used for speech recognition / synthesis where available. */
  locale?: string;
  name: string;
  nativeName: string;
  region: string;
  family: string;
  speakers: string;
  status: LanguageStatus;
  capabilities: LanguageCapability[];
};

const CORE: LanguageCapability[] = [
  "translation",
  "understanding",
  "conversation",
  "detection",
  "generation",
];

const withVoice = (locale: boolean): LanguageCapability[] =>
  locale ? [...CORE, "voice-input", "text-to-speech"] : CORE;

/**
 * Scalable language registry. Adding a language is a single entry here — every
 * language surface in the app (selectors, cards, translation, filters) is
 * generated from this list.
 */
export const AFRICAN_LANGUAGES: AfricanLanguage[] = [
  { code: "sw", locale: "sw-KE", name: "Swahili", nativeName: "Kiswahili", region: "East Africa", family: "Bantu", speakers: "200M+", status: "supported", capabilities: withVoice(true) },
  { code: "ny", locale: "ny-MW", name: "Chichewa", nativeName: "Chichewa / Chinyanja", region: "Southern Africa", family: "Bantu", speakers: "14M+", status: "supported", capabilities: CORE },
  { code: "zu", locale: "zu-ZA", name: "isiZulu", nativeName: "isiZulu", region: "Southern Africa", family: "Bantu", speakers: "27M+", status: "supported", capabilities: withVoice(true) },
  { code: "xh", locale: "xh-ZA", name: "isiXhosa", nativeName: "isiXhosa", region: "Southern Africa", family: "Bantu", speakers: "19M+", status: "supported", capabilities: CORE },
  { code: "st", locale: "st-ZA", name: "Sesotho", nativeName: "Sesotho", region: "Southern Africa", family: "Bantu", speakers: "13M+", status: "supported", capabilities: CORE },
  { code: "tn", locale: "tn-ZA", name: "Setswana", nativeName: "Setswana", region: "Southern Africa", family: "Bantu", speakers: "8M+", status: "beta", capabilities: CORE },
  { code: "nso", name: "Sepedi", nativeName: "Sepedi / Northern Sotho", region: "Southern Africa", family: "Bantu", speakers: "14M+", status: "beta", capabilities: CORE },
  { code: "ve", name: "Tshivenda", nativeName: "Tshivenḓa", region: "Southern Africa", family: "Bantu", speakers: "1.3M+", status: "experimental", capabilities: ["translation", "understanding", "detection"] },
  { code: "ts", name: "Xitsonga", nativeName: "Xitsonga", region: "Southern Africa", family: "Bantu", speakers: "12M+", status: "experimental", capabilities: ["translation", "understanding", "detection"] },
  { code: "ss", name: "siSwati", nativeName: "siSwati", region: "Southern Africa", family: "Bantu", speakers: "2.3M+", status: "experimental", capabilities: ["translation", "understanding", "detection"] },
  { code: "af", locale: "af-ZA", name: "Afrikaans", nativeName: "Afrikaans", region: "Southern Africa", family: "Germanic", speakers: "17M+", status: "supported", capabilities: withVoice(true) },
  { code: "nr", name: "isiNdebele", nativeName: "isiNdebele", region: "Southern Africa", family: "Bantu", speakers: "1.6M+", status: "experimental", capabilities: ["translation", "understanding", "detection"] },
  { code: "sn", name: "Shona", nativeName: "chiShona", region: "Southern Africa", family: "Bantu", speakers: "15M+", status: "beta", capabilities: CORE },
  { code: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá", region: "West Africa", family: "Niger-Congo", speakers: "45M+", status: "supported", capabilities: CORE },
  { code: "ha", name: "Hausa", nativeName: "Harshen Hausa", region: "West Africa", family: "Afro-Asiatic", speakers: "80M+", status: "supported", capabilities: CORE },
  { code: "ig", name: "Igbo", nativeName: "Asụsụ Igbo", region: "West Africa", family: "Niger-Congo", speakers: "31M+", status: "supported", capabilities: CORE },
  { code: "am", locale: "am-ET", name: "Amharic", nativeName: "አማርኛ", region: "Horn of Africa", family: "Semitic", speakers: "57M+", status: "supported", capabilities: CORE },
  { code: "ti", name: "Tigrinya", nativeName: "ትግርኛ", region: "Horn of Africa", family: "Semitic", speakers: "9M+", status: "beta", capabilities: CORE },
  { code: "om", name: "Oromo", nativeName: "Afaan Oromoo", region: "Horn of Africa", family: "Cushitic", speakers: "37M+", status: "beta", capabilities: CORE },
  { code: "so", name: "Somali", nativeName: "Af-Soomaali", region: "Horn of Africa", family: "Cushitic", speakers: "22M+", status: "supported", capabilities: CORE },
  { code: "ar", locale: "ar-EG", name: "Arabic", nativeName: "العربية", region: "North Africa", family: "Semitic", speakers: "170M+ in Africa", status: "supported", capabilities: withVoice(true) },
  { code: "wo", name: "Wolof", nativeName: "Wolof", region: "West Africa", family: "Niger-Congo", speakers: "10M+", status: "beta", capabilities: CORE },
  { code: "mnk", name: "Mandinka", nativeName: "Mandinka", region: "West Africa", family: "Mande", speakers: "1.5M+", status: "experimental", capabilities: ["translation", "understanding", "detection"] },
  { code: "bm", name: "Bambara", nativeName: "Bamanankan", region: "West Africa", family: "Mande", speakers: "14M+", status: "beta", capabilities: CORE },
  { code: "ff", name: "Fulfulde", nativeName: "Fulfulde / Pulaar", region: "West & Central Africa", family: "Niger-Congo", speakers: "37M+", status: "beta", capabilities: CORE },
  { code: "ln", name: "Lingala", nativeName: "Lingála", region: "Central Africa", family: "Bantu", speakers: "40M+", status: "beta", capabilities: CORE },
  { code: "kg", name: "Kikongo", nativeName: "Kikongo", region: "Central Africa", family: "Bantu", speakers: "6M+", status: "experimental", capabilities: ["translation", "understanding", "detection"] },
  { code: "rw", name: "Kinyarwanda", nativeName: "Ikinyarwanda", region: "East Africa", family: "Bantu", speakers: "12M+", status: "supported", capabilities: CORE },
  { code: "rn", name: "Kirundi", nativeName: "Ikirundi", region: "East Africa", family: "Bantu", speakers: "11M+", status: "beta", capabilities: CORE },
  { code: "lg", name: "Luganda", nativeName: "Oluganda", region: "East Africa", family: "Bantu", speakers: "11M+", status: "beta", capabilities: CORE },
  { code: "ki", name: "Kikuyu", nativeName: "Gĩkũyũ", region: "East Africa", family: "Bantu", speakers: "8M+", status: "experimental", capabilities: ["translation", "understanding", "detection"] },
  { code: "luo", name: "Dholuo", nativeName: "Dholuo", region: "East Africa", family: "Nilotic", speakers: "4M+", status: "experimental", capabilities: ["translation", "understanding", "detection"] },
  { code: "mg", name: "Malagasy", nativeName: "Malagasy", region: "Indian Ocean", family: "Austronesian", speakers: "25M+", status: "beta", capabilities: CORE },
  { code: "ak", name: "Akan / Twi", nativeName: "Akan / Twi", region: "West Africa", family: "Kwa", speakers: "20M+", status: "beta", capabilities: CORE },
  { code: "ee", name: "Ewe", nativeName: "Eʋegbe", region: "West Africa", family: "Kwa", speakers: "5M+", status: "experimental", capabilities: ["translation", "understanding", "detection"] },
  { code: "gaa", name: "Ga", nativeName: "Gã", region: "West Africa", family: "Kwa", speakers: "2M+", status: "experimental", capabilities: ["translation", "understanding", "detection"] },
  { code: "ber", name: "Tamazight", nativeName: "ⵜⴰⵎⴰⵣⵉⵖⵜ", region: "North Africa", family: "Berber", speakers: "14M+", status: "beta", capabilities: CORE },
  { code: "ts-pt", name: "Portuguese (Africa)", nativeName: "Português", region: "Lusophone Africa", family: "Romance", speakers: "35M+", status: "supported", capabilities: withVoice(true) },
  { code: "fr", locale: "fr-FR", name: "French (Africa)", nativeName: "Français", region: "Francophone Africa", family: "Romance", speakers: "160M+", status: "supported", capabilities: withVoice(true) },
  { code: "en", locale: "en-GB", name: "English", nativeName: "English", region: "Pan-African", family: "Germanic", speakers: "Widely used", status: "supported", capabilities: withVoice(true) },
];

export const LANGUAGE_REGIONS = Array.from(new Set(AFRICAN_LANGUAGES.map((l) => l.region))).sort();

export function findLanguage(code: string): AfricanLanguage | undefined {
  return AFRICAN_LANGUAGES.find((l) => l.code === code);
}

export function languageLabel(code: string): string {
  const lang = findLanguage(code);
  return lang ? `${lang.name} (${lang.nativeName})` : code;
}

export const STATUS_COPY: Record<LanguageStatus, string> = {
  supported: "Reliable quality across the listed capabilities.",
  beta: "Usable quality — review important output before publishing.",
  experimental: "Early coverage. Expect gaps in idiom and specialised vocabulary.",
};

export const CAPABILITY_LABEL: Record<LanguageCapability, string> = {
  translation: "Translation",
  understanding: "Text understanding",
  conversation: "AI conversation",
  detection: "Language detection",
  generation: "Text generation",
  "voice-input": "Voice input",
  "text-to-speech": "Text-to-speech",
};
