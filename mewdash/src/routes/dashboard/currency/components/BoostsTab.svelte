<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { currencyApi } from "$lib/api/index.ts";
  import type { EconomyBoost } from "$lib/api/currency/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import BoostSheet from "./BoostSheet.svelte";
  import { formatMinutes, formatSigned, utcDate, type Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
  }

  let { guildId, notify }: Props = $props();

  let boosts = $state<EconomyBoost[]>([]);
  let loaded = $state(false);
  let editing = $state<{ boost: EconomyBoost | null } | null>(null);

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  const scheduleLabels = $derived([
    m.currency.boostScheduleOnce(),
    m.common.daily(),
    m.currency.boostScheduleWeekly(),
    m.currency.boostScheduleMonthly()
  ]);

  async function load() {
    try {
      boosts = (await currencyApi.getBoosts(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load boosts", err);
      notify(m.currency.notifyLoadFailed(), "error");
    } finally {
      loaded = true;
    }
  }

  async function toggle(boost: EconomyBoost) {
    try {
      await currencyApi.updateBoost(guildId, boost.name, {
        name: boost.name,
        percentChange: boost.percentChange,
        commands: boost.commands,
        scheduleType: boost.scheduleType,
        startsAt: utcDate(boost.startsAt).toISOString(),
        durationMinutes: boost.durationMinutes,
        enabled: !boost.enabled
      });
      await load();
    } catch (err) {
      logger.error("Failed to toggle a boost", err);
      notify(m.currency.boostSaveFailed(), "error");
    }
  }

  async function remove(boost: EconomyBoost) {
    const confirmed = await requestConfirmation({
      message: m.currency.confirmDeleteItem({ name: boost.name }),
      confirmText: m.common.delete(),
      variant: "danger"
    });
    if (!confirmed) return;
    try {
      await currencyApi.deleteBoost(guildId, boost.name);
      boosts = boosts.filter((x) => x.id !== boost.id);
    } catch (err) {
      logger.error("Failed to delete a boost", err);
      notify(m.currency.boostDeleteFailed(), "error");
    }
  }

  onMount(() => {
    void load();
  });
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.currency.tabBoosts()} alwaysOpen>
    {#snippet actions()}
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
        style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        onclick={() => (editing = { boost: null })}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.currency.boostNew()}
      </button>
    {/snippet}

    {#if loaded && boosts.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.currency.boostsEmpty()}</p>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {#each boosts as boost (boost.id)}
        <div class="rounded-xl border p-4 space-y-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20; opacity: {boost.enabled ? 1 : 0.6};">
          <div class="flex items-start justify-between gap-3">
            <h4 class="font-semibold truncate" style="color: {$colorStore.text}">{boost.name}</h4>
            <span class="text-sm font-semibold tabular-nums shrink-0" style="color: {$colorStore.text}">{formatSigned(boost.percentChange)}%</span>
          </div>
          <div class="text-xs space-y-1" style="color: {$colorStore.muted}">
            <div>{scheduleLabels[boost.scheduleType] ?? ""} · {formatMinutes(boost.durationMinutes)} · {utcDate(boost.startsAt).toLocaleString()}</div>
            <div class="truncate">{boost.commands ? boost.commands.split(",").join(", ") : m.currency.boostEverything()}</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm" style={iconButton} onclick={() => (editing = { boost })}>{m.common.edit()}</button>
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm" style={iconButton} onclick={() => toggle(boost)}>{boost.enabled ? m.common.disable() : m.common.enable()}</button>
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm" style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;" onclick={() => remove(boost)}>{m.common.delete()}</button>
          </div>
        </div>
      {/each}
    </div>
  </PluginCard>
</div>

{#if editing}
  <BoostSheet {guildId} boost={editing.boost} {notify} onclose={() => (editing = null)} onsaved={load} />
{/if}
