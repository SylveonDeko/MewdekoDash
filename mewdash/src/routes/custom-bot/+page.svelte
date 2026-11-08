<!-- routes/custom-bot/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { customBotsApi, type CustomBotUserState } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import Notification from "$lib/components/ui/Notification.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
  import BotCard from "./BotCard.svelte";
  import PitchCard from "./PitchCard.svelte";
  import SetupCard from "./SetupCard.svelte";

  let { data } = $props();

  const userId = $derived(String(data.user?.id ?? ""));

  let userState = $state<CustomBotUserState>({ slots: [], bots: [] });
  let loading = $state(true);
  let loadError = $state<string | null>(null);
  let notice = $state<{ message: string; type: "success" | "error" } | null>(null);
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;

  const freeSlots = $derived(
    userState.slots.filter((slot) => !slot.instanceId && (!slot.expiresAt || new Date(slot.expiresAt) > new Date()))
  );
  const anyStarting = $derived(userState.bots.some((bot) => bot.status === "starting"));

  function notify(message: string, type: "success" | "error" = "success") {
    notice = { message, type };
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => (notice = null), 4000);
  }

  async function load(quiet = false) {
    if (!userId) return;
    if (!quiet) loading = true;
    try {
      userState = await customBotsApi.getUser(userId);
      loadError = null;
    } catch (err) {
      logger.error("Failed to load custom bots:", err);
      if (!quiet) loadError = err instanceof Error && err.message ? err.message : m.customBot.controlFailed();
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void load();
    return () => clearTimeout(noticeTimer);
  });

  $effect(() => {
    if (!anyStarting) return;
    const timer = setInterval(() => void load(true), 3000);
    return () => clearInterval(timer);
  });
</script>

<svelte:head>
  <title>{m.customBot.pageTitle()} - Mewdeko</title>
</svelte:head>

{#if notice}
  <div class="fixed top-4 right-4 left-4 sm:left-auto z-[10001]" transition:fade>
    <Notification message={notice.message} type={notice.type} />
  </div>
{/if}

<div class="min-h-screen p-4 md:p-6">
  <div class="max-w-3xl mx-auto space-y-6">
    <header class="flex items-center gap-4">
      <div class="p-4 rounded-xl shrink-0" style="background: {$colorStore.primary}15;">
        <i class="fa-utility-duo fa-regular fa-wand-magic-sparkles text-3xl"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"
           aria-hidden="true"></i>
      </div>
      <div class="min-w-0">
        <h1 class="text-2xl md:text-3xl font-bold" style="color: {$colorStore.text}">{m.customBot.pageTitle()}</h1>
        <p class="text-sm" style="color: {$colorStore.muted}">{m.customBot.pageSubtitle()}</p>
      </div>
    </header>

    {#if loading}
      <SkeletonLoader type="card" count={2} />
    {:else if loadError}
      <p class="text-sm text-red-400" role="alert">{loadError}</p>
    {:else}
      {#if freeSlots.length > 0}
        <SetupCard
          {userId}
          slotId={freeSlots[0].id}
          freeSlots={freeSlots.length}
          onerror={(message) => notify(message, "error")}
          oncreated={() => load(true)}
        />
      {:else}
        <PitchCard
          {userId}
          hasBots={userState.bots.length > 0}
          onerror={(message) => notify(message, "error")}
          onclaimed={() => {
            notify(m.customBot.claimSuccess());
            void load(true);
          }}
        />
      {/if}

      {#each userState.bots as bot (String(bot.instanceId))}
        <BotCard
          {bot}
          {userId}
          onchanged={() => load(true)}
          onerror={(message) => notify(message, "error")}
          onsuccess={(message) => notify(message)}
        />
      {/each}
    {/if}
  </div>
</div>
