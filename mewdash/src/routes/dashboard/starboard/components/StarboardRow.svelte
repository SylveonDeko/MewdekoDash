<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { Starboard } from "$lib/api/index.ts";
  import { lockState, splitEmotes } from "./starboardModel";

  interface Props {
    starboard: Starboard;
    channelName: string;
    onedit: () => void;
    ontoggle: (enabled: boolean) => void;
    ondelete: () => void;
  }

  let { starboard, channelName, onedit, ontoggle, ondelete }: Props = $props();

  const emotes = $derived(splitEmotes(starboard.emote));
  const locked = $derived(lockState(starboard) !== null);

  /**
   * Shows a custom emote as its name.
   * @param emote The stored emote
   */
  function label(emote: string): string {
    const match = /^<a?:([^:]+):\d+>$/.exec(emote);
    return match ? `:${match[1]}:` : emote;
  }

  const badges = $derived.by(() => {
    const list: string[] = [];
    if (locked) list.push(m.starboard.badgeLocked());
    if (starboard.postDesign) list.push(m.starboard.badgeDesign());
    if (starboard.autoStarChannels) list.push(m.starboard.badgeAutoStar());
    if (starboard.allowedRoles) list.push(m.starboard.badgeRoles());
    return list;
  });

  let menuOpen = $state(false);
  let menuEl: HTMLDivElement | undefined = $state();

  /**
   * Closes the menu when the pointer goes down anywhere outside it.
   * @param event The pointer event
   */
  function outside(event: PointerEvent) {
    if (menuOpen && menuEl && !menuEl.contains(event.target as Node)) menuOpen = false;
  }

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

<svelte:window onpointerdown={outside} />

<div
  class="relative flex items-center gap-2 sm:gap-3 rounded-xl border p-2 sm:p-3"
  class:opacity-60={!starboard.enabled}
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <div class="flex items-center gap-2 grow min-w-0">
    <label class="relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer shrink-0">
      <input
        type="checkbox"
        class="sr-only peer"
        checked={starboard.enabled}
        aria-label={starboard.enabled ? m.starboard.toggleDisable({ channel: channelName }) : m.starboard.toggleEnable({ channel: channelName })}
        onchange={(e) => ontoggle(e.currentTarget.checked)}
      >
      <span
        class="w-11 h-6 rounded-full relative block peer-focus-visible:ring-2
               after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full
               after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5"
        style="background: {starboard.enabled ? $colorStore.primary : `${$colorStore.primary}30`};"
      ></span>
    </label>

    <button type="button" class="grow min-w-0 text-left min-h-[44px]" onclick={onedit}>
      <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">#{channelName}</span>
      <span class="flex flex-wrap items-center gap-1.5 mt-1">
        <span class="text-xs" style="color: {$colorStore.muted}">
          {emotes.map(label).join(" ")} · {m.starboard.rowThreshold({ count: starboard.threshold })}
        </span>
        {#each badges as badge (badge)}
          <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
        {/each}
      </span>
    </button>
  </div>

  <div class="sm:hidden shrink-0">
    <button
      type="button"
      class="rounded-lg min-h-[44px] min-w-[44px]"
      style={iconButton}
      aria-expanded={menuOpen}
      aria-label={m.starboard.rowMoreAria({ channel: channelName })}
      onclick={() => (menuOpen = !menuOpen)}
    >
      <i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
    </button>
    {#if menuOpen}
      <div
        bind:this={menuEl}
        class="absolute right-2 top-full mt-1 z-20 rounded-xl border p-1 min-w-[10rem] shadow-lg"
        style="background: {$colorStore.surface}; border-color: {$colorStore.primary}30;"
      >
        <button type="button" class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3" style="color: {$colorStore.text}" onclick={() => { menuOpen = false; onedit(); }}>
          <i class="fa-solid fa-pen w-4" aria-hidden="true"></i>{m.common.edit()}
        </button>
        <button type="button" class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3" style="color: {$colorStore.text}" onclick={() => { menuOpen = false; ondelete(); }}>
          <i class="fa-solid fa-trash w-4" aria-hidden="true"></i>{m.common.delete()}
        </button>
      </div>
    {/if}
  </div>

  <div class="hidden sm:flex items-center justify-end gap-2 shrink-0">
    <button type="button" class="px-3 rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-label={m.starboard.rowEditAria({ channel: channelName })} onclick={onedit}>
      <i class="fa-solid fa-pen" aria-hidden="true"></i>
    </button>
    <button type="button" class="px-3 rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-label={m.starboard.rowDeleteAria({ channel: channelName })} onclick={ondelete}>
      <i class="fa-solid fa-trash" aria-hidden="true"></i>
    </button>
  </div>
</div>
