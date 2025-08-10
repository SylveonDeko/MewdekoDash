<!-- routes/dashboard/todo/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fly, scale } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { userStore } from "$lib/stores/userStore";
  import { api } from "$lib/api";
  import { logger } from "$lib/logger";
  import { 
    List, 
    Plus, 
    Search, 
    Filter, 
    Settings, 
    Users,
    CheckSquare,
    Clock,
    AlertTriangle,
    Target,
    BarChart3,
    Calendar,
    Tag,
    Edit,
    Trash2,
    Globe,
    Lock,
    Shield,
    Eye,
    MoreVertical
  } from "lucide-svelte";

  import TodoPermissionManager from "$lib/components/specialized/TodoPermissionManager.svelte";
  import ErrorBoundary from "$lib/components/ui/ErrorBoundary.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

  import type { 
    TodoList, 
    TodoItem, 
    UserPermissions, 
    TodoStats,
    TodoFilterOptions,
    CreateTodoListRequest,
    AddTodoItemRequest 
  } from "$lib/types/todo";

  export let data;

  // State
  let todoLists: TodoList[] = [];
  let selectedListId: number | null = null;
  let todoItems: TodoItem[] = [];
  let loading = true;
  let error: string | null = null;

  // UI State
  let showNewListModal = false;
  let showPermissionManager = false;
  let selectedPermissionListId: number | null = null;
  let searchQuery = "";
  let showFilters = false;
  let includeCompleted = false;

  // Filters
  let filters: TodoFilterOptions = {
    completed: false,
    sortBy: 'priority',
    sortOrder: 'desc'
  };

  // New list form
  let newListName = "";
  let newListDescription = "";
  
  // Quick add form
  let showQuickAdd = false;
  let newItemTitle = "";
  let newItemDescription = "";
  let newItemPriority = 2;

  // User permissions for selected list
  let currentPermissions: UserPermissions = {
    canView: false,
    canAdd: false,
    canEdit: false,
    canComplete: false,
    canDelete: false,
    canManage: false
  };

  // Stats for selected list
  let currentStats: TodoStats = {
    totalItems: 0,
    completedItems: 0,
    pendingItems: 0,
    overdueItems: 0,
    completionRate: 0
  };

  // Computed values
  $: filteredLists = todoLists.filter(list => 
    list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (list.description && list.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  $: filteredItems = todoItems.filter(item => {
    if (!includeCompleted && item.isCompleted) return false;
    if (filters.completed !== undefined && item.isCompleted !== filters.completed) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !item.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const sortBy = filters.sortBy || 'priority';
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'priority':
        return (b.priority - a.priority) * order;
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1 * order;
        if (!b.dueDate) return -1 * order;
        return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * order;
      case 'createdAt':
        return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * order;
      case 'title':
        return a.title.localeCompare(b.title) * order;
      default:
        return 0;
    }
  });

  $: selectedList = todoLists.find(list => list.id === selectedListId);

  // Load todo lists
  async function loadTodoLists() {
    if (!$currentGuild?.id || !$userStore?.id) return;

    try {
      loading = true;
      error = null;
      
      const lists = await api.getTodoLists($currentGuild.id, BigInt($userStore.id));
      
      // Filter to only server lists as per requirements
      todoLists = lists.filter(list => list.isServerList);
      
      // Auto-select first list if none selected
      if (!selectedListId && todoLists.length > 0) {
        selectedListId = todoLists[0].id;
      }
      
    } catch (err) {
      console.error("Failed to load todo lists:", err);
      error = "Failed to load todo lists. Please try again.";
    } finally {
      loading = false;
    }
  }

  // Load todo items for selected list
  async function loadTodoItems() {
    if (!$currentGuild?.id || !$userStore?.id || !selectedListId) {
      todoItems = [];
      return;
    }

    try {
      const [items, permissions] = await Promise.all([
        api.getTodoItems($currentGuild.id, selectedListId, BigInt($userStore.id), includeCompleted),
        checkPermissions(selectedListId)
      ]);
      
      todoItems = items;
      currentPermissions = permissions;
      calculateStats();
      
    } catch (err) {
      console.error("Failed to load todo items:", err);
      error = "Failed to load todo items. Please try again.";
    }
  }

  // Check user permissions for a list
  async function checkPermissions(listId: number): Promise<UserPermissions> {
    if (!$currentGuild?.id || !$userStore?.id) {
      return {
        canView: false,
        canAdd: false,
        canEdit: false,
        canComplete: false,
        canDelete: false,
        canManage: false
      };
    }

    try {
      const list = todoLists.find(l => l.id === listId);
      if (!list) {
        return {
          canView: false,
          canAdd: false,
          canEdit: false,
          canComplete: false,
          canDelete: false,
          canManage: false
        };
      }

      // List owner has all permissions
      if (list.ownerId.toString() === $userStore.id) {
        return {
          canView: true,
          canAdd: true,
          canEdit: true,
          canComplete: true,
          canDelete: true,
          canManage: true
        };
      }

      // Check explicit permissions
      const permissions = await api.getTodoListPermissions($currentGuild.id, listId, BigInt($userStore.id));
      const userPermission = permissions.find(p => p.userId.toString() === $userStore.id);
      
      if (userPermission) {
        return {
          canView: userPermission.canView,
          canAdd: userPermission.canAdd,
          canEdit: userPermission.canEdit,
          canComplete: userPermission.canComplete,
          canDelete: userPermission.canDelete,
          canManage: userPermission.canManageList
        };
      }

      // Public server lists have default view permission
      if (list.isServerList && list.isPublic) {
        return {
          canView: true,
          canAdd: false,
          canEdit: false,
          canComplete: false,
          canDelete: false,
          canManage: false
        };
      }

      return {
        canView: false,
        canAdd: false,
        canEdit: false,
        canComplete: false,
        canDelete: false,
        canManage: false
      };
      
    } catch (err) {
      console.error("Failed to check permissions:", err);
      return {
        canView: false,
        canAdd: false,
        canEdit: false,
        canComplete: false,
        canDelete: false,
        canManage: false
      };
    }
  }

  // Calculate stats for current list
  function calculateStats() {
    const total = todoItems.length;
    const completed = todoItems.filter(item => item.isCompleted).length;
    const pending = total - completed;
    const overdue = todoItems.filter(item => 
      item.dueDate && 
      new Date(item.dueDate) < new Date() && 
      !item.isCompleted
    ).length;

    currentStats = {
      totalItems: total,
      completedItems: completed,
      pendingItems: pending,
      overdueItems: overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  // Event handlers
  async function handleSelectList({ detail }: { detail: { listId: number } }) {
    selectedListId = detail.listId;
    await loadTodoItems();
  }

  async function handleCreateList() {
    if (!$currentGuild?.id || !$userStore?.id || !newListName.trim()) return;

    try {
      const request: CreateTodoListRequest = {
        name: newListName.trim(),
        description: newListDescription.trim() || undefined,
        userId: BigInt($userStore.id),
        isServerList: true // Only create server lists
      };

      await api.createTodoList($currentGuild.id, request);
      
      // Reset form and reload lists
      newListName = "";
      newListDescription = "";
      showNewListModal = false;
      await loadTodoLists();
      
    } catch (err) {
      console.error("Failed to create todo list:", err);
      error = "Failed to create todo list. Please try again.";
    }
  }

  async function handleAddTodoItem({ detail }: { detail: { request: AddTodoItemRequest; listId: number } }) {
    if (!$currentGuild?.id || !$userStore?.id) return;

    try {
      const request = {
        ...detail.request,
        userId: BigInt($userStore.id)
      };

      await api.addTodoItem($currentGuild.id, detail.listId, request);
      
      // Reload items if this is the selected list
      if (detail.listId === selectedListId) {
        await loadTodoItems();
      }
      
    } catch (err) {
      console.error("Failed to add todo item:", err);
      error = "Failed to add todo item. Please try again.";
    }
  }

  async function handleCompleteItem({ detail }: { detail: { itemId: number } }) {
    if (!$currentGuild?.id || !$userStore?.id) return;

    try {
      await api.completeTodoItem($currentGuild.id, detail.itemId, BigInt($userStore.id));
      await loadTodoItems();
    } catch (err) {
      console.error("Failed to complete todo item:", err);
      error = "Failed to complete todo item. Please try again.";
    }
  }

  async function handleDeleteItem({ detail }: { detail: { itemId: number } }) {
    if (!$currentGuild?.id || !$userStore?.id) return;

    try {
      await api.deleteTodoItem($currentGuild.id, detail.itemId, BigInt($userStore.id));
      await loadTodoItems();
    } catch (err) {
      console.error("Failed to delete todo item:", err);
      error = "Failed to delete todo item. Please try again.";
    }
  }

  function handleShowPermissions({ detail }: { detail: { listId: number } }) {
    selectedPermissionListId = detail.listId;
    showPermissionManager = true;
  }

  async function handlePermissionsUpdated() {
    // Refresh permissions for current list
    if (selectedListId) {
      currentPermissions = await checkPermissions(selectedListId);
    }
  }

  // Lifecycle
  onMount(() => {
    loadTodoLists();
  });

  $: if ($currentGuild) {
    loadTodoLists();
  }

  $: if (selectedListId) {
    loadTodoItems();
  }
</script>

<svelte:head>
  <title>Todo Lists - {$currentGuild?.name || 'Mewdeko'} Dashboard</title>
</svelte:head>

<ErrorBoundary fallback="Todo dashboard failed to load. Please refresh the page.">
  <DashboardPageLayout 
    title="Todo Lists" 
    subtitle="Organize and track your server's collaborative tasks" 
    icon={List}
    guildName={$currentGuild?.name || "Dashboard"}
    actionButtons={[
      {
        label: "Create List",
        icon: Plus,
        action: () => showNewListModal = true,
        style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text}; box-shadow: 0 0 20px ${$colorStore.primary}20;`
      },
      {
        label: "Filters",
        icon: Filter,
        action: () => showFilters = !showFilters,
        variant: "secondary"
      }
    ]}
  >
    <svelte:fragment slot="status-messages">
      {#if error}
        <div class="mb-8 p-4 rounded-2xl" style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;">
          <div class="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        </div>
      {/if}
    </svelte:fragment>

    <!-- Search Bar -->
    <div class="mb-8">
      <div class="relative max-w-md">
        <Search size={18} class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10" style="color: {$colorStore.primary}" />
        <input
          type="text"
          placeholder="Search todo lists..."
          bind:value={searchQuery}
          class="w-full pl-12 pr-4 py-4 rounded-2xl border text-lg"
          style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10); border-color: {$colorStore.primary}40; color: {$colorStore.text};"
        />
      </div>
    </div>

    <!-- Filters -->
    {#if showFilters}
      <div class="mb-8 p-6 rounded-2xl" style="background: linear-gradient(135deg, {$colorStore.primary}08, {$colorStore.secondary}08);" 
           in:fly={{ y: -20, duration: 300 }}>
        <div class="flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all hover:scale-105"
                 style="background: {includeCompleted ? $colorStore.primary + '20' : 'transparent'};">
            <input type="checkbox" bind:checked={includeCompleted} class="rounded w-5 h-5" />
            <span style="color: {$colorStore.text}" class="font-medium">Show completed items</span>
          </label>

          <DiscordSelector
            type="custom"
            customIcon={BarChart3}
            placeholder="Sort by"
            searchable={false}
            options={[
              { id: "priority", name: "Priority", label: "Sort by Priority", emoji: "🎯" },
              { id: "dueDate", name: "Due Date", label: "Sort by Due Date", emoji: "📅" },
              { id: "createdAt", name: "Created", label: "Sort by Created", emoji: "🗓️" },
              { id: "title", name: "Title", label: "Sort by Title", emoji: "📝" }
            ]}
            selected={filters.sortBy}
            on:change={(e) => filters.sortBy = e.detail.selected}
          />

          <DiscordSelector
            type="custom"
            customIcon={Filter}
            placeholder="Order"
            searchable={false}
            options={[
              { id: "desc", name: "Descending", label: "Descending", emoji: "⬇️" },
              { id: "asc", name: "Ascending", label: "Ascending", emoji: "⬆️" }
            ]}
            selected={filters.sortOrder}
            on:change={(e) => filters.sortOrder = e.detail.selected}
          />
        </div>
      </div>
    {/if}

    <!-- Main Content -->
    {#if loading}
      <!-- Beautiful Loading State -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {#each Array(6).fill(0) as _, index}
          <div class="p-6 rounded-2xl animate-pulse" 
               style="background: linear-gradient(135deg, {$colorStore.primary}08, {$colorStore.secondary}08);"
               in:scale={{ duration: 300, delay: index * 100 }}>
            <div class="space-y-4">
              <div class="h-6 rounded-xl" style="background: {$colorStore.primary}20; width: 70%;"></div>
              <div class="h-4 rounded-lg" style="background: {$colorStore.primary}15; width: 90%;"></div>
              <div class="h-4 rounded-lg" style="background: {$colorStore.primary}15; width: 60%;"></div>
              <div class="h-3 rounded-lg" style="background: {$colorStore.primary}10; width: 100%;"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if filteredLists.length === 0}
      <!-- Beautiful Empty State -->
      <div class="text-center py-20">
        <div class="inline-flex p-6 rounded-3xl mb-6" 
             style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}15);">
          <List class="w-16 h-16" style="color: {$colorStore.primary}" />
        </div>
        <h3 class="text-2xl font-bold mb-4" style="color: {$colorStore.text}">
          {searchQuery ? "No Lists Found" : "No Todo Lists Yet"}
        </h3>
        <p class="text-lg mb-8" style="color: {$colorStore.muted}">
          {searchQuery ? "Try adjusting your search terms." : "Create your first server todo list to get started organizing tasks."}
        </p>
        {#if !searchQuery}
          <button
            class="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg"
            style="color: {$colorStore.text};"
            on:click={() => showNewListModal = true}
          >
            <div class="p-2 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, {$colorStore.gradientStart}, {$colorStore.gradientMid}); color: white;">
              <Plus size={20} />
            </div>
            <span>Create Your First List</span>
          </button>
        {/if}
      </div>
    {:else}
      <!-- Beautiful Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {#each filteredLists as list, index}
          {@const listStats = list.id === selectedListId ? currentStats : { totalItems: 0, completedItems: 0, pendingItems: 0, overdueItems: 0, completionRate: 0 }}
          {@const listPermissions = list.id === selectedListId ? currentPermissions : { canView: true, canAdd: false, canEdit: false, canComplete: false, canDelete: false, canManage: false }}
          
          <div class="group relative" in:scale={{ duration: 300, delay: index * 50 }}>
            <!-- Todo List Card -->
            <div class="relative p-6 rounded-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl"
                 class:ring-2={list.id === selectedListId}
                 style="background: linear-gradient(135deg, {list.color || $colorStore.primary}08, {list.color || $colorStore.primary}15);
                        ring-color: {list.id === selectedListId ? (list.color || $colorStore.primary) : 'transparent'};"
                 on:click={() => handleSelectList({ detail: { listId: list.id } })}
                 on:keydown={(e) => e.key === 'Enter' && handleSelectList({ detail: { listId: list.id } })}
                 tabindex="0"
                 role="button"
                 aria-label="Select todo list {list.name}">
              
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="p-2.5 rounded-xl" style="background: {list.color || $colorStore.primary}20;">
                    <List size={20} style="color: {list.color || $colorStore.primary}" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-lg truncate" style="color: {$colorStore.text}">
                      {list.name}
                    </h3>
                    {#if list.description}
                      <p class="text-sm mt-1 line-clamp-2" style="color: {$colorStore.muted}">
                        {list.description}
                      </p>
                    {/if}
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                  {#if listPermissions.canView}
                    <button
                      class="p-3 rounded-lg transition-all hover:scale-110 flex items-center justify-center min-w-[44px] min-h-[44px]"
                      style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}20); color: {$colorStore.primary};"
                      on:click|stopPropagation={() => handleShowPermissions({ detail: { listId: list.id } })}
                      title="Manage permissions"
                    >
                      <Shield size={16} />
                    </button>
                  {/if}
                  
                  {#if listPermissions.canManage}
                    <button
                      class="p-3 rounded-lg transition-all hover:scale-110 flex items-center justify-center min-w-[44px] min-h-[44px]"
                      style="background: linear-gradient(135deg, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}20); color: {$colorStore.secondary};"
                      on:click|stopPropagation
                      title="List settings"
                    >
                      <Settings size={16} />
                    </button>
                  {/if}
                </div>
              </div>
              
              <!-- Badges -->
              <div class="flex items-center gap-2 mb-4">
                <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                     style="background: {list.isPublic ? $colorStore.secondary + '20' : $colorStore.muted + '20'}; 
                            color: {list.isPublic ? $colorStore.secondary : $colorStore.muted};">
                  {#if list.isPublic}
                    <Globe size={10} />
                    <span>Public</span>
                  {:else}
                    <Lock size={10} />
                    <span>Private</span>
                  {/if}
                </div>
                
                {#if list.isServerList}
                  <div class="px-3 py-1.5 rounded-full text-xs font-medium"
                       style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
                    Server List
                  </div>
                {/if}
              </div>
              
              <!-- Stats -->
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-1.5">
                      <div class="w-2 h-2 rounded-full" style="background: {$colorStore.primary}"></div>
                      <span style="color: {$colorStore.text}">{listStats.pendingItems}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <div class="w-2 h-2 rounded-full" style="background: {$colorStore.secondary}"></div>
                      <span style="color: {$colorStore.text}">{listStats.completedItems}</span>
                    </div>
                    {#if listStats.overdueItems > 0}
                      <div class="flex items-center gap-1.5">
                        <div class="w-2 h-2 rounded-full bg-red-500"></div>
                        <span class="text-red-500">{listStats.overdueItems}</span>
                      </div>
                    {/if}
                  </div>
                  
                  <span class="text-xs font-medium px-2 py-1 rounded-full" 
                        style="background: {$colorStore.primary}15; color: {$colorStore.primary};">
                    {listStats.totalItems} item{listStats.totalItems !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <!-- Progress Bar -->
                {#if listStats.totalItems > 0}
                  <div class="space-y-1">
                    <div class="flex items-center justify-between text-xs">
                      <span style="color: {$colorStore.muted}">Progress</span>
                      <span style="color: {$colorStore.text}" class="font-medium">{listStats.completionRate}%</span>
                    </div>
                    <div class="w-full rounded-full h-2" style="background: {$colorStore.primary}20;">
                      <div class="h-2 rounded-full transition-all duration-1000"
                           style="background: linear-gradient(90deg, {list.color || $colorStore.primary}, {$colorStore.secondary}); 
                                  width: {listStats.completionRate}%"></div>
                    </div>
                  </div>
                {:else}
                  <div class="text-center py-2">
                    <span class="text-xs" style="color: {$colorStore.muted}">Empty list</span>
                  </div>
                {/if}
              </div>
              
              <!-- Selected Indicator -->
              {#if list.id === selectedListId}
                <div class="absolute inset-0 rounded-2xl pointer-events-none"
                     style="box-shadow: 0 0 0 2px {list.color || $colorStore.primary};"></div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      
      <!-- Selected List Items -->
      {#if selectedListId && currentPermissions.canView}
        <div class="mt-12 pt-8 border-t" style="border-color: {$colorStore.primary}20;">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold" style="color: {$colorStore.text}">
              {selectedList?.name} Items
            </h2>
            
            {#if currentPermissions.canAdd}
              <button
                class="flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 min-h-[44px]"
                style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}20); color: {$colorStore.primary};"
                on:click={() => showQuickAdd = !showQuickAdd}
              >
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            {/if}
          </div>
          
          <!-- Quick Add Form -->
          {#if showQuickAdd && currentPermissions.canAdd}
            <div class="mb-6 p-6 rounded-2xl" 
                 style="background: linear-gradient(135deg, {$colorStore.primary}08, {$colorStore.secondary}08);"
                 in:fly={{ y: -20, duration: 300 }}>
              <div class="space-y-4">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  bind:value={newItemTitle}
                  class="w-full px-4 py-3 rounded-xl border text-lg backdrop-blur-sm"
                  style="background: linear-gradient(135deg, {$colorStore.primary}12, {$colorStore.secondary}08); border-color: {$colorStore.primary}40; color: {$colorStore.text};"
                />
                <textarea
                  placeholder="Add a description (optional)..."
                  bind:value={newItemDescription}
                  rows="2"
                  class="w-full px-4 py-3 rounded-xl border resize-none backdrop-blur-sm"
                  style="background: linear-gradient(135deg, {$colorStore.primary}12, {$colorStore.secondary}08); border-color: {$colorStore.primary}40; color: {$colorStore.text};"
                ></textarea>
                <div class="flex items-center justify-between">
                  <DiscordSelector
                    type="custom"
                    customIcon={Target}
                    placeholder="Select Priority"
                    searchable={false}
                    options={[
                      { id: "1", name: "Low Priority", label: "Low Priority", emoji: "🟢" },
                      { id: "2", name: "Medium Priority", label: "Medium Priority", emoji: "🟠" },
                      { id: "3", name: "High Priority", label: "High Priority", emoji: "🟡" },
                      { id: "4", name: "Critical Priority", label: "Critical Priority", emoji: "🔴" }
                    ]}
                    selected={newItemPriority.toString()}
                    on:change={(e) => newItemPriority = parseInt(e.detail.selected)}
                  />
                  
                  <div class="flex flex-col sm:flex-row gap-3">
                    <button
                      class="w-full sm:flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                      style="background: linear-gradient(135deg, {$colorStore.primary}80, {$colorStore.secondary}80); color: white;"
                      on:click={async () => {
                        if (newItemTitle.trim() && selectedListId) {
                          await handleAddTodoItem({
                            detail: {
                              request: {
                                title: newItemTitle.trim(),
                                description: newItemDescription.trim() || undefined,
                                priority: newItemPriority,
                                userId: BigInt($userStore.id)
                              },
                              listId: selectedListId
                            }
                          });
                          newItemTitle = '';
                          newItemDescription = '';
                          newItemPriority = 2;
                          showQuickAdd = false;
                        }
                      }}
                      disabled={!newItemTitle.trim()}
                    >
                      <Plus size={16} />
                      <span>Add Item</span>
                    </button>
                    <button
                      class="w-full sm:w-auto px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 font-medium flex items-center justify-center"
                      style="color: {$colorStore.muted}; border: 1px solid {$colorStore.primary}30;"
                      on:click={() => showQuickAdd = false}
                    >
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/if}
          
          <!-- Todo Items -->
          <div class="space-y-3">
            {#if filteredItems.length === 0}
              <div class="text-center py-12">
                <CheckSquare class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
                <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">
                  {todoItems.length === 0 ? "No Items Yet" : "No Items Match Filters"}
                </h3>
                <p style="color: {$colorStore.muted}">
                  {todoItems.length === 0 
                    ? currentPermissions.canAdd 
                      ? "Add your first todo item to get started."
                      : "This list is empty."
                    : "Try adjusting your filters."}
                </p>
              </div>
            {:else}
              {#each filteredItems as item, index}
                <div class="p-4 rounded-xl transition-all hover:scale-[1.01]" 
                     class:opacity-60={item.isCompleted}
                     style="background: linear-gradient(135deg, {$colorStore.primary}05, {$colorStore.secondary}05);"
                     in:scale={{ duration: 200, delay: index * 30 }}>
                  <div class="flex items-start gap-4">
                    <!-- Completion Checkbox -->
                    <button
                      class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1"
                      style="border-color: {item.isCompleted ? '#10b981' : $colorStore.primary}; 
                             background: {item.isCompleted ? '#10b981' : 'transparent'};"
                      on:click={() => handleCompleteItem({ detail: { itemId: item.id } })}
                      disabled={!currentPermissions.canComplete && !currentPermissions.canEdit}
                    >
                      {#if item.isCompleted}
                        <CheckSquare size={14} color="white" />
                      {/if}
                    </button>
                    
                    <!-- Item Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h4 class="font-medium mb-1" 
                              class:line-through={item.isCompleted}
                              style="color: {item.isCompleted ? $colorStore.muted : $colorStore.text}">
                            {item.title}
                          </h4>
                          {#if item.description}
                            <p class="text-sm" style="color: {$colorStore.muted}">
                              {item.description}
                            </p>
                          {/if}
                          
                          <!-- Metadata -->
                          <div class="flex items-center gap-3 mt-2 text-xs" style="color: {$colorStore.muted}">
                            <!-- Priority -->
                            {#if item.priority === 1}
                              <span class="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
                                🟢 Low
                              </span>
                            {:else if item.priority === 2}
                              <span class="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                                🟠 Medium
                              </span>
                            {:else if item.priority === 3}
                              <span class="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                🟡 High
                              </span>
                            {:else if item.priority === 4}
                              <span class="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700">
                                🔴 Critical
                              </span>
                            {/if}
                            
                            <!-- Due Date -->
                            {#if item.dueDate}
                              {@const isOverdue = new Date(item.dueDate) < new Date() && !item.isCompleted}
                              <span class="flex items-center gap-1">
                                <Calendar size={10} />
                                <span class={isOverdue ? 'text-red-500' : ''}>
                                  {new Date(item.dueDate).toLocaleDateString()}
                                </span>
                              </span>
                            {/if}
                            
                            <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <!-- Actions -->
                        {#if currentPermissions.canEdit || currentPermissions.canDelete}
                          <div class="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                            {#if currentPermissions.canEdit}
                              <button
                                class="p-2 rounded-lg transition-all hover:scale-110 flex items-center justify-center min-w-[36px] min-h-[36px]"
                                style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}20); color: {$colorStore.primary};"
                                title="Edit item"
                              >
                                <Edit size={12} />
                              </button>
                            {/if}
                            
                            {#if currentPermissions.canDelete}
                              <button
                                class="p-2 rounded-lg transition-all hover:scale-110 flex items-center justify-center min-w-[36px] min-h-[36px]"
                                style="background: linear-gradient(135deg, #ef444420, #dc262620); color: #ef4444;"
                                on:click={() => handleDeleteItem({ detail: { itemId: item.id } })}
                                title="Delete item"
                              >
                                <Trash2 size={12} />
                              </button>
                            {/if}
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    {/if}
  </DashboardPageLayout>

  <!-- New List Modal -->
  {#if showNewListModal}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         on:click={() => showNewListModal = false}
         in:fly={{ opacity: 0, duration: 200 }}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
           on:click|stopPropagation
           in:fly={{ y: 20, duration: 300, delay: 100 }}>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-lg" style="background: {$colorStore.primary}20;">
              <Plus size={20} style="color: {$colorStore.primary}" />
            </div>
            <h3 class="text-xl font-bold" style="color: {$colorStore.text}">
              Create New Todo List
            </h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                List Name *
              </label>
              <input
                type="text"
                placeholder="Enter list name..."
                bind:value={newListName}
                class="w-full px-4 py-3 rounded-lg border backdrop-blur-sm"
                style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10); border-color: {$colorStore.primary}50; color: {$colorStore.text};"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                Description
              </label>
              <textarea
                placeholder="Optional description..."
                bind:value={newListDescription}
                rows="3"
                class="w-full px-4 py-3 rounded-lg border resize-none backdrop-blur-sm"
                style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10); border-color: {$colorStore.primary}50; color: {$colorStore.text};"
              ></textarea>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                class="w-full sm:flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center justify-center min-h-[44px]"
                style="background: linear-gradient(135deg, {$colorStore.primary}80, {$colorStore.secondary}80); color: white;"
                on:click={handleCreateList}
                disabled={!newListName.trim()}
              >
                Create List
              </button>
              <button
                class="w-full sm:w-auto px-4 py-3 rounded-lg font-medium transition-all hover:scale-105 flex items-center justify-center min-h-[44px]"
                style="color: {$colorStore.muted}; background: {$colorStore.primary}10;"
                on:click={() => showNewListModal = false}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Permission Manager -->
  {#if selectedPermissionListId}
    <TodoPermissionManager
      listId={selectedPermissionListId}
      isOpen={showPermissionManager}
      on:close={() => showPermissionManager = false}
      on:permissionsUpdated={handlePermissionsUpdated}
    />
  {/if}
</ErrorBoundary>

<style>
  /* Ensure proper touch targets for mobile */
  button {
    min-width: 44px;
    min-height: 44px;
  }

  /* Focus styles for accessibility */
  button:focus, input:focus, textarea:focus, select:focus {
    outline: 2px solid var(--focus-color, #3b82f6);
    outline-offset: 2px;
  }

  /* Custom checkbox styling */
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
  }

  /* Line clamp utility */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Smooth hover animations */
  .group:hover {
    transform: translateY(-1px);
  }

  /* Beautiful gradient animations */
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>