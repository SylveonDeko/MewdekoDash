<script lang="ts">
  import { m } from "$lib/i18n";
  import { xpApi } from "$lib/api/index.ts";
  import type { GuildXpSetting, XpLevelUpLogEntry, XpLevelUpMessage } from "$lib/api/xp/models/index.ts";
  import type { DiscordUser } from "$lib/types/discord";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "./NumberField.svelte";
  import SettingsGroup from "./SettingsGroup.svelte";
  import { errorText, formatDate, idString, type Channel, type SettingsPatch } from "./xpModel";

  interface Props {
    guildId: bigint;
    settings: GuildXpSetting;
    channels: Channel[];
    user?: DiscordUser | null;
    onpatch: SettingsPatch;
    onerror: (message: string) => void;
  }

  let { guildId, settings, channels, user = null, onpatch, onerror }: Props = $props();

  let messagesOpen = $state(false);
  let logOpen = $state(false);
  let messages: XpLevelUpMessage[] = $state([]);
  let log: XpLevelUpLogEntry[] | null = $state(null);
  let draft = $state("");
  let draftKey = $state(0);
  let adding = $state(false);

  const placeholders = $derived(
    [
      ["%xp.user.mention%", m.xp.placeholderMention()],
      ["%xp.user.name%", m.xp.placeholderName()],
      ["%xp.level.old%", m.xp.placeholderOldLevel()],
      ["%xp.level.new%", m.xp.placeholderNewLevel()],
      ["%xp.total%", m.xp.placeholderTotal()],
      ["%xp.rank%", m.xp.placeholderRank()],
      ["%xp.guild.name%", m.xp.placeholderServer()]
    ].map(([name, description]) => ({ category: m.xp.placeholderCategory(), name, description }))
  );

  const channel = $derived(String(settings.levelUpChannel) === "0" ? null : String(settings.levelUpChannel));

  $effect(() => {
    if (messagesOpen && messages.length === 0) void loadMessages();
  });

  $effect(() => {
    if (logOpen && log === null) void loadLog();
  });

  async function loadMessages() {
    try {
      messages = await xpApi.getLevelUpMessages(guildId);
    } catch (err) {
      logger.error("Failed to load level-up messages:", err);
      onerror(errorText(err, m.xp.errorLoadMessages()));
    }
  }

  async function loadLog() {
    try {
      log = await xpApi.getLevelUpLog(guildId);
    } catch (err) {
      logger.error("Failed to load the level-up log:", err);
      onerror(errorText(err, m.xp.errorLoadLog()));
    }
  }

  async function add() {
    if (!draft.trim() || adding) return;
    adding = true;
    try {
      await xpApi.addLevelUpMessage(guildId, draft);
      draft = "";
      draftKey++;
      await loadMessages();
    } catch (err) {
      logger.error("Failed to add a level-up message:", err);
      onerror(errorText(err, m.xp.errorSaveMessage()));
    } finally {
      adding = false;
    }
  }

  async function toggle(message: XpLevelUpMessage, enabled: boolean) {
    try {
      await xpApi.toggleLevelUpMessage(guildId, message.id, enabled);
      message.isEnabled = enabled;
    } catch (err) {
      logger.error("Failed to toggle a level-up message:", err);
      onerror(errorText(err, m.xp.errorSaveMessage()));
      await loadMessages();
    }
  }

  async function remove(message: XpLevelUpMessage) {
    try {
      await xpApi.removeLevelUpMessage(guildId, message.id);
      messages = messages.filter((x) => x.id !== message.id);
    } catch (err) {
      logger.error("Failed to remove a level-up message:", err);
      onerror(errorText(err, m.xp.errorSaveMessage()));
    }
  }
</script>

<PluginCard title={m.xp.cardLevelUpTitle()} alwaysOpen>
  <div class="grid gap-4 sm:grid-cols-2">
    <SettingField label={m.xp.levelUpChannel()} id="xp-levelup-channel">
      <DiscordSelector
        id="xp-levelup-channel"
        type="channel"
        options={channels}
        selected={channel}
        placeholder={m.xp.levelUpChannelPlaceholder()}
        onchange={({ selected }) => onpatch({ levelUpChannel: selected ? BigInt(selected as string) : 0n }, "now")}
      />
    </SettingField>
    <div class="flex items-end">
      <SettingToggle
        id="xp-levelup-rewards-only"
        label={m.xp.rewardsOnly()}
        checked={settings.levelUpRewardsOnly}
        onchange={(on) => onpatch({ levelUpRewardsOnly: on }, "now")}
      />
    </div>
    <NumberField
      id="xp-levelup-interval"
      label={m.xp.levelUpInterval()}
      min={1}
      value={settings.levelUpInterval}
      onchange={(value) => onpatch({ levelUpInterval: value ?? 1 }, "typing")}
    />
    <NumberField
      id="xp-levelup-min"
      label={m.xp.levelUpMinLevel()}
      value={settings.levelUpMinLevel}
      onchange={(value) => onpatch({ levelUpMinLevel: value ?? 0 }, "typing")}
    />
  </div>

  <MessageField
    value={settings.levelUpMessage}
    previewTitle={m.xp.levelUpMessage()}
    icon="fa-star"
    {user}
    {placeholders}
    onchange={(message) => onpatch({ levelUpMessage: message }, "typing")}
  />

  <SettingsGroup title={m.xp.groupCustomMessages()} bind:open={messagesOpen} count={messages.length}>
    {#each messages as message (message.id)}
      <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0"
           class:opacity-60={!message.isEnabled}
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <label class="relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer shrink-0">
          <input type="checkbox" class="sr-only peer" checked={message.isEnabled}
                 aria-label={m.xp.useMessageAria({ id: message.id })}
                 onchange={(e) => toggle(message, e.currentTarget.checked)}>
          <span class="w-11 h-6 rounded-full relative block peer-focus-visible:ring-2
                       after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full
                       after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5"
                style="background: {message.isEnabled ? $colorStore.primary : `${$colorStore.primary}30`};"></span>
        </label>
        <p class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{message.messageContent}</p>
        <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0"
                style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                aria-label={m.xp.removeMessageAria({ id: message.id })} onclick={() => remove(message)}>
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {/each}

    {#key draftKey}
      <MessageField
        value={draft}
        previewTitle={m.xp.newMessage()}
        icon="fa-star"
        {user}
        {placeholders}
        onchange={(message) => (draft = message)}
      />
    {/key}
    <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
            disabled={!draft.trim() || adding} onclick={add}>
      {m.common.add()}
    </button>
  </SettingsGroup>

  <SettingsGroup title={m.xp.groupRecentLevelUps()} bind:open={logOpen}>
    {#if log && log.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.noLevelUps()}</p>
    {:else}
      {#each log ?? [] as entry (`${idString(entry.userId)}-${entry.dateAdded}`)}
        <div class="flex items-center gap-3 rounded-lg p-2 min-w-0" style="background: {$colorStore.primary}08;">
          <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{entry.username}</span>
          <span class="text-sm shrink-0 tabular-nums" style="color: {$colorStore.text}">{entry.oldLevel} → {entry.newLevel}</span>
          <span class="text-xs shrink-0 hidden sm:inline" style="color: {$colorStore.muted}">{formatDate(entry.dateAdded)}</span>
        </div>
      {/each}
    {/if}
  </SettingsGroup>
</PluginCard>
