import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { safeLocalStorage } from "$lib/safeStorage";

/** Skins the music player can render in. */
export type MusicSkin = "modern" | "classic";

const STORAGE_KEY = "mewdeko-music-skin";

/**
 * Music player skin selection. "modern" is the regular card player; "classic"
 * recreates the Winamp 2.x main window and playlist editor. Persisted per
 * browser, independent of the site theme so it works on either.
 */
function createMusicSkinStore() {
  function isSkin(value: unknown): value is MusicSkin {
    return value === "modern" || value === "classic";
  }

  function readStored(): MusicSkin {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    return isSkin(stored) ? stored : "modern";
  }

  let current: MusicSkin = browser ? readStored() : "modern";
  const store = writable<MusicSkin>(current);

  function set(skin: MusicSkin) {
    current = skin;
    store.set(skin);
    if (browser) safeLocalStorage.setItem(STORAGE_KEY, skin);
  }

  function toggle() {
    set(current === "classic" ? "modern" : "classic");
  }

  return {
    subscribe: store.subscribe,
    set,
    /** Switches between the modern card and the classic Winamp window. */
    toggle,
    get current(): MusicSkin {
      return current;
    },
  };
}

export const musicSkinStore = createMusicSkinStore();
