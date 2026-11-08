<!-- routes/owner/custom-bots/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { customBotsApi, type CustomBot, type CustomBotOwnerSlot } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { customBotAvatarUrl } from "$lib/config/customBot";
  import Notification from "$lib/components/ui/Notification.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";

  let rows = $state<CustomBotOwnerSlot[]>([]);
  let loading = $state(true);
  let loadError = $state<string | null>(null);
  let userIdInput = $state("");
  let daysInput = $state("");
  let granting = $state(false);
  let notice = $state<{ message: string; type: "success" | "error" } | null>(null);
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;

  function notify(message: string, type: "success" | "error" = "success") {
    notice = { message, type };
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => (notice = null), 4000);
  }

  async function load() {
    loading = true;
    try {
      const result = await customBotsApi.listSlots();
      if (Array.isArray(result)) {
        rows = result;
      } else {
        const bots: CustomBot[] = result.bots ?? [];
        rows = (result.slots ?? []).map((slot) => ({
          ...slot,
          bot: bots.find((bot) => String(bot.instanceId) === String(slot.instanceId)) ?? null
        }));
      }
      loadError = null;
    } catch (err) {
      logger.error("Failed to load custom bot slots:", err);
      loadError = err instanceof Error && err.message ? err.message : m.customBot.controlFailed();
    } finally {
      loading = false;
    }
  }

  async function grant(event: SubmitEvent) {
    event.preventDefault();
    const userId = userIdInput.trim();
    if (!/^\d{15,22}$/.test(userId) || granting) return;
    const days = Number.parseInt(daysInput, 10);
    granting = true;
    try {
      await customBotsApi.grantSlot(userId, Number.isFinite(days) && days > 0 ? days : undefined);
      userIdInput = "";
      daysInput = "";
      notify(m.customBot.ownerGrantSuccess());
      await load();
    } catch (err) {
      logger.error("Failed to grant custom bot slot:", err);
      notify(err instanceof Error && err.message ? err.message : m.customBot.ownerGrantFailed(), "error");
    } finally {
      granting = false;
    }
  }

  function statusLabel(status: string) {
    switch (status) {
      case "running":
        return m.customBot.statusRunning();
      case "starting":
        return m.customBot.statusStarting();
      case "error":
        return m.customBot.statusError();
      case "expired":
        return m.customBot.statusExpired();
      default:
        return m.customBot.statusStopped();
    }
  }

  onMount(() => {
    void load();
    return () => clearTimeout(noticeTimer);
  });

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
</script>

<svelte:head>
  <title>{m.customBot.ownerName()}</title>
</svelte:head>

{#if notice}
  <div class="fixed top-4 right-4 left-4 sm:left-auto z-[10001]" transition:fade>
    <Notification message={notice.message} type={notice.type} />
  </div>
{/if}

<div class="min-h-screen p-4 md:p-6 lg:p-8" style="background: {$colorStore.primary}06;">
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="flex items-center gap-4">
      <div class="p-4 rounded-xl shrink-0" style="background: {$colorStore.primary}15;">
        <i class="fa-utility-duo fa-regular fa-wand-magic-sparkles text-2xl"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"
           aria-hidden="true"></i>
      </div>
      <h1 class="text-2xl font-bold min-w-0" style="color: {$colorStore.text}">{m.customBot.ownerName()}</h1>
    </header>

    <form class="rounded-2xl border p-4 sm:p-6 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;" onsubmit={grant}>
      <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.customBot.ownerGrantTitle()}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="sm:col-span-2">
          <label for="cb-grant-user" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.customBot.ownerGrantUser()}</label>
          <input id="cb-grant-user" type="text" inputmode="numeric" bind:value={userIdInput} autocomplete="off"
                 class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
        </div>
        <div>
          <label for="cb-grant-days" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.customBot.ownerGrantDays()}</label>
          <input id="cb-grant-days" type="number" inputmode="numeric" min="1" bind:value={daysInput}
                 class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
        </div>
      </div>
      <button
        type="submit"
        class="px-5 rounded-lg min-h-[50px] font-semibold w-full sm:w-auto disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={granting || !/^\d{15,22}$/.test(userIdInput.trim())}
      >
        {m.customBot.ownerGrantSubmit()}
      </button>
    </form>

    <section class="space-y-3">
      <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.customBot.ownerSlotsTitle()}</h2>
      {#if loading}
        <SkeletonLoader type="card" count={2} />
      {:else if loadError}
        <p class="text-sm text-red-400" role="alert">{loadError}</p>
      {:else if rows.length === 0}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.customBot.ownerEmpty()}</p>
      {:else}
        <ul class="space-y-2">
          {#each rows as row (String(row.id))}
            {@const avatar = row.bot ? customBotAvatarUrl(row.bot.avatar, row.bot.botId ? String(row.bot.botId) : null) : null}
            <li class="rounded-xl border p-3 flex flex-wrap items-center gap-x-3 gap-y-2"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
              <div class="flex items-center gap-3 grow min-w-0">
                {#if avatar}
                  <img src={avatar} alt="" class="w-10 h-10 rounded-full shrink-0 object-cover">
                {:else}
                  <span class="w-10 h-10 rounded-full shrink-0 flex items-center justify-center" style="background: {$colorStore.primary}20; color: {$colorStore.text};">
                    <i class="fa-solid fa-robot" aria-hidden="true"></i>
                  </span>
                {/if}
                <div class="min-w-0">
                  <p class="text-sm font-medium truncate" style="color: {$colorStore.text}">
                    {row.bot?.name ?? m.customBot.ownerSlotFree()}
                  </p>
                  <p class="text-xs truncate" style="color: {$colorStore.muted}">
                    {row.userId ? m.customBot.ownerSlotUser({ id: String(row.userId) }) : ""}
                    {row.source}
                  </p>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2 text-xs" style="color: {$colorStore.muted}">
                {#if row.bot}
                  <span class="px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{statusLabel(row.bot.status)}</span>
                {/if}
                <span>
                  {row.expiresAt ? m.customBot.expiresOn({ date: new Date(row.expiresAt).toLocaleDateString() }) : m.customBot.expiresNever()}
                </span>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>
</div>
