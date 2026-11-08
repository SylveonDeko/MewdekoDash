<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount, untrack } from "svelte";
  import { currencyApi, designsApi } from "$lib/api/index.ts";
  import { DesignAvailability, DesignTarget } from "$lib/api/designs/models";
  import type { Design } from "$lib/api/designs/models";
  import { ShopItemType } from "$lib/api/currency/models";
  import type { ShopItem, ShopItemRequest } from "$lib/api/currency/models";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "./NumberField.svelte";
  import { idString, type Named, type Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    item: ShopItem | null;
    roles: Named[];
    notify: Notify;
    onclose: () => void;
    onsaved: () => Promise<void>;
  }

  let { guildId, item, roles, notify, onclose, onsaved }: Props = $props();

  const initial = untrack(() => item);

  let form = $state<ShopItemRequest>(
    initial
      ? {
          name: initial.name,
          description: initial.description ?? "",
          price: initial.price,
          itemType: initial.itemType,
          roleId: initial.roleId,
          designId: initial.designId,
          textContent: initial.textContent ?? "",
          stock: initial.stock,
          maxPerUser: initial.maxPerUser,
          requiredRoleId: initial.requiredRoleId,
          consumable: initial.consumable,
          buyMessage: initial.buyMessage ?? "",
          useMessage: initial.useMessage ?? "",
          useOnBuy: initial.useOnBuy,
          enabled: initial.enabled,
          sortOrder: initial.sortOrder
        }
      : {
          name: "",
          description: "",
          price: 100,
          itemType: ShopItemType.Collectible,
          roleId: null,
          designId: null,
          textContent: "",
          stock: -1,
          maxPerUser: 0,
          requiredRoleId: null,
          consumable: false,
          buyMessage: "",
          useMessage: "",
          useOnBuy: false,
          enabled: true,
          sortOrder: 0
        }
  );
  let saving = $state(false);
  let designs = $state<Design[]>([]);
  const editingName = initial?.name ?? null;

  const typeOptions = $derived([
    { id: ShopItemType.Role.toString(), name: m.common.role() },
    { id: ShopItemType.Collectible.toString(), name: m.currency.itemTypeCollectible() },
    { id: ShopItemType.Text.toString(), name: m.common.text() },
    { id: ShopItemType.Design.toString(), name: m.achievements.cardsTabDesignLabel() }
  ]);
  const designOptions = $derived(
    designs
      .filter((d) => d.availability === DesignAvailability.Shop || d.id === form.designId)
      .map((d) => ({
        id: d.id.toString(),
        name: `${d.name} (${d.target === DesignTarget.Rank ? m.xp.cardRankTitle() : m.designs.targetAchievement()})`
      }))
  );
  const customRoles = $derived(roles.filter((r) => r.id !== $currentGuild?.id?.toString()));
  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  onMount(async () => {
    try {
      designs = (await designsApi.list(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load the designs", err);
      notify(m.designs.notifyLoadFailed(), "error");
    }
  });

  function pickDesign(selected: string | string[] | null) {
    const picked = typeof selected === "string" ? designs.find((d) => d.id.toString() === selected) : undefined;
    form.designId = picked?.id ?? null;
    if (picked && !form.name.trim()) form.name = picked.name;
  }

  async function save() {
    if (!form.name.trim()) {
      notify(m.currency.notifyItemNeedsName(), "error");
      return;
    }
    if (form.itemType === ShopItemType.Design && !form.designId) {
      notify(m.designs.notifyItemNeedsDesign(), "error");
      return;
    }
    if (form.itemType === ShopItemType.Role && !form.roleId) {
      notify(m.currency.notifyItemNeedsRole(), "error");
      return;
    }
    saving = true;
    try {
      if (editingName) {
        await currencyApi.updateShopItem(guildId, editingName, form);
        notify(m.currency.notifyItemUpdated({ name: form.name }));
      } else {
        await currencyApi.createShopItem(guildId, form);
        notify(m.currency.notifyItemAdded({ name: form.name }));
      }
      await onsaved();
      onclose();
    } catch (err: any) {
      logger.error("Failed to save a shop item", err);
      notify(err?.message ?? m.currency.notifyItemSaveFailed(), "error");
    } finally {
      saving = false;
    }
  }
</script>

<Sheet title={editingName ? m.currency.shopEditing({ name: editingName }) : m.currency.shopNew()} {onclose} size="lg">
  <SettingField label={m.common.name()} id="shop-name">
    <input id="shop-name" type="text" bind:value={form.name} class="w-full p-3 rounded-lg border min-h-[50px]" style={field} />
  </SettingField>

  <SettingField label={m.common.description()} id="shop-desc">
    <input id="shop-desc" type="text" value={form.description ?? ""} oninput={(e) => (form.description = e.currentTarget.value)} class="w-full p-3 rounded-lg border min-h-[50px]" style={field} />
  </SettingField>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <NumberField id="shop-price" label={m.currency.shopPrice()} value={form.price} onchange={(value) => (form.price = value ?? 0)} />
    <SettingField label={m.common.type()} id="shop-type">
      <DiscordSelector
        id="shop-type"
        type="custom"
        options={typeOptions}
        selected={form.itemType.toString()}
        searchable={false}
        clearable={false}
        customIcon="fa-tag"
        ariaLabel={m.currency.shopTypeAria()}
        onchange={({ selected }) => (form.itemType = Number(selected) as ShopItemType)}
      />
    </SettingField>
  </div>

  {#if form.itemType === ShopItemType.Role}
    <SettingField label={m.currency.shopRoleGranted()} id="shop-role">
      <DiscordSelector
        id="shop-role"
        type="role"
        options={customRoles}
        selected={idString(form.roleId) || null}
        placeholder={m.common.pickRolePlaceholder()}
        ariaLabel={m.currency.shopRoleGranted()}
        onchange={({ selected }) => (form.roleId = selected ? BigInt(selected as string) : null)}
      />
    </SettingField>
  {:else if form.itemType === ShopItemType.Design}
    <SettingField label={m.designs.shopDesign()} id="shop-design">
      <DiscordSelector
        id="shop-design"
        type="custom"
        options={designOptions}
        selected={form.designId ? form.designId.toString() : null}
        clearable={false}
        customIcon="fa-palette"
        placeholder={m.achievements.cardsTabDesignPlaceholder()}
        ariaLabel={m.designs.shopDesign()}
        onchange={({ selected }) => pickDesign(selected)}
      />
    </SettingField>
    {#if designOptions.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.designs.shopDesignNone()}</p>
    {/if}
  {:else if form.itemType === ShopItemType.Text}
    <SettingField label={m.currency.shopText()} id="shop-text">
      <textarea id="shop-text" rows="3" value={form.textContent ?? ""} oninput={(e) => (form.textContent = e.currentTarget.value)} class="w-full p-3 rounded-lg border" style={field}></textarea>
    </SettingField>
  {/if}

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <NumberField id="shop-stock" label={m.currency.shopStock()} hint={m.currency.shopStockHint()} value={form.stock} min={-1} onchange={(value) => (form.stock = value ?? -1)} />
    <NumberField id="shop-max" label={m.currency.shopMaxPerUser()} hint={m.currency.shopMaxPerUserHint()} value={form.maxPerUser} onchange={(value) => (form.maxPerUser = value ?? 0)} />
    <NumberField id="shop-sort" label={m.currency.shopSortOrder()} value={form.sortOrder} min={-1000} onchange={(value) => (form.sortOrder = value ?? 0)} />
  </div>

  <SettingField label={m.common.requiredRole()} id="shop-required-role">
    <DiscordSelector
      id="shop-required-role"
      type="role"
      options={customRoles}
      selected={idString(form.requiredRoleId) || null}
      placeholder={m.currency.shopRequiredRolePlaceholder()}
      ariaLabel={m.common.requiredRole()}
      onchange={({ selected }) => (form.requiredRoleId = selected ? BigInt(selected as string) : null)}
    />
  </SettingField>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
    <ToggleRow checked={form.consumable} title={m.currency.shopConsumable()} subtitle={m.currency.shopConsumableHint()} colors={$colorStore} class="h-full" onchange={(v) => (form.consumable = v)} />
    <ToggleRow checked={form.enabled} title={m.currency.shopVisible()} subtitle={m.currency.shopVisibleHint()} colors={$colorStore} class="h-full" onchange={(v) => (form.enabled = v)} />
    {#if form.consumable}
      <ToggleRow checked={form.useOnBuy} title={m.currency.shopUseOnBuy()} colors={$colorStore} class="h-full" onchange={(v) => (form.useOnBuy = v)} />
    {/if}
  </div>

  <SettingField label={m.currency.shopBuyMessage()} hint={m.currency.shopMessageHint()} id="shop-buy-message">
    <textarea id="shop-buy-message" rows="2" value={form.buyMessage ?? ""} oninput={(e) => (form.buyMessage = e.currentTarget.value)} class="w-full p-3 rounded-lg border" style={field}></textarea>
  </SettingField>
  <SettingField label={m.currency.shopUseMessage()} id="shop-use-message">
    <textarea id="shop-use-message" rows="2" value={form.useMessage ?? ""} oninput={(e) => (form.useMessage = e.currentTarget.value)} class="w-full p-3 rounded-lg border" style={field}></textarea>
  </SettingField>

  {#snippet footer()}
    <button type="button" class="px-4 rounded-lg min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;" onclick={onclose}>
      {m.common.cancel()}
    </button>
    <button type="button" class="px-5 rounded-lg min-h-[44px] font-medium disabled:opacity-50" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={saving} onclick={save}>
      {saving ? m.common.saving() : editingName ? m.common.saveChanges() : m.currency.shopCreate()}
    </button>
  {/snippet}
</Sheet>
