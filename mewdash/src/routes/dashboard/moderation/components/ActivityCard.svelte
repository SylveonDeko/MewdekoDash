<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { moderationApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    guildId: bigint;
  }

  let { guildId }: Props = $props();

  let recent: any[] = $state([]);

  onMount(async () => {
    try {
      recent = await moderationApi.getRecentModerationActivity(guildId, 10);
    } catch (err) {
      logger.error("Failed to load recent activity:", err);
    }
  });
</script>

<PluginCard title={m.moderation.activityTitle()}>
  {#if recent.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.moderation.activityEmpty()}</p>
  {:else}
    <div class="space-y-2 max-h-96 overflow-y-auto">
      {#each recent as warning (warning.id)}
        <div class="p-3 rounded-xl border space-y-1" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="font-medium" style="color: {$colorStore.text}">
            {m.common.userIdLabel({ id: warning.userId })}
            {#if warning.forgiven}
              <span class="ml-2 text-xs" style="color: {$colorStore.muted}">{m.moderation.warningsForgiven()}</span>
            {/if}
          </div>
          <p class="text-sm" style="color: {$colorStore.text}">{warning.reason || m.common.noReasonProvided()}</p>
          <div class="flex items-center gap-4 text-xs" style="color: {$colorStore.muted}">
            <span>{m.moderation.activityModerator({ name: warning.moderator || m.common.unknown() })}</span>
            <span>{m.moderation.activityDate({ date: warning.dateAdded ? new Date(warning.dateAdded).toLocaleString() : m.common.unknown() })}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
