<!-- routes/dashboard/rolegreets/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
  import { clientApi, type RoleGreet, roleGreetApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // State management
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");

  // Role Greets
  let roleGreets: RoleGreet[] = $state([]);

  // Guild roles and channels
  let guildRoles: Array<{
    id: string;
    name: string;
  }> = $state([]);

  let guildChannels: Array<{
    id: string;
    name: string;
  }> = $state([]);

  // Selected role for adding new greet
    let selectedRoleId = $state("");
    let selectedChannelId = $state("");

  // Edit states
    let editingGreetId: number | null = $state(null);
  let editGreetMessage: any = $state({});
    let editGreetDeleteTime = $state(0);
    let editGreetWebhook: string | null = $state(null);
    let editGreetBots = $state(false);
    let pendingDeleteId: number | null = $state(null);

  /** Normalized editor fields, used for both dirty checks and saving. */
  interface EditState {
    message: string;
    deleteTime: number;
    webhookUrl: string | null;
    greetBots: boolean;
  }

  /** What the user asked for while the editor held unsaved changes. */
  type PendingEditAction = { type: "close" } | { type: "switch"; greet: RoleGreet };

  let editBaseline: EditState = $state({ message: "", deleteTime: 0, webhookUrl: null, greetBots: false });
  let pendingEditAction: PendingEditAction | null = $state(null);
  let editingCardEl: HTMLElement | null = $state(null);

  /**
   * Keeps a reference to the card currently being edited so clicks can be told
   * apart from clicks anywhere else on the page.
   */
  function trackEditingCard(node: HTMLElement, isEditing: boolean) {
    if (isEditing) editingCardEl = node;

    return {
      update(nowEditing: boolean) {
        if (nowEditing) editingCardEl = node;
        else if (editingCardEl === node) editingCardEl = null;
      },
      destroy() {
        if (editingCardEl === node) editingCardEl = null;
      }
    };
  }

  $effect(() => {
    if (editingGreetId === null || pendingEditAction) return;

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || !editingCardEl) return;
      if (editingCardEl.contains(target)) return;
      if (target.closest("[data-greet-edit]")) return;

      /** Overlays such as the embed builder portal outside the app root, so a click there is not a click off the greet. */
      const appRoot = editingCardEl.closest("body > *");
      if (appRoot && !appRoot.contains(target)) return;

      requestStopEditing();
    };

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  });

  // Management
    let loading = $state(true);
    let error: string | null = $state(null);

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function fetchRoleGreets() {
    try {
      loading = true;
      error = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      roleGreets = await roleGreetApi.getAllRoleGreets($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch role greets:", err);
      error = err instanceof Error ? err.message : "Failed to fetch role greets";
    } finally {
      loading = false;
    }
  }

  async function fetchGuildRoles() {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      guildRoles = await clientApi.getRoles($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild roles:", err);
    }
  }

  async function fetchGuildChannels() {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }

      guildChannels = await clientApi.getTextChannels($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild channels:", err);
    }
  }

  async function addRoleGreet() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      if (!selectedRoleId) throw new Error("Please select a role");
      if (!selectedChannelId) throw new Error("Please select a channel");

      await roleGreetApi.addRoleGreet($currentGuild.id, BigInt(selectedRoleId), BigInt(selectedChannelId));

      showNotificationMessage("Role greet added successfully", "success");
      selectedRoleId = "";
      selectedChannelId = "";
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to add role greet:", err);
      showNotificationMessage(err instanceof Error ? err.message : "Failed to add role greet", "error");
    }
  }

  /**
   * Splits a stored greet message into the pieces PreviewCard renders. Messages
   * are stored as the raw embed JSON the bot parses, so a plain string is
   * treated as message content and anything unparseable falls back to itself.
   */
  function parseStoredMessage(message: string | null) {
    const empty = { content: "", embeds: [] as any[], componentRows: [] as any[] };
    if (!message) return empty;
    if (!message.trim().startsWith("{")) return { ...empty, content: message };

    try {
      const parsed = JSON.parse(message);
      const rows = new Map<number, any[]>();

      if (Array.isArray(parsed.components)) {
        for (const component of parsed.components) {
          const rowIndex = component.row || 0;
          if (!rows.has(rowIndex)) rows.set(rowIndex, []);
          rows.get(rowIndex)!.push(component);
        }
      }

      return {
        content: typeof parsed.content === "string" ? parsed.content : "",
        embeds: Array.isArray(parsed.embeds) ? parsed.embeds : parsed.embed ? [parsed.embed] : [],
        componentRows: Array.from(rows.entries()).map(([rowIndex, components]) => ({
          rowKey: `row-${rowIndex}`,
          components
        }))
      };
    } catch {
      return { ...empty, content: message };
    }
  }

  /**
   * Serializes the embed builder value into the string the bot stores. Plain
   * strings pass through; an empty builder becomes an empty message.
   */
  function serializeMessage(message: any): string {
    if (typeof message === "string") return message;
    return message && Object.keys(message).length > 0 ? JSON.stringify(message) : "";
  }

  /**
   * Saves every edited field of a greet in one action. The bot exposes one
   * endpoint per field, so this sends only the fields that actually changed.
   */
  async function saveGreetChanges(greet: RoleGreet): Promise<boolean> {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const guildId = $currentGuild.id;
      const current = currentEditState();
      let changed = false;

      if (current.message !== editBaseline.message) {
        await roleGreetApi.updateRoleGreetMessage(guildId, greet.id, current.message);
        changed = true;
      }

      if (current.deleteTime !== editBaseline.deleteTime) {
        await roleGreetApi.updateRoleGreetDeleteTime(guildId, greet.id, current.deleteTime);
        changed = true;
      }

      if (current.webhookUrl !== editBaseline.webhookUrl) {
        await roleGreetApi.updateRoleGreetWebhook(guildId, greet.id, current.webhookUrl);
        changed = true;
      }

      if (current.greetBots !== editBaseline.greetBots) {
        await roleGreetApi.updateRoleGreetBots(guildId, greet.id, current.greetBots);
        changed = true;
      }

      showNotificationMessage(changed ? "Role greet saved" : "No changes to save", "success");
      editingGreetId = null;
      await fetchRoleGreets();
      return true;
    } catch (err) {
      logger.error("Failed to save role greet:", err);
      showNotificationMessage("Failed to save role greet", "error");
      return false;
    }
  }

  async function toggleRoleGreetDisabled(greetId: number, disabled: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      await roleGreetApi.disableRoleGreet($currentGuild.id, greetId, disabled);
      showNotificationMessage(disabled ? "Role greet disabled" : "Role greet enabled", "success");
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to toggle role greet state:", err);
      showNotificationMessage("Failed to update role greet state", "error");
    }
  }

  /**
   * Deletes a role greet after the user has confirmed the pending delete.
   */
  async function deleteRoleGreet(greetId: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      await roleGreetApi.deleteRoleGreet($currentGuild.id, greetId);
      showNotificationMessage("Role greet deleted", "success");
      pendingDeleteId = null;
      if (editingGreetId === greetId) editingGreetId = null;
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to delete role greet:", err);
      showNotificationMessage("Failed to delete role greet", "error");
    }
  }

  function startEditing(greet: any) {
    editingGreetId = greet.id;

    // Parse message if it's a JSON string
    try {
      if (typeof greet.message === "string" && greet.message.trim().startsWith("{")) {
        editGreetMessage = JSON.parse(greet.message);
      } else if (typeof greet.message === "string" && greet.message) {
        editGreetMessage = { content: greet.message };
      } else {
        editGreetMessage = greet.message || {};
      }
    } catch {
      editGreetMessage = greet.message ? { content: greet.message } : {};
    }

    editGreetDeleteTime = greet.deleteTime;
    editGreetWebhook = greet.webhookUrl;
    editGreetBots = greet.greetBots;
    editBaseline = currentEditState();
  }

  /**
   * Snapshots the editor fields in the normalized form they are compared and
   * saved in, so a round-tripped message never reads as an edit.
   */
  function currentEditState(): EditState {
    return {
      message: serializeMessage(editGreetMessage),
      deleteTime: editGreetDeleteTime,
      webhookUrl: editGreetWebhook || null,
      greetBots: editGreetBots
    };
  }

  function hasUnsavedChanges(): boolean {
    if (editingGreetId === null) return false;
    const current = currentEditState();
    return current.message !== editBaseline.message
      || current.deleteTime !== editBaseline.deleteTime
      || current.webhookUrl !== editBaseline.webhookUrl
      || current.greetBots !== editBaseline.greetBots;
  }

  /**
   * Handles the pencil button. It toggles the editor for the greet it belongs
   * to, and switching to a different greet with unsaved edits asks first.
   */
  function requestEdit(greet: RoleGreet) {
    if (editingGreetId === greet.id) {
      requestStopEditing();
      return;
    }

    if (hasUnsavedChanges()) {
      pendingEditAction = { type: "switch", greet };
      return;
    }

    startEditing(greet);
  }

  /**
   * Closes the editor, asking about unsaved edits first. Used by the pencil
   * toggle, the Cancel button and clicks outside the greet being edited.
   */
  function requestStopEditing() {
    if (hasUnsavedChanges()) {
      pendingEditAction = { type: "close" };
      return;
    }

    editingGreetId = null;
  }

  /**
   * Resolves the unsaved-changes prompt, then carries out whatever the user was
   * trying to do when it interrupted them.
   */
  async function resolveUnsavedChanges(choice: "save" | "discard" | "cancel") {
    const action = pendingEditAction;
    if (!action || choice === "cancel") {
      pendingEditAction = null;
      return;
    }

    pendingEditAction = null;

    if (choice === "save") {
      const greet = roleGreets.find(g => g.id === editingGreetId);
      if (greet && !await saveGreetChanges(greet)) return;
    }

    if (action.type === "switch") {
      startEditing(roleGreets.find(g => g.id === action.greet.id) ?? action.greet);
      return;
    }

    editingGreetId = null;
  }

    function getRoleName(roleId: bigint | string): string {
      const id = typeof roleId === "bigint" ? roleId.toString() : roleId;
      const role = guildRoles.find(r => r.id === id);
      return role ? role.name : `Role ID: ${id}`;
  }

    function getChannelName(channelId: bigint | string): string {
      const id = typeof channelId === "bigint" ? channelId.toString() : channelId;
      const channel = guildChannels.find(c => c.id === id);
      return channel ? channel.name : `Channel ID: ${id}`;
  }

  function handleRoleChange(detail: any) {
    selectedRoleId = detail.selected;
  }

  function handleChannelChange(detail: any) {
    selectedChannelId = detail.selected;
  }

  onMount(() => {
    if (!$currentGuild) goto("/dashboard");
    Promise.all([
      fetchRoleGreets(),
      fetchGuildRoles(),
      fetchGuildChannels()
    ]);
  });

  $effect(() => {
        if ($currentGuild) {
            fetchRoleGreets();
            fetchGuildRoles();
            fetchGuildChannels();
        }
    });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="mb-6">
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-envelope"
  statusMessages={statusMessages}
  subtitle="Configure greeting messages when users receive specific roles"
  title="Role Greets"
