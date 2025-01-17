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
  import Notification from "$lib/Notification.svelte";
  import { browser } from "$app/environment";
  import {currentInstance} from "$lib/stores/instanceStore.ts";
  import ColorThief from 'colorthief';
  import {
    MessageCircle, Plus, Check, X, Edit2, Trash2,
    Clock, Bot, Webhook, Settings, ChevronDown, Users, AlertTriangle
  } from 'lucide-svelte';
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

  // Theme and color management
  let colors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    text: '#ffffff',
    muted: '#9ca3af',
    gradientStart: '#3b82f6',
    gradientMid: '#8b5cf6',
    gradientEnd: '#ec4899'
  };

  $: sortedGreets = [...greets].sort((a, b) => a.id - b.id);
  $: colorVars = `
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-text: ${colors.text};
    --color-muted: ${colors.muted};
  `;

  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  function rgbToHex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function adjustLightness(rgb: number[], lightness: number) {
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${lightness}%)`;
  }

  async function extractColors() {
    if (!$currentGuild?.icon) return;
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = $currentInstance?.botAvatar;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const colorThief = new ColorThief();
      const dominantColor = colorThief.getColor(img);
      const palette = colorThief.getPalette(img);

      const primaryHex = rgbToHex(...dominantColor);
      const secondaryHex = rgbToHex(...palette[1]);
      const accentHex = rgbToHex(...palette[2]);

      colors = {
        primary: primaryHex,
        secondary: secondaryHex,
        accent: accentHex,
        text: adjustLightness(dominantColor, 95),
        muted: adjustLightness(dominantColor, 60),
        gradientStart: primaryHex,
        gradientMid: secondaryHex,
        gradientEnd: accentHex
      };
    } catch (err) {
      logger.error('Failed to extract colors:', err);
    }
  }

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
    extractColors();
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

<div
  class="min-h-screen p-4 md:p-6"
  style="{colorVars} background: radial-gradient(circle at top,
    {colors.gradientStart}15 0%,
    {colors.gradientMid}10 50%,
    {colors.gradientEnd}05 100%);"
>
  <div class="max-w-7xl mx-auto space-y-8">
    <h1 class="text-3xl font-bold mb-8" style="color: {colors.text}">MultiGreets Configuration</h1>

    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}

    <!-- Greet Type Section -->
    <section
      class="mb-8 backdrop-blur-sm rounded-xl border p-6"
      style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
             border-color: {colors.primary}30;"
      transition:fade
    >
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" style="color: {colors.text}">
        <Settings class="h-5 w-5" style="color: {colors.primary}" />
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
            style="background: {greetType === option.type ? colors.primary : `${colors.primary}20`};
                   color: {greetType === option.type ? colors.text : colors.muted};
                   ring-color: {`${colors.primary}50`};
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
            style="border-color: {colors.primary}20; border-top-color: {colors.primary}"
          ></div>
          <span class="mt-4 block text-center" style="color: {colors.muted}">Loading configurations...</span>
        </div>
      </div>
    {:else if error}
      <div
        class="p-6 rounded-xl mb-6"
        style="background: {colors.accent}10; border: 1px solid {colors.accent}40;"
        role="alert"
      >
        <div class="flex items-center gap-3">
          <AlertTriangle class="w-6 h-6" style="color: {colors.accent}" />
          <div style="color: {colors.accent}">
            <div class="font-semibold text-lg">Error Occurred</div>
            <div class="text-sm mt-1" style="color: {colors.accent}90">{error}</div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Add New Greet Section -->
      <section
        class="mb-8 backdrop-blur-sm rounded-xl border p-6"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
               border-color: {colors.primary}30;"
      >
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2" style="color: {colors.text}">
          <Plus class="h-5 w-5" style="color: {colors.primary}" />
          Add New Greet
        </h2>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-grow group">
            <select
              bind:value={selectedChannel}
              class="w-full h-12 appearance-none rounded-lg border px-4 py-2 pr-10 text-base
                     focus:outline-none focus:ring-2 transition-all duration-200"
              style="background: {colors.primary}10;
                     border-color: {colors.primary}30;
                     color: {colors.text}"
            >
              <option value="" disabled>Select a channel</option>
              {#each channels as channel}
                <option class="bg-gray-800 text-white py-2" value={channel.id}>
                  {channel.name}
                </option>
              {/each}
            </select>
            <ChevronDown
              class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              style="color: {colors.muted}"
            />
          </div>
          <button
            class="h-12 px-6 rounded-lg font-medium transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style="background: {colors.primary}; color: {colors.text}"
            disabled={!selectedChannel}
            on:click={addGreet}
          >
            <Plus class="h-5 w-5" />
            Add Greet
          </button>
        </div>
      </section>

      <!-- Greets List -->
      {#if !greets.length}
        <div
          class="text-center p-8 backdrop-blur-sm rounded-xl border"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
          transition:fade
        >
          <MessageCircle
            class="h-16 w-16 mx-auto mb-4"
            style="color: {colors.muted}"
          />
          <p class="text-lg font-medium" style="color: {colors.text}">No Greets Configured</p>
          <p class="text-sm mt-2" style="color: {colors.muted}">
            Add your first greet message using the form above.
          </p>
        </div>
      {:else}
        <div class="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {#each sortedGreets as greet (greet.id)}
            <div
              class="backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden transition-all duration-200"
              style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                     border-color: {colors.primary}30;"
              transition:fade
            >
              <!-- Card Header -->
              <div
                class="p-4 border-b"
                style="background: linear-gradient(to bottom, {colors.gradientStart}20, {colors.gradientMid}20);
                       border-color: {colors.primary}30;"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-medium flex items-center gap-2">
                      <MessageCircle class="w-4 h-4" style="color: {colors.primary}" />
                      <span class="truncate max-w-[180px]">#{greet.channelId}</span>
                      <span class="text-sm" style="color: {colors.muted}">#{greet.id}</span>
                    </h3>
                  </div>
                  <button
                    class="p-2 rounded-lg transition-all duration-200 hover:bg-red-500/10"
                    style="color: {colors.muted}"
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
                      <textarea
                        bind:value={editMessage.message}
                        class="w-full min-h-[120px] p-3 rounded-lg border resize-none focus:ring-2"
                        style="background: {colors.primary}10;
                               border-color: {colors.primary}30;
                               color: {colors.text}"
                        placeholder="Enter greeting message..."
                      />
                      <div class="flex gap-2">
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                          style="background: {colors.primary}; color: {colors.text}"
                          on:click={() => updateMessage(greet.id, editMessage.message)}
                        >
                          <Check class="w-4 h-4" />
                          Save
                        </button>
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                          style="background: {colors.primary}20; color: {colors.text}"
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
                            style="color: {colors.text}">
                          <MessageCircle class="w-4 h-4" style="color: {colors.primary}" />
                          Message
                        </h4>
                        <div
                          class="text-sm break-words p-3 rounded-lg"
                          style="background: {colors.primary}10;"
                        >
                          {#if greet.message}
                            <p class="whitespace-pre-wrap" style="color: {colors.text}">{greet.message}</p>
                          {:else}
                            <p style="color: {colors.muted}">No message set</p>
                          {/if}
                        </div>
                      </div>
                      <button
                        class="p-2 rounded-lg transition-all duration-200"
                        style="background: {colors.primary}10;
                               color: {colors.muted}"
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
                          style="background: {colors.primary}10;
                                 border-color: {colors.primary}30;
                                 color: {colors.text}"
                        />
                        <Clock
                          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                          style="color: {colors.muted}"
                        />
                      </div>
                      <div class="flex gap-2">
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
                          style="background: {colors.primary}; color: {colors.text}"
                          on:click={() => updateDeleteTime(greet.id, editDeleteTime.time)}
                        >
                          <Check class="w-4 h-4" />
                          Save
                        </button>
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
                          style="background: {colors.primary}20; color: {colors.text}"
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
                            style="color: {colors.text}">
                          <Clock class="w-4 h-4" style="color: {colors.secondary}" />
                          Delete After
                        </h4>
                        <p class="text-sm mt-1">
                          {#if greet.deleteTime}
                            <span class="px-2 py-1 rounded"
                                  style="background: {colors.secondary}10;
                                         color: {colors.secondary}">
                              {greet.deleteTime}s
                            </span>
                          {:else}
                            <span style="color: {colors.muted}">Never</span>
                          {/if}
                        </p>
                      </div>
                      <button
                        class="p-2 rounded-lg transition-all duration-200"
                        style="background: {colors.primary}10;
                               color: {colors.muted}"
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
                            style="background: {colors.primary}10;
                                   border-color: {colors.primary}30;
                                   color: {colors.text}"
                          />
                          <Bot
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                            style="color: {colors.muted}"
                          />
                        </div>
                        <div class="relative">
                          <input
                            type="text"
                            bind:value={editWebhook.avatarUrl}
                            placeholder="Avatar URL (optional)"
                            class="w-full p-3 pl-9 rounded-lg border focus:ring-2"
                            style="background: {colors.primary}10;
                                   border-color: {colors.primary}30;
                                   color: {colors.text}"
                          />
                          <Users
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                            style="color: {colors.muted}"
                          />
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
                          style="background: {colors.primary}; color: {colors.text}"
                          on:click={() => updateWebhook(greet.id)}
                        >
                          <Check class="w-4 h-4" />
                          Save
                        </button>
                        <button
                          class="flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
                          style="background: {colors.primary}20; color: {colors.text}"
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
                            style="color: {colors.text}">
                          <Webhook class="w-4 h-4" style="color: {colors.accent}" />
                          Webhook
                        </h4>
                        <p class="text-sm mt-1">
                          {#if greet.webhookUrl}
                            <span class="px-2 py-1 rounded"
                                  style="background: {colors.accent}10;
                                         color: {colors.accent}">
                              Configured
                            </span>
                          {:else}
                            <span style="color: {colors.muted}">Not configured</span>
                          {/if}
                          </p>
                      </div>
                      <button
                        class="p-2 rounded-lg transition-all duration-200"
                        style="background: {colors.primary}10;
                               color: {colors.muted}"
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
                     style="border-color: {colors.primary}20">
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
                         style="background: {greet.greetBots ? colors.primary : `${colors.primary}20`};
                                ring-color: {colors.primary}50">
                    </div>
                    <span class="ml-3 text-sm font-medium transition-colors duration-200"
                          style="color: {colors.text}">
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
                         style="background: {!greet.disabled ? colors.primary : `${colors.primary}20`};
                                ring-color: {colors.primary}50">
                    </div>
                    <span class="ml-3 text-sm font-medium transition-colors duration-200"
                          style="color: {colors.text}">
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
  </div>
</div>

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
    background: var(--color-primary)10;
    @apply rounded-full;
  }

  :global(*::-webkit-scrollbar-thumb) {
    background: var(--color-primary)30;
    @apply rounded-full;
  }

  :global(*::-webkit-scrollbar-thumb:hover) {
    background: var(--color-primary)50;
  }
</style>