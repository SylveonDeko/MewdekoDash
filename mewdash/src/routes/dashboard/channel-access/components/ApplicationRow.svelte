<script lang="ts">
  import { slide } from "svelte/transition";
  import { m } from "$lib/i18n";
  import { AccessApplicationStatus, type ChannelAccessApplication } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { formatDate } from "./channelAccessModel";

  interface Props {
    application: ChannelAccessApplication;
    channel: string;
    expanded: boolean;
    busy: boolean;
    ontoggle: () => void;
    onresolve: (approve: boolean, reason: string) => void;
  }

  let { application, channel, expanded, busy, ontoggle, onresolve }: Props = $props();

  let reason = $state("");

  const pending = $derived(application.status === AccessApplicationStatus.Pending);
  const statusLabels = $derived<Record<number, string>>({
    [AccessApplicationStatus.Pending]: m.common.pending(),
    [AccessApplicationStatus.Approved]: m.common.approved(),
    [AccessApplicationStatus.Denied]: m.common.denied(),
    [AccessApplicationStatus.Withdrawn]: m.channelAccess.statusWithdrawn(),
    [AccessApplicationStatus.Expired]: m.common.expired()
  });
  const statusColor = $derived(
    application.status === AccessApplicationStatus.Approved
      ? "#10b981"
      : application.status === AccessApplicationStatus.Denied
        ? "#ef4444"
        : application.status === AccessApplicationStatus.Pending
          ? $colorStore.primary
          : "#6b7280"
  );
  const who = $derived(
    application.username ?? (application.userId ? application.userId.toString() : m.channelAccess.appsHidden())
  );
  const tally = $derived([
    { icon: "fa-check", count: application.approvals, label: m.common.approve() },
    { icon: "fa-xmark", count: application.denials, label: m.common.deny() },
    { icon: "fa-minus", count: application.abstains, label: m.channelAccess.voteAbstain() }
  ]);

  function voteIcon(vote: number): string {
    return vote === 1 ? "fa-check" : vote === -1 ? "fa-xmark" : "fa-minus";
  }
</script>

<div
  class="rounded-xl border p-3 min-w-0"
  style="background: {$colorStore.primary}08; border-color: {statusColor}40;"
>
  <div class="flex items-start gap-3 min-w-0">
    {#if application.avatarUrl}
      <img alt="" class="w-10 h-10 rounded-full shrink-0" src={application.avatarUrl} loading="lazy" />
    {/if}
    <div class="grow min-w-0">
      <p class="text-sm font-semibold truncate" style="color: {$colorStore.text}">
        {m.channelAccess.appsTitle({ id: application.id, user: who })}
      </p>
      <p class="text-xs break-words" style="color: {$colorStore.muted}">
        {#if pending && application.expiresAt}
          {m.channelAccess.appsMetaCloses({ channel, date: formatDate(application.createdAt), closes: formatDate(application.expiresAt) })}
        {:else}
          {m.channelAccess.appsMetaOpened({ channel, date: formatDate(application.createdAt) })}
        {/if}
      </p>
    </div>
  </div>

  <div class="mt-2 flex flex-wrap items-center gap-2">
    <span class="px-2 py-1 rounded-lg text-xs font-medium" style="background: {statusColor}20; color: {$colorStore.text};">
      {statusLabels[application.status]}
    </span>
    {#each tally as item (item.icon)}
      <span class="inline-flex items-center gap-1 text-xs" style="color: {$colorStore.muted}" title={item.label}>
        <i class="fa-solid {item.icon}" aria-hidden="true"></i>
        <span class="sr-only">{item.label}</span>
        {item.count}
      </span>
    {/each}
    <button
      type="button"
      class="ml-auto px-4 rounded-lg min-h-[44px] text-sm font-medium"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      aria-expanded={expanded}
      onclick={ontoggle}
    >
      {expanded ? m.common.hide() : m.common.details()}
    </button>
  </div>

  {#if expanded}
    <div class="mt-3 space-y-3" transition:slide={{ duration: 150 }}>
      {#each application.answers as answer (answer.question)}
        <div class="rounded-lg p-3" style="background: {$colorStore.primary}10;">
          <p class="text-sm font-medium mb-1" style="color: {$colorStore.text}">{answer.question}</p>
          <p class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.muted}">{answer.answer}</p>
        </div>
      {/each}

      {#if application.votes.length > 0}
        <div class="rounded-lg p-3" style="background: {$colorStore.primary}10;">
          <p class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.features.votesName()}</p>
          <ul class="space-y-1">
            {#each application.votes as vote (vote.userId)}
              <li class="text-sm flex items-center gap-2" style="color: {$colorStore.muted}">
                <i class="fa-solid {voteIcon(vote.vote)} w-4 text-center" aria-hidden="true"></i>
                {vote.username ?? vote.userId.toString()}
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if pending}
        <input
          type="text"
          bind:value={reason}
          aria-label={m.common.reasonOptional()}
          placeholder={m.common.reasonOptional()}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        >
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="px-4 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
            style="background: #10b98120; color: {$colorStore.text}; border: 1px solid #10b98140;"
            disabled={busy}
            onclick={() => onresolve(true, reason)}
          >
            {m.common.approve()}
          </button>
          <button
            type="button"
            class="px-4 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
            style="background: #ef444420; color: {$colorStore.text}; border: 1px solid #ef444440;"
            disabled={busy}
            onclick={() => onresolve(false, reason)}
          >
            {m.common.deny()}
          </button>
        </div>
      {:else if application.resolutionReason}
        <p class="text-sm break-words" style="color: {$colorStore.muted}">
          {m.channelAccess.appsClosed({ date: formatDate(application.resolvedAt), reason: application.resolutionReason })}
        </p>
      {/if}
    </div>
  {/if}
</div>
