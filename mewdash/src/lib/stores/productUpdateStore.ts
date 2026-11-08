import { derived, get, writable } from "svelte/store";
import type { ProductUpdate } from "$lib/content/productUpdates";

/**
 * Updates published since the viewer last acknowledged one. Empty once they have caught up.
 */
export const unseenUpdates = writable<ProductUpdate[]>([]);

/**
 * How many updates the viewer has not acknowledged, for the sidebar's unread dot.
 */
export const unreadUpdateCount = derived(unseenUpdates, ($unseen) => $unseen.length);

/**
 * Whether the updates dialog is showing, and whether it opened straight into the full history.
 *
 * Opening from the sidebar starts on the archive, since the viewer asked to browse rather than
 * being interrupted with something new.
 */
export const updatesDialog = writable<{ open: boolean; archive: boolean }>({
  open: false,
  archive: false
});

/**
 * Opens the dialog on the unseen updates, or on the full history when there are none.
 */
export function openProductUpdates() {
  updatesDialog.set({ open: true, archive: get(unseenUpdates).length === 0 });
}

/**
 * Closes the dialog.
 */
export function closeProductUpdates() {
  updatesDialog.set({ open: false, archive: false });
}
