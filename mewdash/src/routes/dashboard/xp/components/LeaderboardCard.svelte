<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { xpApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "./NumberField.svelte";
  import RowActions from "./RowActions.svelte";
  import { errorText, formatNumber, idString } from "./xpModel";

  interface Props {
    guildId: bigint;
    onerror: (message: string) => void;
  }

  let { guildId, onerror }: Props = $props();

  const PAGE_SIZE = 10;

  type Entry = {
    userId: string;
    username: string;
    avatarUrl: string | null;
    level: number;
    totalXp: number;
    rank: number;
  };

  let entries: Entry[] = $state([]);
  let page = $state(1);
  let loaded = $state(false);
  let mode: "add" | "set" | "reset" | null = $state(null);
  let target: Entry | null = $state(null);
  let amount = $state(100);
  let resetBonus = $state(false);
  let saving = $state(false);

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      const board = await xpApi.getXpLeaderboard(guildId, page, PAGE_SIZE);
      entries = board.map((x) => ({
        userId: idString(x.userId),
        username: x.username,
        avatarUrl: x.avatarUrl,
        level: x.level,
        totalXp: x.totalXp,
        rank: x.rank
      }));
    } catch (err) {
      logger.error("Failed to load the XP leaderboard:", err);
      onerror(errorText(err, m.xp.errorLoadLeaderboard()));
    } finally {
      loaded = true;
    }
  }

  function go(next: number) {
    if (next < 1) return;
    page = next;
    void load();
  }

  function open(entry: Entry, next: "add" | "set" | "reset") {
    target = entry;
    mode = next;
    amount = next === "set" ? entry.totalXp : 100;
    resetBonus = false;
  }

  function close() {
    mode = null;
    target = null;
  }

  async function apply() {
    if (!target || !mode || saving) return;
    saving = true;
    const userId = BigInt(target.userId);
    try {
      if (mode === "add") await xpApi.addUserXp(guildId, userId, amount);
      else if (mode === "set") await xpApi.setUserXp(guildId, userId, amount);
      else await xpApi.resetUserXp(guildId, userId, resetBonus);
      close();
      await load();
    } catch (err) {
      logger.error("Failed to change a member's XP:", err);
      onerror(errorText(err, m.xp.errorChangeXp()));
    } finally {
      saving = false;
    }
  }

  const sheetTitle = $derived(
    mode === "add" ? m.xp.addXp() : mode === "set" ? m.xp.setXp() : m.xp.resetXp()
  );

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.xp.cardLeaderboardTitle()} alwaysOpen>
  {#each entries as entry (entry.userId)}
    <div class="relative flex items-center gap-2 sm:gap-3 rounded-xl border p-2 pl-3 min-w-0"
         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <span class="w-8 shrink-0 text-center text-sm font-semibold tabular-nums" style="color: {$colorStore.text}">{entry.rank}</span>
      {#if entry.avatarUrl}
        <img src={entry.avatarUrl} alt="" class="w-9 h-9 rounded-full shrink-0" loading="lazy" />
      {/if}
      <div class="grow min-w-0">
        <p class="text-sm font-semibold truncate" style="color: {$colorStore.text}">{entry.username}</p>
        <p class="text-xs truncate tabular-nums" style="color: {$colorStore.muted}">
          {m.xp.levelValue({ level: entry.level })} · {formatNumber(entry.totalXp)} XP
        </p>
      </div>
      <RowActions
        name={entry.username}
        moreLabel={m.xp.moreActions()}
        actions={[
          { label: m.xp.addXp(), icon: "fa-plus", run: () => open(entry, "add") },
          { label: m.xp.setXp(), icon: "fa-pen", run: () => open(entry, "set") },
          { label: m.xp.resetXp(), icon: "fa-rotate-left", run: () => open(entry, "reset") }
        ]}
      />
    </div>
  {:else}
    {#if loaded}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.noLeaderboard()}</p>
    {/if}
  {/each}

  <div class="flex items-center justify-between gap-3">
    <button type="button" class="px-4 rounded-xl min-h-[44px] disabled:opacity-50" style={iconButton}
            disabled={page <= 1} aria-label={m.common.previous()} onclick={() => go(page - 1)}>
      <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
    </button>
    <span class="text-sm tabular-nums" style="color: {$colorStore.muted}">{page}</span>
    <button type="button" class="px-4 rounded-xl min-h-[44px] disabled:opacity-50" style={iconButton}
            disabled={entries.length < PAGE_SIZE} aria-label={m.common.next()} onclick={() => go(page + 1)}>
      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
    </button>
  </div>
</PluginCard>

{#if mode && target}
  <Sheet title="{sheetTitle}: {target.username}" onclose={close}>
    {#if mode === "reset"}
      <SettingToggle id="xp-reset-bonus" label={m.xp.alsoResetBonus()} checked={resetBonus}
                     onchange={(on) => (resetBonus = on)} />
    {:else}
      <NumberField id="xp-adjust-amount" label={mode === "add" ? m.xp.xpToAdd() : m.xp.newTotalXp()}
                   min={mode === "add" ? 1 : 0} value={amount} onchange={(value) => (amount = value ?? 0)} />
    {/if}
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={iconButton} onclick={close}>
        {m.common.cancel()}
      </button>
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={saving || (mode === "add" && amount < 1)} onclick={apply}>
        {sheetTitle}
      </button>
    {/snippet}
  </Sheet>
{/if}
