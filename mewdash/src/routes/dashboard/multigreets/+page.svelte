<!-- routes/dashboard/multigreets/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
  import { clientApi, type MultiGreet, multiGreetApi, MultiGreetType } from "$lib/api/index.ts";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts"; // Import the global colorStore
  import { logger } from "$lib/logger.ts";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import { serializeMessage, toBuilderValue } from "$lib/utils/embedMessage";

  interface Props {
        data: PageData;
    }

    let {data}: Props = $props();
    let channels: Array<{ id: string; name: string }> = $state([]);

    let greets: MultiGreet[] = $state([]);
    let loading = $state(true);
    let error: string | null = $state(null);
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");
    let selectedChannel: string | null = $state(null);
    let editMessage: { id: number; message: string } | null = $state(null);
    let editDeleteTime: { id: number; time: string } | null = $state(null);
    let editWebhook: { id: number; name: string; avatarUrl: string } | null = $state(null);
    let greetType: MultiGreetType = $state(MultiGreetType.MultiGreet);

    let sortedGreets = $derived([...greets].sort((a, b) => a.id - b.id));

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

  function handleChannelChange(detail: any) {
    if (detail.selected && typeof detail.selected === "string") {
      selectedChannel = detail.selected;
    }
  }

  async function fetchGreets() {
    try {
      loading = true;
      error = null;
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      const guildId = BigInt($currentGuild.id);
      const fetchedGreets = await multiGreetApi.getMultiGreets(guildId);

      // Parse messages - convert string to object if JSON
      greets = fetchedGreets.map(greet => {
        let parsedMessage = greet.message;
        try {
          if (typeof greet.message === "string" && greet.message.trim().startsWith("{")) {
            parsedMessage = JSON.parse(greet.message);
          } else if (typeof greet.message === "string" && greet.message) {
            parsedMessage = { content: greet.message };
          } else if (!greet.message) {
            parsedMessage = {};
          }
        } catch {
          parsedMessage = greet.message ? { content: greet.message } : {};
        }

        return {
          ...greet,
          message: parsedMessage
        };
      });

      greetType = await multiGreetApi.getMultiGreetType(guildId);
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
      channels = await clientApi.getTextChannels(BigInt($currentGuild.id));
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
      await multiGreetApi.addMultiGreet(BigInt($currentGuild.id), BigInt(selectedChannel));
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
      await multiGreetApi.removeMultiGreet(BigInt($currentGuild.id), id);
      showNotificationMessage("Greet removed successfully");
      await fetchGreets();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to remove greet",
        "error"
      );
    }
  }

  async function updateMessage(id: number, message: any) {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      const messageToSend = serializeMessage(message);
      await multiGreetApi.updateMultiGreetMessage(BigInt($currentGuild.id), id, messageToSend);
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
      await multiGreetApi.updateMultiGreetDeleteTime(BigInt($currentGuild.id), id, time);
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
      await multiGreetApi.updateMultiGreetGreetBots(BigInt($currentGuild.id), id, enabled);
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
      await multiGreetApi.updateMultiGreetWebhook(BigInt($currentGuild.id), id, {
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
      await multiGreetApi.updateMultiGreetDisabled(BigInt($currentGuild.id), id, disabled);
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
      await multiGreetApi.setMultiGreetType(BigInt($currentGuild.id), type);
      greetType = type;
      showNotificationMessage("Greet type updated successfully");
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update greet type",
        "error"
      );
    }
  }

  $effect(() => {
        if ($currentGuild) {
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
    });

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    await Promise.all([fetchGreets(), fetchChannels()]);
  });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  statusMessages={statusMessages}
  subtitle="Configure multiple greeting messages for your server"
  icon="fa-comment"
  guildName={$currentGuild?.name || "Dashboard"}
  title="MultiGreets Configuration"
  actionButtons={[
    {
      label: "Add Greet",
      icon: "fa-plus",
      action: addGreet,
      disabled: !selectedChannel,
      style: `background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}30;`
    }
  ]}
