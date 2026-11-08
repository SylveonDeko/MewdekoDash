<script lang="ts">
  import { m } from "$lib/i18n";
  import { chatTriggersApi, type ChatTrigger } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { TriggerCounter } from "$lib/api/chattriggers/chattriggers";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import TriggerEditor from "./TriggerEditor.svelte";
  import TriggerRow from "./TriggerRow.svelte";
  import type { Named } from "./editor/editorTypes";
  import { AppCommandType, TriggerKind, newTrigger, responseSummary, toWire, triggerProblem, type TriggerPatch } from "./triggerModel";

  interface Props {
    guildId: bigint;
    triggers: ChatTrigger[];
    loading: boolean;
    channels: Named[];
    roles: Named[];
    emojis: GuildEmojiInfo[];
    counters: TriggerCounter[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, triggers = $bindable(), loading, channels, roles, emojis, counters, autoSave, user = null, onreload, onerror, onsuccess }: Props = $props();

  const ALL = "*";
  const UNGROUPED = "__none";

  let search = $state("");
  let categoryFilter = $state(ALL);
  let kindFilter = $state(ALL);
  let statusFilter = $state(ALL);
  let sort = $state("newest");
  let editingId: number | null = $state(null);
  let draft: ChatTrigger | null = $state(null);
  let creating = $state(false);

  const categories = $derived(
    [...new Set(triggers.map(t => t.category).filter((c): c is string => !!c?.trim()))].sort((a, b) => a.localeCompare(b))
  );

  const categoryOptions = $derived([
    { id: ALL, name: m.chatTriggers.filterAllCategories() },
    { id: UNGROUPED, name: m.common.ungrouped() },
    ...categories.map(c => ({ id: c, name: c }))
  ]);

  const kindOptions = $derived([
    { id: ALL, name: m.chatTriggers.filterAllTypes() },
    { id: "message", name: m.chatTriggers.kindMessage() },
    { id: "slash", name: m.chatTriggers.kindInteraction() },
    { id: "button", name: m.chatTriggers.kindButton() },
    { id: "reaction", name: m.chatTriggers.badgeReaction() },
    { id: "event", name: m.chatTriggers.kindEvent() }
  ]);

  const statusOptions = $derived([
    { id: ALL, name: m.chatTriggers.filterAllStatuses() },
    { id: "enabled", name: m.common.enabled() },
    { id: "disabled", name: m.common.disabled() }
  ]);

  const sortOptions = $derived([
    { id: "newest", name: m.chatTriggers.sortNewest() },
    { id: "oldest", name: m.chatTriggers.sortOldest() },
    { id: "used", name: m.chatTriggers.sortUsed() },
    { id: "name", name: m.chatTriggers.sortName() }
  ]);

  function matchesKind(trigger: ChatTrigger): boolean {
    switch (kindFilter) {
      case "message":
        return (trigger.validTriggerTypes & TriggerKind.Message) !== 0;
      case "slash":
        return (trigger.validTriggerTypes & TriggerKind.Interaction) !== 0 || trigger.applicationCommandType > AppCommandType.None;
      case "button":
        return (trigger.validTriggerTypes & TriggerKind.Button) !== 0;
      case "reaction":
        return (trigger.validTriggerTypes & (TriggerKind.Reactions | TriggerKind.ReactionsRemoved)) !== 0;
      case "event":
        return trigger.eventType > 0;
      default:
        return true;
    }
  }

  const visible = $derived.by(() => {
    const needle = search.trim().toLowerCase();
    const list = triggers.filter(trigger => {
      if (categoryFilter === UNGROUPED && trigger.category) return false;
      if (categoryFilter !== ALL && categoryFilter !== UNGROUPED && trigger.category !== categoryFilter) return false;
      if (statusFilter === "enabled" && trigger.isDisabled) return false;
      if (statusFilter === "disabled" && !trigger.isDisabled) return false;
      if (!matchesKind(trigger)) return false;
      if (!needle) return true;
      return (trigger.trigger ?? "").toLowerCase().includes(needle) || responseSummary(trigger.response).toLowerCase().includes(needle);
    });
    const byName = (a: ChatTrigger, b: ChatTrigger) => (a.trigger ?? "").localeCompare(b.trigger ?? "");
    switch (sort) {
      case "oldest":
        return list.sort((a, b) => a.id - b.id);
      case "used":
        return list.sort((a, b) => Number(b.useCount) - Number(a.useCount) || byName(a, b));
      case "name":
        return list.sort(byName);
      default:
        return list.sort((a, b) => b.id - a.id);
    }
  });

  let showFilters = $state(false);
  const activeFilterCount = $derived(
    [categoryFilter !== ALL, kindFilter !== ALL, statusFilter !== ALL, sort !== "newest"].filter(Boolean).length
  );
  const filtering = $derived(!!search.trim() || categoryFilter !== ALL || kindFilter !== ALL || statusFilter !== ALL);
  const editing = $derived(draft ?? triggers.find(t => t.id === editingId) ?? null);
  const problem = $derived(editing ? triggerProblem(editing) : null);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function clearFilters() {
    search = "";
    categoryFilter = ALL;
    kindFilter = ALL;
    statusFilter = ALL;
  }

  function startNew() {
    draft = { ...newTrigger(guildId), creatorId: BigInt(String(user?.id ?? "0")) };
    editingId = null;
  }

  function open(trigger: ChatTrigger) {
    draft = null;
    editingId = trigger.id;
  }

  function close() {
    if (editingId !== null) void autoSave.flush(`trigger:${editingId}`);
    draft = null;
    editingId = null;
  }

  function queueSave(id: number, typing: boolean) {
    const send = async () => {
      const current = triggers.find(t => t.id === id);
      if (!current || triggerProblem(current)) return;
      try {
        await chatTriggersApi.updateChatTrigger(guildId, toWire(current));
      } catch (err) {
        await onreload();
        throw err;
      }
    };
    if (typing) autoSave.schedule(`trigger:${id}`, send);
    else void autoSave.now(`trigger:${id}`, send);
  }

  function change(patch: TriggerPatch, typing = false) {
    if (draft) {
      draft = { ...draft, ...patch };
      return;
    }
    if (editingId === null) return;
    const id = editingId;
    triggers = triggers.map(t => (t.id === id ? { ...t, ...patch } : t));
    queueSave(id, typing);
  }

  function toggle(trigger: ChatTrigger, enabled: boolean) {
    triggers = triggers.map(t => (t.id === trigger.id ? { ...t, isDisabled: !enabled } : t));
    queueSave(trigger.id, false);
  }

  async function create() {
    if (!draft || creating) return;
    creating = true;
    try {
      const added = await chatTriggersApi.addChatTrigger(guildId, toWire(draft));
      triggers = [...triggers, added];
      draft = null;
      editingId = added.id;
      onsuccess(m.chatTriggers.created());
    } catch (err) {
      logger.error("Failed to create trigger:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.createFailed());
    } finally {
      creating = false;
    }
  }

  async function duplicate(trigger: ChatTrigger) {
    try {
      const added = await chatTriggersApi.addChatTrigger(guildId, {
        ...toWire(trigger),
        useCount: 0n,
        applicationCommandId: 0n,
        roundRobinIndex: 0,
        isDisabled: true
      });
      triggers = [...triggers, added];
      open(added);
      onsuccess(m.chatTriggers.duplicated());
    } catch (err) {
      logger.error("Failed to duplicate trigger:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.duplicateFailed());
    }
  }

  async function share(trigger: ChatTrigger) {
    try {
      const { code } = await chatTriggersApi.getShareCode(guildId, trigger.id);
      try {
        await navigator.clipboard.writeText(code);
        onsuccess(m.chatTriggers.shareCopied());
      } catch {
        onsuccess(m.chatTriggers.shareCode({ code }));
      }
    } catch (err) {
      logger.error("Failed to get share code:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.shareFailed());
    }
  }

  async function remove(trigger: ChatTrigger) {
    const confirmed = await requestConfirmation({
      message: m.chatTriggers.deleteConfirm({ name: trigger.trigger ?? "" }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await chatTriggersApi.deleteChatTrigger(guildId, trigger.id);
      triggers = triggers.filter(t => t.id !== trigger.id);
      if (editingId === trigger.id) close();
    } catch (err) {
      logger.error("Failed to delete trigger:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.deleteFailed());
    }
  }
</script>

{#snippet newButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={startNew}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.chatTriggers.newTrigger()}
  </button>
{/snippet}

<PluginCard title={m.chatTriggers.cardTriggersTitle()} actions={newButton}>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if triggers.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-comment" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">{m.chatTriggers.emptyTitle()}</p>
      <p class="text-sm" style="color: {$colorStore.muted}">{m.chatTriggers.emptyHint()}</p>
    </div>
  {:else}
    <div class="space-y-3">
      <div class="flex gap-3 lg:hidden">
        <input
          type="search"
          bind:value={search}
          placeholder={m.chatTriggers.searchPlaceholder()}
          aria-label={m.chatTriggers.searchLabel()}
          class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        >
        <button
          type="button"
          class="shrink-0 flex items-center justify-center gap-2 px-4 rounded-lg min-h-[50px] min-w-[50px]"
          style={buttonStyle}
          aria-expanded={showFilters}
          aria-label={m.chatTriggers.filtersToggleAria()}
          onclick={() => (showFilters = !showFilters)}
        >
          <i class="fa-solid fa-filter" aria-hidden="true"></i>
          {#if activeFilterCount > 0}<span class="text-sm">{activeFilterCount}</span>{/if}
        </button>
      </div>
      <div class="grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_repeat(4,minmax(0,12rem))] gap-3 {showFilters ? 'grid' : 'hidden lg:grid'}">
        <input
          type="search"
          bind:value={search}
          placeholder={m.chatTriggers.searchPlaceholder()}
          aria-label={m.chatTriggers.searchLabel()}
          class="hidden lg:block w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        >
        <DiscordSelector type="custom" options={categoryOptions} selected={categoryFilter} searchable={categories.length > 6} clearable={false} customIcon="fa-folder" ariaLabel={m.chatTriggers.filterCategoryAria()} onchange={(d) => typeof d.selected === "string" && (categoryFilter = d.selected)} />
        <DiscordSelector type="custom" options={kindOptions} selected={kindFilter} searchable={false} clearable={false} customIcon="fa-filter" ariaLabel={m.chatTriggers.filterTypeAria()} onchange={(d) => typeof d.selected === "string" && (kindFilter = d.selected)} />
        <DiscordSelector type="custom" options={statusOptions} selected={statusFilter} searchable={false} clearable={false} customIcon="fa-circle-check" ariaLabel={m.chatTriggers.filterStatusAria()} onchange={(d) => typeof d.selected === "string" && (statusFilter = d.selected)} />
        <DiscordSelector type="custom" options={sortOptions} selected={sort} searchable={false} clearable={false} customIcon="fa-sort" ariaLabel={m.chatTriggers.sortAria()} onchange={(d) => typeof d.selected === "string" && (sort = d.selected)} />
      </div>

      {#if visible.length === 0}
        <div class="flex flex-col items-center gap-3 py-6 text-center">
          <p style="color: {$colorStore.muted}">{m.chatTriggers.noMatches()}</p>
          {#if filtering}
            <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={clearFilters}>
              {m.chatTriggers.clearFilters()}
            </button>
          {/if}
        </div>
      {:else}
        <div class="space-y-2">
          {#each visible as trigger (trigger.id)}
            <TriggerRow
              {trigger}
              onedit={() => open(trigger)}
              ontoggle={(enabled) => toggle(trigger, enabled)}
              onduplicate={() => duplicate(trigger)}
              onshare={() => share(trigger)}
              ondelete={() => remove(trigger)}
            />
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</PluginCard>

{#if editing}
  {#key draft ? "new" : editingId}
    <TriggerEditor
      {guildId}
      trigger={editing}
      isNew={!!draft}
      {triggers}
      {channels}
      {roles}
      {emojis}
      {counters}
      {categories}
      {problem}
      {creating}
      {autoSave}
      {user}
      onchange={change}
      oncreate={create}
      onclose={close}
      {onerror}
    />
  {/key}
{/if}
