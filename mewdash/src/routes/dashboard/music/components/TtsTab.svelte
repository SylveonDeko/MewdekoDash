<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { musicApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type { TtsBlockedUser, TtsGuildSettingsRequest, TtsVcSetting, TtsVoice } from "$lib/api/music/models";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "./NumberField.svelte";
  import RangeField from "./RangeField.svelte";
  import TtsChannels from "./TtsChannels.svelte";
  import { TTS_QUEUE_MAX, idString, type Named } from "./musicModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    voiceChannels: Named[];
    roles: Named[];
    autoSave: AutoSave;
    notify: (message: string, type?: "success" | "error") => void;
  }

  let { guildId, channels, voiceChannels, roles, autoSave, notify }: Props = $props();

  interface TtsGeneral {
    volume: number;
    speed: number;
    defaultVoice: string | null;
    replyContext: boolean;
    attachmentNarration: boolean;
    consecutiveGrouping: boolean;
    maxQueueSize: number;
    roleId: bigint | null;
  }

  type Field = keyof TtsGeneral;

  const ZERO = BigInt(0);

  let general = $state<TtsGeneral | null>(null);
  let saved: TtsGeneral | null = null;
  let vcSettings = $state<TtsVcSetting[]>([]);
  let blocked = $state<TtsBlockedUser[]>([]);
  let blockInput = $state("");
  let voiceSearch = $state("");
  let voiceResults = $state<TtsVoice[] | null>(null);
  let searching = $state(false);

  async function loadSettings() {
    const response: any = await musicApi.getTtsSettings(guildId);
    const next: TtsGeneral = {
      volume: response.ttsVolume ?? response.volume ?? 100,
      speed: response.ttsSpeed ?? response.speed ?? 1,
      defaultVoice: response.ttsDefaultVoice ?? response.defaultVoice ?? null,
      replyContext: response.ttsReplyContext ?? response.replyContext ?? true,
      attachmentNarration: response.ttsAttachmentNarration ?? response.attachmentNarration ?? true,
      consecutiveGrouping: response.ttsConsecutiveGrouping ?? response.consecutiveGrouping ?? true,
      maxQueueSize: response.ttsMaxQueueSize ?? response.maxQueueSize ?? 10,
      roleId: response.ttsRoleId ?? response.roleId ?? null
    };
    general = { ...next };
    saved = { ...next };
    vcSettings = (response.voiceChannels ?? []).map((vc: any) => ({
      voiceChannelId: vc.voiceChannelId,
      enabled: vc.enabled,
      linkedTextChannelId: vc.linkedTextChannelId ?? null,
      announceJoinLeave: vc.announceJoinLeave,
      joinFormat: vc.joinFormat ?? null,
      leaveFormat: vc.leaveFormat ?? null,
      autoJoin: vc.autoJoin ?? false
    }));
  }

  async function loadBlocked() {
    blocked = (await musicApi.getTtsBlockedUsers(guildId)) ?? [];
  }

  function save<K extends Field>(field: K, value: TtsGeneral[K], debounce = false) {
    if (!general || !saved) return;
    const previous = saved[field];
    general[field] = value;
    const body: TtsGuildSettingsRequest = {
      [field]: field === "defaultVoice" ? (value ?? "") : field === "roleId" ? (value ?? ZERO) : value
    };
    const run = async () => {
      try {
        await musicApi.updateTtsSettings(guildId, body);
        if (saved) saved[field] = value;
      } catch (err) {
        if (general) general[field] = previous;
        throw err;
      }
    };
    if (debounce) autoSave.schedule(`tts-${field}`, run);
    else autoSave.now(`tts-${field}`, run);
  }

  async function searchVoices() {
    if (!voiceSearch.trim()) return;
    searching = true;
    try {
      voiceResults = await musicApi.searchTtsVoices(guildId, voiceSearch.trim());
    } catch (err) {
      logger.error("Failed to search voices:", err);
      voiceResults = [];
    } finally {
      searching = false;
    }
  }

  async function block() {
    const raw = blockInput.trim();
    if (!/^\d{15,22}$/.test(raw)) return;
    try {
      await musicApi.setTtsUserBlocked(guildId, BigInt(raw), true);
      blockInput = "";
      await loadBlocked();
    } catch (err) {
      logger.error("Failed to block user:", err);
      notify(m.music.notifyUserBlockFailed(), "error");
    }
  }

  async function unblock(userId: bigint) {
    try {
      await musicApi.setTtsUserBlocked(guildId, userId, false);
      await loadBlocked();
    } catch (err) {
      logger.error("Failed to unblock user:", err);
      notify(m.music.notifyUserUnblockFailed(), "error");
    }
  }

  onMount(async () => {
    const results = await Promise.allSettled([loadSettings(), loadBlocked()]);
    for (const result of results) if (result.status === "rejected") logger.error("Failed to load TTS data:", result.reason);
  });

  const roleOptions = $derived([{ id: "null", name: m.music.ttsRequiredRoleNone() }, ...roles]);
  const input = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const plain = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}20; color: ${$colorStore.text};`);
</script>

{#if general}
  <PluginCard title={m.music.ttsGeneralTitle()} alwaysOpen>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RangeField
        id="tts-volume"
        label={m.music.ttsVolume()}
        value={general.volume}
        min={0}
        max={100}
        display="{general.volume}%"
        oninput={(value) => save("volume", value, true)}
        oncommit={() => autoSave.flush("tts-volume")}
      />
      <RangeField
        id="tts-speed"
        label={m.music.ttsSpeed()}
        value={general.speed}
        min={0.5}
        max={3}
        step={0.1}
        display="{general.speed.toFixed(1)}x"
        oninput={(value) => save("speed", value, true)}
        oncommit={() => autoSave.flush("tts-speed")}
      />
      <NumberField
        id="tts-max-queue"
        label={m.music.ttsMaxQueue()}
        value={general.maxQueueSize}
        min={1}
        max={TTS_QUEUE_MAX}
        oninput={(value) => save("maxQueueSize", value, true)}
        oncommit={() => autoSave.flush("tts-maxQueueSize")}
      />
      <SettingField label={m.common.requiredRole()} hint={m.music.ttsRequiredRoleHint()} id="tts-role">
        <DiscordSelector
          id="tts-role"
          type="role"
          options={roleOptions}
          selected={general.roleId === null ? "null" : idString(general.roleId)}
          placeholder={m.music.ttsRequiredRolePlaceholder()}
          onchange={(detail) => {
            const value = typeof detail.selected === "string" ? detail.selected : "";
            save("roleId", value === "" || value === "null" ? null : BigInt(value));
          }}
        />
      </SettingField>
    </div>

    <SettingField label={m.music.ttsDefaultVoice()} id="tts-default-voice">
      <input
        id="tts-default-voice"
        type="text"
        value={general.defaultVoice ?? ""}
        placeholder={m.music.ttsDefaultVoicePlaceholder()}
        oninput={(e) => save("defaultVoice", (e.currentTarget as HTMLInputElement).value.trim() || null, true)}
        onblur={() => autoSave.flush("tts-defaultVoice")}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={input}
      />
    </SettingField>

    <div class="space-y-2">
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          bind:value={voiceSearch}
          placeholder={m.music.ttsVoiceSearchPlaceholder()}
          aria-label={m.music.ttsVoiceSearchTitle()}
          onkeydown={(e) => {
            if (e.key === "Enter") void searchVoices();
          }}
          class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={input}
        />
        <button
          type="button"
          class="min-h-[50px] px-5 rounded-lg font-medium disabled:opacity-50"
          style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
          disabled={searching || !voiceSearch.trim()}
          onclick={searchVoices}
        >
          {searching ? m.music.searchSearching() : m.common.search()}
        </button>
      </div>
      {#if voiceResults}
        {#if voiceResults.length === 0}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.music.ttsVoicesNone()}</p>
        {:else}
          <div class="max-h-64 overflow-y-auto overscroll-contain space-y-2">
            {#each voiceResults as voice (voice.source + voice.name)}
              {@const active = general.defaultVoice === voice.name}
              <button
                type="button"
                class="w-full min-h-[50px] px-3 py-2 rounded-lg border text-left flex flex-wrap items-center justify-between gap-x-3"
                style="background: {active ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {active ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
                aria-pressed={active}
                onclick={() => save("defaultVoice", voice.name)}
              >
                <span class="text-sm font-medium">{voice.name}</span>
                <span class="text-xs" style="color: {$colorStore.muted}">{voice.language?.name ?? ""} · {voice.source}</span>
              </button>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </PluginCard>

  <PluginCard title={m.music.ttsBehaviorTitle()} alwaysOpen>
    <ToggleRow
      checked={general.replyContext}
      title={m.music.ttsReplyContext()}
      subtitle={m.music.ttsReplyContextHint()}
      colors={$colorStore}
      onchange={(value) => save("replyContext", value)}
    />
    <ToggleRow
      checked={general.attachmentNarration}
      title={m.music.ttsAttachmentNarration()}
      subtitle={m.music.ttsAttachmentNarrationHint()}
      colors={$colorStore}
      onchange={(value) => save("attachmentNarration", value)}
    />
    <ToggleRow
      checked={general.consecutiveGrouping}
      title={m.music.ttsConsecutiveGrouping()}
      subtitle={m.music.ttsConsecutiveGroupingHint()}
      colors={$colorStore}
      onchange={(value) => save("consecutiveGrouping", value)}
    />
  </PluginCard>

  <TtsChannels {guildId} {channels} {voiceChannels} {autoSave} {notify} bind:vcSettings onreload={loadSettings} />

  <PluginCard title={m.music.ttsBlockedTitle()} alwaysOpen>
    <div class="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        inputmode="numeric"
        bind:value={blockInput}
        placeholder={m.common.userId()}
        aria-label={m.common.userId()}
        onkeydown={(e) => {
          if (e.key === "Enter") void block();
        }}
        class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={input}
      />
      <button
        type="button"
        class="min-h-[50px] px-5 rounded-lg font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={!/^\d{15,22}$/.test(blockInput.trim())}
        onclick={block}
      >
        {m.common.block()}
      </button>
    </div>
    {#if blocked.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.music.ttsBlockedEmpty()}</p>
    {:else}
      <div class="space-y-2">
        {#each blocked as user (idString(user.userId))}
          <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <span class="grow min-w-0 px-2 text-sm truncate" style="color: {$colorStore.text}">{idString(user.userId)}</span>
            <button type="button" class="shrink-0 min-h-[44px] px-4 rounded-lg border text-sm" style={plain} onclick={() => unblock(user.userId)}>
              {m.common.unblock()}
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </PluginCard>
{/if}
