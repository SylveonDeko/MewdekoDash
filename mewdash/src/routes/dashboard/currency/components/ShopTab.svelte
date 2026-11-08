<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount, untrack } from "svelte";
  import { currencyApi } from "$lib/api/index.ts";
  import { ShopItemType } from "$lib/api/currency/models";
  import type { ShopItem } from "$lib/api/currency/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ShopItemSheet from "./ShopItemSheet.svelte";
  import { formatNumber, type Named, type Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    roles: Named[];
    notify: Notify;
    startNew?: boolean;
  }

  let { guildId, roles, notify, startNew = false }: Props = $props();

  let items = $state<ShopItem[]>([]);
  let loaded = $state(false);
  let editing = $state<{ item: ShopItem | null } | null>(untrack(() => (startNew ? { item: null } : null)));

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      items = (await currencyApi.getShop(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load the shop", err);
      notify(m.currency.notifyLoadFailed(), "error");
    } finally {
      loaded = true;
    }
  }

  function typeLabel(type: ShopItemType): string {
    if (type === ShopItemType.Role) return m.common.role();
    if (type === ShopItemType.Text) return m.common.text();
    if (type === ShopItemType.Design) return m.achievements.cardsTabDesignLabel();
    return m.currency.shopTypeItem();
  }

  async function toggle(item: ShopItem) {
    try {
      await currencyApi.updateShopItem(guildId, item.name, {
        name: item.name,
        description: item.description,
        price: item.price,
        itemType: item.itemType,
        roleId: item.roleId,
        designId: item.designId,
        textContent: item.textContent,
        stock: item.stock,
        maxPerUser: item.maxPerUser,
        requiredRoleId: item.requiredRoleId,
        consumable: item.consumable,
        buyMessage: item.buyMessage,
        useMessage: item.useMessage,
        useOnBuy: item.useOnBuy,
        enabled: !item.enabled,
        sortOrder: item.sortOrder
      });
      await load();
    } catch (err) {
      logger.error("Failed to toggle a shop item", err);
      notify(m.currency.notifyItemUpdateFailed(), "error");
    }
  }

  async function remove(item: ShopItem) {
    const confirmed = await requestConfirmation({
      message: m.currency.confirmDeleteItem({ name: item.name }),
      confirmText: m.common.delete(),
      variant: "danger"
    });
    if (!confirmed) return;
    try {
      await currencyApi.deleteShopItem(guildId, item.name);
      items = items.filter((x) => x.id !== item.id);
      notify(m.currency.notifyItemDeleted({ name: item.name }));
    } catch (err) {
      logger.error("Failed to delete a shop item", err);
      notify(m.currency.notifyItemDeleteFailed(), "error");
    }
  }

  onMount(() => {
    void load();
  });
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.currency.shopTitle()} alwaysOpen>
    {#snippet actions()}
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
        style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        onclick={() => (editing = { item: null })}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.common.addItem()}
      </button>
    {/snippet}

    {#if loaded && items.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.currency.shopEmpty()}</p>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {#each items as item (item.id)}
        <div class="rounded-xl border p-4 space-y-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20; opacity: {item.enabled ? 1 : 0.6};">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h4 class="font-semibold truncate" style="color: {$colorStore.text}">{item.name}</h4>
              <div class="text-sm tabular-nums" style="color: {$colorStore.text}">{formatNumber(item.price)}</div>
            </div>
            <span class="text-xs px-2 py-1 rounded-lg shrink-0" style="background: {$colorStore.primary}15; color: {$colorStore.muted};">{typeLabel(item.itemType)}</span>
          </div>
          {#if item.description}
            <p class="text-sm" style="color: {$colorStore.muted}">{item.description}</p>
          {/if}
          <div class="text-xs space-y-1" style="color: {$colorStore.muted}">
            {#if item.roleName}<div>{m.common.grantsRole({ role: item.roleName })}</div>{/if}
            {#if item.designName}<div>{m.designs.shopGrantsDesign({ name: item.designName })}</div>{/if}
            {#if item.requiredRoleName}<div>{m.currency.shopRequires({ role: item.requiredRoleName })}</div>{/if}
            <div>{item.stock < 0 ? m.currency.shopStockUnlimited() : m.currency.shopStockCount({ count: item.stock })}</div>
            {#if item.maxPerUser > 0}<div>{m.currency.shopLimit({ count: item.maxPerUser })}</div>{/if}
            <div>{m.currency.shopOwnedSpent({ owned: formatNumber(item.owned), spent: formatNumber(item.revenue) })}</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm" style={iconButton} onclick={() => (editing = { item })}>{m.common.edit()}</button>
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm" style={iconButton} onclick={() => toggle(item)}>{item.enabled ? m.common.hide() : m.common.show()}</button>
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm" style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;" onclick={() => remove(item)}>{m.common.delete()}</button>
          </div>
        </div>
      {/each}
    </div>
  </PluginCard>
</div>

{#if editing}
  <ShopItemSheet {guildId} item={editing.item} {roles} {notify} onclose={() => (editing = null)} onsaved={load} />
{/if}
