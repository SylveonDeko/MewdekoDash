<script lang="ts">
  import { m } from "$lib/i18n";
  import type { FeatureRequestEntry } from "$lib/api/featurerequests/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { categoryIcon, categoryOptions, formatDate, statusOptions } from "./requestModel";

  interface Props {
    entry: FeatureRequestEntry;
    owner: boolean;
    onvote: () => void;
    onstatus: () => void;
    ondelete: () => void;
  }

  let { entry, owner, onvote, onstatus, ondelete }: Props = $props();

  let expanded = $state(false);

  const status = $derived(statusOptions().find(option => option.id === entry.status)?.name ?? entry.status);
  const category = $derived(categoryOptions().find(option => option.id === entry.category)?.name ?? entry.category);

  const chip = $derived(`background: ${$colorStore.primary}15; color: ${$colorStore.text};`);
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

<div class="rounded-xl border min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
  <div class="flex gap-2 p-2">
    <button
      type="button"
      class="shrink-0 flex flex-col items-center justify-center rounded-lg min-w-[56px] min-h-[56px]"
      style={entry.voted
        ? `background: ${$colorStore.primary}; color: ${$colorStore.onPrimary}; border: 1px solid ${$colorStore.primary};`
        : buttonStyle}
      aria-pressed={entry.voted}
      aria-label={entry.voted ? m.featureRequests.voteRemoveAria() : m.featureRequests.voteAddAria()}
      onclick={onvote}
    >
      <i class="fa-solid fa-thumbs-up" aria-hidden="true"></i>
      <span class="text-sm font-semibold">{entry.votes}</span>
    </button>

    <button
      type="button"
      class="grow min-w-0 text-left min-h-[44px] px-1"
      aria-expanded={expanded}
      onclick={() => (expanded = !expanded)}
    >
      <span class="flex flex-wrap items-center gap-1.5">
        <span class="text-xs px-2 py-0.5 rounded-full" style={chip}>{status}</span>
        <span class="text-xs px-2 py-0.5 rounded-full" style={chip}>
          <i class={categoryIcon(entry.category)} aria-hidden="true"></i>
          {category}
        </span>
        {#if entry.mine}
          <span class="text-xs px-2 py-0.5 rounded-full" style={chip}>{m.featureRequests.badgeYours()}</span>
        {/if}
      </span>
      <span class="block text-sm font-semibold mt-1 break-words" style="color: {$colorStore.text}">{entry.title}</span>
      <span class="block text-xs mt-0.5 break-words" style="color: {$colorStore.muted}">
        {entry.userName} · {formatDate(entry.dateAdded)}{entry.guildName ? ` · ${m.featureRequests.fromGuild({ guild: entry.guildName })}` : ""}
      </span>
      {#if !expanded}
        <span class="block text-sm mt-1 line-clamp-2 whitespace-pre-line break-words" style="color: {$colorStore.text}">{entry.body}</span>
      {/if}
    </button>
  </div>

  {#if expanded}
    <div class="px-3 pb-3 space-y-3">
      <p class="text-sm whitespace-pre-line break-words" style="color: {$colorStore.text}">{entry.body}</p>

      {#if entry.ownerNote}
        <div class="rounded-lg p-3 text-sm" style="background: {$colorStore.primary}10; color: {$colorStore.text};">
          <span class="font-semibold">{m.featureRequests.developerNote()}</span>
          {entry.ownerNote}
        </div>
      {/if}

      {#if owner}
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-lg px-4 min-h-[44px]" style={buttonStyle} onclick={onstatus}>
            {m.featureRequests.changeStatus()}
          </button>
          <button type="button" class="rounded-lg px-4 min-h-[44px]" style={buttonStyle} onclick={ondelete}>
            <i class="fa-solid fa-trash mr-2" aria-hidden="true"></i>{m.common.delete()}
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>
