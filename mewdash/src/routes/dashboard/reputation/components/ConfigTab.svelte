<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { reputationApi } from "$lib/api/index.ts";
  import type { RepConfig } from "$lib/api/reputation/models";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "./NumberField.svelte";
  import { idString, type Named } from "./repModel";

  interface Props {
    guildId: bigint;
    config: RepConfig;
    channels: Named[];
    autoSave: AutoSave;
  }

  let { guildId, config, channels, autoSave }: Props = $props();

  type NumberKey = "defaultCooldownMinutes" | "dailyLimit" | "minAccountAgeDays" | "minServerMembershipHours" | "minMessageCount";
  type ToggleKey = "enableNegativeRep" | "enableAnonymous";

  let saved = untrack(() => ({ ...config }));

  const numberSetters: Record<NumberKey, { min: number; set: (value: number) => Promise<unknown> }> = {
    defaultCooldownMinutes: { min: 1, set: (value) => reputationApi.setDefaultCooldown(guildId, value) },
    dailyLimit: { min: 1, set: (value) => reputationApi.setDailyLimit(guildId, value) },
    minAccountAgeDays: { min: 0, set: (value) => reputationApi.setMinAccountAge(guildId, value) },
    minServerMembershipHours: { min: 0, set: (value) => reputationApi.setMinServerMembership(guildId, value) },
    minMessageCount: { min: 0, set: (value) => reputationApi.setMinMessageCount(guildId, value) }
  };

  const toggleSetters: Record<ToggleKey, (value: boolean) => Promise<unknown>> = {
    enableNegativeRep: (value) => reputationApi.setNegativeReputation(guildId, value),
    enableAnonymous: (value) => reputationApi.setAnonymousReputation(guildId, value)
  };

  const numberFields = $derived<Array<{ key: NumberKey; label: string }>>([
    { key: "defaultCooldownMinutes", label: m.common.cooldownMinutes() },
    { key: "dailyLimit", label: m.common.dailyLimit() },
    { key: "minAccountAgeDays", label: m.common.minAccountAgeDays() },
    { key: "minServerMembershipHours", label: m.reputation.minServerTimeLabel() },
    { key: "minMessageCount", label: m.reputation.minMessagesLabel() }
  ]);

  const decayTypes = $derived([
    { id: "daily", name: m.common.daily() },
    { id: "weekly", name: m.reputation.decayTypeWeekly() },
    { id: "monthly", name: m.reputation.decayTypeMonthly() },
    { id: "fixed", name: m.reputation.decayTypeFixed() },
    { id: "percentage", name: m.reputation.decayTypePercentage() }
  ]);

  function setNumber(key: NumberKey, value: number | null) {
    const { min, set } = numberSetters[key];
    if (value === null || value < min) return;
    config[key] = value;
    autoSave.schedule(key, async () => {
      try {
        await set(value);
        saved[key] = value;
      } catch (err) {
        if (config[key] === value) config[key] = saved[key];
        throw err;
      }
    });
  }

  function setToggle(key: ToggleKey, value: boolean) {
    config[key] = value;
    void autoSave.now(key, async () => {
      try {
        await toggleSetters[key](value);
        saved[key] = value;
      } catch (err) {
        config[key] = saved[key];
        throw err;
      }
    });
  }

  function setWeekly(value: number | null) {
    config.weeklyLimit = value;
    autoSave.schedule("weeklyLimit", async () => {
      try {
        await reputationApi.setWeeklyLimit(guildId, value);
        saved.weeklyLimit = value;
      } catch (err) {
        if (config.weeklyLimit === value) config.weeklyLimit = saved.weeklyLimit;
        throw err;
      }
    });
  }

  function setChannel(value: string | null) {
    const next = value ? BigInt(value) : null;
    config.notificationChannel = next;
    void autoSave.now("notificationChannel", async () => {
      try {
        await reputationApi.setNotificationChannel(guildId, next);
        saved.notificationChannel = next;
      } catch (err) {
        config.notificationChannel = saved.notificationChannel;
        throw err;
      }
    });
  }

  function saveDecay(changes: Partial<Pick<RepConfig, "enableDecay" | "decayType" | "decayAmount" | "decayInactiveDays">>, now: boolean) {
    Object.assign(config, changes);
    const snapshot = {
      enableDecay: config.enableDecay,
      decayType: config.decayType,
      decayAmount: config.decayAmount,
      decayInactiveDays: config.decayInactiveDays
    };
    if (snapshot.decayAmount < 1 || snapshot.decayAmount > 100 || snapshot.decayInactiveDays < 1 || snapshot.decayInactiveDays > 365) return;
    const run = async () => {
      try {
        await reputationApi.setDecay(guildId, {
          enabled: snapshot.enableDecay,
          type: snapshot.decayType,
          amount: snapshot.decayAmount,
          inactiveDays: snapshot.decayInactiveDays
        });
        Object.assign(saved, snapshot);
      } catch (err) {
        if (now) {
          config.enableDecay = saved.enableDecay;
          config.decayType = saved.decayType;
        }
        throw err;
      }
    };
    if (now) void autoSave.now("decay", run);
    else autoSave.schedule("decay", run);
  }
