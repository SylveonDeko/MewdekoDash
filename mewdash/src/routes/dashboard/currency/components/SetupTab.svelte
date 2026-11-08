<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { currencyApi } from "$lib/api/index.ts";
  import type { CurrencySetup } from "$lib/api/currency/models";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import DurationField from "./DurationField.svelte";
  import NumberField from "./NumberField.svelte";
  import PresetPicker from "./PresetPicker.svelte";
  import { matchPreset, type PresetId } from "./presets";
  import type { Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    emojis: GuildEmojiInfo[];
    autoSave: AutoSave;
    notify: Notify;
    onaddshopitem: () => void;
    oncomplete: () => void;
  }

  let { guildId, emojis, autoSave, notify, onaddshopitem, oncomplete }: Props = $props();

  let setup = $state<CurrencySetup | null>(null);
  let preset = $state<PresetId | null>(null);
  let finishing = $state(false);

  async function load() {
    try {
      const [loadedSetup, config] = await Promise.all([currencyApi.getSetup(guildId), currencyApi.getConfig(guildId)]);
      setup = loadedSetup;
      preset = matchPreset(config);
      if (!loadedSetup.configured && loadedSetup.rewardAmount === 0) {
        save("rewardAmount", 100);
        if (loadedSetup.rewardTimeoutSeconds === 0) save("rewardTimeoutSeconds", 86_400);
      }
    } catch (err) {
      logger.error("Failed to load the currency setup", err);
      notify(m.currency.configLoadFailed(), "error");
    }
  }

  function save<K extends "currencyEmoji" | "rewardAmount" | "rewardTimeoutSeconds">(key: K, value: CurrencySetup[K], immediate = false) {
    if (!setup) return;
    setup[key] = value;
    const run = async () => {
      await currencyApi.updateSetup(guildId, { [key]: value });
    };
    if (immediate) void autoSave.now(key, run);
    else autoSave.schedule(key, run);
  }

  async function finish() {
    finishing = true;
    try {
      await autoSave.flush();
      await currencyApi.updateSetup(guildId, { setupComplete: true });
      oncomplete();
    } catch (err: any) {
      logger.error("Failed to finish the currency setup", err);
      notify(err?.message ?? m.currency.notifySaveFailed(), "error");
    } finally {
      finishing = false;
    }
  }

  onMount(() => {
    void load();
  });

  const secondary = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

{#if setup}
  <div class="space-y-4 min-w-0" onfocusout={() => void autoSave.flush()}>
    <PluginCard title={m.currency.setupLook()} note="1/3" alwaysOpen>
      <SettingField label={m.currency.setupEmoji()} id="setup-emoji">
        <EmojiPicker
          id="setup-emoji"
          guildEmojis={emojis}
          selected={setup.currencyEmoji || null}
          onchange={({ selected }) => save("currencyEmoji", typeof selected === "string" ? selected : "", true)}
        />
      </SettingField>
    </PluginCard>

    <PluginCard title={m.currency.setupDaily()} note="2/3" alwaysOpen>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NumberField
          id="setup-reward"
          label={m.currency.setupRewardAmount()}
          value={setup.rewardAmount}
          min={1}
          onchange={(value) => value !== null && save("rewardAmount", value)}
        />
        <SettingField label={m.currency.setupCooldown()} id="setup-cooldown-hours">
          <DurationField id="setup-cooldown" seconds={setup.rewardTimeoutSeconds} onchange={(value) => save("rewardTimeoutSeconds", value)} />
        </SettingField>
      </div>
    </PluginCard>

    <PluginCard title={m.currency.presetTitle()} note="3/3" alwaysOpen>
      <PresetPicker {guildId} current={preset} {notify} onapplied={(_, id) => (preset = id)} />
    </PluginCard>

    <div class="flex flex-col sm:flex-row gap-3">
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium flex items-center justify-center gap-2" style={secondary} onclick={onaddshopitem}>
        <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.currency.setupAddShopItem()}
      </button>
      <button
        type="button"
        class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={finishing}
        onclick={finish}
      >
        {m.common.done()}
      </button>
    </div>
  </div>
{/if}
