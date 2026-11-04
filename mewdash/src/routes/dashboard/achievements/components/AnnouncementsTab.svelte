<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { fade } from "svelte/transition";
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
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import { ANNOUNCE_MODES, parseMessageSource, serializeMessage } from "../achievementHelpers";
  import DuoIcon from "./DuoIcon.svelte";

  /** Tab inputs. */
  interface Props {
    settings: AchievementSettings;
    catalog: AchievementCatalog;
    lookups: AchievementLookups | null;
    user?: DiscordUser;
    autoSave: AutoSave;
    onsaved: (settings: AchievementSettings) => void;
    onerror: (text: string) => void;
    onsuccess: (text: string) => void;
  }

  let { settings, catalog, lookups, user, autoSave, onsaved, onerror }: Props = $props();

  let mode = $state(untrack(() => settings.announceMode));
  let logChannelId = $state<string | null>(untrack(() => settings.logChannelId ? settings.logChannelId.toString() : null));
  let dmByDefault = $state(untrack(() => settings.dmByDefault));
  let mentionUsers = $state(untrack(() => settings.mentionUsers));
  let unlockImage = $state(untrack(() => settings.unlockImage));
  let deleteAfter = $state(untrack(() => settings.deleteAfter ?? 0));
  let quietChannels = $state<string[]>(untrack(() => (settings.quietChannelIds ?? []).map((id) => id.toString())));
  let requireSendPermission = $state(untrack(() => settings.requireSendPermission ?? true));
  let message = $state<any>(untrack(() => parseMessageSource(settings.unlockMessage)));

  let channelOptions = $derived(
    (lookups?.channels ?? []).filter((c) => c.type === 0).map((c) => ({ id: c.id.toString(), name: c.name, type: 0 }))
  );
  let quietOptions = $derived(
    (lookups?.channels ?? []).filter((c) => c.id.toString() !== logChannelId).map((c) => ({ id: c.id.toString(), name: c.name, type: c.type }))
  );
  let logChannelProblem = $derived(
    logChannelId && lookups ? !(lookups.channels.find((c) => c.id.toString() === logChannelId)?.canSend ?? false) : false
  );
  /** How long unlock messages stay, from never to a day. */
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
  let modeChoices = $derived(ANNOUNCE_MODES.map((choice) => {
    switch (choice.value) {
      case 0: return { ...choice, title: m.achievements.cardDesignerAutomatic(), text: m.achievements.announcementsMode0Text() };
      case 1: return { ...choice, title: m.achievements.announcementsMode1Title(), text: m.achievements.announcementsMode1Text() };
      case 2: return { ...choice, title: m.achievements.announcementsMode2Title(), text: m.achievements.announcementsMode2Text() };
      case 3: return { ...choice, title: m.achievements.announcementsMode3Title(), text: m.achievements.announcementsMode3Text() };
      default: return { ...choice, title: m.achievements.announcementsMode4Title(), text: m.achievements.announcementsMode4Text() };
    }
  }));
  let needsLog = $derived(mode === AchievementAnnounceMode.LogChannel && !logChannelId);
  let placeholders = $derived(catalog.placeholders.map((p) => ({ category: m.features.achievementsName(), name: p.name, description: p.description })));

  /** Puts the form back to the last saved settings. */
  function restore() {
    mode = settings.announceMode;
    logChannelId = settings.logChannelId ? settings.logChannelId.toString() : null;
    dmByDefault = settings.dmByDefault;
    mentionUsers = settings.mentionUsers;
    unlockImage = settings.unlockImage;
    deleteAfter = settings.deleteAfter ?? 0;
    quietChannels = (settings.quietChannelIds ?? []).map((id) => id.toString());
    requireSendPermission = settings.requireSendPermission ?? true;
    message = parseMessageSource(settings.unlockMessage);
  }

  /**
   * Saves the announcement settings through the page's auto-save. A log channel the bot can't send in is
   * not saved; the inline warning stays until it is changed.
   */
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
          unlockMessage: serializeMessage(message)
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

