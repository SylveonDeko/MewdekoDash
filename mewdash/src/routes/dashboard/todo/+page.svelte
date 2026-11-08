<!-- routes/dashboard/todo/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, todoApi, type TodoItem, type TodoList, type TodoListAccess } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import ItemSheet from "./components/ItemSheet.svelte";
  import ItemsPanel from "./components/ItemsPanel.svelte";
  import ListSheet from "./components/ListSheet.svelte";
  import { errorText, isOverdue, NO_ACCESS, sameId, type Named } from "./components/todoModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let lists: TodoList[] = $state([]);
  let items: TodoItem[] = $state([]);
  let access: TodoListAccess = $state({ ...NO_ACCESS });
  let members: Named[] = $state([]);
  let loading = $state(true);
  let itemsLoading = $state(false);
  let listSheet: "create" | "settings" | null = $state(null);
  let itemSheet: { item: TodoItem | null } | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";
  let membersLoaded = false;
  let itemsToken = 0;

  const autoSave = createAutoSave();

  const guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  const userId = $derived(data.user?.id ? BigInt(data.user.id) : null);
  const me = $derived(data.user?.id ? String(data.user.id) : "");

  const selectedId = $derived.by(() => {
    const requested = Number(page.url.searchParams.get("list"));
    return lists.find(list => list.id === requested)?.id ?? lists[0]?.id ?? null;
  });
  const selected = $derived(lists.find(list => list.id === selectedId) ?? null);

  const listOptions = $derived(
    lists.map(list => ({
      id: String(list.id),
      name: list.isServerList ? list.name : `${list.name} · ${m.todo.scopePersonal()}`
    }))
  );

  const pending = $derived(items.filter(item => !item.isCompleted).length);
  const done = $derived(items.length - pending);
  const overdue = $derived(items.filter(isOverdue).length);
  const progress = $derived(items.length ? Math.round((done / items.length) * 100) : 0);

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function select(id: number | string | null) {
    if (id === null) return;
    const url = new URL(page.url);
    url.searchParams.set("list", String(id));
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function loadLists(keep?: number | null) {
    if (!guildId || !userId) return;
    try {
      const result = await todoApi.getTodoLists(guildId, userId);
      lists = [...(result ?? [])].sort((a, b) => a.name.localeCompare(b.name));
      if (keep) select(keep);
    } catch (err) {
      logger.error("Failed to load todo lists:", err);
      notify(errorText(err, m.todo.pageErrorLoadLists()), "error");
    } finally {
      loading = false;
    }
  }

  async function loadItems(listId: number, quiet = false) {
    if (!guildId || !userId) return;
    const token = ++itemsToken;
    if (!quiet) itemsLoading = true;
    try {
      const [loadedItems, loadedAccess] = await Promise.all([
        todoApi.getTodoItems(guildId, listId, userId, true),
        todoApi.getListAccess(guildId, listId, userId)
      ]);
      if (token !== itemsToken) return;
      items = loadedItems ?? [];
      access = loadedAccess;
    } catch (err) {
      if (token !== itemsToken) return;
      logger.error("Failed to load todo items:", err);
      notify(errorText(err, m.todo.pageErrorLoadItems()), "error");
    } finally {
      if (token === itemsToken) itemsLoading = false;
    }
  }

  async function ensureMembers() {
    if (membersLoaded || !guildId) return;
    membersLoaded = true;
    try {
      const loaded = await clientApi.getMembers(guildId);
      members = (loaded ?? [])
        .filter(member => !member.isBot)
        .map(member => ({ id: String(member.id), name: member.displayName || member.username }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      membersLoaded = false;
      logger.error("Failed to load members:", err);
    }
  }

  function openSettings() {
    void ensureMembers();
    listSheet = "settings";
  }

  function replaceItem(next: TodoItem) {
    items = items.map(item => (item.id === next.id ? next : item));
  }

  async function toggle(item: TodoItem) {
    if (!guildId || !userId) return;
    const next = !item.isCompleted;
    replaceItem({ ...item, isCompleted: next });
    try {
      if (next) await todoApi.completeTodoItem(guildId, item.id, userId);
      else await todoApi.uncompleteTodoItem(guildId, item.id, userId);
    } catch (err) {
      logger.error("Failed to change todo item state:", err);
      replaceItem(item);
      notify(errorText(err, m.todo.pageErrorCompleteItem()), "error");
    }
  }

  async function remove(item: TodoItem) {
    if (!guildId || !userId) return;
    const confirmed = await requestConfirmation({
      message: m.todo.itemDeleteConfirm({ title: item.title }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await todoApi.deleteTodoItem(guildId, item.id, userId);
      items = items.filter(existing => existing.id !== item.id);
    } catch (err) {
      logger.error("Failed to delete todo item:", err);
      notify(errorText(err, m.todo.pageErrorDeleteItem()), "error");
    }
  }

  async function move(item: TodoItem, neighbor: TodoItem) {
    if (!guildId || !userId || !selectedId) return;
    const ranked = [...items].sort((a, b) => a.position - b.position);
    const position = ranked.findIndex(existing => existing.id === neighbor.id) + 1;
    try {
      await todoApi.reorderTodoItem(guildId, item.id, { userId, position });
      await loadItems(selectedId, true);
    } catch (err) {
      logger.error("Failed to move todo item:", err);
      notify(errorText(err, m.todo.itemMoveFailed()), "error");
    }
  }

  function afterDelete() {
    const removedId = selectedId;
    lists = lists.filter(list => list.id !== removedId);
    items = [];
    access = { ...NO_ACCESS };
    notify(m.todo.listDeleted());
  }

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    if ($currentGuild.icon) {
      const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(serverIconUrl);
    } else if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
    }
    if (loadedGuildId !== $currentGuild.id.toString()) {
      loadedGuildId = $currentGuild.id.toString();
      membersLoaded = false;
      members = [];
      loading = true;
      void loadLists();
    }
  });

  $effect(() => {
    const id = selectedId;
    if (id === null) {
      items = [];
      access = { ...NO_ACCESS };
      return;
    }
    void loadItems(id);
  });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<svelte:head>
  <title>{m.todo.pageTitle({ guild: $currentGuild?.name || "Mewdeko" })}</title>
</svelte:head>

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-list-ul"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.todoName()}
  subtitle={m.todo.pageSubtitle()}
  actionButtons={[
    {
      label: m.todo.pageActionCreateList(),
      icon: "fa-plus",
      action: () => (listSheet = "create"),
      style: `background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`
    }
  ]}
>
  {#if loading}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
  {:else if lists.length === 0}
    <PluginCard title={m.todo.pageLists()} alwaysOpen>
      <div class="space-y-3">
        <p class="text-sm" style="color: {$colorStore.muted}">{m.todo.pageListsEmptyTitle()}</p>
        <button
          type="button"
          class="px-5 rounded-xl min-h-[50px] font-medium"
          style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
          onclick={() => (listSheet = "create")}
        >
          {m.todo.pageCreateFirstList()}
        </button>
      </div>
    </PluginCard>
  {:else if selected}
    <PluginCard title={m.todo.pageLists()} alwaysOpen>
      <div class="space-y-4">
        <DiscordSelector
          type="custom"
          customIcon="fa-list-ul"
          options={listOptions}
          selected={String(selected.id)}
          placeholder={m.todo.pageLists()}
          ariaLabel={m.todo.pageLists()}
          clearable={false}
          onchange={(detail) => select(typeof detail.selected === "string" ? detail.selected : null)}
        />

        <div class="flex flex-wrap items-start gap-3">
          <div class="grow min-w-0 space-y-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="inline-block w-3 h-3 rounded-full" style="background: {selected.color || '#7289da'};"></span>
              <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                {selected.isServerList ? m.todo.scopeServer() : m.todo.scopePersonal()}
              </span>
              {#if selected.isServerList && !selected.isPublic}
                <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                  {m.todo.listPrivate()}
                </span>
              {/if}
              {#if sameId(selected.ownerId, me)}
                <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">
                  {m.common.owner()}
                </span>
              {/if}
            </div>
            {#if selected.description}
              <p class="text-sm break-words" style="color: {$colorStore.muted}">{selected.description}</p>
            {/if}
          </div>
          <button
            type="button"
            class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] w-full sm:w-auto"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            onclick={openSettings}
          >
            <i class="fa-solid fa-gear" aria-hidden="true"></i>
            {m.todo.pageListSettingsAria()}
          </button>
        </div>

        {#if items.length}
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style="color: {$colorStore.text}">
              <span>{m.todo.statPending({ count: pending })}</span>
              <span>{m.todo.statDone({ count: done })}</span>
              {#if overdue}
                <span>{m.todo.statOverdue({ count: overdue })}</span>
              {/if}
              <span class="ml-auto" style="color: {$colorStore.muted}">{progress}%</span>
            </div>
            <div
              class="w-full h-2 rounded-full overflow-hidden"
              style="background: {$colorStore.primary}20;"
              role="progressbar"
              aria-label={m.common.progress()}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div class="h-2 rounded-full" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary}; width: {progress}%;"></div>
            </div>
          </div>
        {/if}
      </div>
    </PluginCard>

    <PluginCard title={m.todo.pageItems()} alwaysOpen>
      {#snippet actions()}
        {#if access.canAdd}
          <button
            type="button"
            class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
            onclick={() => (itemSheet = { item: null })}
          >
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
            {m.common.addItem()}
          </button>
        {/if}
      {/snippet}

      {#if !access.canView}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.todo.itemsNoAccess()}</p>
      {:else if itemsLoading && items.length === 0}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
      {:else}
        {#key selected.id}
          <ItemsPanel
            {items}
            {access}
            {me}
            ontoggle={toggle}
            onopen={(item) => (itemSheet = { item })}
            ondelete={remove}
            onmove={move}
          />
        {/key}
      {/if}
    </PluginCard>
  {/if}
</PluginPage>

{#if listSheet && guildId && userId}
  {#if listSheet === "create"}
    <ListSheet
      {guildId}
      {userId}
      list={null}
      access={{ ...NO_ACCESS, canManage: true }}
      {members}
      {autoSave}
      {notify}
      onclose={() => (listSheet = null)}
      oncreated={(created) => void loadLists(created.id)}
      onupdate={() => {}}
      ondeleted={() => {}}
    />
  {:else if selected}
    {#key selected.id}
      <ListSheet
        {guildId}
        {userId}
        list={selected}
        {access}
        {members}
        {autoSave}
        {notify}
        onclose={() => (listSheet = null)}
        oncreated={() => {}}
        onupdate={(next) => (lists = lists.map(list => (list.id === next.id ? next : list)))}
        ondeleted={afterDelete}
      />
    {/key}
  {/if}
{/if}

{#if itemSheet && guildId && userId && selectedId}
  {#key itemSheet.item?.id ?? "new"}
    <ItemSheet
      {guildId}
      {userId}
      listId={selectedId}
      item={itemSheet.item}
      canEdit={itemSheet.item ? access.canEdit || sameId(itemSheet.item.createdBy, me) : true}
      {autoSave}
      {notify}
      onclose={() => (itemSheet = null)}
      onupdate={replaceItem}
      onadded={() => void loadItems(selectedId, true)}
    />
  {/key}
{/if}
