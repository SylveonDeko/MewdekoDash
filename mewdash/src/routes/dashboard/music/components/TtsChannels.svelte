<script lang="ts">
  import { m } from "$lib/i18n";
  import { musicApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import type { TtsVcSetting } from "$lib/api/music/models";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { idString, nameOf, vcPayload, type Named } from "./musicModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    voiceChannels: Named[];
    autoSave: AutoSave;
    notify: (message: string, type?: "success" | "error") => void;
    vcSettings: TtsVcSetting[];
    onreload: () => Promise<void>;
  }

  let { guildId, channels, voiceChannels, autoSave, notify, vcSettings = $bindable(), onreload }: Props = $props();

  const PLACEHOLDERS = ["%user.name%", "%user.mention%", "%user.id%", "%server.name%", "%server.members%", "%channel.name%"];

  let newChannel = $state<string | null>(null);
  let editingId = $state<string | null>(null);

  const editing = $derived(vcSettings.find(vc => idString(vc.voiceChannelId) === editingId) ?? null);
  const freeChannels = $derived(
    voiceChannels.filter(channel => !vcSettings.some(vc => idString(vc.voiceChannelId) === idString(channel.id)))
  );
  const textOptions = $derived([{ id: "null", name: m.music.ttsVcLinkedTextOnly() }, ...channels]);

  function label(id: bigint) {
    return nameOf(voiceChannels, id, m.music.unknownWithId({ id: idString(id) }));
  }

  async function add() {
    if (!newChannel) return;
    try {
      await musicApi.upsertTtsVcSetting(guildId, {
        voiceChannelId: BigInt(newChannel),
        enabled: true,
        linkedTextChannelId: null,
        announceJoinLeave: false,
        joinFormat: null,
        leaveFormat: null,
        autoJoin: false
      });
      newChannel = null;
      await onreload();
    } catch (err) {
      logger.error("Failed to add TTS voice channel:", err);
      notify(m.music.notifyVcAddFailed(), "error");
    }
  }

  async function remove(vc: TtsVcSetting) {
    const name = label(vc.voiceChannelId);
    if (!(await requestConfirmation({ message: m.music.ttsVcRemoveConfirm({ channel: name }), confirmText: m.common.remove() }))) return;
    try {
      await musicApi.removeTtsVcSetting(guildId, vc.voiceChannelId);
      if (editingId === idString(vc.voiceChannelId)) editingId = null;
      await onreload();
    } catch (err) {
      logger.error("Failed to remove TTS voice channel:", err);
      notify(m.music.notifyVcRemoveFailed(), "error");
    }
  }

  function update<K extends keyof TtsVcSetting>(vc: TtsVcSetting, field: K, value: TtsVcSetting[K], debounce = false) {
    const previous = vc[field];
    vc[field] = value;
    const body = vcPayload(vc);
    const key = `vc-${idString(vc.voiceChannelId)}`;
    const run = async () => {
      try {
        await musicApi.upsertTtsVcSetting(guildId, body);
      } catch (err) {
        vc[field] = previous;
        throw err;
      }
    };
    if (debounce) autoSave.schedule(key, run);
    else autoSave.now(key, run);
  }

  const input = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

