<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    title: string;
    subtitle?: string;
    badges?: string[];
    enabled?: boolean;
    name: string;
    onedit: () => void;
    ondelete: () => void;
    ontoggle?: (enabled: boolean) => void;
    onup?: () => void;
    ondown?: () => void;
  }

  let { title, subtitle = "", badges = [], enabled, name, onedit, ondelete, ontoggle, onup, ondown }: Props = $props();

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

<div
  class="flex flex-wrap items-center gap-2 sm:gap-3 rounded-xl border p-2 sm:p-3"
  class:opacity-60={enabled === false}
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <div class="flex items-center gap-2 grow min-w-0">
    {#if enabled !== undefined}
      <label class="relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer shrink-0">
        <input
          type="checkbox"
          class="sr-only peer"
          checked={enabled}
          aria-label={enabled ? m.channelMessages.rowDisableAria({ name }) : m.channelMessages.rowEnableAria({ name })}
          onchange={(e) => ontoggle?.(e.currentTarget.checked)}
        >
        <span
          class="w-11 h-6 rounded-full relative block peer-focus-visible:ring-2
                 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full
                 after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5"
          style="background: {enabled ? $colorStore.primary : `${$colorStore.primary}30`};"
        ></span>
      </label>
    {/if}

    <button type="button" class="grow min-w-0 text-left min-h-[44px]" onclick={onedit}>
      <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{title}</span>
      {#if subtitle}
        <span class="block text-xs truncate" style="color: {$colorStore.muted}">{subtitle}</span>
      {/if}
      {#if badges.length}
        <span class="flex flex-wrap items-center gap-1.5 mt-1">
          {#each badges as badge (badge)}
            <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
          {/each}
        </span>
      {/if}
    </button>
  </div>

  <div class="flex items-center justify-end gap-2 shrink-0 w-full sm:w-auto">
    {#if onup}
      <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-label={m.channelMessages.rowMoveUpAria({ name })} onclick={onup}>
        <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
      </button>
    {/if}
    {#if ondown}
      <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-label={m.channelMessages.rowMoveDownAria({ name })} onclick={ondown}>
        <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
      </button>
    {/if}
    <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-label={m.channelMessages.rowEditAria({ name })} onclick={onedit}>
      <i class="fa-solid fa-pen" aria-hidden="true"></i>
    </button>
    <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-label={m.channelMessages.rowDeleteAria({ name })} onclick={ondelete}>
      <i class="fa-solid fa-trash" aria-hidden="true"></i>
    </button>
  </div>
</div>
