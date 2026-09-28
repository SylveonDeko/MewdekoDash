import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { safeLocalStorage } from "$lib/safeStorage";

/** Visual themes the dashboard can render in. */
export type ThemeName = "default" | "aero";

const STORAGE_KEY = "mewdeko-theme";

const THEME_NAMES: ThemeName[] = ["default", "aero"];

/** Classes placed on the html element per theme. */
const THEME_CLASSES: Record<ThemeName, string[]> = {
  default: [],
  aero: ["theme-aero"],
};

/**
 * Site-wide theme selection. The default theme is the flat dark look; the
 * aero theme is a night-time Frutiger Aero skin (navy-to-teal sky, smoked
 * glossy glass, bubbles) that keeps the guild palette for accents. The active theme is stored in
 * localStorage and mirrored as a class on the html element so plain CSS can
 * restyle surfaces without touching every component.
 */
function createThemeStore() {
  function isThemeName(value: unknown): value is ThemeName {
    return THEME_NAMES.includes(value as ThemeName);
  }

  let current: ThemeName = browser ? readStored() : "default";
  const store = writable<ThemeName>(current);
  applyClass(current);

  function applyClass(theme: ThemeName) {
    if (!browser) return;
    for (const classes of Object.values(THEME_CLASSES)) {
      document.documentElement.classList.remove(...classes);
    }
    document.documentElement.classList.add(...THEME_CLASSES[theme]);
  }

  function readStored(): ThemeName {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    return isThemeName(stored) ? stored : "default";
  }

  function set(theme: ThemeName) {
    current = theme;
    store.set(theme);
    applyClass(theme);
    if (browser) safeLocalStorage.setItem(STORAGE_KEY, theme);
  }

  function init() {
    if (!browser) return;
    current = readStored();
    store.set(current);
    applyClass(current);
  }

  function toggleAero() {
    set(current === "aero" ? "default" : "aero");
  }

  return {
    subscribe: store.subscribe,
    /** Reads the persisted theme and applies it to the document. */
    init,
    set,
    /** Switches between the default theme and Frutiger Aero. */
    toggleAero,
    /** Synchronous accessor for code outside Svelte reactivity. */
    get current(): ThemeName {
      return current;
    },
    /** Theme that will be active before init runs, read straight from storage. */
    peek(): ThemeName {
      return browser ? readStored() : "default";
    },
  };
}

export const themeStore = createThemeStore();