>

      <!-- Add Role Greet Form -->
      <div class="mb-8 p-4 rounded-xl" style="background: {$colorStore.primary}10;">
        <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text}">Add New Role Greet</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Role Selection -->
          <div>
            <span class="block text-sm mb-2" id="role-to-greet-for-label" style="color: {$colorStore.muted}">
              Role to Greet For
            </span>
            <DiscordSelector
              onchange={handleRoleChange}
              options={guildRoles}
              placeholder="Select a Role"
              selected={selectedRoleId}
              type="role" />
          </div>

          <!-- Channel Selection -->
          <div>
            <span class="block text-sm mb-2" id="send-greet-to-channel-label" style="color: {$colorStore.muted}">
              Send Greet To Channel
            </span>
            <DiscordSelector
              onchange={handleChannelChange}
              options={guildChannels}
              placeholder="Select a Channel"
              selected={selectedChannelId}
              type="channel" />
          </div>
        </div>

        <button
          class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
          disabled={!selectedRoleId || !selectedChannelId}
          onclick={addRoleGreet}
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary}; opacity: {!selectedRoleId || !selectedChannelId ? '0.5' : '1'};"
        >
          <i class="fa-solid fa-plus" style="font-size: 18px;"></i>
          <span>Add Role Greet</span>
        </button>
      </div>

      <!-- Role Greets List -->
      {#if loading}
        <div class="flex justify-center items-center min-h-[200px]">
          <div
            class="w-12 h-12 border-4 rounded-full animate-spin"
            style="border-color: {$colorStore.primary}20;
                   border-top-color: {$colorStore.primary};"
            aria-label="Loading"
          >
          </div>
        </div>
      {:else if error}
        <div
          class="rounded-xl p-4 flex items-center gap-3"
          style="background: {$colorStore.accent}10;"
          role="alert"
        >
          <i class="fa-utility-duo fa-regular fa-bell"
             style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"
             aria-hidden="true"></i>
          <p style="color: {$colorStore.accent}">{error}</p>
        </div>
      {:else if roleGreets.length === 0}
        <div
          class="text-center py-12"
          transition:fade
        >
          <i class="fa-utility-duo fa-regular fa-envelope"
             style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; display: block; margin: 0 auto 16px;"
             aria-hidden="true"></i>
          <p style="color: {$colorStore.muted}">No role greets configured</p>
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">Create a role greet to welcome users when they get
            a specific role</p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each roleGreets as greet}
            <div
              use:trackEditingCard={editingGreetId === greet.id}
              class="rounded-xl p-4 transition-all duration-200 border"
              class:opacity-50={greet.disabled}
              style="background: {$colorStore.primary}10;
                     border-color: {greet.disabled ? $colorStore.primary + '10' : $colorStore.primary + '30'};"
            >
              <!-- Header with role name and status -->
              <div class="flex justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="px-2 py-1 rounded-md text-sm font-medium"
                       style="background: {$colorStore.primary}20; color: {$colorStore.text};">
                    {getRoleName(greet.roleId)}
                  </div>
                  <div class="px-2 py-1 rounded-md text-sm"
                       style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
                    #{getChannelName(greet.channelId)}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    style="background: {editingGreetId === greet.id ? $colorStore.primary + '40' : $colorStore.primary + '20'};
                           color: {$colorStore.text};"
                    onclick={() => requestEdit(greet)}
                    data-greet-edit
                    aria-label={editingGreetId === greet.id ? "Close editor" : "Edit"}
                    aria-pressed={editingGreetId === greet.id}
                    title={editingGreetId === greet.id ? "Close editor" : "Edit"}
                  >
                    <i class="fa-solid {editingGreetId === greet.id ? 'fa-xmark' : 'fa-pen'}" style="font-size: 16px;"></i>
                  </button>

                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    style="background: {greet.disabled ? $colorStore.primary + '20' : $colorStore.accent + '20'};
                           color: {greet.disabled ? $colorStore.primary : $colorStore.accent};"
                    onclick={() => toggleRoleGreetDisabled(greet.id, !greet.disabled)}
                    aria-label={greet.disabled ? "Enable" : "Disable"}
                    title={greet.disabled ? "Enable" : "Disable"}
                  >
                    <i class="fa-solid fa-power-off" style="font-size: 16px;"></i>
                  </button>

                  {#if pendingDeleteId === greet.id}
                    <button
                      class="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]"
                      style="background: #ef444430; color: #ef4444;"
                      onclick={() => deleteRoleGreet(greet.id)}
                      title="Confirm delete"
                    >
                      Confirm
                    </button>
                    <button
                      class="px-3 py-2 rounded-lg text-sm transition-all duration-200 min-h-[44px]"
                      style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                      onclick={() => (pendingDeleteId = null)}
                      title="Cancel delete"
                    >
                      Cancel
                    </button>
                  {:else}
                    <button
                      class="p-2 rounded-lg transition-all duration-200"
                      style="background: #ef444420; color: #ef4444;"
                      onclick={() => (pendingDeleteId = greet.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
                    </button>
                  {/if}
                </div>
              </div>

              <!-- Greet Content -->
              {#if editingGreetId === greet.id}
                <!-- Edit Mode -->
                <div class="space-y-4">
                  <!-- Message -->
                  <div>
                    <label for="f-+page-greeting-message-403" class="block text-sm font-medium mb-3" style="color: {$colorStore.text}">
                      <i class="fa-solid fa-comment" style="font-size: 14px;"></i>
                      Greeting Message
                    </label>

                    <FullscreenEmbedBuilder id="f-+page-greeting-message-403"
                      bind:value={editGreetMessage}
                      previewTitle="Role Greeting Message"
                      previewDescription="Message sent when users receive this role"
                      icon="fa-envelope"
                      allowContent={true}
                      allowMultipleEmbeds={true}
                      maxEmbeds={10}
                      allowComponents={true}
                      additionalPlaceholders={[
                        { category: "User", name: "%user.username%", description: "User's username" },
                        { category: "User", name: "%user.mention%", description: "Mention the user" },
                        { category: "Server", name: "%server.name%", description: "Server name" },
                        { category: "Role", name: "%role.name%", description: "Role name" }
                      ]}
                      guildId={$currentGuild?.id}
                      user={data.user}
                      placeholder="Click to configure role greeting message"
                    />
                  </div>

                  <!-- Delete Time -->
                  <div>
                    <label for="greet-delete-time" class="block text-sm mb-2" style="color: {$colorStore.muted}">
                      Delete Time (seconds, 0 for never)
                    </label>
                    <input
                      id="greet-delete-time"
                      type="number"
                      bind:value={editGreetDeleteTime}
                      class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                      style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      min="0"
                    >
                  </div>

                  <!-- Webhook URL -->
                  <div>
                    <label for="greet-webhook" class="block text-sm mb-2" style="color: {$colorStore.muted}">
                      Webhook URL (optional)
                    </label>
                    <input
                      id="greet-webhook"
                      type="text"
                      bind:value={editGreetWebhook}
                      class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                      style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      placeholder="https://discord.com/api/webhooks/..."
                    >
                  </div>

                  <!-- Greet Bots -->
                  <div class="flex items-center justify-between p-3 rounded-lg"
                       style="background: {$colorStore.primary}15;">
                    <div>
                      <span class="font-medium" style="color: {$colorStore.text}">Greet Bots</span>
                      <p class="text-sm" style="color: {$colorStore.muted}">Should bot accounts receive this
                        greeting?</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        bind:checked={editGreetBots}
                        class="sr-only peer"
                      >
                      <span
                        class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all block"
                        style="background-color: {$colorStore.accent}30;
                               peer-checked:background-color: {$colorStore.accent};"
                      ></span>
                    </label>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex justify-end gap-2 mt-4">
                    <button
                      class="px-4 py-2 rounded-lg transition-all duration-200"
                      onclick={requestStopEditing}
                      style="background: {$colorStore.accent}30;
                             color: {$colorStore.text};"
                    >
                      Cancel
                    </button>

                    <button
                      class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                      onclick={() => saveGreetChanges(greet)}
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                    >
                      <i class="fa-solid fa-floppy-disk" style="font-size: 14px;"></i>
                      Save Changes
                    </button>
                  </div>
                </div>
              {:else}
                <!-- View Mode -->
                <div class="space-y-3">
                  <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                    <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.muted}">Message</h4>
                    {#if greet.message}
                      {@const preview = parseStoredMessage(greet.message)}
                      <PreviewCard
                        content={preview.content}
                        embeds={preview.embeds}
                        componentRows={preview.componentRows}
                        user={data.user}
                        guildId={$currentGuild?.id}
                        showEmpty={false}
                      />
                    {:else}
                      <p style="color: {$colorStore.text}">No message set</p>
                    {/if}
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="p-3 rounded-lg flex items-center gap-2" style="background: {$colorStore.secondary}15;">
                      <i class="fa-solid fa-clock" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                      <div>
                        <div class="text-sm font-medium" style="color: {$colorStore.muted}">Delete After</div>
                        <div style="color: {$colorStore.text}">
                          {greet.deleteTime > 0 ? `${greet.deleteTime} seconds` : 'Never'}
                        </div>
                      </div>
                    </div>

                    <div class="p-3 rounded-lg flex items-center gap-2" style="background: {$colorStore.secondary}15;">
                      <i class="fa-solid fa-robot" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                      <div>
                        <div class="text-sm font-medium" style="color: {$colorStore.muted}">Greet Bots</div>
                        <div style="color: {$colorStore.text}">{greet.greetBots ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>

                  {#if greet.webhookUrl}
                    <div class="p-3 rounded-lg flex items-center gap-2" style="background: {$colorStore.accent}15;">
                      <i class="fa-solid fa-globe" style="color: {$colorStore.accent}; font-size: 16px;"></i>
                      <div>
                        <h4 class="text-sm font-medium" style="color: {$colorStore.muted}">Using Webhook</h4>
                        <p class="text-sm truncate" style="color: {$colorStore.text}">{greet.webhookUrl}</p>
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
</DashboardPageLayout>

{#if pendingEditAction}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background: rgba(0, 0, 0, 0.6);"
    transition:fade={{ duration: 120 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="unsaved-changes-title"
  >
    <div
      class="w-full max-w-md rounded-xl p-5 border"
      style="background: {$colorStore.primary}15; border-color: {$colorStore.primary}30; backdrop-filter: blur(12px);"
    >
      <h3 id="unsaved-changes-title" class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">
        Unsaved changes
      </h3>
      <p class="text-sm mb-5" style="color: {$colorStore.muted}">
        {pendingEditAction.type === "switch"
          ? "You have unsaved changes to this greet. Save them before editing the other one?"
          : "You have unsaved changes to this greet. Save them before closing?"}
      </p>

      <div class="flex flex-wrap justify-end gap-2">
        <button
          class="px-4 py-2 rounded-lg transition-all duration-200 min-h-[44px]"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
          onclick={() => resolveUnsavedChanges("cancel")}
        >
          Keep editing
        </button>
        <button
          class="px-4 py-2 rounded-lg transition-all duration-200 min-h-[44px]"
          style="background: #ef444420; color: #ef4444;"
          onclick={() => resolveUnsavedChanges("discard")}
        >
          Discard
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all duration-200 min-h-[44px]"
          style="background: {$colorStore.primary}30; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}40;"
          onclick={() => resolveUnsavedChanges("save")}
        >
          Save changes
        </button>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
    /* Improve touchable area on mobile */
    @media (max-width: 768px) {
        button, input[type="checkbox"] {
            min-height: 44px;
            min-width: 44px;
        }
    }
</style>