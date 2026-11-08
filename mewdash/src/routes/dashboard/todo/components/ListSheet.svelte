<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { todoApi, type TodoList, type TodoListAccess } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import PeopleSection from "./PeopleSection.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { DEFAULT_LIST_COLOR, errorText, type Named, type Notify } from "./todoModel";

  interface Props {
    guildId: bigint;
    userId: bigint;
    /** The list being edited, or null to create one. */
    list: TodoList | null;
    access: TodoListAccess;
    members: Named[];
    autoSave: AutoSave;
    notify: Notify;
    onclose: () => void;
    oncreated: (list: TodoList) => void;
    onupdate: (list: TodoList) => void;
    ondeleted: () => void;
  }

  let { guildId, userId, list, access, members, autoSave, notify, onclose, oncreated, onupdate, ondeleted }: Props =
    $props();

  const original = untrack(() => list);
  const key = original ? `list:${original.id}` : "list:new";
  const canManage = $derived(!original || access.canManage);
  const initial = {
    name: original?.name ?? "",
    description: original?.description ?? "",
    color: original?.color || DEFAULT_LIST_COLOR,
    isPublic: original?.isPublic ?? true
  };

  let name = $state(initial.name);
  let description = $state(initial.description);
  let color = $state(initial.color);
  let isPublic = $state(initial.isPublic);
  let scope = $state("server");
  let busy = $state(false);

  let saved = { ...initial };
  let current: TodoList | null = original;

  const scopeOptions = $derived([
    { id: "server", name: m.todo.scopeServer() },
    { id: "personal", name: m.todo.scopePersonal() }
  ]);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function saveText() {
    if (!original || !name.trim()) return;
    autoSave.schedule(`${key}:text`, async () => {
      try {
        await todoApi.updateTodoList(guildId, original.id, {
          userId,
          name: name.trim(),
          description: description.trim() || null
        });
        saved = { ...saved, name: name.trim(), description: description.trim() };
        current = { ...current!, name: name.trim(), description: description.trim() || null };
        onupdate(current);
      } catch (err) {
        logger.error("Failed to update todo list:", err);
        name = saved.name;
        description = saved.description;
        notify(errorText(err, m.todo.listSaveFailed()), "error");
        throw err;
      }
    });
  }

  function changeColor(next: string) {
    color = next;
    if (!original) return;
    autoSave.schedule(`${key}:color`, async () => {
      try {
        await todoApi.updateTodoList(guildId, original.id, { userId, name: saved.name, description: saved.description || null, color: next });
        saved = { ...saved, color: next };
        current = { ...current!, color: next };
        onupdate(current);
      } catch (err) {
        logger.error("Failed to update todo list color:", err);
        color = saved.color;
        notify(errorText(err, m.todo.listSaveFailed()), "error");
        throw err;
      }
    });
  }

  function changePublic(next: boolean) {
    isPublic = next;
    if (!original) return;
    void autoSave.now(`${key}:public`, async () => {
      try {
        await todoApi.updateTodoList(guildId, original.id, { userId, name: saved.name, description: saved.description || null, isPublic: next });
        saved = { ...saved, isPublic: next };
        current = { ...current!, isPublic: next };
        onupdate(current);
      } catch (err) {
        logger.error("Failed to update todo list visibility:", err);
        isPublic = saved.isPublic;
        notify(errorText(err, m.todo.listSaveFailed()), "error");
        throw err;
      }
    });
  }

  async function create() {
    if (busy || !name.trim()) return;
    busy = true;
    try {
      const created = await todoApi.createTodoList(guildId, {
        userId,
        name: name.trim(),
        description: description.trim() || null,
        isServerList: scope === "server"
      });
      notify(m.todo.listCreated());
      oncreated(created);
      onclose();
    } catch (err) {
      logger.error("Failed to create todo list:", err);
      notify(errorText(err, m.todo.pageErrorCreateList()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove() {
    if (!original) return;
    const confirmed = await requestConfirmation({
      title: m.todo.pageConfirmDeleteListTitle(),
      message: m.todo.pageConfirmDeleteListMessage({ name: original.name }),
      confirmText: m.todo.pageDeleteList()
    });
    if (!confirmed) return;
    try {
      autoSave.cancel(`${key}:text`);
      autoSave.cancel(`${key}:color`);
      await todoApi.deleteTodoList(guildId, original.id, userId);
      ondeleted();
      onclose();
    } catch (err) {
      logger.error("Failed to delete todo list:", err);
      notify(errorText(err, m.todo.pageErrorDeleteList()), "error");
    }
  }

  function close() {
    if (original) void autoSave.flush();
    onclose();
  }
</script>

<Sheet title={original ? original.name : m.todo.pageActionCreateList()} onclose={close}>
  <div>
    <label for="todo-list-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.name()}</label>
    <input
      id="todo-list-name"
      type="text"
      bind:value={name}
      disabled={!canManage}
      maxlength="100"
      placeholder={m.todo.pageNewListNamePlaceholder()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
      oninput={saveText}
      onblur={() => void autoSave.flush(`${key}:text`)}
    >
  </div>

  <div>
    <label for="todo-list-description" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.description()}</label>
    <textarea
      id="todo-list-description"
      bind:value={description}
      disabled={!canManage}
      rows="3"
      maxlength="500"
      class="w-full p-3 rounded-lg border focus:ring-2 resize-y"
      style={inputStyle}
      oninput={saveText}
      onblur={() => void autoSave.flush(`${key}:text`)}
    ></textarea>
  </div>

  {#if !original}
    <div>
      <span id="todo-list-scope" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.type()}</span>
      <DiscordSelector
        type="custom"
        customIcon="fa-users"
        options={scopeOptions}
        selected={scope}
        searchable={false}
        clearable={false}
        ariaLabelledby="todo-list-scope"
        onchange={(detail) => (scope = typeof detail.selected === "string" ? detail.selected : "server")}
      />
    </div>
  {:else}
    <div>
      <label for="todo-list-color" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.color()}</label>
      <input
        id="todo-list-color"
        type="color"
        value={color}
        disabled={!canManage}
        class="w-full sm:w-32 min-h-[50px] rounded-lg border p-1"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
        oninput={(e) => changeColor((e.target as HTMLInputElement).value)}
      >
    </div>

    {#if original.isServerList}
      <ToggleRow
        checked={isPublic}
        title={m.todo.listPublic()}
        disabled={!canManage}
        colors={$colorStore}
        onchange={changePublic}
      />
    {/if}

    <PeopleSection {guildId} {userId} listId={original.id} canManage={access.canManage} {members} {notify} />
  {/if}

  {#snippet footer()}
    {#if original && access.canManage}
      <button
        type="button"
        class="mr-auto px-5 rounded-lg min-h-[44px]"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        onclick={remove}
      >
        <i class="fa-solid fa-trash mr-2" aria-hidden="true"></i>{m.todo.pageDeleteList()}
      </button>
    {/if}
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
        disabled={busy || !name.trim()}
        onclick={create}
      >
        {m.common.create()}
      </button>
    {/if}
  {/snippet}
</Sheet>
