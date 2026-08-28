import { writable } from "svelte/store";

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
      title: "Confirm Action",
      confirmText: "Confirm",
      cancelText: "Cancel",
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
