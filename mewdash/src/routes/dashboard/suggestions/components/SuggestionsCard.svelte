<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { suggestionsApi, SuggestionState, type Suggestion } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText } from "./suggestionsModel";

  interface Props {
    guildId: bigint;
    user?: DiscordUser | null;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, user = null, onerror, onsuccess }: Props = $props();

  const PAGE = 10;

  let suggestions: Suggestion[] = $state([]);
  let loaded = $state(false);
  let filter = $state("all");
  let sort = $state("newest");
  let shown = $state(PAGE);
  let reviewing: Suggestion | null = $state(null);
  let nextState: number | null = $state(null);
  let reason = $state("");
  let busy = $state(false);

  const states = $derived([
    { state: SuggestionState.Accepted, label: m.suggestions.actionAccept(), icon: "fa-check" },
    { state: SuggestionState.Denied, label: m.common.deny(), icon: "fa-xmark" },
    { state: SuggestionState.Considered, label: m.suggestions.actionConsider(), icon: "fa-comment" },
    { state: SuggestionState.Implemented, label: m.suggestions.actionImplement(), icon: "fa-flag-checkered" }
  ]);

  const filters = $derived([
    { id: "all", name: m.common.all() },
    { id: String(SuggestionState.Suggested), name: m.common.pending() },
    { id: String(SuggestionState.Accepted), name: m.common.accepted() },
    { id: String(SuggestionState.Denied), name: m.common.denied() },
    { id: String(SuggestionState.Considered), name: m.suggestions.actionConsidered() },
    { id: String(SuggestionState.Implemented), name: m.common.implemented() }
  ]);

  const sorts = $derived([
    { id: "newest", name: m.suggestions.sortNewest() },
    { id: "oldest", name: m.suggestions.sortOldest() },
    { id: "status", name: m.common.status() }
  ]);

  const visible = $derived.by(() => {
    const list = suggestions.filter(item => filter === "all" || String(item.currentState) === filter);
    const time = (item: Suggestion) => (item.dateAdded ? new Date(item.dateAdded).getTime() : 0);
    return list.sort((a, b) =>
      sort === "oldest" ? time(a) - time(b) : sort === "status" ? a.currentState - b.currentState : time(b) - time(a)
    );
  });

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function statusLabel(state: number): string {
    return (
      {
        [SuggestionState.Suggested]: m.common.pending(),
        [SuggestionState.Accepted]: m.common.accepted(),
        [SuggestionState.Denied]: m.common.denied(),
        [SuggestionState.Considered]: m.suggestions.actionConsidered(),
        [SuggestionState.Implemented]: m.common.implemented()
      }[state] ?? m.common.unknown()
    );
  }

  function statusTint(state: number): string {
    return (
      {
        [SuggestionState.Accepted]: "#22c55e",
        [SuggestionState.Denied]: "#ef4444",
        [SuggestionState.Considered]: $colorStore.secondary,
        [SuggestionState.Implemented]: $colorStore.accent
      }[state] ?? $colorStore.primary
    );
  }

  function dateOf(item: Suggestion): string {
    return item.dateAdded ? new Date(item.dateAdded).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
  }

  function one(detail: { selected: string | string[] | null }): string {
    const value = Array.isArray(detail.selected) ? detail.selected[0] : detail.selected;
    return value || "";
  }

  async function load() {
    try {
      suggestions = await suggestionsApi.getSuggestions(guildId);
    } catch (err) {
      const message = errorText(err, m.suggestions.errorFetch());
      if (message.includes("404") || message.includes("No suggestions")) suggestions = [];
      else {
        logger.error("Failed to load suggestions:", err);
        onerror(message);
      }
    } finally {
      loaded = true;
    }
  }

  function open(item: Suggestion) {
    reviewing = item;
    nextState = null;
    reason = "";
  }

  async function apply() {
    if (!reviewing || nextState === null || !user?.id || busy) return;
    busy = true;
    try {
      await suggestionsApi.updateSuggestionStatus(guildId, reviewing.suggestionId, {
        state: nextState,
        reason: reason.trim() || null,
        userId: user.id
      });
      reviewing = null;
      await load();
      onsuccess(m.suggestions.notifyStatusUpdated());
    } catch (err) {
      logger.error("Failed to update a suggestion:", err);
      onerror(errorText(err, m.common.failedToUpdateStatus()));
    } finally {
      busy = false;
    }
  }

  async function remove() {
    if (!reviewing) return;
    const confirmed = await requestConfirmation({ message: m.suggestions.confirmDelete(), confirmText: m.common.delete() });
    if (!confirmed) return;
    busy = true;
    try {
      await suggestionsApi.deleteSuggestion(guildId, BigInt(reviewing.id));
      reviewing = null;
      await load();
      onsuccess(m.suggestions.notifyDeleted());
    } catch (err) {
      logger.error("Failed to delete a suggestion:", err);
      onerror(errorText(err, m.suggestions.notifyDeleteFailed()));
    } finally {
      busy = false;
    }
  }

  async function clearAll() {
    const confirmed = await requestConfirmation({
      title: m.suggestions.clearTitle(),
      message: m.suggestions.clearMessage(),
      confirmText: m.common.clearAll()
    });
    if (!confirmed) return;
    try {
      await suggestionsApi.clearSuggestions(guildId);
      await load();
      onsuccess(m.suggestions.notifyCleared());
    } catch (err) {
      logger.error("Failed to clear suggestions:", err);
      onerror(errorText(err, m.suggestions.errorClear()));
    }
  }

  onMount(() => {
    void load();
  });
