<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { minecraftApi, type MinecraftServer } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { channelIdOrNone, type Named } from "./minecraftModel";

  interface Props {
    guildId: bigint;
    server: MinecraftServer;
    channels: Named[];
    autoSave: AutoSave;
    onupdate: (server: MinecraftServer) => void;
  }

  let { guildId, server, channels, autoSave, onupdate }: Props = $props();

  const initial = untrack(() => server);
  let address = $state(initial.address);
  let port = $state(initial.port);
  let serverType = $state(String(initial.serverType));
  let queryPort = $state(initial.queryPort);
  let watchChannel: string | null = $state(initial.watchChannelId?.toString() ?? null);
  let watchInterval = $state(initial.watchInterval);
  let watchMode = $state(String(initial.watchMode));
  let chatChannel: string | null = $state(initial.chatChannelId?.toString() ?? null);
  let joinLeaveChannel: string | null = $state(initial.joinLeaveChannelId?.toString() ?? null);
  let deathChannel: string | null = $state(initial.deathChannelId?.toString() ?? null);
  let advancementChannel: string | null = $state(initial.advancementChannelId?.toString() ?? null);

  const typeOptions = $derived([
    { id: "0", name: m.minecraft.serverTypeJava(), icon: "fa-mug-hot" },
    { id: "1", name: m.minecraft.serverTypeBedrock(), icon: "fa-mobile-screen" },
    { id: "2", name: m.minecraft.serverTypeGeyser(), icon: "fa-shuffle" }
  ]);

  const modeOptions = $derived([
    { id: "0", name: m.minecraft.watchModeEmbed(), icon: "fa-message" },
    { id: "1", name: m.placeholders.channelTopic(), icon: "fa-heading" },
    { id: "2", name: m.common.both(), icon: "fa-layer-group" }
  ]);

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const key = (part: string) => `${server.name}:${part}`;

  function restoreConnection() {
    address = server.address;
    port = server.port;
    serverType = String(server.serverType);
    queryPort = server.queryPort;
  }

  function restoreWatch() {
    watchChannel = server.watchChannelId?.toString() ?? null;
    watchInterval = server.watchInterval;
    watchMode = String(server.watchMode);
  }

  function restoreEvents() {
    chatChannel = server.chatChannelId?.toString() ?? null;
    joinLeaveChannel = server.joinLeaveChannelId?.toString() ?? null;
    deathChannel = server.deathChannelId?.toString() ?? null;
    advancementChannel = server.advancementChannelId?.toString() ?? null;
  }

  function connectionValid() {
    return address.trim() !== "" && port >= 1 && port <= 65535 && queryPort >= 0 && queryPort <= 65535;
  }

  function saveConnection(immediate = false) {
    if (!connectionValid()) return;
    const run = async () => {
      try {
        onupdate(
          await minecraftApi.updateServer(guildId, server.name, {
            address: address.trim(),
            port,
            serverType: Number(serverType),
            queryPort
          })
        );
      } catch (err) {
        restoreConnection();
        throw err;
      }
    };
    if (immediate) void autoSave.now(key("connection"), run);
    else autoSave.schedule(key("connection"), run);
  }

  function saveWatch(immediate = false) {
    const interval = Math.min(60, Math.max(1, Math.floor(watchInterval) || 1));
    const run = async () => {
      try {
        onupdate(
          await minecraftApi.setWatch(guildId, server.name, {
            channelId: watchChannel ? BigInt(watchChannel) : null,
            interval,
            watchMode: Number(watchMode)
          })
        );
      } catch (err) {
        restoreWatch();
        throw err;
      }
    };
    if (immediate) void autoSave.now(key("watch"), run);
    else autoSave.schedule(key("watch"), run);
  }

  function saveEvents() {
    void autoSave.now(key("events"), async () => {
      try {
        onupdate(
          await minecraftApi.updateServer(guildId, server.name, {
            chatChannelId: channelIdOrNone(chatChannel),
            joinLeaveChannelId: channelIdOrNone(joinLeaveChannel),
            deathChannelId: channelIdOrNone(deathChannel),
            advancementChannelId: channelIdOrNone(advancementChannel)
          })
        );
      } catch (err) {
        restoreEvents();
        throw err;
      }
    });
  }

  const asId = (value: string | string[] | null) => (typeof value === "string" ? value : null);
</script>

