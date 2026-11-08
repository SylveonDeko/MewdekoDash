<script lang="ts">
  import { m } from "$lib/i18n";
  import { customBotsApi, type CustomBot, type CustomBotStatus } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import { customBotAvatarUrl, guildIconUrl } from "$lib/config/customBot";
  import LogsSheet from "./LogsSheet.svelte";
  import TokenSheet from "./TokenSheet.svelte";

  interface Props {
    bot: CustomBot;
    userId: string;
    onchanged: () => void;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { bot, userId, onchanged, onerror, onsuccess }: Props = $props();

  let busy = $state(false);
  let busyGuild = $state<string | null>(null);
  let menuOpen = $state(false);
  let menuEl: HTMLDivElement | undefined = $state();
  let sheet = $state<"logs" | "token" | null>(null);

  const instanceId = $derived(String(bot.instanceId));
  const expired = $derived(bot.status === "expired");
  const live = $derived(bot.status === "running" || bot.status === "starting");
  const avatar = $derived(customBotAvatarUrl(bot.avatar, bot.botId ? String(bot.botId) : null));
  const expires = $derived(
    bot.expiresAt ? m.customBot.expiresOn({ date: new Date(bot.expiresAt).toLocaleDateString() }) : m.customBot.expiresNever()
  );

  const statusTint: Record<CustomBotStatus, string> = {
    running: "#22c55e",
    starting: "#f59e0b",
    stopped: "#94a3b8",
    error: "#ef4444",
    expired: "#ef4444"
  };

  const statusLabel = $derived.by(() => {
    switch (bot.status) {
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
  });

  function outside(event: PointerEvent) {
    if (menuOpen && menuEl && !menuEl.contains(event.target as Node)) menuOpen = false;
  }

  function pick(action: () => void) {
    menuOpen = false;
    action();
  }

  function messageOf(err: unknown, fallback: string) {
    return err instanceof Error && err.message ? err.message : fallback;
  }

  async function control(action: "start" | "stop" | "restart") {
    if (busy) return;
    busy = true;
    try {
      await customBotsApi.control(userId, instanceId, action);
      onchanged();
    } catch (err) {
      logger.error(`Failed to ${action} custom bot:`, err);
      onerror(messageOf(err, m.customBot.controlFailed()));
    } finally {
      busy = false;
    }
  }

  async function remove() {
    const confirmed = await requestConfirmation({
      title: m.customBot.removeConfirmTitle(),
      message: m.customBot.removeConfirm({ name: bot.name }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    busy = true;
    try {
      await customBotsApi.removeBot(userId, instanceId);
      onsuccess(m.customBot.botRemoved());
      onchanged();
    } catch (err) {
      logger.error("Failed to remove custom bot:", err);
      onerror(messageOf(err, m.customBot.controlFailed()));
    } finally {
      busy = false;
    }
  }

  async function toggleGuild(guildId: string, assigned: boolean) {
    if (busyGuild) return;
    busyGuild = guildId;
    try {
      if (assigned) await customBotsApi.releaseGuild(userId, instanceId, guildId);
      else await customBotsApi.assignGuild(userId, instanceId, guildId);
      onchanged();
    } catch (err) {
      logger.error("Failed to switch custom bot server:", err);
      onerror(messageOf(err, m.customBot.assignFailed()));
    } finally {
      busyGuild = null;
    }
  }

  const softButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

<svelte:window onpointerdown={outside} onkeydown={(e) => { if (e.key === "Escape") menuOpen = false; }} />

<section
  class="relative rounded-2xl border p-4 sm:p-6 space-y-4"
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <div class="flex items-center gap-3">
    {#if avatar}
      <img src={avatar} alt="" class="w-12 h-12 rounded-full shrink-0 object-cover">
    {:else}
      <span class="w-12 h-12 rounded-full shrink-0 flex items-center justify-center" style="background: {$colorStore.primary}20; color: {$colorStore.text};">
        <i class="fa-solid fa-robot" aria-hidden="true"></i>
      </span>
    {/if}
    <div class="min-w-0 grow">
      <h2 class="text-base font-semibold truncate" style="color: {$colorStore.text}">{bot.name}</h2>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          class="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
          style="background: {statusTint[bot.status]}20; color: {$colorStore.text};"
        >
          <span class="w-2 h-2 rounded-full" style="background: {statusTint[bot.status]};"></span>
          {statusLabel}
        </span>
        <span class="text-xs" style="color: {$colorStore.muted}">{expires}</span>
      </div>
    </div>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    {#if bot.inviteUrl && !expired}
      <a href={bot.inviteUrl} target="_blank" rel="noreferrer"
         class="inline-flex items-center justify-center gap-2 px-4 rounded-lg min-h-[44px] font-semibold"
         style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};">
        <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.customBot.invite()}
      </a>
    {/if}
    {#if !expired}
      {#if live}
        <button type="button" class="px-4 rounded-lg min-h-[44px] disabled:opacity-50" style={softButton} disabled={busy} onclick={() => control("stop")}>
          <i class="fa-solid fa-stop mr-2" aria-hidden="true"></i>{m.common.stop()}
        </button>
      {:else}
        <button type="button" class="px-4 rounded-lg min-h-[44px] disabled:opacity-50" style={softButton} disabled={busy} onclick={() => control("start")}>
          <i class="fa-solid fa-play mr-2" aria-hidden="true"></i>{m.common.start()}
        </button>
      {/if}
    {/if}

    <div class="hidden sm:flex flex-wrap items-center gap-2">
      {#if !expired}
        <button type="button" class="px-4 rounded-lg min-h-[44px] disabled:opacity-50" style={softButton} disabled={busy} onclick={() => control("restart")}>
          <i class="fa-solid fa-rotate-right mr-2" aria-hidden="true"></i>{m.customBot.restart()}
        </button>
        <button type="button" class="px-4 rounded-lg min-h-[44px]" style={softButton} onclick={() => (sheet = "token")}>
          <i class="fa-solid fa-key mr-2" aria-hidden="true"></i>{m.customBot.tokenReplace()}
        </button>
      {/if}
      <button type="button" class="px-4 rounded-lg min-h-[44px]" style={softButton} onclick={() => (sheet = "logs")}>
        <i class="fa-solid fa-file-lines mr-2" aria-hidden="true"></i>{m.customBot.viewLogs()}
      </button>
      <button type="button" class="px-4 rounded-lg min-h-[44px] disabled:opacity-50" style={softButton} disabled={busy} onclick={remove}>
        <i class="fa-solid fa-trash mr-2" aria-hidden="true"></i>{m.common.remove()}
      </button>
    </div>

    <div class="sm:hidden ml-auto relative" bind:this={menuEl}>
      <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={softButton} aria-expanded={menuOpen}
              aria-label={m.customBot.menuMore({ name: bot.name })} onclick={() => (menuOpen = !menuOpen)}>
        <i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
      </button>
      {#if menuOpen}
        <div class="absolute right-0 top-full mt-1 z-20 rounded-xl border p-1 min-w-[10rem] shadow-lg"
             style="background: {$colorStore.surface}; border-color: {$colorStore.primary}30;">
          {#if !expired}
            <button type="button" class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3" style="color: {$colorStore.text}" onclick={() => pick(() => control("restart"))}>
              <i class="fa-solid fa-rotate-right w-4" aria-hidden="true"></i>{m.customBot.restart()}
            </button>
            <button type="button" class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3" style="color: {$colorStore.text}" onclick={() => pick(() => (sheet = "token"))}>
              <i class="fa-solid fa-key w-4" aria-hidden="true"></i>{m.customBot.tokenReplace()}
            </button>
          {/if}
          <button type="button" class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3" style="color: {$colorStore.text}" onclick={() => pick(() => (sheet = "logs"))}>
            <i class="fa-solid fa-file-lines w-4" aria-hidden="true"></i>{m.customBot.viewLogs()}
          </button>
          <button type="button" class="w-full text-left px-3 min-h-[44px] rounded-lg flex items-center gap-3" style="color: {$colorStore.text}" onclick={() => pick(remove)}>
            <i class="fa-solid fa-trash w-4" aria-hidden="true"></i>{m.common.remove()}
          </button>
        </div>
      {/if}
    </div>
  </div>

  <div class="space-y-2 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
    <h3 class="text-sm font-semibold" style="color: {$colorStore.text}">{m.customBot.serversTitle()}</h3>
    <p class="text-sm" style="color: {$colorStore.muted}">{m.customBot.assignBlurb()}</p>
    {#if bot.guilds.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.customBot.noServers()}</p>
    {:else}
      <ul class="space-y-2">
        {#each bot.guilds as guild (String(guild.id))}
          {@const icon = guildIconUrl(String(guild.id), guild.icon)}
          <li
            class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border p-2 sm:p-3"
            style="background: {guild.assigned ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {guild.assigned ? $colorStore.selectedBorder : `${$colorStore.primary}20`};"
          >
            <div class="flex items-center gap-3 grow min-w-0">
              {#if icon}
                <img src={icon} alt="" class="w-10 h-10 rounded-full shrink-0 object-cover">
              {:else}
                <span class="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-semibold" style="background: {$colorStore.primary}20; color: {$colorStore.text};">
                  {guild.name.charAt(0).toUpperCase()}
                </span>
              {/if}
              <span class="text-sm font-medium truncate" style="color: {$colorStore.text}">{guild.name}</span>
            </div>
            <button
              type="button"
              class="px-4 rounded-lg min-h-[44px] w-full sm:w-auto text-sm font-medium disabled:opacity-50"
              style={guild.assigned ? softButton : `background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`}
              disabled={busyGuild !== null || expired}
              onclick={() => toggleGuild(String(guild.id), guild.assigned)}
            >
              {guild.assigned ? m.customBot.assignRelease() : m.customBot.assignHere()}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

{#if sheet === "logs"}
  <LogsSheet {userId} {instanceId} name={bot.name} onclose={() => (sheet = null)} />
{:else if sheet === "token"}
  <TokenSheet
    {userId}
    {instanceId}
    name={bot.name}
    onclose={() => (sheet = null)}
    ondone={() => {
      sheet = null;
      onsuccess(m.customBot.tokenReplaced());
      onchanged();
    }}
  />
{/if}
