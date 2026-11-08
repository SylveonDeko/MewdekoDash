<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import {
    countingApi,
    CountingPattern,
    type CountingConfigResponse,
    type UpdateCountingConfigRequest
  } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { DiscordUser } from "$lib/types/discord";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import NumberField from "./NumberField.svelte";
  import { splitIds, type Named, type Notify } from "./countingModel";

  interface Props {
    guildId: bigint;
    channelId: bigint;
    roles: Named[];
    emojis: GuildEmojiInfo[];
    user?: DiscordUser;
    autoSave: AutoSave;
    notify: Notify;
  }

  let { guildId, channelId, roles, emojis, user, autoSave, notify }: Props = $props();

  interface Settings {
    allowRepeatedUsers: boolean;
    cooldown: number;
    requiredRoles: string[];
    bannedRoles: string[];
    maxNumber: number;
    resetOnError: boolean;
    deleteWrongMessages: boolean;
    pattern: CountingPattern;
    numberBase: number;
    successEmote: string;
    errorEmote: string;
    enableAchievements: boolean;
    enableCompetitions: boolean;
    successMessage: string;
    failureMessage: string;
    milestoneMessage: string;
  }
  type Key = keyof Settings;

  let settings = $state<Settings | null>(null);
  let saved: Settings | null = null;
  let milestones = $state<number[]>([]);
  let newMilestone = $state<number | null>(null);
  let savingMilestones = $state(false);

  const patterns = $derived([
    { id: String(CountingPattern.Normal), name: m.counting.patternSequential() },
    { id: String(CountingPattern.Roman), name: m.counting.patternRoman() },
    { id: String(CountingPattern.Binary), name: m.counting.patternBinary() },
    { id: String(CountingPattern.Hexadecimal), name: m.counting.patternHexadecimal() },
    { id: String(CountingPattern.Words), name: m.counting.patternWords() },
    { id: String(CountingPattern.Fibonacci), name: m.counting.patternFibonacci() },
    { id: String(CountingPattern.Primes), name: m.counting.patternPrimes() }
  ]);

  const placeholders = $derived([
    { category: m.counting.pageTitle(), name: "%number%", description: m.counting.placeholderNumber() },
    { category: m.counting.pageTitle(), name: "%expected%", description: m.counting.placeholderExpected() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user%", description: m.placeholders.user() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.mention%", description: m.placeholders.userMention() },
    { category: m.features.categoryServer(), name: "%server%", description: m.placeholders.server() },
    { category: m.features.categoryServer(), name: "%channel%", description: m.placeholders.channel() }
  ]);

  const TYPED = new Set<Key>(["cooldown", "maxNumber", "numberBase", "successMessage", "failureMessage", "milestoneMessage"]);

  function build(key: Key, s: Settings): (() => Promise<unknown>) | null {
    const update = (request: UpdateCountingConfigRequest) => () => countingApi.updateCountingConfig(guildId, channelId, request);
    const valid = (value: number, min: number, max = Number.MAX_SAFE_INTEGER) => Number.isInteger(value) && value >= min && value <= max;
    switch (key) {
      case "cooldown": return valid(s.cooldown, 0, 300) ? update({ cooldown: s.cooldown }) : null;
      case "maxNumber": return valid(s.maxNumber, 0) ? update({ maxNumber: s.maxNumber }) : null;
      case "numberBase": return valid(s.numberBase, 2, 36) ? update({ numberBase: s.numberBase }) : null;
      case "requiredRoles": return update({ requiredRoles: s.requiredRoles.join(",") });
      case "bannedRoles": return update({ bannedRoles: s.bannedRoles.join(",") });
      case "successEmote": return update({ successEmote: s.successEmote });
      case "errorEmote": return update({ errorEmote: s.errorEmote });
      case "pattern": return update({ pattern: s.pattern });
      case "allowRepeatedUsers": return update({ allowRepeatedUsers: s.allowRepeatedUsers });
      case "resetOnError": return update({ resetOnError: s.resetOnError });
      case "deleteWrongMessages": return update({ deleteWrongMessages: s.deleteWrongMessages });
      case "enableAchievements": return update({ enableAchievements: s.enableAchievements });
      case "enableCompetitions": return update({ enableCompetitions: s.enableCompetitions });
      case "successMessage": return () => countingApi.setSuccessMessage(guildId, channelId, { message: s.successMessage });
      case "failureMessage": return () => countingApi.setFailureMessage(guildId, channelId, { message: s.failureMessage });
      case "milestoneMessage": return () => countingApi.setCustomMessage(guildId, channelId, { message: s.milestoneMessage });
    }
  }

  function patch<K extends Key>(key: K, value: Settings[K]) {
    if (!settings || !saved) return;
    settings[key] = value;
    const snapshot = $state.snapshot(settings) as Settings;
    const request = build(key, snapshot);
    if (!request) return;
    const typed = TYPED.has(key);
    const saveKey = `${channelId}:${key}`;
    const run = async () => {
      try {
        await request();
        if (saved) saved = { ...saved, [key]: snapshot[key] };
      } catch (err) {
        if (!typed && settings && saved) settings[key] = saved[key];
        throw err;
      }
    };
    if (typed) autoSave.schedule(saveKey, run);
    else void autoSave.now(saveKey, run);
  }

  function flush(key: Key) {
    void autoSave.flush(`${channelId}:${key}`);
  }

  async function load() {
    try {
      const [config, milestoneData] = await Promise.all([
        countingApi.getCountingConfig(guildId, channelId),
        countingApi.getMilestones(guildId, channelId).catch(() => ({ milestones: [] as number[] }))
      ]);
      settings = fromConfig(config);
      saved = { ...settings, requiredRoles: [...settings.requiredRoles], bannedRoles: [...settings.bannedRoles] };
      milestones = [...(milestoneData?.milestones ?? [])].sort((a, b) => a - b);
    } catch (err) {
      logger.error("Failed to load counting settings:", err);
      notify(m.counting.notifyDetailsFailed(), "error");
    }
  }

  function fromConfig(config: CountingConfigResponse): Settings {
    return {
      allowRepeatedUsers: config.allowRepeatedUsers,
      cooldown: config.cooldown,
      requiredRoles: splitIds(config.requiredRoles),
      bannedRoles: splitIds(config.bannedRoles),
      maxNumber: config.maxNumber,
      resetOnError: config.resetOnError,
      deleteWrongMessages: config.deleteWrongMessages,
      pattern: config.pattern,
      numberBase: config.numberBase,
      successEmote: config.successEmote ?? "",
      errorEmote: config.errorEmote ?? "",
      enableAchievements: config.enableAchievements,
      enableCompetitions: config.enableCompetitions,
      successMessage: config.successMessage ?? "",
      failureMessage: config.failureMessage ?? "",
      milestoneMessage: config.milestoneMessage ?? ""
    };
  }

  async function saveMilestones(next: number[]) {
    savingMilestones = true;
    try {
      const sorted = [...new Set(next.filter((n) => Number.isFinite(n) && n > 0))].sort((a, b) => a - b);
      await countingApi.setMilestones(guildId, channelId, { milestones: sorted });
      milestones = sorted;
      newMilestone = null;
    } catch (err) {
      logger.error("Failed to save milestones:", err);
      notify(m.counting.notifyMilestonesFailed(), "error");
    } finally {
      savingMilestones = false;
    }
  }

  onMount(() => {
    void load();
  });
