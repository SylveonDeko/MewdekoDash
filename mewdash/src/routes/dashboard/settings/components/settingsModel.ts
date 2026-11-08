export type Named = { id: string; name: string };

export interface Settings {
  prefix: string;
  commandLogChannel: bigint;
  currencyEmoji: string;
  warnlogChannelId: bigint;
  warnExpireHours: number;
  warnExpireAction: number;
  locale: string;
  snipeset: boolean;
  previewLinks: boolean;
  muteRoleName: string;
  removeRolesOnMute: boolean;
  verboseErrors: boolean;
}

/** How a change is saved: toggles and pickers at once, typed fields once typing stops. */
export type SaveMode = "now" | "typing";
export type Patch = (changes: Partial<Settings>, mode?: SaveMode) => void;

export const DEFAULT_PREFIX = ".";
export const DEFAULT_CURRENCY_EMOJI = "💰";

/**
 * Reads an error's own message, which is the bot's when it gave one.
 * @param err The thrown value
 * @param fallback What to say when there is no message
 */
export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Turns an id the API returned, which may be a big number, into a string, or null for unset.
 * @param value The id
 */
export function idOrNull(value: unknown): string | null {
  const id = value === null || value === undefined ? "" : String(value);
  return id === "" || id === "0" ? null : id;
}

/** Languages the bot ships response strings for. */
export const LANGUAGES: Array<{ id: string; name: string }> = [
  { id: "en-US", name: "English" },
  { id: "ar", name: "العربية (Arabic)" },
  { id: "cs-CZ", name: "Čeština (Czech)" },
  { id: "da-DK", name: "Dansk (Danish)" },
  { id: "de-DE", name: "Deutsch (German)" },
  { id: "es-ES", name: "Español (Spanish)" },
  { id: "fr-FR", name: "Français (French)" },
  { id: "he-IL", name: "עברית (Hebrew)" },
  { id: "hi-IN", name: "हिन्दी (Hindi)" },
  { id: "hu-HU", name: "Magyar (Hungarian)" },
  { id: "id-ID", name: "Bahasa Indonesia" },
  { id: "it-IT", name: "Italiano (Italian)" },
  { id: "ja-JP", name: "日本語 (Japanese)" },
  { id: "ko-KR", name: "한국어 (Korean)" },
  { id: "nb-NO", name: "Norsk (Norwegian)" },
  { id: "nl-NL", name: "Nederlands (Dutch)" },
  { id: "pl-PL", name: "Polski (Polish)" },
  { id: "pt-BR", name: "Português (Brazil)" },
  { id: "ro-RO", name: "Română (Romanian)" },
  { id: "ru-RU", name: "Русский (Russian)" },
  { id: "sr-RS", name: "Srpski (Serbian)" },
  { id: "sv-SE", name: "Svenska (Swedish)" },
  { id: "tr-TR", name: "Türkçe (Turkish)" },
  { id: "uk-UA", name: "Українська (Ukrainian)" },
  { id: "zh-CN", name: "简体中文 (Chinese, Simplified)" },
  { id: "zh-TW", name: "繁體中文 (Chinese, Traditional)" },
  { id: "owo", name: "OwO" }
];
