<!-- routes/dashboard/multigreets/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade, slide } from "svelte/transition";
  import type { MultiGreet, GuildConfig } from "$lib/types/models.ts";
  import { MultiGreetType } from "$lib/types/models.ts";
  import { goto } from "$app/navigation";
  import Notification from "$lib/Notification.svelte";
  import { browser } from "$app/environment";

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
  let editWebhook: { id: number; name: string; avatarUrl: string } | null =
    null;
  let greetType: MultiGreetType = MultiGreetType.MultiGreet;
  let isMobile = false;

  $: sortedGreets = [...greets].sort((a, b) => a.id - b.id);

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  function showNotificationMessage(
    message: string,
    type: "success" | "error" = "success",
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
      console.error("Failed to fetch greets:", err);
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
      console.error("Failed to fetch channels:", err);
      error = err instanceof Error ? err.message : "Failed to fetch channels";
    }
  }

  async function addGreet() {
    try {
      if (!$currentGuild?.id || !selectedChannel) {
        throw new Error("No guild or channel selected");
      }
      await api.addMultiGreet(
        BigInt($currentGuild.id),
        BigInt(selectedChannel),
      );
      showNotificationMessage("Greet added successfully");
      await fetchGreets();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to add greet",
        "error",
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
        "error",
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
        "error",
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
        "error",
      );
    }
  }

  async function updateGreetBots(id: number, enabled: boolean) {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      await api.updateMultiGreetGreetBots(
        BigInt($currentGuild.id),
        id,
        enabled,
      );
      showNotificationMessage("Greet bots setting updated successfully");
      await fetchGreets();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update greet bots",
        "error",
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
        "error",
      );
    }
  }

  async function updateDisabled(id: number, disabled: boolean) {
    try {
      if (!$currentGuild?.id) {
        throw new Error("No guild selected");
      }
      await api.updateMultiGreetDisabled(
        BigInt($currentGuild.id),
        id,
        disabled,
      );
      showNotificationMessage("Greet status updated successfully");
      await fetchGreets();
    } catch (error) {
      showNotificationMessage(
        error instanceof Error ? error.message : "Failed to update status",
        "error",
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
        "error",
      );
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

<svelte:head>
  <title>MultiGreets - Mewdeko Dashboard</title>
</svelte:head>

<div class="container mx-auto px-4 py-6 max-w-7xl min-h-screen">
  <h1 class="text-3xl font-bold mb-8">MultiGreets Configuration</h1>

  {#if showNotification}
    <div class="fixed top-4 right-4 z-50">
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}

  <!-- Greet Type Section -->
  <section
    class="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
    transition:fade
  >
    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
      <svg
        class="h-5 w-5 text-blue-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
        />
        <path
          clip-rule="evenodd"
          d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
          fill-rule="evenodd"
        />
      </svg>
      Greet Type Configuration
    </h2>
    <div class="flex flex-col sm:flex-row gap-3">
      {#each [{ type: MultiGreetType.MultiGreet, label: "All Greets", icon: "🔄", desc: "Send all configured greets" }, { type: MultiGreetType.RandomGreet, label: "Random Greet", icon: "🎲", desc: "Send one random greet" }, { type: MultiGreetType.Off, label: "Disabled", icon: "⭕", desc: "Disable all greets" }] as option}
        <button
          class="flex-1 px-4 py-3 rounded-lg transition-all duration-200
                           {greetType === option.type
            ? 'bg-blue-500 text-white ring-2 ring-blue-400/50 ring-offset-1 ring-offset-gray-800'
            : 'bg-gray-700/50 hover:bg-gray-700 text-gray-200'}"
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
    <div class="flex flex-col items-center justify-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/50 border-t-blue-500"
      ></div>
      <span class="mt-4 text-gray-400">Loading configurations...</span>
    </div>
  {:else if error}
    <div
      class="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-4 rounded-lg mb-6"
      role="alert"
    >
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <div class="font-medium">Error Occurred</div>
          <div class="text-sm mt-1">{error}</div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Add New Greet Section -->
    <section
      class="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
    >
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-green-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
        Add New Greet
      </h2>
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Improved Select Dropdown -->
        <div class="relative flex-grow group">
          <select
            bind:value={selectedChannel}
            class="w-full h-12 appearance-none rounded-lg border border-gray-600/50 bg-gray-700/50
                               px-4 py-2 pr-10 text-base text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200
                               group-hover:border-gray-500/50"
            aria-label="Select channel"
          >
            <option value="" disabled selected>Select a channel</option>
            {#each channels as channel}
              <option class="bg-gray-700 text-white py-2" value={channel.id}
                >{channel.name}</option
              >
            {/each}
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400
                                group-hover:text-gray-300 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <button
          class="h-12 px-6 rounded-lg bg-blue-500 text-white font-medium transition-all duration-200
                           hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                           disabled:hover:bg-blue-500 whitespace-nowrap flex items-center justify-center gap-2
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1
                           focus:ring-offset-gray-800"
          disabled={!selectedChannel}
          on:click={addGreet}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          Add Greet
        </button>
      </div>
    </section>

    <!-- Greets List -->
    {#if !greets.length}
      <div
        class="text-gray-400 text-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl
                        border border-gray-700/50"
        transition:fade
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 mx-auto mb-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p class="text-lg font-medium">No Greets Configured</p>
        <p class="text-sm text-gray-500 mt-2">
          Add your first greet message using the form above.
        </p>
      </div>
    {:else}
      <div class="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {#each sortedGreets as greet (greet.id)}
          <div
            class="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50
                                overflow-hidden hover:border-gray-600/50 transition-all duration-200"
          >
            <!-- Card Header -->
            <div
              class="p-4 bg-gradient-to-b from-gray-700/50 to-gray-800/50 border-b border-gray-700/50"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M9.493 2.853a1 1 0 011.014 0l6 3.5A1 1 0 0117 7.5v5a1 1 0 01-.493.853l-6 3.5a1 1 0 01-1.014 0l-6-3.5A1 1 0 013 12.5v-5a1 1 0 01.493-.853l6-3.5zM10 4.5L5.5 7 10 9.5 14.5 7 10 4.5z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="truncate max-w-[180px]">{greet.channelId}</span
                    >
                    <span class="text-sm text-gray-400 font-normal"
                      >#{greet.id}</span
                    >
                  </h3>
                  <p
                    class="text-sm text-gray-400 mt-0.5 flex items-center gap-1"
                  >
                    <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                    {greet.channelId}
                  </p>
                </div>
                <button
                  class="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10
                                           transition-all duration-200 group"
                  on:click={() => removeGreet(greet.id)}
                  title="Remove greet"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 transform group-hover:scale-110 transition-transform duration-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
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
                      class="w-full min-h-[120px] p-3 rounded-lg border border-gray-600/50
                                                   bg-gray-700/50 text-sm resize-none focus:ring-2
                                                   focus:ring-blue-500/50 focus:border-transparent
                                                   placeholder-gray-500"
                      placeholder="Enter greeting message..."
                      aria-label="Edit greeting message"
                    />
                    <div class="flex gap-2">
                      <button
                        class="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium
                                                       hover:bg-blue-600 transition-colors duration-200
                                                       flex items-center justify-center gap-2"
                        on:click={() =>
                          updateMessage(greet.id, editMessage.message)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        Save
                      </button>
                      <button
                        class="flex-1 py-2 rounded-lg bg-gray-700 text-white text-sm font-medium
                                                       hover:bg-gray-600 transition-colors duration-200
                                                       flex items-center justify-center gap-2"
                        on:click={() => (editMessage = null)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  </div>
                {:else}
                  <div class="flex justify-between items-start gap-4">
                    <div class="flex-grow">
                      <h4
                        class="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        Message
                      </h4>
                      <div
                        class="text-sm break-words bg-gray-700/30 p-3 rounded-lg"
                      >
                        {#if greet.message}
                          <p class="whitespace-pre-wrap">{greet.message}</p>
                        {:else}
                          <p class="text-gray-500 italic">No message set</p>
                        {/if}
                      </div>
                    </div>
                    <button
                      class="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700
                                                   transition-colors duration-200 group"
                      on:click={() =>
                        (editMessage = {
                          id: greet.id,
                          message: greet.message ?? "",
                        })}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 transform group-hover:scale-110 transition-transform duration-200"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                        />
                      </svg>
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
                        class="w-full p-3 rounded-lg border border-gray-600/50 bg-gray-700/50
                                                       text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
                                                       pl-9 placeholder-gray-500"
                        aria-label="Edit delete time"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div class="flex gap-2">
                      <button
                        class="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium
                                                       hover:bg-blue-600 transition-colors duration-200
                                                       flex items-center justify-center gap-2"
                        on:click={() =>
                          updateDeleteTime(greet.id, editDeleteTime.time)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        Save
                      </button>
                      <button
                        class="flex-1 py-2 rounded-lg bg-gray-700 text-white text-sm font-medium
                                                       hover:bg-gray-600 transition-colors duration-200
                                                       flex items-center justify-center gap-2"
                        on:click={() => (editDeleteTime = null)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  </div>
                {:else}
                  <div class="flex justify-between items-center">
                    <div>
                      <h4
                        class="text-sm font-medium text-gray-300 flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-purple-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        Delete After
                      </h4>
                      <p class="text-sm text-gray-400 mt-1">
                        {#if greet.deleteTime}
                          <span
                            class="bg-purple-500/10 text-purple-400 px-2 py-1 rounded"
                          >
                            {greet.deleteTime}s
                          </span>
                        {:else}
                          <span class="text-gray-500 italic">Never</span>
                        {/if}
                      </p>
                    </div>
                    <button
                      class="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700
                                                   transition-colors duration-200 group"
                      on:click={() =>
                        (editDeleteTime = {
                          id: greet.id,
                          time: String(greet.deleteTime || ""),
                        })}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 transform group-hover:scale-110 transition-transform duration-200"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                        />
                      </svg>
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
                          class="w-full p-3 rounded-lg border border-gray-600/50 bg-gray-700/50
                                                           text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
                                                           pl-9 placeholder-gray-500"
                          aria-label="Webhook name"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                      <div class="relative">
                        <input
                          type="text"
                          bind:value={editWebhook.avatarUrl}
                          placeholder="Avatar URL (optional)"
                          class="w-full p-3 rounded-lg border border-gray-600/50 bg-gray-700/50
                                                           text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
                                                           pl-9 placeholder-gray-500"
                          aria-label="Webhook avatar URL"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button
                        class="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium
                                                       hover:bg-blue-600 transition-colors duration-200
                                                       flex items-center justify-center gap-2"
                        on:click={() => updateWebhook(greet.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        Save
                      </button>
                      <button
                        class="flex-1 py-2 rounded-lg bg-gray-700 text-white text-sm font-medium
                                                       hover:bg-gray-600 transition-colors duration-200
                                                       flex items-center justify-center gap-2"
                        on:click={() => (editWebhook = null)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  </div>
                {:else}
                  <div class="flex justify-between items-center">
                    <div>
                      <h4
                        class="text-sm font-medium text-gray-300 flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        Webhook
                      </h4>
                      <p class="text-sm text-gray-400 mt-1">
                        {#if greet.webhookUrl}
                          <span
                            class="bg-green-500/10 text-green-400 px-2 py-1 rounded"
                          >
                            Configured
                          </span>
                        {:else}
                          <span class="text-gray-500 italic"
                            >Not configured</span
                          >
                        {/if}
                      </p>
                    </div>
                    <button
                      class="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700
                                                   transition-colors duration-200 group"
                      on:click={() =>
                        (editWebhook = {
                          id: greet.id,
                          name: "",
                          avatarUrl: "",
                        })}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 transform group-hover:scale-110 transition-transform duration-200"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                        />
                      </svg>
                    </button>
                  </div>
                {/if}
              </div>

              <!-- Toggle Controls -->
              <div
                class="flex flex-wrap gap-4 pt-2 border-t border-gray-700/50"
              >
                <label
                  class="relative inline-flex items-center cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    checked={greet.greetBots}
                    on:change={(e) =>
                      updateGreetBots(greet.id, e.currentTarget.checked)}
                  />
                  <div
                    class="w-11 h-6 bg-gray-700 rounded-full peer-focus:ring-2
                                                peer-focus:ring-blue-500/50 peer-checked:bg-blue-500
                                                peer-checked:after:translate-x-full peer-checked:after:border-white
                                                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                                after:bg-white after:rounded-full after:h-5 after:w-5
                                                after:transition-all"
                  ></div>
                  <span
                    class="ml-3 text-sm font-medium text-gray-300 group-hover:text-white"
                  >
                    Greet Bots
                  </span>
                </label>

                <label
                  class="relative inline-flex items-center cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    checked={!greet.disabled}
                    on:change={(e) =>
                      updateDisabled(greet.id, !e.currentTarget.checked)}
                  />
                  <div
                    class="w-11 h-6 bg-gray-700 rounded-full peer-focus:ring-2
                                                peer-focus:ring-green-500/50 peer-checked:bg-green-500
                                                peer-checked:after:translate-x-full peer-checked:after:border-white
                                                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                                after:bg-white after:rounded-full after:h-5 after:w-5
                                                after:transition-all"
                  ></div>
                  <span
                    class="ml-3 text-sm font-medium text-gray-300 group-hover:text-white"
                  >
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

<style>
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
</style>
