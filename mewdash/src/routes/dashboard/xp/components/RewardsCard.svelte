<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { xpApi } from "$lib/api/index.ts";
  import type { GuildXpSetting } from "$lib/api/xp/models/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "./NumberField.svelte";
  import { errorText, formatNumber, idString, type Role, type SettingsPatch } from "./xpModel";

  interface Props {
    guildId: bigint;
    settings: GuildXpSetting;
    roles: Role[];
    onpatch: SettingsPatch;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, settings, roles, onpatch, onerror, onsuccess }: Props = $props();

  type RoleReward = { id: number; level: number; roleId: string; roleName: string };
  type CurrencyReward = { id: number; level: number; amount: number };

  let roleRewards: RoleReward[] = $state([]);
  let currencyRewards: CurrencyReward[] = $state([]);
  let newRole = $state({ level: 1, roleId: "" });
  let newCurrency = $state({ level: 1, amount: 100 });
  let syncing = $state(false);

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      const [roleList, currencyList] = await Promise.all([
        xpApi.getXpRoleRewards(guildId),
        xpApi.getXpCurrencyRewards(guildId)
      ]);
      roleRewards = roleList
        .map((x) => ({ id: x.id, level: x.level, roleId: idString(x.roleId), roleName: x.roleName }))
        .sort((a, b) => a.level - b.level);
      currencyRewards = currencyList
        .map((x) => ({ id: x.id, level: x.level, amount: x.amount }))
        .sort((a, b) => a.level - b.level);
    } catch (err) {
      logger.error("Failed to load XP rewards:", err);
      onerror(errorText(err, m.xp.errorLoadRewards()));
    }
  }

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      await load();
    } catch (err) {
      logger.error("Failed to change XP rewards:", err);
      onerror(errorText(err, m.xp.errorSaveReward()));
    }
  }

  async function addRole() {
    if (!newRole.roleId || newRole.level < 1) return;
    await run(() => xpApi.addXpRoleReward(guildId, newRole.level, BigInt(newRole.roleId)));
    newRole = { level: newRole.level + 1, roleId: "" };
  }

  async function addCurrency() {
    if (newCurrency.amount < 1 || newCurrency.level < 1) return;
    await run(() => xpApi.addXpCurrencyReward(guildId, newCurrency.level, newCurrency.amount));
    newCurrency = { level: newCurrency.level + 1, amount: newCurrency.amount };
  }

  async function sync() {
    syncing = true;
    try {
      await xpApi.syncRoles(guildId);
      onsuccess(m.xp.syncStarted());
    } catch (err) {
      logger.error("Failed to start the role sync:", err);
      onerror(errorText(err, m.xp.errorSync()));
    } finally {
      syncing = false;
    }
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.xp.cardRewardsTitle()} alwaysOpen>
  <SettingToggle
    id="xp-exclusive"
    label={m.xp.exclusiveRoles()}
    checked={settings.exclusiveRoleRewards}
    onchange={(on) => onpatch({ exclusiveRoleRewards: on }, "now")}
  />

  <div class="space-y-2">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.xp.roleRewards()}</h4>
    {#each roleRewards as reward (reward.id)}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0"
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <span class="text-sm font-semibold shrink-0 tabular-nums" style="color: {$colorStore.text}">{m.xp.levelValue({ level: reward.level })}</span>
        <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.muted}">{reward.roleName}</span>
        <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton}
                aria-label={m.xp.removeRewardAria({ level: reward.level })}
                onclick={() => run(() => xpApi.removeXpRoleReward(guildId, reward.level))}>
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.noRoleRewards()}</p>
    {/each}

    <div class="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end">
      <NumberField id="xp-role-level" label={m.common.level()} min={1} value={newRole.level}
                   onchange={(value) => (newRole.level = value ?? 1)} />
      <div>
        <span class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.role()}</span>
        <DiscordSelector type="role" options={roles} selected={newRole.roleId || null}
                         ariaLabel={m.common.role()}
                         onchange={({ selected }) => (newRole.roleId = (selected as string) ?? "")} />
      </div>
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={!newRole.roleId} onclick={addRole}>
        {m.common.add()}
      </button>
    </div>

    <button type="button" class="px-4 rounded-xl min-h-[44px] text-sm font-medium disabled:opacity-50"
            style={iconButton} disabled={syncing || roleRewards.length === 0} onclick={sync}>
      <i class="fa-solid {syncing ? 'fa-spinner fa-spin' : 'fa-rotate'} mr-2" aria-hidden="true"></i>{m.xp.syncRoles()}
    </button>
  </div>

  <div class="space-y-2">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.xp.currencyRewards()}</h4>
    {#each currencyRewards as reward (reward.id)}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0"
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <span class="text-sm font-semibold shrink-0 tabular-nums" style="color: {$colorStore.text}">{m.xp.levelValue({ level: reward.level })}</span>
        <span class="grow min-w-0 truncate text-sm tabular-nums" style="color: {$colorStore.muted}">{formatNumber(reward.amount)}</span>
        <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton}
                aria-label={m.xp.removeRewardAria({ level: reward.level })}
                onclick={() => run(() => xpApi.removeXpCurrencyReward(guildId, reward.level))}>
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.noCurrencyRewards()}</p>
    {/each}

    <div class="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end">
      <NumberField id="xp-currency-level" label={m.common.level()} min={1} value={newCurrency.level}
                   onchange={(value) => (newCurrency.level = value ?? 1)} />
      <NumberField id="xp-currency-amount" label={m.common.amount()} min={1} value={newCurrency.amount}
                   onchange={(value) => (newCurrency.amount = value ?? 1)} />
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={addCurrency}>
        {m.common.add()}
      </button>
    </div>
  </div>
</PluginCard>