>

    <!-- Greet Type Section -->
    <section
      class="mb-8 rounded-xl border p-6"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      transition:fade
    >
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
        <i class="fa-utility-duo fa-regular fa-gear h-5 w-5" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
        Greet Type Configuration
      </h2>
      <div class="flex flex-col sm:flex-row gap-3">
        {#each [
          { type: MultiGreetType.MultiGreet, label: "All Greets", icon: "🔄", desc: "Send all configured greets" },
          { type: MultiGreetType.RandomGreet, label: "Random Greet", icon: "🎲", desc: "Send one random greet" },
          { type: MultiGreetType.Off, label: "Disabled", icon: "⭕", desc: "Disable all greets" }
        ] as option}
          <button
            class="flex-1 px-4 py-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1"
            style="background: {greetType === option.type ? $colorStore.primary + '30' : $colorStore.primary + '08'};
                   color: {greetType === option.type ? $colorStore.primary : $colorStore.muted};
                   border: 1px solid {greetType === option.type ? $colorStore.primary + '50' : $colorStore.primary + '20'};"
            onclick={() => updateGreetType(option.type)}
          >
            <span class="text-xl mb-1">{option.icon}</span>
            <span class="font-medium">{option.label}</span>
            <span class="text-xs opacity-75">{option.desc}</span>
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
          <i class="fa-utility-duo fa-regular fa-triangle-exclamation" style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 24px;"></i>
          <div style="color: {$colorStore.accent}">
            <div class="font-semibold text-lg">Error Occurred</div>
            <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Add New Greet Section -->
      <section
        class="mb-8  rounded-xl border p-6 transition-all"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
      >
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
          <i class="fa-utility-duo fa-regular fa-plus h-5 w-5" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          Add New Greet
        </h2>
        <div class="flex flex-col sm:flex-row gap-3">
            <div class="grow">
            <DiscordSelector
              type="channel"
              options={channels}
              selected={selectedChannel}
              placeholder="Select a channel"
              onchange={handleChannelChange}
            />
          </div>
        </div>
      </section>

      <!-- Greets List -->
      {#if !greets.length}
        <div
          class="text-center p-8  rounded-xl border transition-all"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                 border-color: {$colorStore.primary}30;"
          transition:fade
        >
          <i class="fa-utility-duo fa-regular fa-comment" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 64px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
          <p class="text-lg font-medium" style="color: {$colorStore.text}">No Greets Configured</p>
          <p class="text-sm mt-2" style="color: {$colorStore.muted}">
            Add your first greet message using the form above.
          </p>
        </div>
      {:else}
        <div class="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {#each sortedGreets as greet (greet.id)}
            <div
              class=" rounded-xl border shadow-lg overflow-hidden transition-all duration-200"
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
                      <i class="fa-solid fa-comment" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                      <span class="truncate max-w-[180px]">#{greet.channelId}</span>
                      <span class="text-sm" style="color: {$colorStore.muted}">#{greet.id}</span>
                    </h3>
                  </div>
                  <button aria-label="Delete greet"
                    class="p-2 rounded-lg transition-all duration-200 hover:bg-red-500/10"
                    style="color: {$colorStore.muted}"
                    onclick={() => removeGreet(greet.id)}
                  >
                    <i class="fa-solid fa-trash" style="font-size: 20px;"></i>
                  </button>
                </div>
              </div>

              <!-- Card Content -->
              <div class="p-4 space-y-6">
                <!-- Message Section -->
                <div class="space-y-3">
                  <h4 class="text-sm font-medium flex items-center gap-2"
                      style="color: {$colorStore.text}">
                    <i class="fa-solid fa-comment" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                    Greeting Message
                  </h4>

                  <FullscreenEmbedBuilder
                    value={toBuilderValue(greet.message)}
                    previewTitle="Greeting Message #{greet.id}"
                    previewDescription="Message sent when users join"
                    icon="fa-comment"
                    allowContent={true}
                    allowMultipleEmbeds={true}
                    maxEmbeds={10}
                    allowComponents={true}
                    additionalPlaceholders={[
                      { category: "Join", name: "%user%", description: "Username" },
                      { category: "Join", name: "%user.mention%", description: "Mention the user" },
                      { category: "Join", name: "%user.id%", description: "User ID" },
                      { category: "Join", name: "%user.avatar%", description: "User's avatar URL" },
                      { category: "Server", name: "%server%", description: "Server name" },
                      { category: "Server", name: "%server.members%", description: "Member count" }
                    ]}
                    guildId={$currentGuild?.id}
                    user={data.user}
                    placeholder="Click to configure greeting message"
                    onchange={(newValue) => updateMessage(greet.id, newValue)}
                  />
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
                        >
                        <i class="fa-solid fa-clock absolute left-3 top-1/2 transform -translate-y-1/2" style="color: {$colorStore.muted}; font-size: 16px;"></i>
                      </div>
                      <div class="flex gap-2">
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2 min-h-[44px]"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                          onclick={() => editDeleteTime && updateDeleteTime(greet.id, editDeleteTime.time)}
                        >
                          <i class="fa-solid fa-check" style="font-size: 16px;"></i>
                          Save
                        </button>
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
                          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
                          onclick={() => editDeleteTime = null}
                        >
                          <i class="fa-solid fa-xmark" style="font-size: 16px;"></i>
                          Cancel
                        </button>
                      </div>
                    </div>
                  {:else}
                    <div class="flex justify-between items-center">
                      <div>
                        <h4 class="text-sm font-medium flex items-center gap-2"
                            style="color: {$colorStore.text}">
                          <i class="fa-solid fa-clock" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                          Delete After
                        </h4>
                        <p class="text-sm mt-1">
                          {#if greet.deleteTime}
                            <span class="px-2 py-1 rounded-sm"
                                  style="background: {$colorStore.secondary}10;
                                         color: {$colorStore.secondary}">
                              {greet.deleteTime}s
                            </span>
                          {:else}
                            <span style="color: {$colorStore.muted}">Never</span>
                          {/if}
                        </p>
                      </div>
                      <button aria-label="Edit delete time"
                        class="p-2 rounded-lg transition-all duration-200"
                        style="background: {$colorStore.primary}10;
                               color: {$colorStore.muted}"
                        onclick={() => editDeleteTime = { id: greet.id, time: String(greet.deleteTime || "") }}
                      >
                        <i class="fa-solid fa-pen" style="font-size: 16px;"></i>
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
                          >
                          <i class="fa-solid fa-robot absolute left-3 top-1/2 transform -translate-y-1/2" style="color: {$colorStore.muted}; font-size: 16px;"></i>
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
                          >
                          <i class="fa-solid fa-users absolute left-3 top-1/2 transform -translate-y-1/2" style="color: {$colorStore.muted}; font-size: 16px;"></i>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2 min-h-[44px]"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                          onclick={() => updateWebhook(greet.id)}
                        >
                          <i class="fa-solid fa-check" style="font-size: 16px;"></i>
                          Save
                        </button>
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
                          style="background: {$colorStore.primary}20; color: {$colorStore.text}"
                          onclick={() => editWebhook = null}
                        >
                          <i class="fa-solid fa-xmark" style="font-size: 16px;"></i>
                          Cancel
                        </button>
                      </div>
                    </div>
                  {:else}
                    <div class="flex justify-between items-center">
                      <div>
                        <h4 class="text-sm font-medium flex items-center gap-2"
                            style="color: {$colorStore.text}">
                          <i class="fa-solid fa-webhook" style="color: {$colorStore.accent}; font-size: 16px;"></i>
                          Webhook
                        </h4>
                        <p class="text-sm mt-1">
                          {#if greet.webhookUrl}
                            <span class="px-2 py-1 rounded-sm"
                                  style="background: {$colorStore.accent}10;
                                         color: {$colorStore.accent}">
                              Configured
                            </span>
                          {:else}
                            <span style="color: {$colorStore.muted}">Not configured</span>
                          {/if}
                        </p>
                      </div>
                      <button aria-label="Edit webhook"
                        class="p-2 rounded-lg transition-all duration-200"
                        style="background: {$colorStore.primary}10;
                               color: {$colorStore.muted}"
                        onclick={() => editWebhook = {
                          id: greet.id,
                          name: "",
                          avatarUrl: ""
                        }}
                      >
                        <i class="fa-solid fa-pen" style="font-size: 16px;"></i>
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
                      onchange={(e) => updateGreetBots(greet.id, e.currentTarget.checked)}
                    >
                    <span class="w-11 h-6 rounded-full peer-focus:ring-2 after:content-['']
                              after:absolute after:top-[2px] after:left-[2px] after:bg-white
                              after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full block"
                         style="background: {greet.greetBots ? $colorStore.primary : `${$colorStore.primary}20`};
                                ring-color: {$colorStore.primary}50">
                    </span>
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
                      onchange={(e) => updateDisabled(greet.id, !e.currentTarget.checked)}
                    >
                    <span class="w-11 h-6 rounded-full peer-focus:ring-2 after:content-['']
                              after:absolute after:top-[2px] after:left-[2px] after:bg-white
                              after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full block"
                         style="background: {!greet.disabled ? $colorStore.primary : `${$colorStore.primary}20`};
                                ring-color: {$colorStore.primary}50">
                    </span>
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
    @reference '../../../app.css'; :global input[type="checkbox"] {
        color-scheme: dark;
    }

    /* Prevent iOS styling */

    /* Prevent blue highlight on iOS */

    /* Custom styling for options */

    /* Add smooth transitions for color changes */
    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-300;
    }
</style>