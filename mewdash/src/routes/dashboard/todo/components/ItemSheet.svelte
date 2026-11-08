<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { todoApi, type TodoItem } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import {
    dueInputValue,
    dueIso,
    errorText,
    priorityOptions,
    type Notify
  } from "./todoModel";

  interface Props {
    guildId: bigint;
    userId: bigint;
    listId: number;
    /** The item being edited, or null to add a new one. */
    item: TodoItem | null;
    canEdit: boolean;
    autoSave: AutoSave;
    notify: Notify;
    onclose: () => void;
    /** Called after a save. */
    onupdate: (item: TodoItem) => void;
    /** Called after a new item is created. */
    onadded: () => void;
  }

  let { guildId, userId, listId, item, canEdit, autoSave, notify, onclose, onupdate, onadded }: Props = $props();

  const original = untrack(() => item);
  const readOnly = $derived(original !== null && !canEdit);
  const key = original ? `item:${original.id}` : "item:new";
  const initial = {
    title: original?.title ?? "",
    description: original?.description ?? "",
    priority: String(original?.priority || 2),
    due: dueInputValue(original?.dueDate)
  };

  let title = $state(initial.title);
  let description = $state(initial.description);
  let priority = $state(initial.priority);
  let due = $state(initial.due);
  let tags: string[] = $state([...(original?.tags ?? [])]);
  let tagInput = $state("");
  let busy = $state(false);

  let saved = { ...initial };
  let current: TodoItem | null = original;

  const priorities = $derived(priorityOptions());

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function patch(change: Partial<TodoItem>) {
    if (!current) return;
    current = { ...current, ...change };
    onupdate(current);
  }

  function saveCore() {
    if (!original || !title.trim()) return;
    autoSave.schedule(`${key}:core`, persistCore);
  }

  async function persistCore() {
    if (!original) return;
    const next = { title: title.trim(), description: description.trim(), priority: Number(priority) };
    try {
      await todoApi.updateTodoItem(guildId, original.id, {
        userId,
        title: next.title,
        description: next.description || null,
        priority: next.priority
      });
      saved = { ...saved, title: next.title, description: next.description, priority };
      patch({ title: next.title, description: next.description || null, priority: next.priority });
    } catch (err) {
      logger.error("Failed to update todo item:", err);
      title = saved.title;
      description = saved.description;
      priority = saved.priority;
      notify(errorText(err, m.todo.pageEditSaveFailed()), "error");
      throw err;
    }
  }

  function changePriority(next: string | string[] | null) {
    if (typeof next !== "string" || next === priority) return;
    priority = next;
    if (original) void autoSave.now(`${key}:core`, persistCore);
  }

  function changeDue(next: string) {
    due = next;
    if (!original) return;
    void autoSave.now(`${key}:due`, async () => {
      try {
        await todoApi.setTodoItemDueDate(guildId, original.id, { userId, dueDate: dueIso(next) });
        saved = { ...saved, due: next };
        patch({ dueDate: dueIso(next) });
      } catch (err) {
        logger.error("Failed to set due date:", err);
        due = saved.due;
        notify(errorText(err, m.todo.pageEditSaveFailed()), "error");
        throw err;
      }
    });
  }

  async function addTag() {
    const tag = tagInput.trim();
    if (!tag || tags.some(existing => existing.toLowerCase() === tag.toLowerCase())) {
      tagInput = "";
      return;
    }
    if (!original) {
      tags = [...tags, tag];
      tagInput = "";
      return;
    }
    try {
      await todoApi.addTodoItemTag(guildId, original.id, { userId, tag });
      tags = [...tags, tag];
      tagInput = "";
      patch({ tags });
    } catch (err) {
      logger.error("Failed to add tag:", err);
      notify(errorText(err, m.todo.itemTagFailed()), "error");
    }
  }

  async function removeTag(tag: string) {
    if (!original) {
      tags = tags.filter(existing => existing !== tag);
      return;
    }
    try {
      await todoApi.removeTodoItemTag(guildId, original.id, { userId, tag });
      tags = tags.filter(existing => existing !== tag);
      patch({ tags });
    } catch (err) {
      logger.error("Failed to remove tag:", err);
      notify(errorText(err, m.todo.itemTagFailed()), "error");
    }
  }

  async function create() {
    if (busy || !title.trim()) return;
    busy = true;
    try {
      await todoApi.addTodoItem(guildId, listId, {
        userId,
        title: title.trim(),
        description: description.trim() || null,
        priority: Number(priority),
        dueDate: dueIso(due),
        tags
      });
      notify(m.todo.itemAdded());
      onadded();
      onclose();
    } catch (err) {
      logger.error("Failed to add todo item:", err);
      notify(errorText(err, m.todo.pageErrorAddItem()), "error");
    } finally {
      busy = false;
    }
  }

  function close() {
    if (original) void autoSave.flush();
    onclose();
  }