<PluginCard title={m.music.ttsVcTitle()} alwaysOpen>
  <div class="flex flex-col sm:flex-row gap-2">
    <div class="grow min-w-0">
      <DiscordSelector
        type="custom"
        options={freeChannels}
        selected={newChannel}
        customIcon="fa-volume"
        placeholder={m.common.selectVoiceChannelPlaceholder()}
        ariaLabel={m.common.voiceChannel()}
        onchange={(detail) => (newChannel = typeof detail.selected === "string" && detail.selected ? detail.selected : null)}
      />
    </div>
    <button
      type="button"
      class="min-h-[50px] px-5 rounded-lg font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={!newChannel}
      onclick={add}
    >
      {m.music.ttsVcEnable()}
    </button>
  </div>

  {#if vcSettings.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.music.ttsVcEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each vcSettings as vc (idString(vc.voiceChannelId))}
        <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <button type="button" class="grow min-w-0 text-left min-h-[44px] px-1" onclick={() => (editingId = idString(vc.voiceChannelId))}>
            <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{label(vc.voiceChannelId)}</span>
            <span class="flex flex-wrap items-center gap-1.5 mt-1">
              <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                {vc.enabled ? m.common.enabled() : m.common.disabled()}
              </span>
              {#if vc.autoJoin}
                <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{m.music.ttsVcAutoJoin()}</span>
              {/if}
              {#if vc.announceJoinLeave}
                <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{m.music.ttsVcAnnounce()}</span>
              {/if}
            </span>
          </button>
          <button
            type="button"
            class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            aria-label={m.music.ttsVcRemoveAria({ channel: label(vc.voiceChannelId) })}
            onclick={() => remove(vc)}
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>

{#if editing}
  {@const vc = editing}
  <Sheet title={label(vc.voiceChannelId)} onclose={() => (editingId = null)}>
    <ToggleRow checked={vc.enabled} title={m.common.enabled()} colors={$colorStore} onchange={(value) => update(vc, "enabled", value)} />

    <SettingField label={m.music.ttsVcLinkedTextChannel()} id="tts-vc-text">
      <DiscordSelector
        id="tts-vc-text"
        type="channel"
        options={textOptions}
        selected={vc.linkedTextChannelId === null ? "null" : idString(vc.linkedTextChannelId)}
        placeholder={m.common.selectChannelPlaceholder()}
        onchange={(detail) => {
          const value = typeof detail.selected === "string" ? detail.selected : "";
          update(vc, "linkedTextChannelId", value === "" || value === "null" ? null : BigInt(value));
        }}
      />
    </SettingField>

    <ToggleRow
      checked={vc.autoJoin}
      title={m.music.ttsVcAutoJoinToggle()}
      subtitle={m.music.ttsVcAutoJoinHint()}
      colors={$colorStore}
      onchange={(value) => update(vc, "autoJoin", value)}
    />

    <ToggleRow
      checked={vc.announceJoinLeave}
      title={m.music.ttsVcAnnounce()}
      colors={$colorStore}
      onchange={(value) => update(vc, "announceJoinLeave", value)}
    />

    {#if vc.announceJoinLeave}
      <SettingField label={m.music.ttsVcJoinFormat()} id="tts-vc-join">
        <input
          id="tts-vc-join"
          type="text"
          value={vc.joinFormat ?? ""}
          placeholder={m.music.ttsVcJoinFormatPlaceholder()}
          oninput={(e) => update(vc, "joinFormat", (e.currentTarget as HTMLInputElement).value || null, true)}
          onblur={() => autoSave.flush(`vc-${idString(vc.voiceChannelId)}`)}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={input}
        />
      </SettingField>
      <SettingField label={m.music.ttsVcLeaveFormat()} id="tts-vc-leave">
        <input
          id="tts-vc-leave"
          type="text"
          value={vc.leaveFormat ?? ""}
          placeholder={m.music.ttsVcLeaveFormatPlaceholder()}
          oninput={(e) => update(vc, "leaveFormat", (e.currentTarget as HTMLInputElement).value || null, true)}
          onblur={() => autoSave.flush(`vc-${idString(vc.voiceChannelId)}`)}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={input}
        />
      </SettingField>
      <p class="text-xs break-words" style="color: {$colorStore.muted}">
        {m.music.ttsVcPlaceholders()}
        {#each PLACEHOLDERS as placeholder (placeholder)}
          <code class="mr-1" style="color: {$colorStore.text}">{placeholder}</code>
        {/each}
      </p>
    {/if}

    {#snippet footer()}
      <button
        type="button"
        class="min-h-[44px] px-4 rounded-lg border text-sm"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20; color: {$colorStore.text};"
        onclick={() => remove(vc)}
      >
        {m.common.remove()}
      </button>
    {/snippet}
  </Sheet>
{/if}
