import { writable } from "svelte/store";
import { m } from "$lib/i18n";

export interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

interface PendingConfirmation extends Required<ConfirmationOptions> {
  resolve: (confirmed: boolean) => void;
}

export const pendingConfirmation = writable<PendingConfirmation | null>(null);

const queue: PendingConfirmation[] = [];
let activeConfirmation: PendingConfirmation | null = null;

function showNext() {
  activeConfirmation = queue.shift() ?? null;
  pendingConfirmation.set(activeConfirmation);
}

export function requestConfirmation(options: ConfirmationOptions): Promise<boolean> {
  return new Promise((resolve) => {
    queue.push({
      title: m.common.confirmAction(),
      confirmText: m.common.confirm(),
      cancelText: m.common.cancel(),
      variant: "danger",
      ...options,
      resolve
    });

    if (!activeConfirmation) showNext();
  });
}

export function resolveConfirmation(confirmed: boolean) {
  const request = activeConfirmation;
  if (!request) return;

  activeConfirmation = null;
  pendingConfirmation.set(null);
  request.resolve(confirmed);
  if (queue.length > 0) queueMicrotask(showNext);
}
