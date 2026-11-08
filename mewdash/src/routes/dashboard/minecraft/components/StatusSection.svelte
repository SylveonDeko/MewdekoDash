<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { MinecraftStatus } from "$lib/api/index.ts";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { FALLBACK_AVATAR, avatarUrl } from "./minecraftModel";

  interface Props {
    status: MinecraftStatus | undefined;
    refreshing: boolean;
  }

  let { status, refreshing }: Props = $props();

  const stats = $derived(
    status?.isOnline
      ? [
          { label: m.common.players(), value: `${status.playersOnline}/${status.playersMax}` },
          { label: m.minecraft.statusVersion(), value: status.version },
          { label: m.common.latency(), value: `${status.latency}ms` },
          { label: m.minecraft.statusSoftware(), value: status.software },
          { label: m.minecraft.statusMap(), value: status.map },
          { label: m.minecraft.statusMotd(), value: status.motd }
        ].filter(stat => stat.value)
      : []
  );
</script>

<PluginCard title={m.common.status()} alwaysOpen>
  {#snippet actions()}
    {#if refreshing}
      <i class="fa-solid fa-spinner fa-spin" style="color: {$colorStore.muted}" aria-hidden="true"></i>
    {/if}
  {/snippet}

  {#if !status}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
  {:else if !status.isOnline}
    <p class="p-3 rounded-xl text-center font-semibold" style="background: #ef444415; color: #ef4444;">{m.minecraft.statusUnreachable()}</p>
  {:else}
    <div class="grid grid-cols-2 gap-2">
      {#each stats as stat (stat.label)}
        <div class="p-3 rounded-xl min-w-0 {stat.label === m.minecraft.statusMotd() ? 'col-span-2' : ''}" style="background: {$colorStore.primary}08;">
          <div class="text-xs" style="color: {$colorStore.muted}">{stat.label}</div>
          <div class="text-sm font-medium break-words" style="color: {$colorStore.text}">{stat.value}</div>
        </div>
      {/each}
    </div>

    {#if status.playerList.length}
      <div>
        <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.minecraft.manageOnlinePlayers({ count: status.playerList.length })}</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {#each status.playerList as player (player)}
            <div class="flex items-center gap-3 p-2 rounded-xl min-w-0" style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
              <img
                src={avatarUrl(player, 48)}
                alt=""
                class="w-9 h-9 rounded-lg shrink-0"
                onerror={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR)}
              >
              <span class="text-sm font-medium truncate" style="color: {$colorStore.text}">{player}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if status.plugins.length}
      <div>
        <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.minecraft.managePlugins({ count: status.plugins.length })}</h4>
        <div class="flex flex-wrap gap-2">
          {#each status.plugins as plugin (plugin)}
            <span class="px-3 py-1 rounded-lg text-sm" style="background: {$colorStore.primary}10; color: {$colorStore.text};">{plugin}</span>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</PluginCard>
