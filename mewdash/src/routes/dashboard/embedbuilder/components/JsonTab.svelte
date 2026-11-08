<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    jsonText: string;
    jsonParseError: string;
    onrefresh: () => void;
    onapply: () => void;
  }

  let { jsonText = $bindable(), jsonParseError, onrefresh, onapply }: Props = $props();
</script>

<div class="space-y-4">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <h3 class="text-lg font-semibold" style="color: {$colorStore.text};">{m.embedbuilder.fullscreenJsonHeading()}</h3>
    <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
      <button
        type="button"
        aria-label={m.embedbuilder.pageJsonRefreshAria()}
        class="min-h-[44px] px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        onclick={onrefresh}
      >
        <i class="fa-solid fa-rotate" aria-hidden="true"></i>
        {m.embedbuilder.pageJsonRefresh()}
      </button>
      <button
        type="button"
        aria-label={m.embedbuilder.pageJsonApplyAria()}
        class="min-h-[44px] px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        onclick={onapply}
      >
        <i class="fa-solid fa-check" aria-hidden="true"></i>
        {m.embedbuilder.pageJsonApply()}
      </button>
    </div>
  </div>

  <textarea
    rows="20"
    spellcheck="false"
    class="w-full px-3 py-2 rounded-lg border font-mono text-xs resize-y"
    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    placeholder={m.embedbuilder.fullscreenJsonPlaceholder()}
    aria-label={m.embedbuilder.fullscreenJsonHeading()}
    bind:value={jsonText}
  ></textarea>

  {#if jsonParseError}
    <p class="text-sm" style="color: #ED4245;">{jsonParseError}</p>
  {/if}
</div>