</script>

<Sheet title={original ? m.todo.pageItemEdit() : m.common.addItem()} onclose={close} size="lg">
  <div>
    <label for="todo-item-title" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.title()}</label>
    <input
      id="todo-item-title"
      type="text"
      bind:value={title}
      disabled={readOnly}
      maxlength="200"
      placeholder={m.todo.pageQuickTitlePlaceholder()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
      oninput={saveCore}
      onblur={() => void autoSave.flush(`${key}:core`)}
    >
  </div>

  <div>
    <label for="todo-item-description" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.description()}</label>
    <textarea
      id="todo-item-description"
      bind:value={description}
      disabled={readOnly}
      rows="4"
      class="w-full p-3 rounded-lg border focus:ring-2 resize-y"
      style={inputStyle}
      oninput={saveCore}
      onblur={() => void autoSave.flush(`${key}:core`)}
    ></textarea>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <span id="todo-item-priority" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.priority()}</span>
      <DiscordSelector
        type="custom"
        customIcon="fa-flag"
        options={priorities}
        selected={priority}
        searchable={false}
        clearable={false}
        disabled={readOnly}
        ariaLabelledby="todo-item-priority"
        onchange={(detail) => changePriority(detail.selected)}
      />
    </div>
    <div>
      <label for="todo-item-due" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.todo.pageEditDueDate()}</label>
      <div class="flex gap-2">
        <input
          id="todo-item-due"
          type="date"
          value={due}
          disabled={readOnly}
          class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
          onchange={(e) => changeDue((e.target as HTMLInputElement).value)}
        >
        {#if due && !readOnly}
          <button
            type="button"
            class="shrink-0 px-4 rounded-lg min-h-[50px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            aria-label={m.todo.itemClearDue()}
            onclick={() => changeDue("")}
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        {/if}
      </div>
    </div>
  </div>

  <div>
    <label for="todo-item-tag" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.tags()}</label>
    {#if tags.length}
      <div class="flex flex-wrap gap-2 mb-3">
        {#each tags as tag (tag)}
          <span
            class="inline-flex items-center gap-1 pl-3 rounded-full text-sm"
            style="background: {$colorStore.primary}15; color: {$colorStore.text};"
          >
            {tag}
            {#if !readOnly}
              <button
                type="button"
                class="min-h-[44px] min-w-[44px]"
                aria-label={m.todo.itemRemoveTag({ tag })}
                onclick={() => removeTag(tag)}
              >
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            {:else}
              <span class="pr-3"></span>
            {/if}
          </span>
        {/each}
      </div>
    {/if}
    {#if !readOnly}
      <div class="flex gap-2">
        <input
          id="todo-item-tag"
          type="text"
          bind:value={tagInput}
          maxlength="32"
          placeholder={m.tickets.addTag()}
          class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
          onkeydown={(e) => e.key === "Enter" && addTag()}
        >
        <button
          type="button"
          class="shrink-0 px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
          disabled={!tagInput.trim()}
          onclick={addTag}
        >
          {m.common.add()}
        </button>
      </div>
    {/if}
  </div>

  {#snippet footer()}
    <button
      type="button"
      class="px-5 rounded-lg min-h-[44px]"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={close}
    >
      {original ? m.common.close() : m.common.cancel()}
    </button>
    {#if !original}
      <button
        type="button"
        class="px-5 rounded-lg min-h-[44px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={busy || !title.trim()}
        onclick={create}
      >
        {m.common.addItem()}
      </button>
    {/if}
  {/snippet}
</Sheet>