</script>

{#snippet clearButton()}
  {#if suggestions.length > 0}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={clearAll}>
      <i class="fa-solid fa-broom" aria-hidden="true"></i>
      {m.common.clearAll()}
    </button>
  {/if}
{/snippet}

<PluginCard title={m.features.suggestionsName()} actions={clearButton} alwaysOpen>
  {#if suggestions.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SettingField label={m.common.status()} id="suggestions-filter">
        <DiscordSelector id="suggestions-filter" type="custom" customIcon="fa-filter" options={filters} selected={filter} clearable={false} searchable={false} onchange={(detail) => { filter = one(detail) || "all"; shown = PAGE; }} />
      </SettingField>
      <SettingField label={m.suggestions.sortLabel()} id="suggestions-sort">
        <DiscordSelector id="suggestions-sort" type="custom" customIcon="fa-arrow-down-wide-short" options={sorts} selected={sort} clearable={false} searchable={false} onchange={(detail) => (sort = one(detail) || "newest")} />
      </SettingField>
    </div>
  {/if}

  {#each visible.slice(0, shown) as item (item.id)}
    <button
      type="button"
      class="w-full text-left flex items-start gap-3 rounded-xl border p-3 min-h-[56px] min-w-0"
      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
      onclick={() => open(item)}
    >
      {#if item.user?.avatarUrl}
        <img src={item.user.avatarUrl} alt="" class="w-9 h-9 rounded-full shrink-0" loading="lazy" />
      {/if}
      <span class="grow min-w-0">
        <span class="flex items-center gap-2 min-w-0">
          <span class="text-sm font-semibold truncate" style="color: {$colorStore.text}">{item.user?.username ?? item.userId}</span>
          <span class="text-xs shrink-0" style="color: {$colorStore.muted}">{dateOf(item)}</span>
        </span>
        <span class="block text-sm line-clamp-2 break-words" style="color: {$colorStore.text}">{item.suggestion1}</span>
        <span class="flex flex-wrap items-center gap-2 mt-1">
          <span class="text-xs px-2 py-0.5 rounded-full" style="background: {statusTint(item.currentState)}25; color: {$colorStore.text};">{statusLabel(item.currentState)}</span>
          {#if item.emoteCounts}
            <span class="text-xs tabular-nums" style="color: {$colorStore.muted}">
              {item.emoteCounts.emote1} · {item.emoteCounts.emote2}
            </span>
          {/if}
        </span>
      </span>
    </button>
  {:else}
    {#if loaded}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.suggestions.emptyTitle()}</p>
    {/if}
  {/each}

  {#if visible.length > shown}
    <button type="button" class="w-full px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (shown += PAGE)}>
      {m.common.showMore()}
    </button>
  {/if}
</PluginCard>

{#if reviewing}
  {@const item = reviewing}
  <Sheet title={m.common.idLabel({ id: String(item.suggestionId) })} onclose={() => (reviewing = null)}>
    <div class="flex items-center gap-3 min-w-0">
      {#if item.user?.avatarUrl}
        <img src={item.user.avatarUrl} alt="" class="w-10 h-10 rounded-full shrink-0" />
      {/if}
      <div class="min-w-0">
        <p class="text-sm font-semibold truncate" style="color: {$colorStore.text}">{item.user?.username ?? item.userId}</p>
        <p class="text-xs" style="color: {$colorStore.muted}">{dateOf(item)} · {statusLabel(item.currentState)}</p>
      </div>
    </div>

    <p class="break-words leading-relaxed rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text};">{item.suggestion1}</p>

    {#if item.emoteCounts}
      <p class="text-sm tabular-nums" style="color: {$colorStore.muted}">
        {[item.emoteCounts.emote1, item.emoteCounts.emote2, item.emoteCounts.emote3, item.emoteCounts.emote4, item.emoteCounts.emote5]
          .map((count, index) => (index < 2 || count > 0 ? m.suggestions.emoteCountLabel({ number: index + 1, count }) : ""))
          .filter(Boolean)
          .join(" · ")}
      </p>
    {/if}

    <div class="grid grid-cols-2 gap-2" role="group" aria-label={m.common.status()}>
      {#each states as option (option.state)}
        {@const selected = nextState === option.state}
        <button
          type="button"
          class="flex items-center justify-center gap-2 min-h-[50px] rounded-xl border font-medium disabled:opacity-50"
          style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
          aria-pressed={selected}
          disabled={item.currentState === option.state}
          onclick={() => (nextState = option.state)}
        >
          <i class="fa-solid {option.icon}" aria-hidden="true"></i>
          {option.label}
        </button>
      {/each}
    </div>

    <SettingField label={m.suggestions.reasonLabel()} id="suggestion-reason">
      <textarea
        id="suggestion-reason"
        rows="3"
        bind:value={reason}
        class="w-full p-3 rounded-lg border focus:ring-2 resize-none"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      ></textarea>
    </SettingField>

    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={buttonStyle} disabled={busy} onclick={remove}>{m.common.delete()}</button>
      <button
        type="button"
        class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={busy || nextState === null}
        onclick={apply}
      >
        {m.common.apply()}
      </button>
    {/snippet}
  </Sheet>
{/if}
