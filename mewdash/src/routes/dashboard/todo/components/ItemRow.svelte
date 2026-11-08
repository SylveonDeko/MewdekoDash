<script lang="ts">
  import { m } from "$lib/i18n";
  import type { TodoItem } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { isOverdue, PRIORITY_COLORS, priorityLabel, toDate } from "./todoModel";

  interface Props {
    item: TodoItem;
    canEdit: boolean;
    canComplete: boolean;
    canDelete: boolean;
    /** Show move buttons. */
    movable: boolean;
    first: boolean;
    last: boolean;
    ontoggle: () => void;
    onopen: () => void;
    ondelete: () => void;
    onmove: (direction: -1 | 1) => void;
  }

  let { item, canEdit, canComplete, canDelete, movable, first, last, ontoggle, onopen, ondelete, onmove }: Props = $props();

  const overdue = $derived(isOverdue(item));
  const due = $derived(toDate(item.dueDate));
  const tint = $derived(PRIORITY_COLORS[item.priority] ?? PRIORITY_COLORS[2]);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

<div
  class="flex items-start gap-2 rounded-xl border p-2 min-w-0"
  class:opacity-70={item.isCompleted}
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <button
    type="button"
    class="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50"
    aria-pressed={item.isCompleted}
    aria-label={item.isCompleted ? m.todo.itemReopen() : m.todo.itemComplete()}
    disabled={!canComplete}
    onclick={ontoggle}
  >
    <span
      class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
      style="border-color: {$colorStore.primary}; background: {item.isCompleted ? $colorStore.primary : 'transparent'}; color: {$colorStore.onPrimary};"
    >
      {#if item.isCompleted}
        <i class="fa-solid fa-check text-xs" aria-hidden="true"></i>
      {/if}
    </span>
  </button>

  <div class="grow min-w-0">
    <button type="button" class="block w-full text-left min-h-[44px] px-1 py-1" onclick={onopen}>
      <span
        class="block text-sm font-semibold break-words"
        class:line-through={item.isCompleted}
        style="color: {item.isCompleted ? $colorStore.muted : $colorStore.text}"
      >
        {item.title}
      </span>
      {#if item.description}
        <span class="block text-sm line-clamp-2 break-words" style="color: {$colorStore.muted}">{item.description}</span>
      {/if}
      <span class="flex flex-wrap items-center gap-1.5 mt-1">
        <span class="text-xs px-2 py-0.5 rounded-full" style="background: {tint}25; color: {$colorStore.text};">
          {priorityLabel(item.priority)}
        </span>
        {#if due}
          <span
            class="text-xs px-2 py-0.5 rounded-full"
            style="background: {overdue ? '#ef444425' : `${$colorStore.primary}15`}; color: {$colorStore.text};"
          >
            <i class="fa-regular fa-calendar" aria-hidden="true"></i>
            {due.toLocaleDateString()}
          </span>
        {/if}
        {#each item.tags ?? [] as tag (tag)}
          <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{tag}</span>
        {/each}
      </span>
    </button>

    {#if canEdit || canDelete}
      <div class="flex flex-wrap items-center gap-2 mt-1">
        {#if movable && canEdit}
          <button
            type="button"
            class="rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-40"
            style={buttonStyle}
            aria-label={m.common.moveUp()}
            disabled={first}
            onclick={() => onmove(-1)}
          >
            <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            class="rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-40"
            style={buttonStyle}
            aria-label={m.common.moveDown()}
            disabled={last}
            onclick={() => onmove(1)}
          >
            <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
          </button>
        {/if}
        {#if canEdit}
          <button
            type="button"
            class="rounded-lg min-h-[44px] min-w-[44px]"
            style={buttonStyle}
            aria-label={m.todo.pageItemEdit()}
            onclick={onopen}
          >
            <i class="fa-solid fa-pen" aria-hidden="true"></i>
          </button>
        {/if}
        {#if canDelete}
          <button
            type="button"
            class="rounded-lg min-h-[44px] min-w-[44px]"
            style={buttonStyle}
            aria-label={m.todo.pageItemDelete()}
            onclick={ondelete}
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>
