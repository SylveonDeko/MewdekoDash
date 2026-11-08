<script lang="ts">
  import { m } from "$lib/i18n";
  import type { MinecraftServer, MinecraftStatus } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { serverTypeLabel, type Named } from "./minecraftModel";

  interface Props {
    servers: MinecraftServer[];
    statuses: Record<string, MinecraftStatus>;
    channels: Named[];
    loading: boolean;
    onopen: (server: MinecraftServer) => void;
  }

  let { servers, statuses, channels, loading, onopen }: Props = $props();

  function channelName(id: bigint | null): string {
    if (!id) return "";
    return channels.find(channel => String(channel.id) === id.toString())?.name ?? m.common.unknown();
  }
</script>

<PluginCard title={m.common.servers()} alwaysOpen>
  {#if loading && !servers.length}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if !servers.length}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-server" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.minecraft.serversEmptyTitle()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each servers as server (server.id)}
        {@const status = statuses[server.name]}
        {@const badges = [
          ...(server.isDefault ? [m.common.default()] : []),
          serverTypeLabel(server.serverType),
          ...(status ? [status.isOnline ? m.minecraft.serversPlayersOnline({ online: status.playersOnline, max: status.playersMax }) : m.common.offline()] : []),
          ...(server.rconEnabled ? [m.minecraft.serversRconEnabled()] : [])
        ]}
        <button
          type="button"
          class="w-full flex items-center gap-3 rounded-xl border p-3 min-h-[44px] min-w-0 text-left"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
          onclick={() => onopen(server)}
        >
          <span
            class="shrink-0 w-3 h-3 rounded-full"
            style="background: {status ? (status.isOnline ? '#10b981' : '#ef4444') : `${$colorStore.muted}`};"
            aria-hidden="true"
          ></span>
          <span class="grow min-w-0">
            <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{server.name}</span>
            <span class="block text-sm truncate" style="color: {$colorStore.muted}">
              {server.address}:{server.port}{#if server.watchChannelId} · {m.minecraft.serversWatching({ channel: `#${channelName(server.watchChannelId)}`, minutes: server.watchInterval })}{/if}
            </span>
            <span class="flex flex-wrap items-center gap-1.5 mt-1">
              {#each badges as badge (badge)}
                <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
              {/each}
            </span>
          </span>
          <i class="fa-solid fa-chevron-right shrink-0" style="color: {$colorStore.muted}" aria-hidden="true"></i>
        </button>
      {/each}
    </div>
  {/if}
</PluginCard>
