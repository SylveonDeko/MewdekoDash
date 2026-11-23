import { safeLocalStorage } from "$lib/safeStorage";
import { isSimpleButton, type ButtonAction } from "./buttons";

export type BuilderMode = "simple" | "advanced";

export const MODE_STORAGE_KEY = "mewdeko.embedbuilder.mode";
export const TOUR_STORAGE_KEY = "mewdeko.embedbuilder.tour";

interface MessageEmbed {
  url?: string;
  author?: { name?: string; url?: string; icon_url?: string } | null;
  thumbnail?: { url?: string } | null;
  footer?: { text?: string; icon_url?: string } | null;
  fields?: unknown[] | null;
}

interface MessageComponent {
  style: number;
  isSelect: boolean;
  action?: ButtonAction;
}

interface MessageRow {
  components: MessageComponent[];
}

/**
 * Whether a message holds anything the Simple form cannot show: a second embed, fields, an author, a footer,
 * a thumbnail, a title link, a trigger button, a select menu or more than one component row. Link buttons and
 * buttons that show a message are shown by Simple.
 */
export function usesAdvancedFeatures(embeds: MessageEmbed[], rows: MessageRow[]): boolean {
  if (embeds.length > 1 || rows.length > 1) return true;

  const embed = embeds[0];
  if (embed) {
    if (embed.url?.trim()) return true;
    if (embed.fields && embed.fields.length > 0) return true;
    if (embed.author?.name?.trim() || embed.author?.url?.trim() || embed.author?.icon_url?.trim()) return true;
    if (embed.footer?.text?.trim() || embed.footer?.icon_url?.trim()) return true;
    if (embed.thumbnail?.url?.trim()) return true;
  }

  return rows.some(row => row.components.some(component => !isSimpleButton(component)));
}

/**
 * The builder's mode. The stored choice is shared by every builder and is read after mount so the server
 * and the first browser render agree. A session override opens a message in Advanced without changing it.
 */
export function createBuilderMode() {
  let stored = $state<BuilderMode>("simple");
  let override = $state<BuilderMode | null>(null);
  let ready = $state(false);

  return {
    get mode(): BuilderMode {
      return override ?? stored;
    },
    get ready() {
      return ready;
    },
    init() {
      stored = safeLocalStorage.getItem(MODE_STORAGE_KEY) === "advanced" ? "advanced" : "simple";
      override = null;
      ready = true;
    },
    set(next: BuilderMode) {
      stored = next;
      override = null;
      safeLocalStorage.setItem(MODE_STORAGE_KEY, next);
    },
    openAdvancedForSession() {
      override = "advanced";
    }
  };
}

export function tourSeen(): boolean {
  return safeLocalStorage.getItem(TOUR_STORAGE_KEY) === "done";
}

export function markTourSeen() {
  safeLocalStorage.setItem(TOUR_STORAGE_KEY, "done");
}
