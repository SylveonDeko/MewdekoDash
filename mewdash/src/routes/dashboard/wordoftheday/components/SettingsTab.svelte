<script lang="ts">
  import { m } from "$lib/i18n";
  import { TIMEZONE_OPTIONS } from "$lib/config/timezones";
  import { WordDifficulty, WordPartOfSpeech, WordSourceMode } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import type { WotdConfig } from "./wotdConfig.svelte";
  import {
    archiveOptions,
    DEFAULT_THREAD_NAME,
    difficultyOptions,
    HOUR_OPTIONS,
    modeOptions,
    posOptions,
    selectedNumber,
    templatePlaceholders,
    type Named
  } from "./wotdModel";

  interface Props {
    wotd: WotdConfig;
    channels: Named[];
    roles: Named[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onreset: () => void;
    resetting: boolean;
  }

  let { wotd, channels, roles, autoSave, user = null, onreset, resetting }: Props = $props();

  const form = $derived(wotd.form);
  const placeholders = $derived(templatePlaceholders());

  const inputStyle = $derived(
    `background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const inputClass = "w-full px-3 rounded-lg border min-h-[50px] text-base disabled:opacity-50";
</script>

<PluginCard title={m.wordoftheday.postingTitle()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.common.channel()} id="wotd-channel">
      <DiscordSelector
        id="wotd-channel"
        type="channel"
        options={channels}
        selected={form.channelId}
        placeholder={m.common.noChannelSelected()}
        onchange={(detail) => wotd.setChannel(typeof detail.selected === "string" ? detail.selected : null)}
      />
    </SettingField>

    <SettingField label={m.wordoftheday.postingHour()} id="wotd-hour">
      <DiscordSelector
        id="wotd-hour"
        type="custom"
        customIcon="fa-clock"
        clearable={false}
        options={HOUR_OPTIONS}
        selected={form.postHour.toString()}
        placeholder={m.wordoftheday.postingHourPlaceholder()}
        searchable={false}
        onchange={(detail) => wotd.setPostHour(selectedNumber(detail, 9))}
      />
    </SettingField>

    <SettingField label={m.common.timezone()} id="wotd-timezone">
      <DiscordSelector
        id="wotd-timezone"
        type="timezone"
        options={TIMEZONE_OPTIONS}
        selected={form.timezone}
        placeholder={m.common.selectTimezonePlaceholder()}
        onchange={(detail) => wotd.setTimezone(typeof detail.selected === "string" ? detail.selected : "UTC")}
      />
    </SettingField>

    <SettingField label={m.common.pingRole()} id="wotd-ping">
      <DiscordSelector
        id="wotd-ping"
        type="role"
        options={roles}
        selected={form.pingRoleId}
        placeholder={m.common.noPingRole()}
        onchange={(detail) => wotd.setPingRole(typeof detail.selected === "string" ? detail.selected : null)}
      />
    </SettingField>
  </div>
</PluginCard>

<PluginCard title={m.wordoftheday.sourceTitle()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.wordoftheday.sourceLabel()} id="wotd-source">
      <DiscordSelector
        id="wotd-source"
        type="custom"
        customIcon="fa-book"
        clearable={false}
        options={modeOptions()}
        selected={form.sourceMode.toString()}
        placeholder={m.wordoftheday.sourceLabel()}
        searchable={false}
        onchange={(detail) => wotd.setSourceMode(selectedNumber(detail, WordSourceMode.Dictionary))}
      />
    </SettingField>

    <SettingField label={m.wordoftheday.sourceTopic()} id="wotd-topic">
      <input
        id="wotd-topic"
        type="text"
        value={form.topic}
        oninput={(e) => wotd.setTopic(e.currentTarget.value)}
        onblur={() => autoSave.flush("topic")}
        placeholder={m.wordoftheday.sourceTopicPlaceholder()}
        maxlength="80"
        class={inputClass}
        style={inputStyle}
      />
    </SettingField>

    <SettingField label={m.placeholders.wotdPos()} id="wotd-pos">
      <DiscordSelector
        id="wotd-pos"
        type="custom"
        customIcon="fa-font"
        clearable={false}
        options={posOptions()}
        selected={form.partOfSpeech.toString()}
        placeholder={m.wordoftheday.optionAny()}
        searchable={false}
        onchange={(detail) => wotd.setPartOfSpeech(selectedNumber(detail, WordPartOfSpeech.Any))}
      />
    </SettingField>

    <SettingField label={m.wordoftheday.sourceDifficulty()} id="wotd-difficulty">
      <DiscordSelector
        id="wotd-difficulty"
        type="custom"
        customIcon="fa-gauge"
        clearable={false}
        options={difficultyOptions()}
        selected={form.difficulty.toString()}
        placeholder={m.wordoftheday.optionAny()}
        searchable={false}
        onchange={(detail) => wotd.setDifficulty(selectedNumber(detail, WordDifficulty.Any))}
      />
    </SettingField>
  </div>
  <p class="text-xs" style="color: {$colorStore.muted}">{m.wordoftheday.sourceHint()}</p>
</PluginCard>

<PluginCard title={m.wordoftheday.threadTitle()} enabled={form.createThread} onToggle={wotd.setCreateThread}>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.wordoftheday.threadName()} id="wotd-thread-name">
      <input
        id="wotd-thread-name"
        type="text"
        value={form.threadName}
        oninput={(e) => wotd.setThreadName(e.currentTarget.value)}
        onblur={() => autoSave.flush("threadName")}
        placeholder={DEFAULT_THREAD_NAME}
        maxlength="100"
        class={inputClass}
        style={inputStyle}
      />
    </SettingField>

    <SettingField label={m.wordoftheday.threadArchive()} id="wotd-thread-archive">
      <DiscordSelector
        id="wotd-thread-archive"
        type="custom"
        customIcon="fa-hourglass"
        clearable={false}
        options={archiveOptions()}
        selected={form.threadAutoArchiveMinutes.toString()}
        placeholder={m.wordoftheday.threadArchivePlaceholder()}
        searchable={false}
        onchange={(detail) => wotd.setThreadArchive(selectedNumber(detail, 1440))}
      />
    </SettingField>
  </div>
</PluginCard>

<PluginCard title={m.wordoftheday.templateTitle()} alwaysOpen>
  <MessageField
    value={form.messageTemplate}
    previewTitle={m.features.wordofthedayName()}
    icon="fa-book-open"
    {user}
    {placeholders}
    placeholder={m.wordoftheday.templateEmpty()}
    onchange={wotd.setTemplate}
  />
</PluginCard>

<div>
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-4 rounded-lg min-h-[50px] font-medium w-full sm:w-auto"
    style="background: {$colorStore.muted}20; color: {$colorStore.text}; border: 1px solid {$colorStore.muted}30;"
    disabled={resetting}
    onclick={onreset}
  >
    <i class="fa-solid fa-arrows-rotate {resetting ? 'fa-spin' : ''}" aria-hidden="true"></i>
    {m.common.resetEverything()}
  </button>
</div>
