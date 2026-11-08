<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    syntax: string;
    description?: string;
  }

  let { syntax, description }: Props = $props();

  let copied = $state(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(syntax);
      copied = true;
      setTimeout(() => (copied = false), 1200);
    } catch {
      copied = false;
    }
  }
</script>

<button
  type="button"
  class="w-full min-h-[44px] py-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-left"
  aria-label={m.chatTriggers.referenceCopyAria({ syntax })}
  onclick={copy}
>
  <code class="font-mono text-xs px-1.5 py-0.5 rounded break-all"
        style="background: {$colorStore.primary}12; color: {$colorStore.text};">{syntax}</code>
  {#if copied}
    <span class="text-sm" style="color: {$colorStore.primary}">{m.common.copied()}</span>
  {:else if description}
    <span class="text-sm min-w-0" style="color: {$colorStore.muted}">{description}</span>
  {/if}
</button>
