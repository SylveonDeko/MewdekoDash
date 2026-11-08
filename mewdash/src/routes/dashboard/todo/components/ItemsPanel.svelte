<script lang="ts">
  import { m } from "$lib/i18n";
  import type { TodoItem, TodoListAccess } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import ItemRow from "./ItemRow.svelte";
  import { priorityOptions, sameId, toDate } from "./todoModel";

  interface Props {
    items: TodoItem[];
    access: TodoListAccess;
    me: string;
    ontoggle: (item: TodoItem) => void;
    onopen: (item: TodoItem) => void;
    ondelete: (item: TodoItem) => void;
    onmove: (item: TodoItem, neighbor: TodoItem) => void;
  }

  let { items, access, me, ontoggle, onopen, ondelete, onmove }: Props = $props();

  let search = $state("");
  let priority: string | null = $state(null);
  let tag: string | null = $state(null);
  let sort = $state("manual");
  let showCompleted = $state(false);

  const allTags = $derived(
    [...new Set(items.flatMap(item => item.tags ?? []))].sort((a, b) => a.localeCompare(b))
  );

  const sortOptions = $derived([
    { id: "manual", name: m.todo.sortManual() },
    { id: "priority", name: m.common.priority() },
    { id: "dueDate", name: m.todo.pageEditDueDate() },
    { id: "newest", name: m.chatTriggers.sortNewest() },
    { id: "title", name: m.common.title() }
  ]);

  const filtering = $derived(Boolean(search.trim() || priority || tag));

  const visible = $derived.by(() => {
    const query = search.trim().toLowerCase();
    const list = items.filter(item => {
      if (!showCompleted && item.isCompleted) return false;
      if (priority && String(item.priority) !== priority) return false;
      if (tag && !(item.tags ?? []).includes(tag)) return false;
      if (query && !`${item.title} ${item.description ?? ""}`.toLowerCase().includes(query)) return false;
      return true;
    });
    if (sort === "manual") return list;
    return [...list].sort((a, b) => {
      if (sort === "priority") return b.priority - a.priority;
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "newest") return (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0);
      const left = toDate(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const right = toDate(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return left - right;
    });
  });

  const movable = $derived(sort === "manual" && !filtering);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function mine(item: TodoItem): boolean {
    return sameId(item.createdBy, me);
  }

  function edgeOf(index: number, direction: -1 | 1): boolean {
    const neighbor = visible[index + direction];
    return !neighbor || neighbor.isCompleted !== visible[index].isCompleted;
  }

  function move(index: number, direction: -1 | 1) {
    const neighbor = visible[index + direction];
    if (neighbor) onmove(visible[index], neighbor);
  }
</script>

<div class="space-y-3">
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <input
      type="search"
      bind:value={search}
      placeholder={m.todo.itemsSearch()}
      aria-label={m.common.search()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] sm:col-span-2 lg:col-span-1"
      style={inputStyle}
    >
    <DiscordSelector
      type="custom"
      customIcon="fa-flag"
      options={priorityOptions()}
      selected={priority}
      placeholder={m.tickets.anyPriority()}
      ariaLabel={m.common.priority()}
      searchable={false}
      onchange={(detail) => (priority = typeof detail.selected === "string" ? detail.selected : null)}
    />
    <DiscordSelector
      type="custom"
      customIcon="fa-tag"
      options={allTags.map(value => ({ id: value, name: value }))}
      selected={tag}
      placeholder={m.todo.filterTag()}
      ariaLabel={m.tickets.tags()}
      disabled={allTags.length === 0}
      onchange={(detail) => (tag = typeof detail.selected === "string" ? detail.selected : null)}
    />
    <DiscordSelector
      type="custom"
      customIcon="fa-arrow-down-wide-short"
      options={sortOptions}
      selected={sort}
      placeholder={m.common.sortBy()}
      ariaLabel={m.common.sortBy()}
      searchable={false}
      clearable={false}
      onchange={(detail) => (sort = typeof detail.selected === "string" ? detail.selected : "manual")}
    />
  </div>

  <ToggleRow
    checked={showCompleted}
    title={m.todo.pageShowCompleted()}
    colors={$colorStore}
    onchange={(value) => (showCompleted = value)}
  />

  {#if visible.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-list-check" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">
        {items.length === 0 ? m.todo.itemsEmpty() : m.todo.pageItemsFilteredTitle()}
      </p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each visible as item, index (item.id)}
        <ItemRow
          {item}
          canEdit={access.canEdit || mine(item)}
          canComplete={access.canComplete || mine(item)}
          canDelete={access.canDelete || mine(item)}
          {movable}
          first={edgeOf(index, -1)}
          last={edgeOf(index, 1)}
          ontoggle={() => ontoggle(item)}
          onopen={() => onopen(item)}
          ondelete={() => ondelete(item)}
          onmove={(direction) => move(index, direction)}
        />
      {/each}
    </div>
  {/if}
</div>