<PluginCard title={m.minecraft.sectionConnection()} alwaysOpen>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <SettingField label={m.minecraft.fieldAddress()} id="mc-address">
      <input
        id="mc-address"
        type="text"
        autocapitalize="none"
        bind:value={address}
        oninput={() => saveConnection()}
        onblur={() => autoSave.flush(key("connection"))}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
    <SettingField label={m.minecraft.fieldPort()} id="mc-port">
      <input
        id="mc-port"
        type="number"
        inputmode="numeric"
        min="1"
        max="65535"
        bind:value={port}
        oninput={() => saveConnection()}
        onblur={() => autoSave.flush(key("connection"))}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
    <SettingField label={m.common.type()} id="mc-type">
      <DiscordSelector
        id="mc-type"
        type="custom"
        customIcon="fa-server"
        options={typeOptions}
        selected={serverType}
        clearable={false}
        placeholder={m.minecraft.placeholderType()}
        onchange={(detail) => {
          if (typeof detail.selected !== "string") return;
          serverType = detail.selected;
          saveConnection(true);
        }}
      />
    </SettingField>
    <SettingField label={m.minecraft.fieldQueryPortEdit()} id="mc-query-port">
      <input
        id="mc-query-port"
        type="number"
        inputmode="numeric"
        min="0"
        max="65535"
        bind:value={queryPort}
        oninput={() => saveConnection()}
        onblur={() => autoSave.flush(key("connection"))}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
  </div>
</PluginCard>

<PluginCard title={m.minecraft.sectionWatch()} alwaysOpen>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <SettingField label={m.minecraft.fieldWatchChannel()} id="mc-watch-channel">
      <DiscordSelector
        id="mc-watch-channel"
        type="channel"
        options={channels}
        selected={watchChannel}
        placeholder={m.minecraft.placeholderNoWatchChannel()}
        onchange={(detail) => {
          watchChannel = asId(detail.selected);
          saveWatch(true);
        }}
      />
    </SettingField>
    <SettingField label={m.minecraft.fieldWatchMode()} id="mc-watch-mode">
      <DiscordSelector
        id="mc-watch-mode"
        type="custom"
        customIcon="fa-eye"
        options={modeOptions}
        selected={watchMode}
        clearable={false}
        placeholder={m.minecraft.placeholderWatchMode()}
        onchange={(detail) => {
          if (typeof detail.selected !== "string") return;
          watchMode = detail.selected;
          saveWatch(true);
        }}
      />
    </SettingField>
    <SettingField label={m.minecraft.fieldWatchInterval()} id="mc-watch-interval">
      <input
        id="mc-watch-interval"
        type="number"
        inputmode="numeric"
        min="1"
        max="60"
        bind:value={watchInterval}
        oninput={() => saveWatch()}
        onblur={() => autoSave.flush(key("watch"))}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
  </div>
</PluginCard>

<PluginCard title={m.minecraft.eventChannelsTitle()} alwaysOpen>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <SettingField label={m.minecraft.eventChatBridge()} id="mc-chat-channel">
      <DiscordSelector id="mc-chat-channel" type="channel" options={channels} selected={chatChannel} placeholder={m.minecraft.placeholderUseWatchChannel()}
        onchange={(detail) => { chatChannel = asId(detail.selected); saveEvents(); }} />
    </SettingField>
    <SettingField label={m.minecraft.eventJoinLeave()} id="mc-join-channel">
      <DiscordSelector id="mc-join-channel" type="channel" options={channels} selected={joinLeaveChannel} placeholder={m.minecraft.placeholderUseWatchChannel()}
        onchange={(detail) => { joinLeaveChannel = asId(detail.selected); saveEvents(); }} />
    </SettingField>
    <SettingField label={m.minecraft.eventDeaths()} id="mc-death-channel">
      <DiscordSelector id="mc-death-channel" type="channel" options={channels} selected={deathChannel} placeholder={m.minecraft.placeholderUseWatchChannel()}
        onchange={(detail) => { deathChannel = asId(detail.selected); saveEvents(); }} />
    </SettingField>
    <SettingField label={m.minecraft.eventAdvancements()} id="mc-advancement-channel">
      <DiscordSelector id="mc-advancement-channel" type="channel" options={channels} selected={advancementChannel} placeholder={m.minecraft.placeholderUseWatchChannel()}
        onchange={(detail) => { advancementChannel = asId(detail.selected); saveEvents(); }} />
    </SettingField>
  </div>
</PluginCard>
