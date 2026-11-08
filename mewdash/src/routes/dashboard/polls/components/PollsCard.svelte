<script lang="ts">
  import { m } from "$lib/i18n";
  import { pollApi, type PollResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { saveBlob } from "$lib/components/stats/format";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText, formatDate, timeLeft, typeLabel } from "./pollModel";

  interface Props {
    guildId: bigint;
    userId: bigint | null;
    polls: PollResponse[];
    loading: boolean;
    includeClosed: boolean;
    onincludeclosed: (value: boolean) => void;
    onnew: () => void;
    onchanged: () => Promise<void>;
    onerror: (message: string) => void;
  }

  let { guildId, userId, polls, loading, includeClosed, onincludeclosed, onnew, onchanged, onerror }: Props = $props();

  let openId: number | null = $state(null);
  let detail: PollResponse | null = $state(null);
  let busy = $state(false);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const primaryButton = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
  const open = $derived(polls.find(poll => poll.id === openId) ?? null);
  const shown = $derived.by(() => {
    const loaded = detail as PollResponse | null;
    return loaded && loaded.id === openId ? loaded : open;
  });
  const total = $derived(shown ? shown.options.reduce((sum, option) => sum + option.voteCount, 0) : 0);

  function votes(poll: PollResponse): number {
    return poll.options.reduce((sum, option) => sum + option.voteCount, 0);
  }

  async function show(poll: PollResponse) {
    openId = poll.id;
    detail = null;
    try {
      detail = await pollApi.getPoll(guildId, poll.id);
    } catch (err) {
      logger.error("Failed to load poll details:", err);
    }
  }

  async function close(poll: PollResponse) {
    if (!userId) return;
    const confirmed = await requestConfirmation({
      message: m.polls.closeConfirm({ question: poll.question }),
      confirmText: m.polls.closeConfirmButton(),
      variant: "warning"
    });
    if (!confirmed) return;
    busy = true;
    try {
      await pollApi.closePoll(guildId, poll.id, { userId, notifyVoters: false });
      openId = null;
      await onchanged();
    } catch (err) {
      logger.error("Failed to close poll:", err);
      onerror(errorText(err, m.polls.notifyCloseFailed()));
    } finally {
      busy = false;
    }
  }

  async function remove(poll: PollResponse) {
    if (!userId) return;
    const confirmed = await requestConfirmation({
      message: m.polls.deleteConfirm({ question: poll.question }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    busy = true;
    try {
      await pollApi.deletePoll(guildId, poll.id, userId);
      openId = null;
      await onchanged();
    } catch (err) {
      logger.error("Failed to delete poll:", err);
      onerror(errorText(err, m.polls.notifyDeleteFailed()));
    } finally {
      busy = false;
    }
  }

  async function exportCsv(poll: PollResponse) {
    try {
      saveBlob(await pollApi.exportPoll(guildId, poll.id), `poll-${poll.id}.csv`);
    } catch (err) {
      logger.error("Failed to export poll:", err);
      onerror(errorText(err, m.polls.errorExport()));
    }
  }
</script>

{#snippet newButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={primaryButton} onclick={onnew}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.polls.actionNew()}
  </button>
{/snippet}

<PluginCard title={m.features.pollsName()} actions={newButton} alwaysOpen>
  <ToggleRow checked={includeClosed} title={m.polls.listIncludeClosed()} colors={$colorStore} onchange={onincludeclosed} />

  {#if loading && polls.length === 0}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if polls.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.polls.listEmptyTitle()}</p>
  {/if}

  {#each polls as poll (poll.id)}
    <button
      type="button"
      class="w-full text-left flex items-start gap-3 rounded-xl border p-3 min-h-[56px] min-w-0"
      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
      onclick={() => show(poll)}
    >
      <i class="fa-solid {poll.isActive ? 'fa-circle-dot' : 'fa-circle-check'} mt-1 shrink-0" style="color: {$colorStore.text};" aria-hidden="true"></i>
      <span class="grow min-w-0">
        <span class="block text-sm font-semibold break-words" style="color: {$colorStore.text}">{poll.question}</span>
        <span class="block text-xs" style="color: {$colorStore.muted}">
          #{poll.channelName ?? poll.channelId} · {typeLabel(poll.type)} · {votes(poll) === 1 ? m.common.votesOne({ count: 1 }) : m.common.votesOther({ count: votes(poll) })} · {poll.isActive ? timeLeft(poll.expiresAt) : m.common.closedDate({ date: formatDate(poll.closedAt) })}
        </span>
      </span>
    </button>
  {/each}
</PluginCard>

{#if shown && open}
  {@const poll = open}
  <Sheet title={m.common.poll()} onclose={() => (openId = null)}>
    <h4 class="font-semibold break-words" style="color: {$colorStore.text}">{shown.question}</h4>
    <div class="space-y-3">
      {#each shown.options as option (option.id)}
        {@const pct = total > 0 ? Math.round((option.voteCount / total) * 100) : 0}
        <div>
          <div class="flex items-center justify-between gap-3 text-sm mb-1">
            <span class="min-w-0 break-words" style="color: {$colorStore.text}">{option.emote ? `${option.emote} ` : ""}{option.text}</span>
            <span class="shrink-0 tabular-nums" style="color: {$colorStore.muted}">{option.voteCount} · {pct}%</span>
          </div>
          <div class="h-2 rounded-full overflow-hidden" style="background: {$colorStore.primary}15;">
            <div class="h-full rounded-full" style="width: {pct}%; background: {$colorStore.selectedBorder};"></div>
          </div>
        </div>
      {/each}
    </div>

    {#if shown.stats}
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}08;">
          <div class="text-xs" style="color: {$colorStore.muted}">{m.polls.detailUnique()}</div>
          <div class="font-bold" style="color: {$colorStore.text}">{shown.stats.uniqueVoters}</div>
        </div>
        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}08;">
          <div class="text-xs" style="color: {$colorStore.muted}">{m.polls.detailParticipation()}</div>
          <div class="font-bold" style="color: {$colorStore.text}">{Math.round(shown.stats.participationRate * 100) / 100}%</div>
        </div>
        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}08;">
          <div class="text-xs" style="color: {$colorStore.muted}">{m.common.peakHour()}</div>
          <div class="font-bold" style="color: {$colorStore.text}">{m.polls.detailPeakValue({ hour: shown.stats.peakVotingHour })}</div>
        </div>
        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}08;">
          <div class="text-xs" style="color: {$colorStore.muted}">{m.common.created()}</div>
          <div class="font-bold" style="color: {$colorStore.text}">{new Date(shown.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    {/if}

    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={buttonStyle} disabled={busy} onclick={() => remove(poll)}>{m.common.delete()}</button>
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => exportCsv(poll)}>CSV</button>
      {#if poll.isActive}
        <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={busy} onclick={() => close(poll)}>{m.polls.closeConfirmButton()}</button>
      {/if}
    {/snippet}
  </Sheet>
{/if}
