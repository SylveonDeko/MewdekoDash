<!-- routes/dashboard/multigreets/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import type { MultiGreet } from "$lib/types/models.ts";
  import { MultiGreetType } from "$lib/types/models.ts";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { browser } from "$app/environment";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts"; // Import the global colorStore
  import {
    AlertTriangle,
    Bot,
    Check,
    ChevronDown,
    Clock,
    Edit2,
    MessageCircle,
    Plus,
    Settings,
    Trash2,
    Users,
    Webhook,
    X
  } from "lucide-svelte";
  import { logger } from "$lib/logger.ts";

  export let data: PageData;
  let channels: Array<{ id: string; name: string }> = [];

  let greets: MultiGreet[] = [];
  let loading = true;
  let error: string | null = null;
  let showNotification = false;
  let notificationMessage = "";
  let notificationType: "success" | "error" = "success";
  let selectedChannel: string | null = null;
  let editMessage: { id: number; message: string } | null = null;
  let editDeleteTime: { id: number; time: string } | null = null;
  let editWebhook: { id: number; name: string; avatarUrl: string } | null = null;
  let greetType: MultiGreetType = MultiGreetType.MultiGreet;
  let isMobile = false;

  $: sortedGreets = [...greets].sort((a, b) => a.id - b.id);

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  function showNotificationMessage(
    message: string,
    type: "success" | "error" = "success"
  ) {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function fetchGreets() {
    try {
      loading = true;
      error = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      const guildId = BigInt($currentGuild.id);
      greets = await api.getMultiGreets(guildId);
      greetType = await api.getMultiGreetType(guildId);
    } catch (err) {
      logger.error("Failed to fetch greets:", err);
      error = err instanceof Error ? err.message : "Failed to fetch greets";
    } finally {
      loading = false;
    }
  }

  async function fetchChannels() {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      channels = await api.getGuildTextChannels(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to fetch channels:", err);
      error = err instanceof Error ? err.message : "Failed to fetch channels";
    }
  }

  async function addGreet() {
    try {
      if (!$currentGuild?.id || !selectedChannel) {
        throw new Error("No guild or channel selected");
      }
      await api.addMultiGreet(BigInt($currentGuild.id), BigInt(selectedChannel));
      showNotificationMessage("Greet added successfully");
      await fetchGreets();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to add greet",
        "error"
      );
    }
  }

  async function removeGreet(id: number) {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      await api.removeMultiGreet(BigInt($currentGuild.id), id);
      showNotificationMessage("Greet removed successfully");
      await fetchGreets();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to remove greet",
        "error"
      );
    }
  }

  async function updateMessage(id: number, message: string) {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      await api.updateMultiGreetMessage(BigInt($currentGuild.id), id, message);
      showNotificationMessage("Message updated successfully");
      editMessage = null;
      await fetchGreets();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update message",
        "error"
      );
    }
  }

  async function updateDeleteTime(id: number, time: string) {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      await api.updateMultiGreetDeleteTime(BigInt($currentGuild.id), id, time);
      showNotificationMessage("Delete time updated successfully");
      editDeleteTime = null;
      await fetchGreets();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update delete time",
        "error"
      );
    }
  }

  async function updateGreetBots(id: number, enabled: boolean) {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      await api.updateMultiGreetGreetBots(BigInt($currentGuild.id), id, enabled);
      showNotificationMessage("Greet bots setting updated successfully");
      await fetchGreets();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update greet bots",
        "error"
      );
    }
  }

  async function updateWebhook(id: number) {
    try {
      if (!$currentGuild?.id || !editWebhook) {
        throw new Error("No guild selected or webhook data missing");
      }
      await api.updateMultiGreetWebhook(BigInt($currentGuild.id), id, {
        name: editWebhook.name,
        avatarUrl: editWebhook.avatarUrl,
      });
      showNotificationMessage("Webhook updated successfully");
      editWebhook = null;
      await fetchGreets();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update webhook",
        "error"
      );
    }
  }

  async function updateDisabled(id: number, disabled: boolean) {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      await api.updateMultiGreetDisabled(BigInt($currentGuild.id), id, disabled);
      showNotificationMessage("Greet status updated successfully");
      await fetchGreets();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update status",
        "error"
      );
    }
  }

  async function updateGreetType(type: MultiGreetType) {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      await api.setMultiGreetType(BigInt($currentGuild.id), type);
      greetType = type;
      showNotificationMessage("Greet type updated successfully");
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update greet type",
        "error"
      );
    }
  }

  $: if ($currentGuild) {
    fetchGreets();
    fetchChannels();
    // Extract colors from server icon if available, otherwise use bot avatar as fallback
    if ($currentGuild.icon) {
      const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(serverIconUrl);
    } else if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
    }
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    await Promise.all([fetchGreets(), fetchChannels()]);
    checkMobile();
    if (browser) window.addEventListener("resize", checkMobile);
  });

  onDestroy(() => {
    if (browser) window.removeEventListener("resize", checkMobile);
  });
