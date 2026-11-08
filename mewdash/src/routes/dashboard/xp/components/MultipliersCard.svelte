<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { clientApi, xpApi } from "$lib/api/index.ts";
  import type { XpBoost } from "$lib/api/xp/models/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "./NumberField.svelte";
  import RowActions from "./RowActions.svelte";
  import { errorText, formatDate, idString, type Channel, type Role } from "./xpModel";

  interface Props {
    guildId: bigint;
    channels: Channel[];
    roles: Role[];
    onerror: (message: string) => void;
  }

  let { guildId, channels, roles, onerror }: Props = $props();

  type Entry = { id: string; name: string; multiplier: number };

  let channelEntries: Entry[] = $state([]);
  let roleEntries: Entry[] = $state([]);
  let boosts: XpBoost[] = $state([]);
  let newChannel = $state({ id: "", multiplier: 2 });
  let categories: { id: string; name: string }[] = $state([]);
  let newCategory = $state({ id: "", multiplier: 2 });
  let newRole = $state({ id: "", multiplier: 2 });
  let sheetOpen = $state(false);
  let saving = $state(false);
  let draft = $state(blankBoost());

  const units = $derived([
    { id: "1", name: m.xp.unitMinutes() },
    { id: "60", name: m.xp.unitHours() },
    { id: "1440", name: m.xp.unitDays() }
  ]);

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  const draftMinutes = $derived(draft.amount * Number(draft.unit));
  const draftValid = $derived(draft.name.trim() !== "" && draft.multiplier > 1 && draftMinutes >= 5);

  function blankBoost() {
    return { name: "", multiplier: 2, amount: 2, unit: "60", channelIds: [] as string[], roleIds: [] as string[] };
  }

  async function load() {
    try {
      const [multipliers, boostList] = await Promise.all([xpApi.getMultipliers(guildId), xpApi.getBoosts(guildId)]);
      channelEntries = multipliers.channels.map((x) => ({
        id: idString(x.channelId),
        name: x.name ?? idString(x.channelId),
        multiplier: x.multiplier
      }));
      roleEntries = multipliers.roles.map((x) => ({
        id: idString(x.roleId),
        name: x.name ?? idString(x.roleId),
        multiplier: x.multiplier
      }));
      boosts = boostList.map((x) => ({
        ...x,
        channelIds: x.channelIds.map(idString),
        roleIds: x.roleIds.map(idString)
      }));
    } catch (err) {
      logger.error("Failed to load XP multipliers:", err);
      onerror(errorText(err, m.xp.errorLoadMultipliers()));
    }
  }

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      await load();
    } catch (err) {
      logger.error("Failed to change XP multipliers:", err);
      onerror(errorText(err, m.xp.errorSaveMultiplier()));
    }
  }

  async function addChannel() {
    if (!newChannel.id || newChannel.multiplier <= 0) return;
    await run(() => xpApi.setChannelMultiplier(guildId, BigInt(newChannel.id), newChannel.multiplier));
    newChannel.id = "";
  }

  async function addCategory() {
    if (!newCategory.id || newCategory.multiplier <= 0) return;
    await run(() => xpApi.setChannelMultiplier(guildId, BigInt(newCategory.id), newCategory.multiplier));
    newCategory.id = "";
  }

  async function addRole() {
    if (!newRole.id || newRole.multiplier <= 0) return;
    await run(() => xpApi.setRoleMultiplier(guildId, BigInt(newRole.id), newRole.multiplier));
    newRole.id = "";
  }

  async function createBoost() {
    if (!draftValid || saving) return;
    saving = true;
    try {
      await xpApi.createBoost(guildId, {
        name: draft.name.trim(),
        multiplier: draft.multiplier,
        durationMinutes: draftMinutes,
        channelIds: draft.channelIds.map((x) => BigInt(x)),
        roleIds: draft.roleIds.map((x) => BigInt(x))
      });
      sheetOpen = false;
      await load();
    } catch (err) {
      logger.error("Failed to start an XP boost:", err);
      onerror(errorText(err, m.xp.errorSaveBoost()));
    } finally {
      saving = false;
    }
  }

  function openSheet() {
    draft = blankBoost();
    sheetOpen = true;
  }

  function scope(boost: XpBoost): string {
    const parts: string[] = [];
    if (boost.channelIds.length) parts.push(m.xp.boostChannels({ count: boost.channelIds.length }));
    if (boost.roleIds.length) parts.push(m.xp.boostRoles({ count: boost.roleIds.length }));
    return parts.join(" · ");
  }

  onMount(() => {
    void load();
    clientApi.getCategories(guildId).then(
      (list) => (categories = list.map((x) => ({ id: idString(x.id), name: x.name }))),
      (err) => logger.warn("Failed to load categories:", err)
    );
  });
</script>

