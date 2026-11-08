<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { currencyApi } from "$lib/api/index.ts";
  import type { CurrencySetup, EconomyConfig } from "$lib/api/currency/models";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import DurationField from "./DurationField.svelte";
  import NumberField from "./NumberField.svelte";
  import PresetPicker from "./PresetPicker.svelte";
  import { matchPreset } from "./presets";
  import {
    DECIMAL_SETTINGS,
    formatDuration,
    formatNumber,
    winTotal,
    type BoolSetting,
    type NumberSetting,
    type Notify
  } from "./currencyModel";

  interface Props {
    guildId: bigint;
    autoSave: AutoSave;
    notify: Notify;
  }

  let { guildId, autoSave, notify }: Props = $props();

  let config = $state<EconomyConfig | null>(null);
  let setup = $state<CurrencySetup | null>(null);
  let saved: EconomyConfig | null = null;
  let resetting = $state(false);

  interface Field {
    key: NumberSetting;
    label: string;
    hint?: string;
    min?: number;
    seconds?: boolean;
  }

  interface Section {
    id: string;
    title: string;
    toggle: BoolSetting;
    summary: string;
    fields: Field[];
  }

  interface Group {
    title: string;
    sections: Section[];
  }

  const PAIRS: Partial<Record<NumberSetting, [NumberSetting, NumberSetting]>> = {
    minBet: ["minBet", "maxBet"],
    maxBet: ["minBet", "maxBet"],
    workMinReward: ["workMinReward", "workMaxReward"],
    workMaxReward: ["workMinReward", "workMaxReward"],
    crimeMinReward: ["crimeMinReward", "crimeMaxReward"],
    crimeMaxReward: ["crimeMinReward", "crimeMaxReward"],
    crimeFineMin: ["crimeFineMin", "crimeFineMax"],
    crimeFineMax: ["crimeFineMin", "crimeFineMax"]
  };

  function pairInvalid(source: EconomyConfig, [low, high]: [NumberSetting, NumberSetting]): boolean {
    if (high === "maxBet" && source.maxBet === 0) return false;
    return source[low] > source[high];
  }

  const errors = $derived.by(() => {
    const result: Partial<Record<NumberSetting, string>> = {};
    if (!config) return result;
    for (const key of Object.keys(PAIRS) as NumberSetting[]) {
      const pair = PAIRS[key]!;
      if (key === pair[1] && pairInvalid(config, pair)) result[key] = m.currency.errMinAboveMax();
    }
    return result;
  });

  const preset = $derived(config ? matchPreset(config) : null);

  const groups = $derived.by<Group[]>(() => {
    if (!config) return [];
    const c = config;
    return [
      {
        title: m.currency.configEarning(),
        sections: [
          {
            id: "work",
            title: m.currency.configWork(),
            toggle: "workEnabled",
            summary: m.currency.sumWork({
              min: formatNumber(c.workMinReward),
              max: formatNumber(c.workMaxReward),
              every: formatDuration(c.workCooldownSeconds)
            }),
            fields: [
              { key: "workMinReward", label: m.currency.cfgWorkMinimum() },
              { key: "workMaxReward", label: m.currency.cfgWorkMaximum() },
              { key: "workCooldownSeconds", label: m.currency.cfgWorkCooldownSeconds(), seconds: true }
            ]
          },
          {
            id: "crime",
            title: m.currency.configCrime(),
            toggle: "crimeEnabled",
            summary: m.currency.sumCrime({
              min: formatNumber(c.crimeMinReward),
              max: formatNumber(c.crimeMaxReward),
              chance: c.crimeSuccessChance,
              every: formatDuration(c.crimeCooldownSeconds)
            }),
            fields: [
              { key: "crimeMinReward", label: m.currency.cfgCrimeMinimum() },
              { key: "crimeMaxReward", label: m.currency.cfgCrimeMaximum() },
              { key: "crimeSuccessChance", label: m.currency.cfgCrimeSuccessChance() },
              { key: "crimeFineMin", label: m.currency.cfgCrimeFineMinimum() },
              { key: "crimeFineMax", label: m.currency.cfgCrimeFineMaximum() },
              { key: "crimeCooldownSeconds", label: m.currency.cfgCrimeCooldownSeconds(), seconds: true }
            ]
          }
        ]
      },
      {
        title: m.common.games(),
        sections: [
          {
            id: "betting",
            title: m.currency.configBetting(),
            toggle: "gamblingEnabled",
            summary: m.currency.sumBetting({ min: formatNumber(c.minBet), payout: c.payoutMultiplier }),
            fields: [
              { key: "minBet", label: m.currency.cfgMinimumBet(), min: 1 },
              { key: "maxBet", label: m.currency.cfgMaximumBet(), hint: m.currency.cfghint0ForUnlimitedACeilingStopsOneLuck() },
              { key: "payoutMultiplier", label: m.currency.cfgPayoutMultiplier(), hint: m.currency.cfghintScalesWinningsOnlyNeverTheReturned() },
              { key: "gameCooldownSeconds", label: m.currency.cfgGameCooldownSeconds(), seconds: true },
              { key: "lossLimitPerDay", label: m.currency.cfgDailyLossLimit(), hint: m.currency.cfghint0ToDisableCutsAUserOffAfterLosin() }
            ]
          }
        ]
      },
      {
        title: m.currency.configRisk(),
        sections: [
          {
            id: "robbery",
            title: m.currency.configRobbery(),
            toggle: "robEnabled",
            summary: m.currency.sumRobbery({
              chance: c.robSuccessChance,
              steal: c.robMaxStealPercent,
              every: formatDuration(c.robCooldownSeconds)
            }),
            fields: [
              { key: "robSuccessChance", label: m.currency.cfgSuccessChance() },
              { key: "robMaxStealPercent", label: m.currency.cfgMaximumSteal(), hint: m.currency.cfghintShareOfTheTargetSWalletASuccessT(), min: 1 },
              { key: "robFinePercent", label: m.currency.cfgFailureFine(), hint: m.currency.cfghintShareOfTheRobberSWalletDestroyedO() },
              { key: "robMinimumWallet", label: m.currency.cfgProtectedBelow(), hint: m.currency.cfghintTargetsHoldingLessThanThisCannotBe() },
              { key: "robCooldownSeconds", label: m.currency.cfgRobberyCooldownSeconds(), seconds: true }
            ]
          }
        ]
      },
      {
        title: m.currency.configMoney(),
        sections: [
          {
            id: "bank",
            title: m.currency.configBank(),
            toggle: "bankEnabled",
            summary: m.currency.sumBank({
              capacity: c.bankCapacity > 0 ? formatNumber(c.bankCapacity) : m.currency.sumUnlimited(),
              interest: c.bankInterestPercent
            }),
            fields: [
              { key: "bankCapacity", label: m.currency.cfgBankCapacity(), hint: m.currency.shopMaxPerUserHint() },
              { key: "bankInterestPercent", label: m.currency.cfgInterest(), hint: m.currency.cfghintPaidPerIntervalOnTheBankedBalance() },
              { key: "bankInterestHours", label: m.currency.cfgInterestIntervalHours(), min: 1 }
            ]
          },
          {
            id: "transfers",
            title: m.currency.configTransfers(),
            toggle: "payEnabled",
            summary: m.currency.sumTransfers({ tax: c.payTaxPercent, minimum: formatNumber(c.payMinimum) }),
            fields: [
              { key: "payTaxPercent", label: m.currency.cfgTransferTax() },
              { key: "payCooldownSeconds", label: m.currency.cfgTransferCooldownSeconds(), seconds: true },
              { key: "payMinimum", label: m.currency.cfgMinimumTransfer(), min: 1 }
            ]
          }
        ]
      }
    ];
  });

  const dailyStreakFields = $derived<Field[]>([
    { key: "dailyStreakBonus", label: m.currency.cfgBonusPerDay(), hint: m.currency.cfghintAddedPerConsecutiveDayClaimed() },
    { key: "dailyStreakMaxBonus", label: m.currency.cfgMaximumBonus(), hint: m.currency.cfghint0ForUncapped() }
  ]);

  async function load() {
    try {
      [config, setup] = await Promise.all([currencyApi.getConfig(guildId), currencyApi.getSetup(guildId)]);
      saved = { ...config };
    } catch (err) {
      logger.error("Failed to load the economy config", err);
      notify(m.currency.configLoadFailed(), "error");
    }
  }

  function toggle(key: BoolSetting, value: boolean) {
    if (!config) return;
    config[key] = value;
    void autoSave.now(key, async () => {
      try {
        const updated = await currencyApi.updateConfig(guildId, { [key]: value });
        if (saved) saved[key] = updated[key];
      } catch (err) {
        if (config && saved) config[key] = saved[key];
        throw err;
      }
    });
  }

  function setNumber(key: NumberSetting, value: number | null, min: number) {
    if (!config || value === null || value < min) return;
    config[key] = value;
    autoSave.schedule(key, async () => {
      if (!config) return;
      const pair = PAIRS[key];
      if (pair && pairInvalid(config, pair)) return;
      const keys = pair ? [...new Set(pair)] : [key];
      const sent = Object.fromEntries(keys.map((k) => [k, config![k]])) as Partial<Record<NumberSetting, number>>;
      const updated = await currencyApi.updateConfig(guildId, sent);
      for (const k of keys) {
        if (saved) saved[k] = updated[k];
        if (config && config[k] === sent[k] && updated[k] !== sent[k]) config[k] = updated[k];
      }
    });
  }

  function setSetup(key: "rewardAmount" | "rewardTimeoutSeconds", value: number) {
    if (!setup) return;
    setup[key] = value;
    autoSave.schedule(key, async () => {
      await currencyApi.updateSetup(guildId, { [key]: value });
    });
  }

  async function reset() {
    const confirmed = await requestConfirmation({
      message: m.currency.confirmReset(),
      confirmText: m.common.reset(),
      variant: "danger"
    });
    if (!confirmed) return;
    resetting = true;
    try {
      await autoSave.flush();
      config = await currencyApi.resetConfig(guildId);
      saved = { ...config };
      notify(m.currency.notifyResetDone());
    } catch (err) {
      logger.error("Failed to reset the economy config", err);
      notify(m.currency.notifyResetFailed(), "error");
    } finally {
      resetting = false;
    }
  }

  onMount(() => {
    void load();
  });