<div class="space-y-6" in:fade={{ duration: 200 }}>
  <div class="relative rounded-2xl border p-5 md:p-6" style="z-index: 30;
       background: {$colorStore.primary}0c;
       border-color: {$colorStore.primary}30;">
    <h2 class="flex items-center gap-2 text-lg font-semibold" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-bell" />
      {m.achievements.announcementsWhereTitle()}
    </h2>
    <p class="text-sm mt-1 mb-5" style="color: {$colorStore.muted}">
      {m.achievements.announcementsWhereHint()}
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" role="radiogroup" aria-label={m.achievements.announcementsModeLabel()}>
      {#each modeChoices as choice (choice.value)}
        {@const pressed = mode === choice.value}
        <button type="button" role="radio" aria-checked={pressed}
                class="flex items-start gap-3 p-4 rounded-xl border text-left transition-all min-h-[44px]"
                style="background: {pressed ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                       border-color: {pressed ? $colorStore.primary : $colorStore.primary + '30'};"
                onclick={() => { mode = choice.value; queue(); }}>
          <DuoIcon icon={choice.icon} color={pressed ? null : $colorStore.muted} class="mt-1" />
          <span class="min-w-0">
            <span class="block font-semibold" style="color: {pressed ? $colorStore.primary : $colorStore.text}">{choice.title}</span>
            <span class="block text-sm" style="color: {$colorStore.muted}">{choice.text}</span>
          </span>
        </button>
      {/each}
    </div>

    <div class="mt-6 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
      <span id="ach-log-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.logChannel()}</span>
      <div class="flex items-center gap-2 md:max-w-xl">
        <div class="flex-1 min-w-0">
          <DiscordSelector type="channel" options={channelOptions} selected={logChannelId}
                           placeholder={m.common.noLogChannel()} ariaLabelledby="ach-log-label"
                           onchange={(d) => { logChannelId = typeof d.selected === "string" && d.selected ? d.selected : null; queue(); }} />
        </div>
        {#if logChannelId}
          <button type="button" class="w-[44px] h-[44px] rounded-xl shrink-0" aria-label={m.common.noLogChannel()}
                  style="background: {$colorStore.primary}08; color: {$colorStore.muted};"
                  onclick={() => { logChannelId = null; queue(); }}>
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        {/if}
      </div>
      {#if logChannelProblem}
        <p class="text-xs mt-2" style="color: #ef4444">{m.achievements.announcementsLogProblem()}</p>
      {:else if needsLog}
        <p class="text-xs mt-2" style="color: {$colorStore.accent}">{m.achievements.announcementsLogNeeded()}</p>
      {:else}
        <p class="text-xs mt-2" style="color: {$colorStore.muted}">{m.achievements.announcementsLogHint()}</p>
      {/if}
    </div>

    <div class="mt-6 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
      <span id="ach-quiet-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.achievements.announcementsQuietLabel()}</span>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 items-start">
        <div>
          <DiscordSelector type="channel" multiple={true} options={quietOptions} selected={quietChannels}
                           placeholder={m.achievements.announcementsQuietPlaceholder()} ariaLabelledby="ach-quiet-label"
                           onchange={(d) => { quietChannels = Array.isArray(d.selected) ? d.selected : []; queue(); }} />
          <p class="text-xs mt-2" style="color: {$colorStore.muted}">
            {m.achievements.announcementsQuietHint()}
          </p>
        </div>
        <ToggleRow checked={requireSendPermission} title={m.achievements.announcementsRequireSendTitle()}
                   subtitle={m.achievements.announcementsRequireSendSubtitle()}
                   colors={$colorStore} onchange={(v) => { requireSendPermission = v; queue(); }} />
      </div>
    </div>

    <div class="mt-6 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
      <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.achievements.announcementsDelivery()}</span>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ToggleRow checked={dmByDefault} title={m.achievements.announcementsDmTitle()} class="h-full"
                   subtitle={m.achievements.announcementsDmSubtitle()}
                   colors={$colorStore} onchange={(v) => { dmByDefault = v; queue(); }} />
        <ToggleRow checked={mentionUsers} title={m.achievements.announcementsMentionTitle()} class="h-full"
                   subtitle={m.achievements.announcementsMentionSubtitle()}
                   colors={$colorStore} onchange={(v) => { mentionUsers = v; queue(); }} />
        <ToggleRow checked={unlockImage} title={m.achievements.announcementsImageTitle()} class="h-full"
                   subtitle={m.achievements.announcementsImageSubtitle()}
                   colors={$colorStore} onchange={(v) => { unlockImage = v; queue(); }} />
      </div>
    </div>

    <div class="mt-6 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
      <span id="ach-delete-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.achievements.announcementsDeleteLabel()}</span>
      <div class="md:max-w-xs">
        <DiscordSelector type="custom" options={deleteOptions} selected={deleteAfter.toString()} searchable={false}
                         ariaLabelledby="ach-delete-label" customIcon="fa-clock"
                         onchange={(d) => { deleteAfter = typeof d.selected === "string" ? Number(d.selected) : 0; queue(); }} />
      </div>
      <p class="text-xs mt-2" style="color: {$colorStore.muted}">
        {m.achievements.announcementsDeleteHint()}
      </p>
    </div>
  </div>

  <div class="relative rounded-2xl border p-5 md:p-6" style="z-index: 20;
       background: {$colorStore.primary}0c;
       border-color: {$colorStore.primary}30;">
    <h2 class="flex items-center gap-2 text-lg font-semibold" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-envelope-open" />
      {m.achievements.announcementsMessageTitle()}
    </h2>
    <p class="text-sm mt-1 mb-5" style="color: {$colorStore.muted}">
      {m.achievements.announcementsMessageHint()}
    </p>
    <FullscreenEmbedBuilder id="achievement-unlock-message"
                            bind:value={message}
                            onchange={() => queue()}
                            previewTitle={m.achievements.announcementsMessageTitle()}
                            previewDescription={m.achievements.announcementsMessagePreviewDescription()}
                            icon="fa-crown"
                            allowContent={true}
                            allowMultipleEmbeds={true}
                            maxEmbeds={10}
                            allowComponents={true}
                            additionalPlaceholders={placeholders}
                            guildId={$currentGuild?.id ?? null}
                            user={user ?? null}
                            placeholder={m.achievements.announcementsMessagePlaceholder()} />
    <div class="flex flex-wrap gap-2 mt-4">
      {#each catalog.placeholders as p (p.name)}
        <code class="text-xs px-2 py-1 rounded-md" style="background: {$colorStore.primary}10; color: {$colorStore.primary}" title={p.description}>{p.name}</code>
      {/each}
    </div>
  </div>

</div>
