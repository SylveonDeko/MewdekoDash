<script lang="ts">
  import { m } from "$lib/i18n";
  import { todoApi, type TodoListPermission } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import { errorText, sameId, type Named, type Notify } from "./todoModel";

  interface Props {
    guildId: bigint;
    userId: bigint;
    listId: number;
    canManage: boolean;
    members: Named[];
    notify: Notify;
  }

  let { guildId, userId, listId, canManage, members, notify }: Props = $props();

  type Flags = { canAdd: boolean; canEdit: boolean; canComplete: boolean; canDelete: boolean; canManage: boolean };
  const NONE: Flags = { canAdd: false, canEdit: false, canComplete: false, canDelete: false, canManage: false };

  let permissions: TodoListPermission[] = $state([]);
  let loading = $state(true);
  let busy = $state(false);
  let target: string | null = $state(null);
  let flags: Flags = $state({ ...NONE });

  const toggles = $derived<Array<{ key: keyof Flags; label: string }>>([
    { key: "canAdd", label: m.todo.permAdd() },
    { key: "canEdit", label: m.todo.permEdit() },
    { key: "canComplete", label: m.todo.permComplete() },
    { key: "canDelete", label: m.todo.permDelete() },
    { key: "canManage", label: m.todo.permManage() }
  ]);

  function nameOf(id: bigint): string {
    return members.find(member => sameId(member.id, id))?.name ?? String(id);
  }

  function summary(permission: TodoListPermission): string {
    if (permission.canManageList) return m.todo.permissionsLevelManager();
    const granted = [
      permission.canAdd && m.todo.permAdd(),
      permission.canEdit && m.todo.permEdit(),
      permission.canComplete && m.todo.permComplete(),
      permission.canDelete && m.todo.permDelete()
    ].filter(Boolean);
    return granted.length ? granted.join(", ") : m.todo.permissionsLevelViewer();
  }

  async function load() {
    loading = true;
    try {
      permissions = (await todoApi.getTodoListPermissions(guildId, listId, userId)) ?? [];
    } catch (err) {
      logger.error("Failed to load list permissions:", err);
      notify(errorText(err, m.todo.permissionsLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  function edit(permission: TodoListPermission) {
    target = String(permission.userId);
    flags = {
      canAdd: permission.canAdd,
      canEdit: permission.canEdit,
      canComplete: permission.canComplete,
      canDelete: permission.canDelete,
      canManage: permission.canManageList
    };
  }

  async function grant() {
    if (busy || !target) return;
    busy = true;
    try {
      await todoApi.grantTodoListPermissions(guildId, listId, {
        targetUserId: BigInt(target),
        requestingUserId: userId,
        canView: true,
        ...flags
      });
      target = null;
      flags = { ...NONE };
      notify(m.todo.permissionsGranted());
      await load();
    } catch (err) {
      logger.error("Failed to grant permissions:", err);
      notify(errorText(err, m.todo.permissionsGrantFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function revoke(permission: TodoListPermission) {
    const confirmed = await requestConfirmation({
      message: m.todo.permissionsRevokeConfirm({ name: nameOf(permission.userId) }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      await todoApi.revokeTodoListPermissions(guildId, listId, permission.userId, userId);
      await load();
    } catch (err) {
      logger.error("Failed to revoke permissions:", err);
      notify(errorText(err, m.todo.permissionsRevokeFailed()), "error");
    }
  }

  void load();
</script>

<div class="space-y-3">
  <h4 class="text-sm font-semibold" style="color: {$colorStore.text}">{m.todo.permissionsCurrent()}</h4>

  {#if canManage}
    <div class="space-y-3 rounded-xl border p-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <DiscordSelector
        type="user"
        options={members}
        selected={target}
        placeholder={m.todo.permissionsSearchMembers()}
        ariaLabel={m.common.member()}
        onchange={(detail) => (target = typeof detail.selected === "string" ? detail.selected : null)}
      />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {#each toggles as toggle (toggle.key)}
          <ToggleRow
            checked={flags[toggle.key]}
            title={toggle.label}
            colors={$colorStore}
            onchange={(value) => (flags[toggle.key] = value)}
          />
        {/each}
      </div>
      <button
        type="button"
        class="px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={busy || !target}
        onclick={grant}
      >
        {m.todo.permissionsGrant()}
      </button>
    </div>
  {/if}

  {#if loading}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
  {:else if permissions.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.todo.permissionsEmptyTitle()}</p>
  {:else}
    <div class="space-y-2">
      {#each permissions as permission (permission.userId)}
        <div
          class="flex items-center gap-2 rounded-xl border p-2 min-w-0"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
        >
          <div class="grow min-w-0 px-1">
            <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{nameOf(permission.userId)}</span>
            <span class="block text-sm truncate" style="color: {$colorStore.muted}">{summary(permission)}</span>
          </div>
          {#if canManage}
            <button
              type="button"
              class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              aria-label={m.common.edit()}
              onclick={() => edit(permission)}
            >
              <i class="fa-solid fa-pen" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              aria-label={m.todo.permissionsRevokeAria()}
              onclick={() => revoke(permission)}
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
