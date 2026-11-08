<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { musicApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type { MusicPlayerSetting } from "$lib/api/music/models";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NowPlaying from "./NowPlaying.svelte";
  import NumberField from "./NumberField.svelte";
  import RangeField from "./RangeField.svelte";
  import { AUTOPLAY_MAX, AUTO_DISCONNECT, idString, nameOf, type Named } from "./musicModel";

  interface Props {
    guildId: bigint;
    userId: bigint | null;
    channels: Named[];
    roles: Named[];
    autoSave: AutoSave;
    notify: (message: string, type?: "success" | "error") => void;
  }

  let { guildId, userId, channels, roles, autoSave, notify }: Props = $props();

  type Field = keyof MusicPlayerSetting;

  let settings = $state<MusicPlayerSetting | null>(null);
  let saved: MusicPlayerSetting | null = null;
  let linkChannels = $state<bigint[]>([]);
  let newLinkChannel = $state<string | null>(null);

  const ZERO = BigInt(0);

  function save(field: Field, value: MusicPlayerSetting[Field], debounce = false) {
    if (!settings || !saved) return;
    const previous = saved[field];
    (settings as any)[field] = value;
    const body = { [field]: value === null ? ZERO : value };
    const run = async () => {
      try {
        await musicApi.updateMusicSettings(guildId, body as unknown as MusicPlayerSetting);
        if (saved) (saved as any)[field] = value;
      } catch (err) {
        if (settings) (settings as any)[field] = previous;
        throw err;
      }
    };
    if (debounce) autoSave.schedule(`music-${field}`, run);
    else autoSave.now(`music-${field}`, run);
  }

  function pickId(detail: { selected: string | string[] | null }): bigint | null {
    const value = typeof detail.selected === "string" ? detail.selected : "";
    return value === "" || value === "null" ? null : BigInt(value);
  }

  function pickNumber(detail: { selected: string | string[] | null }): number | null {
    return typeof detail.selected === "string" && detail.selected !== "" ? Number(detail.selected) : null;
  }

  async function addLinkChannel() {
    if (!newLinkChannel) return;
    try {
      linkChannels = await musicApi.enableLinkChannel(guildId, BigInt(newLinkChannel));
      newLinkChannel = null;
    } catch (err) {
      logger.error("Failed to enable music link conversion:", err);
      notify(m.music.notifyLinkEnableFailed(), "error");
    }
  }

  async function removeLinkChannel(channelId: bigint) {
    try {
      linkChannels = await musicApi.disableLinkChannel(guildId, channelId);
    } catch (err) {
      logger.error("Failed to disable music link conversion:", err);
      notify(m.music.notifyLinkDisableFailed(), "error");
    }
  }

  onMount(async () => {
    const [loaded, links] = await Promise.allSettled([musicApi.getMusicSettings(guildId), musicApi.getLinkChannels(guildId)]);
    if (loaded.status === "fulfilled") {
      settings = { ...loaded.value };
      saved = { ...loaded.value };
    } else {
      logger.error("Failed to fetch music settings:", loaded.reason);
      notify(m.music.errorFetchSettings(), "error");
    }
    if (links.status === "fulfilled") linkChannels = links.value;
  });

  const repeatOptions = $derived([
    { id: "0", name: m.common.off() },
    { id: "1", name: m.music.repeatModeSingle() },
    { id: "2", name: m.music.repeatLiveQueue() }
  ]);

  const disconnectOptions = $derived([
    { id: String(AUTO_DISCONNECT.none), name: m.common.never() },
    { id: String(AUTO_DISCONNECT.voice), name: m.music.autoDisconnectVoice() },
    { id: String(AUTO_DISCONNECT.queue), name: m.music.autoDisconnectQueue() },
    { id: String(AUTO_DISCONNECT.either), name: m.music.autoDisconnectEither() }
  ]);

  const channelOptions = $derived([{ id: "null", name: m.music.generalChannelAll() }, ...channels]);
  const roleOptions = $derived([{ id: "null", name: m.music.generalDjRoleNone() }, ...roles]);
  const freeChannels = $derived(channels.filter(channel => !linkChannels.some(id => idString(id) === idString(channel.id))));
</script>

<NowPlaying {guildId} {userId} {notify} />

{#if settings}
  <PluginCard title={m.music.sectionPlayback()} alwaysOpen>
    <RangeField
      id="music-volume"
      label={m.music.generalVolume()}
      value={settings.volume}
      min={0}
      max={100}
      display="{settings.volume}%"
      oninput={(value) => save("volume", value, true)}
      oncommit={() => autoSave.flush("music-volume")}
    />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SettingField label={m.music.generalChannel()} id="music-channel">
        <DiscordSelector
          id="music-channel"
          type="channel"
          options={channelOptions}
          selected={settings.musicChannelId === null ? "null" : idString(settings.musicChannelId)}
          placeholder={m.music.generalChannelPlaceholder()}
          onchange={(detail) => save("musicChannelId", pickId(detail))}
        />
      </SettingField>
      <SettingField label={m.music.generalDjRole()} id="music-dj-role">
        <DiscordSelector
          id="music-dj-role"
          type="role"
          options={roleOptions}
          selected={settings.djRoleId === null ? "null" : idString(settings.djRoleId)}
          placeholder={m.music.generalDjRolePlaceholder()}
          onchange={(detail) => save("djRoleId", pickId(detail))}
        />
      </SettingField>
      <SettingField label={m.music.generalRepeatMode()} id="music-repeat">
        <DiscordSelector
          id="music-repeat"
          type="custom"
          options={repeatOptions}
          selected={String(settings.playerRepeat)}
          clearable={false}
          customIcon="fa-arrows-rotate"
          placeholder={m.music.repeatModePlaceholder()}
          onchange={(detail) => {
            const value = pickNumber(detail);
            if (value !== null) save("playerRepeat", value);
          }}
        />
      </SettingField>
      <SettingField label={m.music.advancedAutoDisconnect()} id="music-disconnect">
        <DiscordSelector
          id="music-disconnect"
          type="custom"
          options={disconnectOptions}
          selected={String(settings.autoDisconnect)}
          clearable={false}
          customIcon="fa-clock"
          placeholder={m.music.autoDisconnectPlaceholder()}
          onchange={(detail) => {
            const value = pickNumber(detail);
            if (value !== null) save("autoDisconnect", value);
          }}
        />
      </SettingField>
    </div>
    <NumberField
      id="music-autoplay"
      label={m.music.fieldAutoplay()}
      hint={m.music.fieldAutoplayHint({ max: AUTOPLAY_MAX })}
      value={settings.autoPlay}
      min={0}
      max={AUTOPLAY_MAX}
      oninput={(value) => save("autoPlay", value, true)}
      oncommit={() => autoSave.flush("music-autoPlay")}
    />
  </PluginCard>

  <PluginCard
    title={m.music.sectionVoteSkip()}
    enabled={settings.voteSkipEnabled}
    onToggle={(value) => save("voteSkipEnabled", value)}
  >
    <RangeField
      id="music-vote-threshold"
      label={m.music.advancedVoteSkipThreshold()}
      value={settings.voteSkipThreshold}
      min={1}
      max={100}
      display="{settings.voteSkipThreshold}%"
      oninput={(value) => save("voteSkipThreshold", value, true)}
      oncommit={() => autoSave.flush("music-voteSkipThreshold")}
    />
  </PluginCard>
{/if}

<PluginCard title={m.music.linkTitle()} alwaysOpen>
  <div class="flex flex-col sm:flex-row gap-2">
    <div class="grow min-w-0">
      <DiscordSelector
        type="channel"
        options={freeChannels}
        selected={newLinkChannel}
        placeholder={m.common.selectChannelPlaceholder()}
        ariaLabel={m.common.channel()}
        onchange={(detail) => (newLinkChannel = typeof detail.selected === "string" && detail.selected ? detail.selected : null)}
      />
    </div>
    <button
      type="button"
      class="min-h-[50px] px-5 rounded-lg font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={!newLinkChannel}
      onclick={addLinkChannel}
    >
      {m.music.linkAddChannel()}
    </button>
  </div>

  {#if linkChannels.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.music.linkEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each linkChannels as channelId (idString(channelId))}
        {@const name = nameOf(channels, channelId, m.music.unknownWithId({ id: idString(channelId) }))}
        <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <span class="grow min-w-0 px-2 text-sm font-medium truncate" style="color: {$colorStore.text}">#{name}</span>
          <button
            type="button"
            class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            aria-label={m.music.linkRemoveAria({ channel: name })}
            onclick={() => removeLinkChannel(channelId)}
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