</script>

<DashboardPageLayout 
  title="MultiGreets Configuration" 
  subtitle="Configure multiple greeting messages for your server" 
  icon={MessageCircle}
  guildName={$currentGuild?.name || "Dashboard"}
  actionButtons={[
    {
      label: "Add Greet",
      icon: Plus,
      action: addGreet,
      disabled: !selectedChannel,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text}; box-shadow: 0 0 20px ${$colorStore.primary}20;`
    }
  ]}
>
  <svelte:fragment slot="status-messages">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  </svelte:fragment>

    <!-- Greet Type Section -->
    <section
      class="mb-8 rounded-xl border p-6"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      transition:fade
    >
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
        <Settings class="h-5 w-5" style="color: {$colorStore.primary}" />
        Greet Type Configuration
      </h2>
      <div class="flex flex-col sm:flex-row gap-3">
        {#each [
          { type: MultiGreetType.MultiGreet, label: "All Greets", icon: "🔄", desc: "Send all configured greets" },
          { type: MultiGreetType.RandomGreet, label: "Random Greet", icon: "🎲", desc: "Send one random greet" },
          { type: MultiGreetType.Off, label: "Disabled", icon: "⭕", desc: "Disable all greets" }
        ] as option}
          <button
            class="flex-1 px-4 py-3 rounded-lg transition-all duration-200"
            class:ring-2={greetType === option.type}
            class:ring-offset-1={greetType === option.type}
            style="background: {greetType === option.type ? $colorStore.primary : `${$colorStore.primary}20`};
                   color: {greetType === option.type ? $colorStore.text : $colorStore.muted};
                   ring-color: {`${$colorStore.primary}50`};
                   ring-offset-color: #1a1b1e;"
            on:click={() => updateGreetType(option.type)}
          >
            <div class="flex flex-col items-center gap-1">
              <span class="text-xl mb-1">{option.icon}</span>
              <span class="font-medium">{option.label}</span>
              <span class="text-xs opacity-75">{option.desc}</span>
            </div>
          </button>
        {/each}
      </div>
    </section>

    {#if loading}
      <div class="flex justify-center items-center min-h-[400px]">
        <div class="relative">
          <div
            class="w-16 h-16 border-4 rounded-full animate-spin"
            style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"
          ></div>
          <span class="mt-4 block text-center" style="color: {$colorStore.muted}">Loading configurations...</span>
        </div>
      </div>
    {:else if error}
      <div
        class="p-6 rounded-xl mb-6"
        style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;"
        role="alert"
      >
        <div class="flex items-center gap-3">
          <AlertTriangle class="w-6 h-6" style="color: {$colorStore.accent}" />
          <div style="color: {$colorStore.accent}">
            <div class="font-semibold text-lg">Error Occurred</div>
            <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Add New Greet Section -->
      <section
        class="mb-8 rounded-xl border p-6"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
      >
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
          <Plus class="h-5 w-5" style="color: {$colorStore.primary}" />
          Add New Greet
        </h2>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-grow">
            <DiscordSelector
              type="channel"
              options={channels}
              selected={selectedChannel}
              placeholder="Select a channel"
              on:change={(e) => {
                selectedChannel = e.detail.selected;
              }}
            />
          </div>
        </div>
      </section>

      <!-- Greets List -->
      {#if !greets.length}
        <div
          class="text-center p-8 rounded-xl border"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                 border-color: {$colorStore.primary}30;"
          transition:fade
        >
          <MessageCircle
            class="h-16 w-16 mx-auto mb-4"
            style="color: {$colorStore.muted}"
          />
          <p class="text-lg font-medium" style="color: {$colorStore.text}">No Greets Configured</p>
          <p class="text-sm mt-2" style="color: {$colorStore.muted}">
            Add your first greet message using the form above.
          </p>
        </div>
      {:else}
        <div class="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {#each sortedGreets as greet (greet.id)}
            <div
              class="rounded-xl border shadow-lg overflow-hidden transition-all duration-200"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                     border-color: {$colorStore.primary}30;"
              transition:fade
            >
              <!-- Card Header -->
              <div
                class="p-4 border-b"
                style="background: linear-gradient(to bottom, {$colorStore.gradientStart}20, {$colorStore.gradientMid}20);
                       border-color: {$colorStore.primary}30;"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-medium flex items-center gap-2">
                      <MessageCircle class="w-4 h-4" style="color: {$colorStore.primary}" />
                      <span class="truncate max-w-[180px]">#{greet.channelId}</span>
                      <span class="text-sm" style="color: {$colorStore.muted}">#{greet.id}</span>
                    </h3>
                  </div>
                  <button
                    class="p-2 rounded-lg transition-all duration-200 hover:bg-red-500/10"
                    style="color: {$colorStore.muted}"
                    on:click={() => removeGreet(greet.id)}
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- Card Content -->
              <div class="p-4 space-y-6">
                <!-- Message Section -->
                <div class="space-y-3">
                  {#if editMessage?.id === greet.id}
                    <div class="space-y-3">
                      <label for="edit-greeting-message-{greet.id}" class="sr-only">Edit Greeting Message</label>
                      <textarea
                        id="edit-greeting-message-{greet.id}"
                        bind:value={editMessage.message}
                        class="w-full min-h-[120px] p-3 rounded-lg border resize-none focus:ring-2"
                        style="background: {$colorStore.primary}10;
                               border-color: {$colorStore.primary}30;
                               color: {$colorStore.text}"
                        placeholder="Enter greeting message..."
                        aria-label="Edit greeting message for greet {greet.id}"
                      />
                      <div class="flex gap-2">
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                          style="background: {$colorStore.primary}; color: {$colorStore.text}"
                          on:click={() => updateMessage(greet.id, editMessage.message)}
                        >
                          <Check class="w-4 h-4" />
                          Save
                        </button>
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
                          on:click={() => editMessage = null}
                        >
                          <X class="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  {:else}
                    <div class="flex justify-between items-start gap-4">
                      <div class="flex-grow">
                        <h4 class="text-sm font-medium mb-2 flex items-center gap-2"
                            style="color: {$colorStore.text}">
                          <MessageCircle class="w-4 h-4" style="color: {$colorStore.primary}" />
                          Message
                        </h4>
                        <div
                          class="text-sm break-words p-3 rounded-lg"
                          style="background: {$colorStore.primary}10;"
                        >
                          {#if greet.message}
                            <p class="whitespace-pre-wrap" style="color: {$colorStore.text}">{greet.message}</p>
                          {:else}
                            <p style="color: {$colorStore.muted}">No message set</p>
                          {/if}
                        </div>
                      </div>
                      <button
                        class="p-2 rounded-lg transition-all duration-200"
                        style="background: {$colorStore.primary}10;
                               color: {$colorStore.muted}"
                        on:click={() => editMessage = { id: greet.id, message: greet.message ?? "" }}
                      >
                        <Edit2 class="w-4 h-4" />
                      </button>
                    </div>
                  {/if}
                </div>

                <!-- Delete Time Section -->
                <div class="space-y-3">
                  {#if editDeleteTime?.id === greet.id}
                    <div class="space-y-3">
                      <div class="relative">
                        <input
                          type="text"
                          bind:value={editDeleteTime.time}
                          placeholder="e.g. 1m30s"
                          class="w-full p-3 rounded-lg border focus:ring-2"
                          style="background: {$colorStore.primary}10;
                                 border-color: {$colorStore.primary}30;
                                 color: {$colorStore.text}"
                        />
                        <Clock
                          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                          style="color: {$colorStore.muted}"
                        />
                      </div>
                      <div class="flex gap-2">
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
                          style="background: {$colorStore.primary}; color: {$colorStore.text}"
                          on:click={() => updateDeleteTime(greet.id, editDeleteTime.time)}
                        >
                          <Check class="w-4 h-4" />
                          Save
                        </button>
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
                          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
                          on:click={() => editDeleteTime = null}
                        >
                          <X class="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  {:else}
                    <div class="flex justify-between items-center">
                      <div>
                        <h4 class="text-sm font-medium flex items-center gap-2"
                            style="color: {$colorStore.text}">
                          <Clock class="w-4 h-4" style="color: {$colorStore.secondary}" />
                          Delete After
                        </h4>
                        <p class="text-sm mt-1">
                          {#if greet.deleteTime}
                            <span class="px-2 py-1 rounded"
                                  style="background: {$colorStore.secondary}10;
                                         color: {$colorStore.secondary}">
                              {greet.deleteTime}s
                            </span>
                          {:else}
                            <span style="color: {$colorStore.muted}">Never</span>
                          {/if}
                        </p>
                      </div>
                      <button
                        class="p-2 rounded-lg transition-all duration-200"
                        style="background: {$colorStore.primary}10;
                               color: {$colorStore.muted}"
                        on:click={() => editDeleteTime = { id: greet.id, time: String(greet.deleteTime || "") }}
                      >
                        <Edit2 class="w-4 h-4" />
                      </button>
                    </div>
                  {/if}
                </div>

                <!-- Webhook Configuration -->
                <div class="space-y-3">
                  {#if editWebhook?.id === greet.id}
                    <div class="space-y-3">
                      <div class="space-y-2">
                        <div class="relative">
                          <input
                            type="text"
                            bind:value={editWebhook.name}
                            placeholder="Webhook Name"
                            class="w-full p-3 pl-9 rounded-lg border focus:ring-2"
                            style="background: {$colorStore.primary}10;
                                   border-color: {$colorStore.primary}30;
                                   color: {$colorStore.text}"
                          />
                          <Bot
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                            style="color: {$colorStore.muted}"
                          />
                        </div>
                        <div class="relative">
                          <input
                            type="text"
                            bind:value={editWebhook.avatarUrl}
                            placeholder="Avatar URL (optional)"
                            class="w-full p-3 pl-9 rounded-lg border focus:ring-2"
                            style="background: {$colorStore.primary}10;
                                   border-color: {$colorStore.primary}30;
                                   color: {$colorStore.text}"
                          />
                          <Users
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                            style="color: {$colorStore.muted}"
                          />
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
                          style="background: {$colorStore.primary}; color: {$colorStore.text}"
                          on:click={() => updateWebhook(greet.id)}
                        >
                          <Check class="w-4 h-4" />
                          Save
                        </button>
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
                          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
                          on:click={() => editWebhook = null}
                        >
                          <X class="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  {:else}
                    <div class="flex justify-between items-center">
                      <div>
                        <h4 class="text-sm font-medium flex items-center gap-2"
                            style="color: {$colorStore.text}">
                          <Webhook class="w-4 h-4" style="color: {$colorStore.accent}" />
                          Webhook
                        </h4>
                        <p class="text-sm mt-1">
                          {#if greet.webhookUrl}
                            <span class="px-2 py-1 rounded"
                                  style="background: {$colorStore.accent}10;
                                         color: {$colorStore.accent}">
                              Configured
                            </span>
                          {:else}
                            <span style="color: {$colorStore.muted}">Not configured</span>
                          {/if}
                        </p>
                      </div>
                      <button
                        class="p-2 rounded-lg transition-all duration-200"
                        style="background: {$colorStore.primary}10;
                               color: {$colorStore.muted}"
                        on:click={() => editWebhook = {
                          id: greet.id,
                          name: "",
                          avatarUrl: ""
                        }}
                      >
                        <Edit2 class="w-4 h-4" />
                      </button>
                    </div>
                  {/if}
                </div>

                <!-- Toggle Controls -->
                <div class="flex flex-wrap gap-4 pt-4 border-t"
                     style="border-color: {$colorStore.primary}20">
                  <label class="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      class="sr-only peer"
                      checked={greet.greetBots}
                      on:change={(e) => updateGreetBots(greet.id, e.currentTarget.checked)}
                    />
                    <div class="w-11 h-6 rounded-full peer-focus:ring-2 after:content-['']
                              after:absolute after:top-[2px] after:left-[2px] after:bg-white
                              after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                         style="background: {greet.greetBots ? $colorStore.primary : `${$colorStore.primary}20`};
                                ring-color: {$colorStore.primary}50">
                    </div>
                    <span class="ml-3 text-sm font-medium transition-colors duration-200"
                          style="color: {$colorStore.text}">
                      Greet Bots
                    </span>
                  </label>

                  <label class="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      class="sr-only peer"
                      checked={!greet.disabled}
                      on:change={(e) => updateDisabled(greet.id, !e.currentTarget.checked)}
                    />
                    <div class="w-11 h-6 rounded-full peer-focus:ring-2 after:content-['']
                              after:absolute after:top-[2px] after:left-[2px] after:bg-white
                              after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                         style="background: {!greet.disabled ? $colorStore.primary : `${$colorStore.primary}20`};
                                ring-color: {$colorStore.primary}50">
                    </div>
                    <span class="ml-3 text-sm font-medium transition-colors duration-200"
                          style="color: {$colorStore.text}">
                      Enabled
                    </span>
                  </label>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
</DashboardPageLayout>

<style lang="postcss">
    :global(body) {
        background-color: #1a202c;
        color: #ffffff;
    }

    :global(input[type="checkbox"]) {
        color-scheme: dark;
    }

    /* Prevent iOS styling */
    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }

    /* Prevent blue highlight on iOS */
    select:focus {
        -webkit-tap-highlight-color: transparent;
    }

    /* Custom styling for options */
    option {
        background-color: #374151;
        color: white;
        padding: 0.5rem;
    }

    /* Add smooth transitions for color changes */
    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-300;
    }

    /* Add container queries for better responsive behavior */
    @container (max-width: 640px) {
        .music-controls {
            @apply flex-col items-stretch;
        }
    }

    /* Add better card spacing for mobile */
    @media (max-width: 640px) {
        :global(.card-grid) {
            @apply gap-4;
        }

        :global(.card) {
            @apply p-4;
        }
    }

    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary) 10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary) 30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary) 50;
    }
</style>