</script>

{#if settings}
  <div class="space-y-4 min-w-0" onfocusout={() => (["cooldown", "maxNumber", "numberBase"] as Key[]).forEach(flush)}>
    <PluginCard title={m.common.rules()} alwaysOpen>
      <SettingField label={m.counting.configPattern()} id="counting-pattern">
        <DiscordSelector
          type="custom"
          options={patterns}
          selected={String(settings.pattern)}
          searchable={false}
          clearable={false}
          customIcon="fa-list-1-2"
          placeholder={m.counting.configPatternPlaceholder()}
          ariaLabel={m.counting.configPattern()}
          onchange={({ selected }) => patch("pattern", Number(selected) as CountingPattern)}
        />
      </SettingField>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <NumberField
          id="counting-base"
          label={m.counting.configNumberBase()}
          hint={m.counting.configNumberBaseHint()}
          value={settings.numberBase}
          min={2}
          max={36}
          onchange={(value) => patch("numberBase", value ?? 10)}
        />
        <NumberField
          id="counting-max"
          label={m.counting.configMaxNumber()}
          hint={m.common.zeroMeansUnlimited()}
          value={settings.maxNumber}
          onchange={(value) => patch("maxNumber", value ?? 0)}
        />
        <NumberField
          id="counting-cooldown"
          label={m.common.cooldownSeconds()}
          value={settings.cooldown}
          max={300}
          onchange={(value) => patch("cooldown", value ?? 0)}
        />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <ToggleRow checked={settings.allowRepeatedUsers} title={m.counting.configAllowRepeated()} colors={$colorStore} class="h-full" onchange={(v) => patch("allowRepeatedUsers", v)} />
        <ToggleRow checked={settings.resetOnError} title={m.counting.configResetOnError()} colors={$colorStore} class="h-full" onchange={(v) => patch("resetOnError", v)} />
        <ToggleRow checked={settings.deleteWrongMessages} title={m.counting.configDeleteWrong()} colors={$colorStore} class="h-full" onchange={(v) => patch("deleteWrongMessages", v)} />
      </div>
    </PluginCard>

    <PluginCard title={m.counting.cardReactions()} alwaysOpen>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SettingField label={m.counting.configSuccessEmote()} id="counting-success-emote">
          <EmojiPicker
            id="counting-success-emote"
            guildEmojis={emojis}
            selected={settings.successEmote || null}
            onchange={({ selected }) => patch("successEmote", typeof selected === "string" ? selected : "")}
          />
        </SettingField>
        <SettingField label={m.counting.configErrorEmote()} id="counting-error-emote">
          <EmojiPicker
            id="counting-error-emote"
            guildEmojis={emojis}
            selected={settings.errorEmote || null}
            onchange={({ selected }) => patch("errorEmote", typeof selected === "string" ? selected : "")}
          />
        </SettingField>
      </div>
    </PluginCard>

    <PluginCard title={m.counting.configRolesTitle()} alwaysOpen>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SettingField label={m.common.requiredRoles()} id="counting-required-roles">
          <DiscordSelector
            type="role"
            multiple={true}
            options={roles}
            selected={settings.requiredRoles}
            placeholder={m.counting.configRequiredRolesPlaceholder()}
            ariaLabel={m.common.requiredRoles()}
            onchange={({ selected }) => patch("requiredRoles", Array.isArray(selected) ? selected : [])}
          />
        </SettingField>
        <SettingField label={m.counting.configBannedRoles()} id="counting-banned-roles">
          <DiscordSelector
            type="role"
            multiple={true}
            options={roles}
            selected={settings.bannedRoles}
            placeholder={m.counting.configBannedRolesPlaceholder()}
            ariaLabel={m.counting.configBannedRoles()}
            onchange={({ selected }) => patch("bannedRoles", Array.isArray(selected) ? selected : [])}
          />
        </SettingField>
      </div>
    </PluginCard>

    <PluginCard title={m.common.features()} alwaysOpen>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <ToggleRow checked={settings.enableAchievements} title={m.counting.configEnableAchievements()} colors={$colorStore} class="h-full" onchange={(v) => patch("enableAchievements", v)} />
        <ToggleRow checked={settings.enableCompetitions} title={m.counting.configEnableCompetitions()} colors={$colorStore} class="h-full" onchange={(v) => patch("enableCompetitions", v)} />
      </div>
    </PluginCard>

    <PluginCard title={m.counting.milestonesTitle()} alwaysOpen>
      <ul class="flex flex-wrap gap-2">
        {#each milestones as milestone (milestone)}
          <li class="flex items-center gap-1 rounded-lg border pl-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <span class="text-sm tabular-nums" style="color: {$colorStore.text}">{milestone.toLocaleString()}</span>
            <button
              type="button"
              class="min-h-[44px] min-w-[44px] rounded-lg disabled:opacity-50"
              style="color: {$colorStore.text}"
              aria-label={m.counting.milestoneRemoveAria({ milestone })}
              disabled={savingMilestones}
              onclick={() => saveMilestones(milestones.filter((x) => x !== milestone))}
            >
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </li>
        {/each}
      </ul>
      <div class="flex gap-3 items-stretch">
        <input
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
          class="grow min-w-0 p-3 rounded-lg border min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          placeholder={m.counting.milestoneAddPlaceholder()}
          aria-label={m.counting.milestoneNewAria()}
          value={newMilestone ?? ""}
          oninput={(e) => {
            const raw = (e.currentTarget as HTMLInputElement).value;
            newMilestone = raw === "" ? null : Math.floor(Number(raw));
          }}
          onkeydown={(e) => {
            if (e.key === "Enter" && newMilestone && newMilestone > 0) void saveMilestones([...milestones, newMilestone]);
          }}
        />
        <button
          type="button"
          class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
          style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
          disabled={savingMilestones || !newMilestone || newMilestone < 1}
          onclick={() => newMilestone && saveMilestones([...milestones, newMilestone])}
        >
          {m.common.add()}
        </button>
      </div>
    </PluginCard>

    <PluginCard title={m.common.messages()} alwaysOpen>
      <div class="space-y-4">
        <div class="space-y-2">
          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.counting.successMessageLabel()}</h4>
          <MessageField
            value={settings.successMessage}
            previewTitle={m.counting.successMessageLabel()}
            icon="fa-list-numeric"
            {user}
            {placeholders}
            onchange={(next) => patch("successMessage", next)}
          />
        </div>
        <div class="space-y-2">
          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.counting.failureMessageLabel()}</h4>
          <MessageField
            value={settings.failureMessage}
            previewTitle={m.counting.failureMessageLabel()}
            icon="fa-list-numeric"
            {user}
            {placeholders}
            onchange={(next) => patch("failureMessage", next)}
          />
        </div>
        <div class="space-y-2">
          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.counting.milestoneMessageLabel()}</h4>
          <MessageField
            value={settings.milestoneMessage}
            previewTitle={m.counting.milestoneMessageLabel()}
            icon="fa-list-numeric"
            {user}
            {placeholders}
            placeholder={m.counting.milestoneMessagePlaceholder()}
            onchange={(next) => patch("milestoneMessage", next)}
          />
        </div>
      </div>
    </PluginCard>
  </div>
{/if}
