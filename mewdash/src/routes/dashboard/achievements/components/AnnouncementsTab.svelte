<script lang="ts">
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
    onsaved: (settings: AchievementSettings) => void;
    onerror: (text: string) => void;
    onsuccess: (text: string) => void;
  }

  let { settings, catalog, lookups, user, onsaved, onerror }: Props = $props();

  let mode = $state(untrack(() => settings.announceMode));
  let logChannelId = $state<string | null>(untrack(() => settings.logChannelId ? settings.logChannelId.toString() : null));
  let dmByDefault = $state(untrack(() => settings.dmByDefault));
  let mentionUsers = $state(untrack(() => settings.mentionUsers));
  let unlockImage = $state(untrack(() => settings.unlockImage));
  let deleteAfter = $state(untrack(() => settings.deleteAfter ?? 0));
  let quietChannels = $state<string[]>(untrack(() => (settings.quietChannelIds ?? []).map((id) => id.toString())));
  let requireSendPermission = $state(untrack(() => settings.requireSendPermission ?? true));
  let message = $state<any>(untrack(() => parseMessageSource(settings.unlockMessage)));
  let saving = $state(false);

  let baseline = $state(untrack(() => snapshot()));
  let dirty = $derived(snapshot() !== baseline);

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
  const deleteOptions = [
    { id: "0", name: "Never" },
    { id: "5", name: "After 5 seconds" },
    { id: "15", name: "After 15 seconds" },
    { id: "30", name: "After 30 seconds" },
    { id: "60", name: "After 1 minute" },
    { id: "300", name: "After 5 minutes" },
    { id: "900", name: "After 15 minutes" },
    { id: "3600", name: "After 1 hour" },
    { id: "86400", name: "After 1 day" }
  ];
  let needsLog = $derived(mode === AchievementAnnounceMode.LogChannel && !logChannelId);
  let placeholders = $derived(catalog.placeholders.map((p) => ({ category: "Achievements", name: p.name, description: p.description })));

  /** The form state as text, for change tracking. */
  function snapshot(): string {
    return JSON.stringify([mode, logChannelId, dmByDefault, mentionUsers, unlockImage, deleteAfter, [...quietChannels].sort(),
      requireSendPermission, serializeMessage(message)]);
  }

  /** Saves the announcement settings. */
  async function save() {
    if (!$currentGuild?.id || saving) return;
    saving = true;
    try {
      const saved = await achievementsApi.updateSettings($currentGuild.id, {
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
      baseline = snapshot();
    } catch (err: any) {
      logger.error("Failed to save announcement settings:", err);
      onerror(err?.message || "Couldn't save the announcement settings.");
    } finally {
      saving = false;
    }
  }

  /** Puts the form back to the saved settings. */
  function discard() {
    mode = settings.announceMode;
    logChannelId = settings.logChannelId ? settings.logChannelId.toString() : null;
    dmByDefault = settings.dmByDefault;
    mentionUsers = settings.mentionUsers;
    unlockImage = settings.unlockImage;
    deleteAfter = settings.deleteAfter ?? 0;
    quietChannels = (settings.quietChannelIds ?? []).map((id) => id.toString());
    requireSendPermission = settings.requireSendPermission ?? true;
    message = parseMessageSource(settings.unlockMessage);
    baseline = snapshot();
  }
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
  <div class="relative rounded-2xl border p-5 md:p-6 shadow-2xl" style="z-index: 30;
       background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
       border-color: {$colorStore.primary}30;">
    <h2 class="flex items-center gap-2 text-lg font-semibold" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-bell" />
      Where unlocks are announced
    </h2>
    <p class="text-sm mt-1 mb-5" style="color: {$colorStore.muted}">
      Several unlocks at once share one message. Members can turn messages, mentions, and DMs off for themselves.
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" role="radiogroup" aria-label="Announcement mode">
      {#each ANNOUNCE_MODES as choice (choice.value)}
        {@const pressed = mode === choice.value}
        <button type="button" role="radio" aria-checked={pressed}
                class="flex items-start gap-3 p-4 rounded-xl border text-left transition-all hover:scale-[1.01] min-h-[44px]"
                style="background: {pressed ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                       border-color: {pressed ? $colorStore.primary : $colorStore.primary + '30'};"
                onclick={() => { mode = choice.value; }}>
          <DuoIcon icon={choice.icon} color={pressed ? null : $colorStore.muted} class="mt-1" />
          <span class="min-w-0">
            <span class="block font-semibold" style="color: {pressed ? $colorStore.primary : $colorStore.text}">{choice.title}</span>
            <span class="block text-sm" style="color: {$colorStore.muted}">{choice.text}</span>
          </span>
        </button>
      {/each}
    </div>

    <div class="mt-6 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
      <span id="ach-log-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Log channel</span>
      <div class="flex items-center gap-2 md:max-w-xl">
        <div class="flex-1 min-w-0">
          <DiscordSelector type="channel" options={channelOptions} selected={logChannelId}
                           placeholder="No log channel" ariaLabelledby="ach-log-label"
                           onchange={(d) => { logChannelId = typeof d.selected === "string" && d.selected ? d.selected : null; }} />
        </div>
        {#if logChannelId}
          <button type="button" class="w-[44px] h-[44px] rounded-xl shrink-0" aria-label="No log channel"
                  style="background: {$colorStore.primary}08; color: {$colorStore.muted};"
                  onclick={() => { logChannelId = null; }}>
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        {/if}
      </div>
      {#if logChannelProblem}
        <p class="text-xs mt-2" style="color: #ef4444">The bot can't post or embed links there.</p>
      {:else if needsLog}
        <p class="text-xs mt-2" style="color: {$colorStore.accent}">Pick a channel, or nothing gets announced.</p>
      {:else}
        <p class="text-xs mt-2" style="color: {$colorStore.muted}">Where unlocks go when the announce mode uses a log channel.</p>
      {/if}
    </div>

    <div class="mt-6 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
      <span id="ach-quiet-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Keep unlocks out of some channels</span>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 items-start">
        <div>
          <DiscordSelector type="channel" multiple={true} options={quietOptions} selected={quietChannels}
                           placeholder="No quiet channels" ariaLabelledby="ach-quiet-label"
                           onchange={(d) => { quietChannels = Array.isArray(d.selected) ? d.selected : []; }} />
          <p class="text-xs mt-2" style="color: {$colorStore.muted}">
            Members still earn achievements in these channels. The unlock is posted in the log channel instead, or not at all
            when there isn't one.
          </p>
        </div>
        <ToggleRow checked={requireSendPermission} title="Only post where the member can talk"
                   subtitle="Skips channels the member can't send messages in, such as a read only channel they reacted in. The log channel is never skipped."
                   colors={$colorStore} onchange={(v) => { requireSendPermission = v; }} />
      </div>
    </div>

    <div class="mt-6 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
      <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Delivery</span>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ToggleRow checked={dmByDefault} title="DM members by default" class="h-full"
                   subtitle="Members who haven't chosen get their unlocks in DMs too."
                   colors={$colorStore} onchange={(v) => { dmByDefault = v; }} />
        <ToggleRow checked={mentionUsers} title="Mention members" class="h-full"
                   subtitle="Ping members in unlock messages unless they turn it off."
                   colors={$colorStore} onchange={(v) => { mentionUsers = v; }} />
        <ToggleRow checked={unlockImage} title="Attach the achievement card" class="h-full"
                   subtitle="Design it in the Cards tab. Custom messages place it with %achievement.image%."
                   colors={$colorStore} onchange={(v) => { unlockImage = v; }} />
      </div>
    </div>

    <div class="mt-6 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
      <span id="ach-delete-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Delete unlock messages</span>
      <div class="md:max-w-xs">
        <DiscordSelector type="custom" options={deleteOptions} selected={deleteAfter.toString()} searchable={false}
                         ariaLabelledby="ach-delete-label" customIcon="fa-clock"
                         onchange={(d) => { deleteAfter = typeof d.selected === "string" ? Number(d.selected) : 0; }} />
      </div>
      <p class="text-xs mt-2" style="color: {$colorStore.muted}">
        Removes announcements from channels after a while to keep busy channels clean. 5 seconds unless you change it. DMs are
        never deleted.
      </p>
    </div>
  </div>

  <div class="relative rounded-2xl border p-5 md:p-6 shadow-2xl" style="z-index: 20;
       background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
       border-color: {$colorStore.primary}30;">
    <h2 class="flex items-center gap-2 text-lg font-semibold" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-envelope-open" />
      Unlock message
    </h2>
    <p class="text-sm mt-1 mb-5" style="color: {$colorStore.muted}">
      Leave it empty for the default embed in the grade's color. When several unlock at once, the placeholders use the best one and
      %achievement.list% lists them all.
    </p>
    <FullscreenEmbedBuilder id="achievement-unlock-message"
                            bind:value={message}
                            previewTitle="Unlock message"
                            previewDescription="Sent when a member unlocks achievements"
                            icon="fa-crown"
                            allowContent={true}
                            allowMultipleEmbeds={true}
                            maxEmbeds={10}
                            allowComponents={true}
                            additionalPlaceholders={placeholders}
                            guildId={$currentGuild?.id ?? null}
                            user={user ?? null}
                            placeholder="Click to write a custom unlock message, or leave it for the default" />
    <div class="flex flex-wrap gap-2 mt-4">
      {#each catalog.placeholders as p (p.name)}
        <code class="text-xs px-2 py-1 rounded-md" style="background: {$colorStore.primary}10; color: {$colorStore.primary}" title={p.description}>{p.name}</code>
      {/each}
    </div>
  </div>

  {#if dirty}
    <div class="sticky bottom-4 z-40 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-2xl border shadow-2xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20), #1a202c; border-color: {$colorStore.primary}40;"
         in:fade={{ duration: 150 }}>
      <span class="flex-1 text-sm" style="color: {$colorStore.text}">You have unsaved changes.</span>
      <button type="button" class="px-4 py-2.5 rounded-xl min-h-[44px]"
              style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              onclick={discard}>Discard</button>
      <button type="button" class="px-5 py-2.5 rounded-xl min-h-[44px] font-semibold disabled:opacity-50"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              disabled={saving || logChannelProblem} onclick={save}>
        {#if saving}<i class="fa-solid fa-spinner fa-spin mr-2" aria-hidden="true"></i>{/if}Save
      </button>
    </div>
  {/if}
</div>
