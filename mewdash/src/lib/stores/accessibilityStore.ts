import { writable } from "svelte/store";
import { browser } from "$app/environment";

const STORAGE_KEY = "mewdeko-dyslexic-font";

function createDyslexicFontStore() {
  const store = writable(false);

  function applyClass(enabled: boolean) {
    if (!browser) return;
    document.documentElement.classList.toggle("dyslexic-font", enabled);
  }

  function init() {
    if (!browser) return;
    const enabled = localStorage.getItem(STORAGE_KEY) === "true";
    store.set(enabled);
    applyClass(enabled);
  }

  function set(enabled: boolean) {
    store.set(enabled);
    applyClass(enabled);
    if (browser) {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    }
  }

  function toggle() {
    if (!browser) return;
    set(!(localStorage.getItem(STORAGE_KEY) === "true"));
  }

  return {
    subscribe: store.subscribe,
    init,
    set,
    toggle
  };
}

export const dyslexicFontStore = createDyslexicFontStore();