{#snippet multiplierRows(entries: Entry[], remove: (id: string) => Promise<unknown>)}
  {#each entries as entry (entry.id)}
    <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0"
         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{entry.name}</span>
      <span class="text-sm font-semibold shrink-0 tabular-nums" style="color: {$colorStore.text}">×{entry.multiplier}</span>
      <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton}
              aria-label={m.xp.removeMultiplierAria({ name: entry.name })} onclick={() => run(() => remove(entry.id))}>
        <i class="fa-solid fa-trash" aria-hidden="true"></i>
      </button>
    </div>
  {/each}
{/snippet}

<PluginCard title={m.xp.cardMultipliersTitle()} alwaysOpen>
  <div class="space-y-2">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.xp.channelMultipliers()}</h4>
    {@render multiplierRows(channelEntries, (id) => xpApi.removeChannelMultiplier(guildId, BigInt(id)))}
    <div class="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
      <div>
        <span class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.channel()}</span>
        <DiscordSelector type="channel" options={channels} selected={newChannel.id || null} ariaLabel={m.common.channel()}
                         onchange={({ selected }) => (newChannel.id = (selected as string) ?? "")} />
      </div>
      <NumberField id="xp-channel-multiplier" label={m.xp.multiplier()} min={0.1} decimal value={newChannel.multiplier}
                   onchange={(value) => (newChannel.multiplier = value ?? 1)} />
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={!newChannel.id} onclick={addChannel}>
        {m.common.add()}
      </button>
    </div>
    {#if categories.length > 0}
      <div class="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
        <div>
          <span class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.category()}</span>
          <DiscordSelector type="custom" customIcon="fa-folder" options={categories} selected={newCategory.id || null}
                           ariaLabel={m.common.category()}
                           onchange={({ selected }) => (newCategory.id = (selected as string) ?? "")} />
        </div>
        <NumberField id="xp-category-multiplier" label={m.xp.multiplier()} min={0.1} decimal value={newCategory.multiplier}
                     onchange={(value) => (newCategory.multiplier = value ?? 1)} />
        <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
                style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                disabled={!newCategory.id} onclick={addCategory}>
          {m.common.add()}
        </button>
      </div>
    {/if}
  </div>

  <div class="space-y-2">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.xp.roleMultipliers()}</h4>
    {@render multiplierRows(roleEntries, (id) => xpApi.removeRoleMultiplier(guildId, BigInt(id)))}
    <div class="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
      <div>
        <span class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.role()}</span>
        <DiscordSelector type="role" options={roles} selected={newRole.id || null} ariaLabel={m.common.role()}
                         onchange={({ selected }) => (newRole.id = (selected as string) ?? "")} />
      </div>
      <NumberField id="xp-role-multiplier" label={m.xp.multiplier()} min={0.1} decimal value={newRole.multiplier}
                   onchange={(value) => (newRole.multiplier = value ?? 1)} />
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={!newRole.id} onclick={addRole}>
        {m.common.add()}
      </button>
    </div>
  </div>

  <div class="space-y-2">
    <div class="flex items-center justify-between gap-3">
      <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.xp.boosts()}</h4>
      <button type="button" class="px-4 rounded-xl min-h-[44px] text-sm font-medium"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={openSheet}>
        {m.xp.newBoost()}
      </button>
    </div>
    {#each boosts as boost (boost.id)}
      <div class="relative flex items-center gap-2 rounded-xl border p-2 pl-3 min-w-0"
           class:opacity-60={!boost.active}
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="grow min-w-0">
          <p class="text-sm font-semibold truncate" style="color: {$colorStore.text}">{boost.name} · ×{boost.multiplier}</p>
          <p class="text-xs truncate" style="color: {$colorStore.muted}">
            {boost.active ? m.xp.boostEnds({ date: formatDate(boost.endTime) }) : m.xp.boostEnded({ date: formatDate(boost.endTime) })}{scope(boost) ? ` · ${scope(boost)}` : ""}
          </p>
        </div>
        <RowActions
          name={boost.name}
          moreLabel={m.xp.moreActions()}
          actions={[{ label: m.xp.cancelBoost(), icon: "fa-trash", run: () => run(() => xpApi.cancelBoost(guildId, boost.id)) }]}
        />
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.noBoosts()}</p>
    {/each}
  </div>
</PluginCard>

{#if sheetOpen}
  <Sheet title={m.xp.newBoost()} onclose={() => (sheetOpen = false)}>
    <SettingField label={m.common.name()} id="xp-boost-name">
      <input id="xp-boost-name" type="text" bind:value={draft.name}
             class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
             style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
    </SettingField>
    <div class="grid gap-4 sm:grid-cols-3">
      <NumberField id="xp-boost-multiplier" label={m.xp.multiplier()} min={1.1} decimal value={draft.multiplier}
                   onchange={(value) => (draft.multiplier = value ?? 2)} />
      <NumberField id="xp-boost-amount" label={m.xp.boostLasts()} min={1} value={draft.amount}
                   onchange={(value) => (draft.amount = value ?? 1)} />
      <SettingField label={m.xp.unit()} id="xp-boost-unit">
        <DiscordSelector id="xp-boost-unit" type="custom" options={units} selected={draft.unit} searchable={false}
                         clearable={false} customIcon="fa-clock"
                         onchange={({ selected }) => (draft.unit = selected as string)} />
      </SettingField>
    </div>
    <SettingField label={m.xp.boostOnlyChannels()} id="xp-boost-channels">
      <DiscordSelector id="xp-boost-channels" type="channel" options={channels} multiple selected={draft.channelIds}
                       placeholder={m.xp.everywhere()}
                       onchange={({ selected }) => (draft.channelIds = (selected as string[]) ?? [])} />
    </SettingField>
    <SettingField label={m.xp.boostOnlyRoles()} id="xp-boost-roles">
      <DiscordSelector id="xp-boost-roles" type="role" options={roles} multiple selected={draft.roleIds}
                       placeholder={m.xp.everyone()}
                       onchange={({ selected }) => (draft.roleIds = (selected as string[]) ?? [])} />
    </SettingField>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={iconButton}
              onclick={() => (sheetOpen = false)}>{m.common.cancel()}</button>
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={!draftValid || saving} onclick={createBoost}>{m.xp.startBoost()}</button>
    {/snippet}
  </Sheet>
{/if}
