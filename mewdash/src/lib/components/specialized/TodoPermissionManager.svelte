<!-- lib/components/TodoPermissionManager.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { todoApi, guildApi } from "$lib/api/index.ts";
  import type { TodoListPermission, GrantPermissionRequest } from "$lib/types/todo";

  interface Props {
    listId: number;
    isOpen?: boolean;
    onclose?: () => void;
    onpermissionsUpdated?: () => void;
  }

  let { listId, isOpen = false, onclose, onpermissionsUpdated }: Props = $props();

  let permissions: TodoListPermission[] = $state([]);
  let guildMembers: Array<{ id: string; username: string; displayName: string; avatarUrl: string; isBot: boolean }> = $state([]);
  let loading = $state(true);
  let searchQuery = $state("");
  let showAddUser = $state(false);
  let selectedUserId = $state("");
  let newPermissions = $state({
    canView: true,
    canEdit: false,
    canManage: false
  });

  // Filter members for user selection
  let filteredMembers = $derived(guildMembers.filter(member => 
    !member.isBot && 
    !permissions.some(p => p.userId.toString() === member.id) &&
    (member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
     member.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  ));

  async function loadPermissions() {
    if (!$currentGuild?.id || !listId) return;
    
    try {
      loading = true;
      const [permsData, membersData] = await Promise.all([
        todoApi.getTodoListPermissions($currentGuild.id, listId, BigInt($currentGuild.userId)),
        guildApi.getGuildMembers($currentGuild.id)
      ]);
      
      permissions = permsData;
      guildMembers = membersData;
    } catch (error) {
      console.error("Failed to load permissions:", error);
    } finally {
      loading = false;
    }
  }

  async function grantPermissions() {
    if (!$currentGuild?.id || !selectedUserId) return;

    try {
      const request: GrantPermissionRequest = {
        targetUserId: BigInt(selectedUserId),
        requestingUserId: BigInt($currentGuild.userId),
        canView: newPermissions.canView,
        canManage: newPermissions.canManage
      };

      await todoApi.grantTodoListPermissions($currentGuild.id, listId, request);
      await loadPermissions();
      
      // Reset form
      selectedUserId = "";
      newPermissions = { canView: true, canEdit: false, canManage: false };
      showAddUser = false;

      onpermissionsUpdated?.();
    } catch (error) {
      console.error("Failed to grant permissions:", error);
    }
  }

  async function revokePermissions(userId: bigint) {
    if (!$currentGuild?.id) return;

    try {
      await todoApi.revokeTodoListPermissions($currentGuild.id, listId, userId, BigInt($currentGuild.userId));
      await loadPermissions();
      onpermissionsUpdated?.();
    } catch (error) {
      console.error("Failed to revoke permissions:", error);
    }
  }

  function closeModal() {
    onclose?.();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      closeModal();
    }
  }

  function getPermissionSummary(permission: TodoListPermission): string {
    if (permission.canManageList) return "Manager";
    if (permission.canEdit) return "Editor";
    if (permission.canAdd) return "Contributor";
    return "Viewer";
  }

  function getPermissionIcon(permission: TodoListPermission) {
    if (permission.canManageList) return "fa-shield";
    if (permission.canEdit) return "fa-pen";
    return "fa-eye";
  }

  onMount(() => {
    if (isOpen) {
      loadPermissions();
    }
  });

  $effect(() => {
    if (isOpen && listId) {
      loadPermissions();
    }
  });
</script>