</script>

<div class="space-y-4 min-w-0" onfocusout={() => void autoSave.flush()}>
  <PluginCard title={m.reputation.configHeading()} alwaysOpen>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {#each numberFields as field (field.key)}
        <NumberField
          id="rep-{field.key}"
          label={field.label}
          value={config[field.key]}
          min={numberSetters[field.key].min}
          onchange={(value) => setNumber(field.key, value)}
        />
      {/each}
      <NumberField
        id="rep-weekly"
        label={m.reputation.weeklyLimitLabel()}
        value={config.weeklyLimit}
        min={1}
        nullable
        placeholder={m.common.none()}
        onchange={setWeekly}
      />
    </div>
    <SettingField label={m.reputation.notificationChannelLabel()} id="rep-channel">
      <DiscordSelector
        id="rep-channel"
        type="channel"
        options={channels}
        selected={idString(config.notificationChannel) || null}
        placeholder={m.reputation.notificationChannelPlaceholder()}
        ariaLabel={m.reputation.notificationChannelLabel()}
        onchange={({ selected }) => setChannel((selected as string) || null)}
      />
    </SettingField>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <ToggleRow checked={config.enableNegativeRep} title={m.common.allowNegativeReputation()} colors={$colorStore} class="h-full" onchange={(v) => setToggle("enableNegativeRep", v)} />
      <ToggleRow checked={config.enableAnonymous} title={m.reputation.anonymousAria()} colors={$colorStore} class="h-full" onchange={(v) => setToggle("enableAnonymous", v)} />
    </div>
  </PluginCard>

  <PluginCard title={m.reputation.decayTitle()} enabled={config.enableDecay} onToggle={(value) => saveDecay({ enableDecay: value }, true)}>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <SettingField label={m.common.schedule()} id="rep-decay-type">
        <DiscordSelector
          id="rep-decay-type"
          type="custom"
          options={decayTypes}
          selected={config.decayType}
          searchable={false}
          clearable={false}
          customIcon="fa-clock"
          ariaLabel={m.common.schedule()}
          onchange={({ selected }) => saveDecay({ decayType: String(selected) }, true)}
        />
      </SettingField>
      <NumberField id="rep-decay-amount" label={m.reputation.decayAmount()} value={config.decayAmount} min={1} max={100} onchange={(value) => saveDecay({ decayAmount: value ?? 1 }, false)} />
      <NumberField id="rep-decay-days" label={m.reputation.decayInactiveDays()} value={config.decayInactiveDays} min={1} max={365} onchange={(value) => saveDecay({ decayInactiveDays: value ?? 1 }, false)} />
    </div>
  </PluginCard>
</div>
