<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import type { Notify } from "./formsModel";

  interface Props {
    link: string;
    onclose: () => void;
    notify: Notify;
  }

  let { link, onclose, notify }: Props = $props();

  async function copy() {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(link);
        notify(m.forms.pageNotifyLinkCopied());
        onclose();
        return;
      } catch {
        // clipboard unavailable
      }
    }
    try {
      const scratch = document.createElement("textarea");
      scratch.value = link;
      scratch.setAttribute("readonly", "");
      scratch.style.position = "fixed";
      scratch.style.opacity = "0";
      document.body.appendChild(scratch);
      scratch.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(scratch);
      if (copied) {
        notify(m.forms.pageNotifyLinkCopied());
        onclose();
        return;
      }
    } catch {
      // copy failed
    }
    notify(m.forms.pageErrorCopyFailed(), "error");
  }
</script>

<Sheet title={m.forms.pageShareTitle()} {onclose}>
  <SettingField label={m.forms.pageShareLinkLabel()} id="form-share-link">
    <input
      id="form-share-link"
      type="text"
      readonly
      value={link}
      onclick={(e) => e.currentTarget.select()}
      class="w-full p-3 rounded-lg border font-mono text-sm min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    />
  </SettingField>
  <button
    type="button"
    class="w-full flex items-center justify-center gap-2 rounded-xl min-h-[50px] font-medium"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
    onclick={copy}
  >
    <i class="fa-solid fa-copy" aria-hidden="true"></i>
    {m.common.copyToClipboard()}
  </button>
</Sheet>
