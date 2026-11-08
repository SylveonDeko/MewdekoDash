<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { clientApi, currencyApi } from "$lib/api/index.ts";
  import type { InventoryItem, LeaderboardEntry, ShopItem } from "$lib/api/currency/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import NumberField from "./NumberField.svelte";
  import { formatNumber, formatPercent, idString, type Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
  }

  let { guildId, notify }: Props = $props();

  const pageSize = 25;

  let entries = $state<LeaderboardEntry[]>([]);
  let total = $state(0);
  let page = $state(0);
  let members = $state<Array<{ id: string; name: string }>>([]);
  let shop = $state<ShopItem[]>([]);
  let busy = $state(false);

  let adjustUser = $state<string | null>(null);
  let adjustAmount = $state(0);
  let adjustReason = $state("");

  let inventoryUser = $state<string | null>(null);
  let inventory = $state<InventoryItem[]>([]);
  let itemName = $state<string | null>(null);
  let itemAmount = $state(1);
  let spawn = $state(false);

  const pages = $derived(Math.max(1, Math.ceil(total / pageSize)));
  const itemOptions = $derived(shop.map((x) => ({ id: x.name, name: x.name })));
  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const solid = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const outline = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function loadPage(next: number) {
    page = Math.max(0, next);
    try {
      const data = await currencyApi.getLeaderboard(guildId, page, pageSize);
      entries = data.entries;
      total = data.total;
    } catch (err) {
      logger.error("Failed to load the leaderboard", err);
      notify(m.common.failedToLoadLeaderboard(), "error");
    }
  }

  async function adjust() {
    if (!adjustUser) {
      notify(m.currency.notifyPickMember(), "error");
      return;
    }
    if (!adjustAmount) {
      notify(m.currency.notifyAmountZero(), "error");
      return;
    }
    busy = true;
    try {
      const result = await currencyApi.adjustBalance(guildId, {
        userId: BigInt(adjustUser),
        amount: adjustAmount,
        reason: adjustReason.trim() || null
      });
      notify(m.currency.notifyAdjusted({ wallet: formatNumber(result.wallet) }));
      adjustUser = null;
      adjustAmount = 0;
      adjustReason = "";
      await loadPage(page);
    } catch (err) {
      logger.error("Failed to adjust a balance", err);
      notify(m.currency.notifyAdjustFailed(), "error");
    } finally {
      busy = false;
    }
  }

  async function loadInventory(user: string | null) {
    inventoryUser = user;
    inventory = [];
    if (!user) return;
    try {
      inventory = (await currencyApi.getInventory(guildId, BigInt(user))) ?? [];
    } catch (err) {
      logger.error("Failed to load an inventory", err);
      notify(m.currency.inventoryFailed(), "error");
    }
  }

  async function give() {
    if (!inventoryUser || !itemName || itemAmount < 1) return;
    busy = true;
    try {
      await currencyApi.giveInventoryItem(guildId, BigInt(inventoryUser), { itemName, amount: itemAmount }, spawn);
      await loadInventory(inventoryUser);
    } catch (err: any) {
      logger.error("Failed to give an item", err);
      notify(err?.message ?? m.currency.inventoryFailed(), "error");
    } finally {
      busy = false;
    }
  }

  async function take(name: string, amount: number) {
    if (!inventoryUser) return;
    busy = true;
    try {
      await currencyApi.takeInventoryItem(guildId, BigInt(inventoryUser), { itemName: name, amount });
      await loadInventory(inventoryUser);
    } catch (err: any) {
      logger.error("Failed to take an item", err);
      notify(err?.message ?? m.currency.inventoryFailed(), "error");
    } finally {
      busy = false;
    }
  }

  onMount(() => {
    void loadPage(0);
    currencyApi.getShop(guildId).then((items) => (shop = items ?? [])).catch(() => {});
    clientApi
      .getMembers(guildId)
      .then((list) => {
        members = list
          .map((x) => ({ id: idString(x.id), name: x.username ?? idString(x.id) }))
          .sort((a, b) => a.name.localeCompare(b.name));
      })
      .catch((err) => logger.error("Failed to load members", err));
  });
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.currency.adjustTitle()} alwaysOpen>
    <DiscordSelector
      type="user"
      options={members}
      selected={adjustUser}
      searchable
      placeholder={m.currency.adjustMemberPlaceholder()}
      ariaLabel={m.common.member()}
      onchange={({ selected }) => (adjustUser = (selected as string) ?? null)}
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
      <div>
        <label for="adj-amount" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.amount()}</label>
        <input id="adj-amount" type="number" inputmode="numeric" bind:value={adjustAmount} class="w-full p-3 rounded-lg border min-h-[50px]" style={field} />
      </div>
      <div>
        <label for="adj-reason" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.reason()}</label>
        <input id="adj-reason" type="text" bind:value={adjustReason} placeholder={m.currency.adjustReasonPlaceholder()} class="w-full p-3 rounded-lg border min-h-[50px]" style={field} />
      </div>
    </div>
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={solid} disabled={busy} onclick={adjust}>{m.common.apply()}</button>
  </PluginCard>

  <PluginCard title={m.currency.inventoryTitle()} alwaysOpen>
    <DiscordSelector
      type="user"
      options={members}
      selected={inventoryUser}
      searchable
      placeholder={m.currency.adjustMemberPlaceholder()}
      ariaLabel={m.common.member()}
      onchange={({ selected }) => void loadInventory((selected as string) ?? null)}
    />
    {#if inventoryUser}
      {#each inventory as entry (entry.id)}
        <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{entry.name}</span>
          <span class="text-sm tabular-nums shrink-0" style="color: {$colorStore.muted}">x{formatNumber(entry.quantity)}</span>
          <button type="button" class="px-3 rounded-lg min-h-[44px] text-sm shrink-0 disabled:opacity-50" style={outline} disabled={busy} onclick={() => take(entry.name, 1)}>{m.currency.inventoryTakeOne()}</button>
          <button type="button" class="px-3 rounded-lg min-h-[44px] text-sm shrink-0 disabled:opacity-50" style={outline} disabled={busy} onclick={() => take(entry.name, entry.quantity)}>{m.currency.inventoryTakeAll()}</button>
        </div>
      {:else}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.currency.inventoryEmpty()}</p>
      {/each}

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div class="sm:col-span-2">
          <DiscordSelector
            type="custom"
            options={itemOptions}
            selected={itemName}
            customIcon="fa-box"
            placeholder={m.currency.inventoryItemPlaceholder()}
            ariaLabel={m.currency.inventoryItemPlaceholder()}
            onchange={({ selected }) => (itemName = (selected as string) ?? null)}
          />
        </div>
        <NumberField id="inv-amount" label={m.common.amount()} value={itemAmount} min={1} onchange={(value) => (itemAmount = value ?? 1)} />
      </div>
      <ToggleRow checked={spawn} title={m.currency.inventorySpawn()} colors={$colorStore} onchange={(v) => (spawn = v)} />
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={solid} disabled={busy || !itemName} onclick={give}>{m.currency.inventoryGive()}</button>
    {/if}
  </PluginCard>

  <PluginCard title={m.currency.boardTitle()} note={m.currency.statHolders({ count: formatNumber(total) })} alwaysOpen>
    {#if entries.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.currency.boardEmpty()}</p>
    {:else}
      <ol class="space-y-2">
        {#each entries as entry (idString(entry.userId))}
          <li class="flex items-center gap-3 p-3 rounded-lg min-w-0" style="background: {$colorStore.primary}08;">
            <span class="w-8 text-center text-sm font-semibold shrink-0" style="color: {$colorStore.muted}">{entry.rank}</span>
            {#if entry.avatarUrl}
              <img src={entry.avatarUrl} alt="" class="w-9 h-9 rounded-full shrink-0" />
            {:else}
              <span class="w-9 h-9 rounded-full shrink-0" style="background: {$colorStore.primary}20;"></span>
            {/if}
            <div class="grow min-w-0">
              <div class="truncate text-sm font-medium" style="color: {$colorStore.text}">{entry.username ?? m.common.userFallback({ id: idString(entry.userId) })}</div>
              <div class="text-xs truncate" style="color: {$colorStore.muted}">
                {m.currency.boardColWallet()} {formatNumber(entry.wallet)} · {m.currency.configBank()} {formatNumber(entry.bank)} · {formatPercent(entry.shareOfSupply)}
              </div>
            </div>
            <span class="text-sm font-semibold tabular-nums shrink-0" style="color: {$colorStore.text}">{formatNumber(entry.netWorth)}</span>
          </li>
        {/each}
      </ol>
      <div class="flex items-center justify-between gap-3">
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm disabled:opacity-50" style={outline} disabled={page === 0} onclick={() => loadPage(page - 1)}>{m.common.previous()}</button>
        <span class="text-sm" style="color: {$colorStore.muted}">{m.common.pageOfTotal({ page: page + 1, total: pages })}</span>
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm disabled:opacity-50" style={outline} disabled={page + 1 >= pages} onclick={() => loadPage(page + 1)}>{m.common.next()}</button>
      </div>
    {/if}
  </PluginCard>
</div>
