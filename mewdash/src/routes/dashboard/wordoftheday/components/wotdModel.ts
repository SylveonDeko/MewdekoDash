import { m } from "$lib/i18n";
import { WordDifficulty, WordPartOfSpeech, WordSourceMode } from "$lib/api/index.ts";

export type Named = { id: string; name: string; color?: number };
export type Option = { id: string; name: string };
export type Notify = (message: string, type?: "success" | "error") => void;

export type TabId = "settings" | "schedule" | "words" | "history";
export const TAB_IDS: TabId[] = ["settings", "schedule", "words", "history"];

export const DEFAULT_THREAD_NAME = "Word of the day: %wotd.word%";

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function selectedNumber(detail: { selected: string | string[] | null }, fallback: number): number {
  return detail.selected && typeof detail.selected === "string" ? parseInt(detail.selected) : fallback;
}

export function formatDate(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleDateString() : m.common.never();
}

export const HOUR_OPTIONS: Option[] = Array.from({ length: 24 }, (_, i) => ({
  id: i.toString(),
  name: `${i.toString().padStart(2, "0")}:00`
}));

export function modeOptions(): Option[] {
  return [
    { id: WordSourceMode.Dictionary.toString(), name: m.wordoftheday.sourceDictionary() },
    { id: WordSourceMode.Custom.toString(), name: m.wordoftheday.sourceCustom() },
    { id: WordSourceMode.Mixed.toString(), name: m.wordoftheday.sourceMixed() }
  ];
}

export function posOptions(): Option[] {
  return [
    { id: WordPartOfSpeech.Any.toString(), name: m.wordoftheday.optionAny() },
    { id: WordPartOfSpeech.Noun.toString(), name: m.wordoftheday.posNoun() },
    { id: WordPartOfSpeech.Verb.toString(), name: m.wordoftheday.posVerb() },
    { id: WordPartOfSpeech.Adjective.toString(), name: m.wordoftheday.posAdjective() },
    { id: WordPartOfSpeech.Adverb.toString(), name: m.wordoftheday.posAdverb() }
  ];
}

export function difficultyOptions(): Option[] {
  return [
    { id: WordDifficulty.Any.toString(), name: m.wordoftheday.optionAny() },
    { id: WordDifficulty.Common.toString(), name: m.wordoftheday.difficultyCommon() },
    { id: WordDifficulty.Moderate.toString(), name: m.wordoftheday.difficultyModerate() },
    { id: WordDifficulty.Rare.toString(), name: m.wordoftheday.difficultyRare() }
  ];
}

export function archiveOptions(): Option[] {
  return [
    { id: "60", name: m.common.oneHour() },
    { id: "1440", name: m.common.oneDay() },
    { id: "4320", name: m.wordoftheday.archive3d() },
    { id: "10080", name: m.wordoftheday.archive1w() }
  ];
}

export function inheritOptions(options: Option[]): Option[] {
  return [{ id: "0", name: m.wordoftheday.optionInherit() }, ...options.slice(1)];
}

export function dayNames(): string[] {
  return [
    m.wordoftheday.daySunday(),
    m.wordoftheday.dayMonday(),
    m.wordoftheday.dayTuesday(),
    m.wordoftheday.dayWednesday(),
    m.wordoftheday.dayThursday(),
    m.wordoftheday.dayFriday(),
    m.wordoftheday.daySaturday()
  ];
}

export function monthNames(): string[] {
  return [
    m.wordoftheday.monthJanuary(),
    m.wordoftheday.monthFebruary(),
    m.wordoftheday.monthMarch(),
    m.wordoftheday.monthApril(),
    m.wordoftheday.monthMay(),
    m.wordoftheday.monthJune(),
    m.wordoftheday.monthJuly(),
    m.wordoftheday.monthAugust(),
    m.wordoftheday.monthSeptember(),
    m.wordoftheday.monthOctober(),
    m.wordoftheday.monthNovember(),
    m.wordoftheday.monthDecember()
  ];
}

export function optionName(options: Option[], value: number): string {
  return options.find((o) => o.id === value.toString())?.name ?? m.wordoftheday.optionAny();
}

export function templatePlaceholders() {
  const word = m.common.word();
  return [
    { category: word, name: "%wotd.word%", description: m.placeholders.wotdWord() },
    { category: word, name: "%wotd.definition%", description: m.placeholders.wotdDefinition() },
    { category: word, name: "%wotd.pos%", description: m.placeholders.wotdPos() },
    { category: word, name: "%wotd.example%", description: m.placeholders.wotdExample() },
    { category: word, name: "%wotd.phonetic%", description: m.placeholders.wotdPhonetic() },
    { category: word, name: "%wotd.date%", description: m.placeholders.wotdDate() },
    { category: word, name: "%wotd.ping%", description: m.placeholders.wotdPing() },
    { category: m.placeholders.categoryServer(), name: "%server.name%", description: m.placeholders.serverName() }
  ];
}
