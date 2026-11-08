<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    token: string;
    onthumbnail: () => void;
    onimage: () => void;
    ondismiss: () => void;
  }

  let { token, onthumbnail, onimage, ondismiss }: Props = $props();
</script>

<div
  class="mt-2 flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm"
  style="background: {$colorStore.selectedSurface}; border-color: {$colorStore.selectedBorder}; color: {$colorStore.text};"
  role="status"
>
  <span class="min-w-0 grow break-all">{m.embedbuilder.editorImageChip({ placeholder: token })}</span>
  <button
    type="button"
    class="min-h-[44px] rounded-lg border px-3 font-medium"
    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    onclick={onthumbnail}
  >
    {m.embedbuilder.editorMoveToThumbnail()}
  </button>
  <button
    type="button"
    class="min-h-[44px] rounded-lg border px-3 font-medium"
    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    onclick={onimage}
  >
    {m.embedbuilder.editorMoveToImage()}
  </button>
  <button
    type="button"
    class="min-h-[44px] min-w-[44px] rounded-lg"
    style="color: {$colorStore.muted};"
    aria-label={m.common.dismiss()}
    onclick={ondismiss}
  >
    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
  </button>
</div>
