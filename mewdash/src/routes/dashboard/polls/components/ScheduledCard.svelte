<script lang="ts">
  import { m } from "$lib/i18n";
  import { pollApi, type ScheduledPollResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, formatDate, typeLabel, type Named } from "./pollModel";

  interface Props {
    guildId: bigint;
    userId: bigint | null;
    items: ScheduledPollResponse[];
    channels: Named[];
    onchanged: () => Promise<void>;
    onerror: (message: string) => void;
  }

  let { guildId, userId, items, channels, onchanged, onerror }: Props = $props();

  const pending = $derived(items.filter(item => !item.isExecuted && !item.isCancelled));
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function channelName(id: bigint): string {
    return channels.find(channel => channel.id === id.toString())?.name ?? id.toString();
  }

  async function cancel(item: ScheduledPollResponse) {
    if (!userId) return;
    const confirmed = await requestConfirmation({
      message: m.polls.scheduledCancelConfirm({ question: item.question }),
      confirmText: m.polls.scheduledCancelButton(),
      variant: "warning"
    });
    if (!confirmed) return;
    try {
      await pollApi.cancelScheduledPoll(guildId, item.id, userId);
      await onchanged();
    } catch (err) {
      logger.error("Failed to cancel scheduled poll:", err);
      onerror(errorText(err, m.polls.notifyCancelFailed()));
    }
  }
</script>

<PluginCard title={m.polls.scheduledTitle()} alwaysOpen>
  {#each pending as item (item.id)}
    <div class="flex items-center gap-2 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <div class="grow min-w-0">
        <p class="text-sm font-semibold break-words" style="color: {$colorStore.text}">{item.question}</p>
        <p class="text-xs" style="color: {$colorStore.muted}">#{channelName(item.channelId)} · {typeLabel(item.type)} · {m.polls.scheduledPosts({ date: formatDate(item.scheduledFor) })}</p>
      </div>
      <button type="button" class="px-3 rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={buttonStyle} aria-label="{m.common.cancel()}: {item.question}" onclick={() => cancel(item)}>
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    </div>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.polls.scheduledEmpty()}</p>
  {/each}
</PluginCard>