</script>

{#snippet fieldGrid(fields: Field[])}
  {#if config}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {#each fields as field (field.key)}
        <NumberField
          id="cfg-{field.key}"
          label={field.label}
          hint={field.seconds ? formatDuration(config[field.key]) : field.hint}
          value={config[field.key]}
          min={field.min ?? 0}
          decimal={DECIMAL_SETTINGS.has(field.key)}
          error={errors[field.key]}
          onchange={(value) => setNumber(field.key, value, field.min ?? 0)}
        />
      {/each}
    </div>
  {/if}
{/snippet}

{#if config && setup}
  <div class="space-y-6 min-w-0" onfocusout={() => void autoSave.flush()}>
    <PluginCard title={m.currency.presetTitle()} alwaysOpen>
      <PresetPicker
        {guildId}
        current={preset}
        confirm
        {notify}
        onapplied={(updated) => {
          config = updated;
          saved = { ...updated };
        }}
      />
    </PluginCard>

    {#each groups as group, index (group.title)}
      <section class="space-y-4">
        <h3 class="text-sm font-semibold uppercase tracking-wide" style="color: {$colorStore.muted}">{group.title}</h3>

        {#if index === 0}
          <PluginCard title={m.currency.setupDaily()} note={m.currency.sumDaily({ amount: formatNumber(setup.rewardAmount), every: formatDuration(setup.rewardTimeoutSeconds) })} alwaysOpen>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberField
                id="cfg-reward-amount"
                label={m.currency.setupRewardAmount()}
                value={setup.rewardAmount}
                min={1}
                onchange={(value) => value !== null && setSetup("rewardAmount", value)}
              />
              <SettingField label={m.currency.setupCooldown()} id="cfg-reward-timeout-hours">
                <DurationField id="cfg-reward-timeout" seconds={setup.rewardTimeoutSeconds} onchange={(value) => setSetup("rewardTimeoutSeconds", value)} />
              </SettingField>
            </div>
            <ToggleRow
              checked={config.dailyStreakEnabled}
              title={m.currency.cfgEnableStreaks()}
              colors={$colorStore}
              onchange={(value) => toggle("dailyStreakEnabled", value)}
            />
            {#if config.dailyStreakEnabled}
              {@render fieldGrid(dailyStreakFields)}
            {/if}
          </PluginCard>
        {/if}

        {#each group.sections as section (section.id)}
          <PluginCard title={section.title} note={section.summary} enabled={config[section.toggle]} onToggle={(value) => toggle(section.toggle, value)}>
            {@render fieldGrid(section.fields)}
            {#if section.id === "betting"}
              <p class="text-sm" style="color: {$colorStore.muted}">
                {m.currency.bettingExample({ stake: formatNumber(config.minBet), total: formatNumber(winTotal(config.minBet, 2, config.payoutMultiplier)) })}
              </p>
            {/if}
          </PluginCard>
        {/each}
      </section>
    {/each}

    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      disabled={resetting}
      onclick={reset}
    >
      {m.currency.configReset()}
    </button>
  </div>
{/if}
