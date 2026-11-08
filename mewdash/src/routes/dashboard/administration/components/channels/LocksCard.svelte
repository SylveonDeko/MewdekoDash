<script lang="ts">
  import { m } from "$lib/i18n";
  import { channelActionsApi, channelToolsApi, type ChannelTimedAction } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ToolRow from "../ToolRow.svelte";
  import { errorText, type Named, type Notify } from "../toolsModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    notify: Notify;
  }

  let { guildId, channels, notify }: Props = $props();

  let locks: ChannelTimedAction[] = $state([]);
  let loading = $state(true);

  const soft = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      locks = await channelToolsApi.getLocks(guildId);
    } catch (err) {
      logger.error("Failed to load locked channels:", err);
      notify(errorText(err, m.serverTools.locksLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function undo(lock: ChannelTimedAction) {
    try {
      await channelActionsApi.unlock(guildId, { channelIds: [BigInt(lock.channelId)], kind: lock.kind });
      notify(m.serverTools.locksUndone());
    } catch (err) {
      logger.error("Failed to undo lock:", err);
      notify(errorText(err, m.serverTools.locksUndoFailed()), "error");
    }
    await load();
  }

  function channelName(id: bigint | string): string {
    return channels.find(channel => channel.id === String(id))?.name ?? String(id);
  }

  void load();
</script>

{#if loading || locks.length > 0}
  <PluginCard title={m.serverTools.locksTitle()} alwaysOpen>
    {#if loading}
      <div class="flex justify-center py-6">
        <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
      </div>
    {:else}
      <div class="space-y-2">
        {#each locks as lock (`${lock.channelId}:${lock.kind}`)}
          <ToolRow
            title={`#${channelName(lock.channelId)}`}
            subtitle={lock.endsAt ? m.serverTools.locksEnds({ time: new Date(lock.endsAt).toLocaleString() }) : m.serverTools.locksUntilUndone()}
            badges={[lock.kind === "Lock" ? m.serverTools.actionLock() : m.serverTools.actionHide()]}
          >
            {#snippet actions()}
              <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={soft} onclick={() => undo(lock)}>
                {lock.kind === "Lock" ? m.serverTools.actionUnlock() : m.serverTools.actionUnhide()}
              </button>
            {/snippet}
          </ToolRow>
        {/each}
      </div>
    {/if}
  </PluginCard>
{/if}
