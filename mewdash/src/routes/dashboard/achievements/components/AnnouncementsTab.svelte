<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    achievementsApi,
    AchievementAnnounceMode,
    type AchievementCatalog,
    type AchievementLookups,
    type AchievementSettings
  } from "$lib/api/index.ts";
  import type { DiscordUser } from "$lib/types/discord";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import { ANNOUNCE_MODES } from "../achievementHelpers";

  interface Props {
    settings: AchievementSettings;
    catalog: AchievementCatalog;
    lookups: AchievementLookups | null;
    user?: DiscordUser;
    autoSave: AutoSave;
    onsaved: (settings: AchievementSettings) => void;
    onerror: (text: string) => void;
  }

  let { settings, catalog, lookups, user, autoSave, onsaved, onerror }: Props = $props();

  let mode = $state(untrack(() => settings.announceMode));
  let logChannelId = $state<string | null>(untrack(() => (settings.logChannelId ? settings.logChannelId.toString() : null)));
  let dmByDefault = $state(untrack(() => settings.dmByDefault));
  let mentionUsers = $state(untrack(() => settings.mentionUsers));
  let unlockImage = $state(untrack(() => settings.unlockImage));
  let deleteAfter = $state(untrack(() => settings.deleteAfter ?? 0));
  let quietChannels = $state<string[]>(untrack(() => (settings.quietChannelIds ?? []).map((id) => id.toString())));
  let requireSendPermission = $state(untrack(() => settings.requireSendPermission ?? true));
  let message = $state(untrack(() => settings.unlockMessage ?? ""));

  const channelOptions = $derived(
    (lookups?.channels ?? []).filter((c) => c.type === 0).map((c) => ({ id: c.id.toString(), name: c.name, type: 0 }))
  );
  const quietOptions = $derived(
    (lookups?.channels ?? [])
      .filter((c) => c.id.toString() !== logChannelId)
      .map((c) => ({ id: c.id.toString(), name: c.name, type: c.type }))
  );
  const logChannelProblem = $derived(
    logChannelId && lookups ? !(lookups.channels.find((c) => c.id.toString() === logChannelId)?.canSend ?? false) : false
  );
  const needsLog = $derived(mode === AchievementAnnounceMode.LogChannel && !logChannelId);
  const deleteOptions = $derived([
    { id: "0", name: m.common.never() },
    { id: "5", name: m.achievements.announcementsDelete5s() },
    { id: "15", name: m.achievements.announcementsDelete15s() },
    { id: "30", name: m.achievements.announcementsDelete30s() },
    { id: "60", name: m.achievements.announcementsDelete1m() },
    { id: "300", name: m.achievements.announcementsDelete5m() },
    { id: "900", name: m.achievements.announcementsDelete15m() },
    { id: "3600", name: m.achievements.announcementsDelete1h() },
    { id: "86400", name: m.achievements.announcementsDelete1d() }
  ]);
  const modeChoices = $derived(
    ANNOUNCE_MODES.map((choice) => {
      switch (choice.value) {
        case 0: return { ...choice, title: m.achievements.cardDesignerAutomatic(), text: m.achievements.announcementsMode0Text() };
        case 1: return { ...choice, title: m.achievements.announcementsMode1Title(), text: m.achievements.announcementsMode1Text() };
        case 2: return { ...choice, title: m.achievements.announcementsMode2Title(), text: m.achievements.announcementsMode2Text() };
        case 3: return { ...choice, title: m.achievements.announcementsMode3Title(), text: m.achievements.announcementsMode3Text() };
        default: return { ...choice, title: m.achievements.announcementsMode4Title(), text: m.achievements.announcementsMode4Text() };
      }
    })
  );
  const placeholders = $derived(
    catalog.placeholders.map((p) => ({ category: m.features.achievementsName(), name: p.name, description: p.description }))
  );

  function restore() {
    mode = settings.announceMode;
    logChannelId = settings.logChannelId ? settings.logChannelId.toString() : null;
    dmByDefault = settings.dmByDefault;
    mentionUsers = settings.mentionUsers;
    unlockImage = settings.unlockImage;
    deleteAfter = settings.deleteAfter ?? 0;
    quietChannels = (settings.quietChannelIds ?? []).map((id) => id.toString());
    requireSendPermission = settings.requireSendPermission ?? true;
    message = settings.unlockMessage ?? "";
  }

  function queue() {
    const guildId = $currentGuild?.id;
    if (!guildId) return;
    if (logChannelProblem) {
      autoSave.cancel("achievementAnnouncements");
      return;
    }
    void autoSave.now("achievementAnnouncements", async () => {
      try {
        const saved = await achievementsApi.updateSettings(guildId, {
          announceMode: mode,
          logChannelId: logChannelId ?? "0",
          dmByDefault,
          mentionUsers,
          unlockImage,
          deleteAfter,
          quietChannelIds: quietChannels.filter((id) => id !== logChannelId),
          requireSendPermission,
          unlockMessage: message
        });
        onsaved(saved);
      } catch (err: any) {
        logger.error("Failed to save announcement settings:", err);
        restore();
        onerror(err?.message || m.achievements.announcementsErrorSave());
        throw err;
      }
    });
  }
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.achievements.announcementsWhereTitle()} alwaysOpen>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2" role="radiogroup" aria-label={m.achievements.announcementsModeLabel()}>
      {#each modeChoices as choice (choice.value)}
        {@const pressed = mode === choice.value}
        <button
          type="button"
          role="radio"
          aria-checked={pressed}
          class="flex items-start gap-3 p-3 rounded-lg border text-left min-h-[44px]"
          style="background: {pressed ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {pressed ? $colorStore.selectedBorder : `${$colorStore.primary}20`};"
          onclick={() => {
            mode = choice.value;
            queue();
          }}
        >
          <i class="fa-solid {choice.icon} mt-1 w-4 text-center" style="color: {$colorStore.muted}" aria-hidden="true"></i>
          <span class="min-w-0">
            <span class="block text-sm font-semibold" style="color: {$colorStore.text}">{choice.title}</span>
            <span class="block text-xs" style="color: {$colorStore.muted}">{choice.text}</span>
          </span>
        </button>
      {/each}
    </div>

    <div>
      <span id="ach-log-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.logChannel()}</span>
      <div class="flex items-center gap-2 md:max-w-xl">
        <div class="flex-1 min-w-0">
          <DiscordSelector
            type="channel"
            options={channelOptions}
            selected={logChannelId}
            placeholder={m.common.noLogChannel()}
            ariaLabelledby="ach-log-label"
            onchange={(d) => {
              logChannelId = typeof d.selected === "string" && d.selected ? d.selected : null;
              queue();
            }}
          />
        </div>
        {#if logChannelId}
          <button
            type="button"
            class="min-w-[50px] min-h-[50px] rounded-lg shrink-0"
            aria-label={m.common.noLogChannel()}
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            onclick={() => {
              logChannelId = null;
              queue();
            }}
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        {/if}
      </div>
      {#if logChannelProblem}
        <p class="text-xs mt-2" style="color: #ef4444">{m.achievements.announcementsLogProblem()}</p>
      {:else if needsLog}
        <p class="text-xs mt-2" style="color: {$colorStore.accent}">{m.achievements.announcementsLogNeeded()}</p>
      {/if}
    </div>

    <div class="md:max-w-xl">
      <span id="ach-quiet-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.achievements.announcementsQuietLabel()}</span>
      <DiscordSelector
        type="channel"
        multiple={true}
        options={quietOptions}
        selected={quietChannels}
        placeholder={m.achievements.announcementsQuietPlaceholder()}
        ariaLabelledby="ach-quiet-label"
        onchange={(d) => {
          quietChannels = Array.isArray(d.selected) ? d.selected : [];
          queue();
        }}
      />
    </div>

    <ToggleRow
      checked={requireSendPermission}
      title={m.achievements.announcementsRequireSendTitle()}
      subtitle={m.achievements.announcementsRequireSendSubtitle()}
      colors={$colorStore}
      onchange={(v) => {
        requireSendPermission = v;
        queue();
      }}
    />
  </PluginCard>

  <PluginCard title={m.achievements.announcementsDelivery()} alwaysOpen>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <ToggleRow
        checked={dmByDefault}
        title={m.achievements.announcementsDmTitle()}
        subtitle={m.achievements.announcementsDmSubtitle()}
        class="h-full"
        colors={$colorStore}
        onchange={(v) => {
          dmByDefault = v;
          queue();
        }}
      />
      <ToggleRow
        checked={mentionUsers}
        title={m.achievements.announcementsMentionTitle()}
        subtitle={m.achievements.announcementsMentionSubtitle()}
        class="h-full"
        colors={$colorStore}
        onchange={(v) => {
          mentionUsers = v;
          queue();
        }}
      />
      <ToggleRow
        checked={unlockImage}
        title={m.achievements.announcementsImageTitle()}
        subtitle={m.achievements.announcementsImageSubtitle()}
        class="h-full"
        colors={$colorStore}
        onchange={(v) => {
          unlockImage = v;
          queue();
        }}
      />
    </div>
    <div class="md:max-w-xs">
      <span id="ach-delete-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.achievements.announcementsDeleteLabel()}</span>
      <DiscordSelector
        type="custom"
        options={deleteOptions}
        selected={deleteAfter.toString()}
        searchable={false}
        ariaLabelledby="ach-delete-label"
        customIcon="fa-clock"
        clearable={false}
        onchange={(d) => {
          deleteAfter = typeof d.selected === "string" ? Number(d.selected) : 0;
          queue();
        }}
      />
    </div>
  </PluginCard>

  <PluginCard title={m.achievements.announcementsMessageTitle()} alwaysOpen>
    <MessageField
      value={message}
      previewTitle={m.achievements.announcementsMessageTitle()}
      icon="fa-crown"
      user={user ?? null}
      {placeholders}
      placeholder={m.achievements.announcementsMessagePlaceholder()}
      onchange={(next) => {
        message = next;
        queue();
      }}
    />
  </PluginCard>
</div>
