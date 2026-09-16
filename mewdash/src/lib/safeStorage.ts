// lib/safeStorage.ts

/**
 * A Storage that never throws. `window.localStorage` and `window.sessionStorage` are not always there: they
 * are undefined during SSR, `null` in Chrome when the user has blocked site data, and reading them throws a
 * SecurityError in some sandboxed and private contexts. Every access in the app goes through one of these so a
 * missing store degrades to "nothing remembered" instead of a crash.
 */
export interface SafeStorage {
  /** Reads a key, or null when storage is unavailable or the key is unset. */
  getItem(key: string): string | null;
  /** Writes a key; silently does nothing when storage is unavailable or full. */
  setItem(key: string, value: string): void;
  /** Removes a key; silently does nothing when storage is unavailable. */
  removeItem(key: string): void;
  /** Every key currently stored, or an empty list when storage is unavailable. */
  keys(): string[];
  /** Whether a real store is reachable right now. */
  readonly available: boolean;
}

function createSafeStorage(resolve: () => Storage | null | undefined): SafeStorage {
  function backing(): Storage | null {
    try {
      if (typeof window === "undefined") return null;
      return resolve() ?? null;
    } catch {
      return null;
    }
  }

  return {
    getItem(key) {
      try {
        return backing()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      try {
        backing()?.setItem(key, value);
      } catch {
        /* quota exceeded or storage disabled: the value is simply not remembered */
      }
    },
    removeItem(key) {
      try {
        backing()?.removeItem(key);
      } catch {
        /* storage disabled */
      }
    },
    keys() {
      try {
        const store = backing();
        if (!store) return [];
        const keys: string[] = [];
        for (let i = 0; i < store.length; i++) {
          const key = store.key(i);
          if (key !== null) keys.push(key);
        }
        return keys;
      } catch {
        return [];
      }
    },
    get available() {
      return backing() !== null;
    },
  };
}

/** `localStorage` that never throws. */
export const safeLocalStorage = createSafeStorage(() => window.localStorage);

/** `sessionStorage` that never throws. */
export const safeSessionStorage = createSafeStorage(() => window.sessionStorage);
