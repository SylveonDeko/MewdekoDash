<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { ChatTrigger } from "$lib/api/index.ts";
  import { AppCommandType, TriggerKind, responseSummary } from "./triggerModel";

  interface Props {
    trigger: ChatTrigger;
    onedit: () => void;
    ontoggle: (enabled: boolean) => void;
    onduplicate: () => void;
    onshare: () => void;
    ondelete: () => void;
  }

  let { trigger, onedit, ontoggle, onduplicate, onshare, ondelete }: Props = $props();

  const summary = $derived(responseSummary(trigger.response));

  const badges = $derived.by(() => {
    const list: string[] = [];
    if (trigger.category) list.push(trigger.category);
    if (trigger.applicationCommandType === AppCommandType.Slash) list.push(`/${trigger.applicationCommandName ?? trigger.trigger}`);
    else if (trigger.applicationCommandType > 0) list.push(m.chatTriggers.badgeContextCommand());
    if (trigger.validTriggerTypes & TriggerKind.Button) list.push(m.chatTriggers.kindButton());
    if (trigger.validTriggerTypes & (TriggerKind.Reactions | TriggerKind.ReactionsRemoved)) list.push(m.chatTriggers.badgeReaction());
    if (trigger.eventType > 0) list.push(m.chatTriggers.badgeEvent());
    if (trigger.isRegex) list.push(m.chatTriggers.badgeRegex());
    if (trigger.staffOnly) list.push(m.chatTriggers.badgeStaff());
    if (trigger.cooldownSeconds > 0) list.push(m.chatTriggers.badgeCooldown({ seconds: trigger.cooldownSeconds }));
    if (Number(trigger.currencyCost) > 0) list.push(m.chatTriggers.badgeCost({ amount: Number(trigger.currencyCost) }));
    if (trigger.maxUses != null) list.push(m.chatTriggers.badgeUses({ used: Number(trigger.useCount), max: trigger.maxUses }));
    return list;
  });

  const uses = $derived(Number(trigger.useCount ?? 0));

  let menuOpen = $state(false);
  let menuEl: HTMLDivElement | undefined = $state();

  /**
   * Closes the menu when the pointer goes down anywhere outside it.
   * @param event The pointer event
   */
  function outside(event: PointerEvent) {
    if (menuOpen && menuEl && !menuEl.contains(event.target as Node)) menuOpen = false;
  }

  /**
   * Runs a menu action and closes the menu.
   * @param action The action to run
   */
  function pick(action: () => void) {
    menuOpen = false;
    action();
  }

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

<svelte:window onpointerdown={outside} onkeydown={(e) => { if (e.key === "Escape") menuOpen = false; }} />

<div
  class="relative flex items-center gap-2 sm:gap-3 rounded-xl border p-2 sm:p-3"
  class:opacity-60={trigger.isDisabled}
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <div class="flex items-center gap-2 grow min-w-0">
  <label class="relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer shrink-0">
    <input
      type="checkbox"
      class="sr-only peer"
      checked={!trigger.isDisabled}
      aria-label={trigger.isDisabled ? m.chatTriggers.toggleResume({ name: trigger.trigger ?? "" }) : m.chatTriggers.togglePause({ name: trigger.trigger ?? "" })}
      onchange={(e) => ontoggle(e.currentTarget.checked)}
    >
    <span
      class="w-11 h-6 rounded-full relative block peer-focus-visible:ring-2
             after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full
             after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5"
      style="background: {trigger.isDisabled ? `${$colorStore.primary}30` : $colorStore.primary};"
    ></span>
  </label>

  <button type="button" class="grow min-w-0 text-left min-h-[44px]" onclick={onedit}>
    <span class="block font-mono text-sm font-semibold truncate" style="color: {$colorStore.text}">{trigger.trigger}</span>
    <span class="block text-sm truncate" style="color: {$colorStore.muted}">{summary || m.chatTriggers.rowNoText()}</span>
    <span class="flex flex-wrap items-center gap-1.5 mt-1">
      <span class="text-xs" style="color: {$colorStore.muted}">
        {uses === 1 ? m.chatTriggers.usedOne({ count: 1 }) : m.chatTriggers.usedOther({ count: uses })}
      </span>
      {#each badges as badge (badge)}
        <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
      {/each}
    </span>
  </button>
  </div>

  <div class="sm:hidden shrink-0" bind:this={menuEl}>
    <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-expanded={menuOpen}
            aria-label={m.chatTriggers.rowMoreAria({ name: trigger.trigger ?? "" })} onclick={() => (menuOpen = !menuOpen)}>
      <i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
    </button>
    {#if menuOpen}
      <div class="absolute right-2 top-full mt-1 z-20 rounded-xl border p-1 min-w-[10rem] shadow-lg"
           style="background: {$colorStore.surface}; border-color: {$colorStore.primary}30;">
        <button type="button" class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3" style="color: {$colorStore.text}" onclick={() => pick(onduplicate)}>
          <i class="fa-solid fa-copy w-4" aria-hidden="true"></i>{m.common.duplicate()}
        </button>
        <button type="button" class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3" style="color: {$colorStore.text}" onclick={() => pick(onshare)}>
          <i class="fa-solid fa-share-nodes w-4" aria-hidden="true"></i>{m.chatTriggers.rowShare()}
        </button>
        <button type="button" class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3" style="color: {$colorStore.text}" onclick={() => pick(ondelete)}>
          <i class="fa-solid fa-trash w-4" aria-hidden="true"></i>{m.common.delete()}
        </button>
      </div>
    {/if}
  </div>

  <div class="hidden sm:flex items-center justify-end gap-2 shrink-0">
    <button type="button" class="px-3 rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-label={m.chatTriggers.rowEditAria({ name: trigger.trigger ?? "" })} onclick={onedit}>
      <i class="fa-solid fa-pen" aria-hidden="true"></i>
    </button>
    <button type="button" class="px-3 rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-label={m.chatTriggers.rowDuplicateAria({ name: trigger.trigger ?? "" })} onclick={onduplicate}>
      <i class="fa-solid fa-copy" aria-hidden="true"></i>
    </button>
    <button type="button" class="px-3 rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-label={m.chatTriggers.rowShareAria({ name: trigger.trigger ?? "" })} onclick={onshare}>
      <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
    </button>
    <button type="button" class="px-3 rounded-lg min-h-[44px] min-w-[44px]" style={iconButton} aria-label={m.chatTriggers.rowDeleteAria({ name: trigger.trigger ?? "" })} onclick={ondelete}>
      <i class="fa-solid fa-trash" aria-hidden="true"></i>
    </button>
  </div>
</div>
