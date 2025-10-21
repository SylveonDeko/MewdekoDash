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

  async function updateRoleGreetMessage(greetId: number, message: any) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      const messageToSend = typeof message === "string" ? message : (Object.keys(message).length > 0 ? JSON.stringify(message) : "");
      await roleGreetApi.updateRoleGreetMessage($currentGuild.id, greetId, messageToSend);
      showNotificationMessage("Message updated successfully", "success");
      editingGreetId = null;
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to update message:", err);
      showNotificationMessage("Failed to update message", "error");
    }
  }

  async function updateRoleGreetDeleteTime(greetId: number, seconds: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      await roleGreetApi.updateRoleGreetDeleteTime($currentGuild.id, greetId, seconds);
      showNotificationMessage("Delete time updated successfully", "success");
      editingGreetId = null;
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to update delete time:", err);
      showNotificationMessage("Failed to update delete time", "error");
    }
  }

  async function updateRoleGreetWebhook(greetId: number, webhookUrl: string | null) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      await roleGreetApi.updateRoleGreetWebhook($currentGuild.id, greetId, webhookUrl);
      showNotificationMessage("Webhook updated successfully", "success");
      editingGreetId = null;
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to update webhook:", err);
      showNotificationMessage("Failed to update webhook", "error");
    }
  }

  async function updateRoleGreetBots(greetId: number, enabled: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");

      await roleGreetApi.updateRoleGreetBots($currentGuild.id, greetId, enabled);
      showNotificationMessage("Bot greeting setting updated", "success");
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to update bot greeting setting:", err);
      showNotificationMessage("Failed to update setting", "error");
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
  }

  function cancelEditing() {
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
                    style="background: {$colorStore.primary}20;
                           color: {$colorStore.text};"
                    onclick={() => startEditing(greet)}
                    aria-label="Edit"
                    title="Edit"
                  >
                    <i class="fa-solid fa-pen" style="font-size: 16px;"></i>
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
                </div>
              </div>

              <!-- Greet Content -->
              {#if editingGreetId === greet.id}
                <!-- Edit Mode -->
                <div class="space-y-4">
                  <!-- Message -->
                  <div>
                    <label class="block text-sm font-medium mb-3" style="color: {$colorStore.text}">
                      <i class="fa-solid fa-comment" style="font-size: 14px;"></i>
                      Greeting Message
                    </label>

                    <FullscreenEmbedBuilder
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
                      onclick={cancelEditing}
                      style="background: {$colorStore.accent}30;
                             color: {$colorStore.text};"
                    >
                      Cancel
                    </button>

                    <button
                      class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                      onclick={() => updateRoleGreetMessage(greet.id, editGreetMessage)}
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                    >
                      Update Message
                    </button>

                    <button
                      class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                      onclick={() => updateRoleGreetDeleteTime(greet.id, editGreetDeleteTime)}
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                    >
                      Update Delete Time
                    </button>

                    <button
                      class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                      onclick={() => updateRoleGreetWebhook(greet.id, editGreetWebhook)}
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                    >
                      Update Webhook
                    </button>

                    <button
                      class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                      onclick={() => updateRoleGreetBots(greet.id, editGreetBots)}
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                    >
                      Update Bot Settings
                    </button>
                  </div>
                </div>
              {:else}
                <!-- View Mode -->
                <div class="space-y-3">
                  <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                    <h4 class="text-sm font-medium mb-1" style="color: {$colorStore.muted}">Message</h4>
                    <p style="color: {$colorStore.text}">{greet.message || 'No message set'}</p>
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

<style lang="postcss">
    /* Improve touchable area on mobile */
    @media (max-width: 768px) {
        button, input[type="checkbox"] {
            min-height: 44px;
            min-width: 44px;
        }
    }
</style>