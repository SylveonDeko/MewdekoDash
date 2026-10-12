// lib/utils/autoSave.svelte.ts
import { onDestroy, onMount } from "svelte";
import { beforeNavigate } from "$app/navigation";
import { logger } from "$lib/logger";

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export interface AutoSaveOptions {
  /** Debounce for `schedule`, in ms. Typing fields want this; toggles use `now`. */
  delay?: number;
  /** Called once per failed save, after the save's own error handling has run. */
  onError?: (err: unknown, key: string) => void;
}

type SaveFn = () => Promise<unknown>;

/**
 * Saves settings as they change instead of behind a Save button.
 *
 * Each save is filed under a key, normally the setting's name. A key has at most one save
 * waiting and one running: scheduling again replaces the waiting save, and a save never
 * starts while the previous one for its key is still running, so writes land in order.
 *
 * - `now(key, fn)` saves straight away. Use it for toggles, selects and colour pickers.
 * - `schedule(key, fn)` saves once the field has been still for `delay` ms. Use it for
 *   text and number inputs, and call `flush(key)` on blur so leaving the field saves it.
 *
 * Navigating away inside the dashboard flushes whatever is waiting. Closing the tab with
 * a save waiting or running raises the browser's leave prompt, since a request started
 * during unload is not guaranteed to arrive.
 *
 * Rolling a field back on failure is the save function's job: catch, restore, rethrow.
 *
 * Call this once from a page's script block.
 */
export function createAutoSave(options: AutoSaveOptions = {}) {
  const delay = options.delay ?? 700;

  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const waiting = new Map<string, SaveFn>();
  const running = new Map<string, Promise<void>>();

  let pendingCount = $state(0);
  let savingCount = $state(0);
  let lastResult = $state<"saved" | "error" | null>(null);
  let failedKey: string | null = null;
  let failedFn: SaveFn | null = null;
  let savedTimer: ReturnType<typeof setTimeout> | undefined;
  let destroyed = false;

  function syncPending() {
    pendingCount = waiting.size;
  }

  async function run(key: string, fn: SaveFn): Promise<void> {
    const previous = running.get(key);
    const task = (async () => {
      if (previous) await previous.catch(() => {});
      savingCount++;
      try {
        await fn();
        if (failedKey === key) {
          failedKey = null;
          failedFn = null;
        }
        if (!failedKey) markSaved();
      } catch (err) {
        logger.error(`Auto-save failed for "${key}":`, err);
        failedKey = key;
        failedFn = fn;
        lastResult = "error";
        options.onError?.(err, key);
      } finally {
        savingCount--;
      }
    })();
    running.set(key, task);
    try {
      await task;
    } finally {
      if (running.get(key) === task) running.delete(key);
    }
  }

  function markSaved() {
    lastResult = "saved";
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => {
      if (lastResult === "saved") lastResult = null;
    }, 2500);
  }

  function cancel(key: string) {
    const timer = timers.get(key);
    if (timer) clearTimeout(timer);
    timers.delete(key);
    waiting.delete(key);
    syncPending();
  }

  /** Saves immediately, replacing anything waiting under the same key. */
  function now(key: string, fn: SaveFn): Promise<void> {
    cancel(key);
    return run(key, fn);
  }

  /** Saves after the key has gone `ms` without another call. */
  function schedule(key: string, fn: SaveFn, ms = delay) {
    if (destroyed) return;
    const timer = timers.get(key);
    if (timer) clearTimeout(timer);
    waiting.set(key, fn);
    syncPending();
    timers.set(
      key,
      setTimeout(() => {
        flush(key);
      }, ms)
    );
  }

  /** Runs waiting saves now: one key, or all of them. */
  function flush(key?: string): Promise<void> {
    const keys = key === undefined ? [...waiting.keys()] : waiting.has(key) ? [key] : [];
    return Promise.all(
      keys.map((k) => {
        const fn = waiting.get(k)!;
        cancel(k);
        return run(k, fn);
      })
    ).then(() => {});
  }

  /** Repeats the save that last failed. */
  function retry(): Promise<void> {
    if (!failedKey || !failedFn) return Promise.resolve();
    return now(failedKey, failedFn);
  }

  beforeNavigate(() => {
    void flush();
  });

  onMount(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (waiting.size === 0 && savingCount === 0) return;
      void flush();
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  });

  onDestroy(() => {
    void flush();
    destroyed = true;
    clearTimeout(savedTimer);
  });

  return {
    now,
    schedule,
    flush,
    cancel,
    retry,
    /** True while anything is waiting or running. */
    get busy() {
      return pendingCount > 0 || savingCount > 0;
    },
    get status(): SaveStatus {
      if (savingCount > 0) return "saving";
      if (pendingCount > 0) return "pending";
      return lastResult ?? "idle";
    }
  };
}

export type AutoSave = ReturnType<typeof createAutoSave>;
