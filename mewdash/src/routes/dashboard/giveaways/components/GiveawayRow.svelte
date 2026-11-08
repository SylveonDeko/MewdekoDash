<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { Giveaway } from "$lib/api/index.ts";
  import { GiveawayStatus, PrizeType, entryMethodOf, formatDuration, parseExtraEntries, parseUtc } from "./giveawayModel";

  interface Props {
    giveaway: Giveaway;
    channelName: string;
    entries: number | null;
    onopen: () => void;
    onend: () => void;
    onreroll: () => void;
    onstart: () => void;
    ondelete: () => void;
  }

  let { giveaway, channelName, entries, onopen, onend, onreroll, onstart, ondelete }: Props = $props();

  const status = $derived(giveaway.ended);

  const actions = $derived.by(() => {
    if (status === GiveawayStatus.Draft) {
      return [
        { key: "start", label: m.giveaways.startNow(), icon: "fa-play", run: onstart },
        { key: "delete", label: m.common.delete(), icon: "fa-trash", run: ondelete }
      ];
    }
    if (status === GiveawayStatus.Ended) {
      return [{ key: "reroll", label: m.giveaways.reroll(), icon: "fa-arrows-rotate", run: onreroll }];
    }
    return [{ key: "end", label: m.giveaways.endNow(), icon: "fa-flag", run: onend }];
  });

  const timeText = $derived.by(() => {
    if (status === GiveawayStatus.Draft) return m.giveaways.rowRuns({ time: formatDuration(giveaway.draftDurationSeconds) });
    const date = parseUtc(giveaway.when).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    return status === GiveawayStatus.Ended ? m.giveaways.rowEnded({ date }) : m.giveaways.rowEnds({ date });
  });

  const badges = $derived.by(() => {
    const list: string[] = [];
    const method = entryMethodOf(giveaway);
    list.push(method === "captcha" ? m.common.captcha() : method === "button" ? m.common.button() : m.giveaways.methodReaction());
    if (entries !== null) list.push(m.giveaways.badgeEntries({ count: entries }));
    if (giveaway.restrictTo?.trim()) list.push(m.giveaways.badgeRoles());
    if (Number(giveaway.messageCountReq) > 0) list.push(m.giveaways.badgeMessages({ count: Number(giveaway.messageCountReq) }));
    if (parseExtraEntries(giveaway.extraEntryRoles).length) list.push(m.giveaways.badgeExtra());
    if (giveaway.prizeType === PrizeType.Xp) list.push(m.giveaways.badgeXp({ amount: Number(giveaway.prizeAmount) }));
    if (giveaway.prizeType === PrizeType.Coins) list.push(m.giveaways.badgeCoins({ amount: Number(giveaway.prizeAmount) }));
    return list;
  });

  let menuOpen = $state(false);
  let menuEl: HTMLDivElement | undefined = $state();

  function outside(event: PointerEvent) {
    if (menuOpen && menuEl && !menuEl.contains(event.target as Node)) menuOpen = false;
  }

  function pick(action: () => void) {
    menuOpen = false;
    action();
  }

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

<svelte:window onpointerdown={outside} onkeydown={(e) => { if (e.key === "Escape") menuOpen = false; }} />

<div class="relative flex items-center gap-2 sm:gap-3 rounded-xl border p-2 sm:p-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
  <button type="button" class="grow min-w-0 text-left min-h-[44px] px-1" onclick={onopen}>
    <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{giveaway.item || m.giveaways.untitled()}</span>
    <span class="block text-sm truncate" style="color: {$colorStore.muted}">
      #{channelName} · {giveaway.winners === 1 ? m.giveaways.rowWinnersOne({ count: 1 }) : m.giveaways.rowWinnersOther({ count: giveaway.winners })} · {timeText}
    </span>
    <span class="flex flex-wrap items-center gap-1.5 mt-1">
      {#each badges as badge (badge)}
        <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
      {/each}
    </span>
  </button>

  <div class="sm:hidden shrink-0" bind:this={menuEl}>
    <button
      type="button"
      class="rounded-lg min-h-[44px] min-w-[44px]"
      style={iconButton}
      aria-expanded={menuOpen}
      aria-haspopup="menu"
      aria-label={m.giveaways.rowMoreAria({ name: giveaway.item ?? "" })}
      onclick={() => (menuOpen = !menuOpen)}
    >
      <i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
    </button>
    {#if menuOpen}
      <div class="absolute right-2 top-full mt-1 z-20 rounded-xl border p-1 min-w-[10rem] shadow-lg" style="background: {$colorStore.surface}; border-color: {$colorStore.primary}30;" role="menu">
        {#each actions as action (action.key)}
          <button type="button" role="menuitem" class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3" style="color: {$colorStore.text}" onclick={() => pick(action.run)}>
            <i class="fa-solid {action.icon} w-4" aria-hidden="true"></i>{action.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <div class="hidden sm:flex items-center justify-end gap-2 shrink-0">
    {#each actions as action (action.key)}
      <button type="button" class="flex items-center gap-2 px-4 rounded-lg min-h-[44px]" style={iconButton} onclick={action.run}>
        <i class="fa-solid {action.icon}" aria-hidden="true"></i>
        {action.label}
      </button>
    {/each}
  </div>
</div>
