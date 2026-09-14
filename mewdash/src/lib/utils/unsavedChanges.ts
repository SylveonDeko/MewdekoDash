// lib/utils/unsavedChanges.ts
import { onMount } from "svelte";
import { beforeNavigate } from "$app/navigation";
import { requestConfirmation } from "$lib/stores/confirmationStore";

/**
 * Warns before leaving a page while `isDirty()` returns true.
 *
 * In-app navigation is intercepted with the shared ConfirmationModal so the
 * user can stay and save. Tab closes and full reloads use the browser's own
 * beforeunload prompt, which is the only mechanism browsers allow there.
 *
 * Call this once from a page's script block.
 */
export function useUnsavedChangesGuard(isDirty: () => boolean) {
  beforeNavigate((navigation) => {
    if (!isDirty()) return;
    if (navigation.type === "leave") {
      navigation.cancel();
      return;
    }
    navigation.cancel();
    requestConfirmation({
      title: "Discard unsaved changes?",
      message: "You have changes that have not been saved. Leaving this page will lose them.",
      confirmText: "Leave without saving",
      cancelText: "Stay",
      variant: "warning"
    }).then((confirmed) => {
      if (confirmed && navigation.to?.url) {
        window.location.assign(navigation.to.url.href);
      }
    });
  });

  onMount(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDirty()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  });
}
