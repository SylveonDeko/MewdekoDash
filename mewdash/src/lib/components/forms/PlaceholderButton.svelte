<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    onclick: (event: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
    expanded?: boolean;
  }

  let { onclick, expanded = false }: Props = $props();
</script>

<button
  type="button"
  class="min-h-[44px] px-3 rounded-lg text-sm font-medium inline-flex items-center gap-2"
  style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
  aria-expanded={expanded}
  {onclick}
>
  <span aria-hidden="true" class="font-mono">%</span>
  {m.embedbuilder.editorInsertPlaceholder()}
</button>