<!-- Modal Backdrop -->
{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
            class="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    onclick={closeModal}
    in:fly={{ opacity: 0, duration: 200 }}
            role="button" tabindex="0"
            onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); closeModal; } }}>
    <!-- Modal Content -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      in:fly={{ y: 20, duration: 300, delay: 100 }}
      role="button" tabindex="0"
      onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); } }}>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b" style="border-color: {$colorStore.primary}20;">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg" style="background: {$colorStore.primary}20;">
            <i class="fa-solid fa-shield" style="color: {$colorStore.primary}; font-size: 20px;"></i>
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">
            Manage Permissions
          </h2>
        </div>

        <button aria-label="Button action"
          class="p-2 rounded-lg transition-all hover:scale-110"
          style="color: {$colorStore.muted}; background: {$colorStore.primary}10;"
          onclick={closeModal}
          onkeydown={handleKeydown}
        ><i class="fa-solid fa-xmark" style="font-size: 20px;"></i></button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        {#if loading}
          <!-- Loading State -->
          <div class="space-y-4">
            {#each Array(3).fill(0) as _}
              <div class="flex items-center gap-4 p-4 rounded-xl animate-pulse" style="background: {$colorStore.primary}08;">
                <div class="w-10 h-10 rounded-full" style="background: {$colorStore.primary}20;"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-4 rounded-sm" style="background: {$colorStore.primary}20; width: 60%;"></div>
                    <div class="h-3 rounded-sm" style="background: {$colorStore.primary}15; width: 40%;"></div>
                </div>
                  <div class="w-20 h-6 rounded-sm" style="background: {$colorStore.primary}20;"></div>
              </div>
            {/each}
          </div>
        {:else}
          <!-- Add User Section -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Current Permissions</h3>
              <button
                class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}; color: white;"
                onclick={() => showAddUser = !showAddUser}
              >
                <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
                <span>Add User</span>
              </button>
            </div>

            {#if showAddUser}
              <div class="p-4 rounded-xl mb-4" style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;" 
                   in:fly={{ y: -20, duration: 200 }}>
                <!-- User Search -->
                <div class="mb-4">
                  <label for="user-search" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                    Select User
                  </label>
                  
                  <div class="relative">
                    <i class="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2"
                       style="color: {$colorStore.muted}; font-size: 16px;"></i>
                    <input
                      type="text"
                      placeholder="Search members..."
                      class="w-full pl-10 pr-4 py-2 rounded-lg border"
                      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      bind:value={searchQuery}
                    >
                  </div>

                  {#if searchQuery && filteredMembers.length > 0}
                    <div class="mt-2 max-h-32 overflow-y-auto border rounded-lg" style="border-color: {$colorStore.primary}30;">
                      {#each filteredMembers.slice(0, 5) as member}
                        <button
                          class="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                          class:bg-blue-50={selectedUserId === member.id}
                          class:selected={selectedUserId === member.id}
                          onclick={() => { selectedUserId = member.id; searchQuery = member.displayName; }}
                        >
                          <img src={member.avatarUrl} alt="" class="w-8 h-8 rounded-full">
                          <div>
                            <div class="font-medium" style="color: {$colorStore.text}">{member.displayName}</div>
                            <div class="text-sm" style="color: {$colorStore.muted}">@{member.username}</div>
                          </div>
                          {#if selectedUserId === member.id}
                            <i class="fa-solid fa-check" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                          {/if}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>

                <!-- Permission Levels -->
                <div class="mb-4">
                  <label for="permission-level" class="block text-sm font-medium mb-2"
                         style="color: {$colorStore.text}">
                    Permission Level
                  </label>
                  
                  <div class="space-y-2">
                    <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                           style="background: {newPermissions.canView ? $colorStore.primary + '15' : $colorStore.primary + '05'};">
                      <input 
                        type="checkbox" 
                        bind:checked={newPermissions.canView}
                        class="rounded-sm"
                      >
                      <div class="flex items-center gap-2">
                        <i class="fa-solid fa-eye" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                        <span style="color: {$colorStore.text}">Can View</span>
                      </div>
                      <span class="text-sm ml-auto" style="color: {$colorStore.muted}">See list and items</span>
                    </label>

                    <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                           style="background: {newPermissions.canEdit ? $colorStore.primary + '15' : $colorStore.primary + '05'};">
                      <input 
                        type="checkbox" 
                        bind:checked={newPermissions.canEdit}
                        class="rounded-sm"
                      >
                      <div class="flex items-center gap-2">
                        <i class="fa-solid fa-pen" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                        <span style="color: {$colorStore.text}">Can Edit</span>
                      </div>
                      <span class="text-sm ml-auto" style="color: {$colorStore.muted}">Add, edit, complete items</span>
                    </label>

                    <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                           style="background: {newPermissions.canManage ? $colorStore.accent + '15' : $colorStore.primary + '05'};">
                      <input 
                        type="checkbox" 
                        bind:checked={newPermissions.canManage}
                        class="rounded-sm"
                      >
                      <div class="flex items-center gap-2">
                        <i class="fa-solid fa-shield" style="color: {$colorStore.accent}; font-size: 16px;"></i>
                        <span style="color: {$colorStore.text}">Can Manage</span>
                      </div>
                      <span class="text-sm ml-auto" style="color: {$colorStore.muted}">Change settings, permissions</span>
                    </label>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2">
                  <button
                    class="flex-1 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: {$colorStore.primary}; color: white;"
                    onclick={grantPermissions}
                    disabled={!selectedUserId || !newPermissions.canView}
                  >
                    Grant Permissions
                  </button>
                  
                  <button
                    class="px-4 py-2 rounded-lg transition-all hover:scale-[1.02]"
                    style="color: {$colorStore.muted}; background: {$colorStore.primary}10;"
                    onclick={() => showAddUser = false}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            {/if}
          </div>

          <!-- Current Permissions List -->
          <div class="space-y-3">
            {#if permissions.length === 0}
              <div class="text-center py-8">
                <i class="fa-solid fa-users"
                   style="color: {$colorStore.primary}50; font-size: 48px; display: block; margin: 0 auto 16px;"></i>
                <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Permissions Set</h3>
                <p class="text-sm" style="color: {$colorStore.muted}">
                  Add users to collaborate on this todo list.
                </p>
              </div>
            {:else}
              {#each permissions as permission, index}
                {@const member = guildMembers.find(m => m.id === permission.userId.toString())}
                <div class="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.primary}08;"
                     in:fly={{ y: 20, duration: 200, delay: index * 50 }}>
                  <div class="flex items-center gap-4">
                    <!-- Avatar -->
                    <img 
                      src={member?.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`} 
                      alt="" 
                      class="w-10 h-10 rounded-full"
                    >
                    
                    <!-- User Info -->
                    <div>
                      <div class="font-medium" style="color: {$colorStore.text}">
                        {member?.displayName || "Unknown User"}
                      </div>
                      <div class="text-sm" style="color: {$colorStore.muted}">
                        @{member?.username || permission.userId}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <!-- Permission Level -->
                    <div class="flex items-center gap-2 px-3 py-1 rounded-full"
                         style="background: {$colorStore.primary}15; color: {$colorStore.primary};">
                      <i class="fa-solid {getPermissionIcon(permission)}" style="font-size: 14px;"></i>
                      <span class="text-sm font-medium">{getPermissionSummary(permission)}</span>
                    </div>

                    <!-- Revoke Button -->
                    <button aria-label="Remove permission"
                      class="p-2 rounded-lg transition-all hover:scale-110"
                      style="color: #ef4444; background: #ef444415;"
                      onclick={() => revokePermissions(permission.userId)}
                      title="Revoke permissions"
                    >
                      <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
                    </button>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t" style="border-color: {$colorStore.primary}20;">
        <button
          class="px-6 py-2 rounded-lg transition-all hover:scale-[1.02]"
          style="color: {$colorStore.muted}; background: {$colorStore.primary}10;"
          onclick={closeModal}
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Custom checkbox styling */
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
  }

  /* Ensure proper touch targets for mobile */
  button {
    min-width: 44px;
    min-height: 44px;
  }

  /* Focus styles for accessibility */
  button:focus, input:focus {
    outline: 2px solid var(--focus-color, #3b82f6);
    outline-offset: 2px;
  }

  /* Selected user styling */
  .selected {
    background-color: rgb(239 246 255) !important;
  }
  
  :global(.dark) .selected {
    background-color: rgb(30 58 138 / 0.2) !important;
  }
</style>