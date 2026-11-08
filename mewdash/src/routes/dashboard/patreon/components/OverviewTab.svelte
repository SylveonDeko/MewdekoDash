<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import {
    patreonApi,
    type PatreonAnalytics,
    type PatreonCreator,
    type PatreonOAuthStatusResponse
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import { errorText, formatDate, formatMoney, type Notify } from "./patreonModel";

  interface Props {
    guildId: bigint;
    status: PatreonOAuthStatusResponse;
    notify: Notify;
    ondisconnect: () => void;
  }

  let { guildId, status, notify, ondisconnect }: Props = $props();

  let analytics = $state<PatreonAnalytics | null>(null);
  let creator = $state<PatreonCreator | null>(null);
  let running: string | null = $state(null);
  let confirmOpen = $state(false);

  const stats = $derived(
    analytics
      ? [
          [m.patreon.statActive(), String(analytics.activeSupporters)],
          [m.patreon.statMonthly(), formatMoney(analytics.totalMonthlyRevenue)],
          [m.patreon.statAverage(), formatMoney(analytics.averageSupport)],
          [m.patreon.statNew(), String(analytics.newSupportersThisMonth)],
          [m.patreon.statFormer(), String(analytics.formerSupporters)],
          [m.patreon.statLifetime(), formatMoney(analytics.lifetimeRevenue)],
          [m.patreon.statLinked(), `${analytics.linkedSupporters} / ${analytics.totalSupporters}`]
        ]
      : []
  );

  const actions = $derived([
    { operation: "sync", icon: "fa-users", label: m.patreon.actionSyncSupporters(), failed: m.patreon.notifySyncFailed() },
    { operation: "sync_all", icon: "fa-rotate", label: m.patreon.actionSyncAll(), failed: m.patreon.notifySyncFailed() },
    { operation: "sync_roles", icon: "fa-star", label: m.patreon.actionSyncRoles(), failed: m.patreon.notifySyncRolesFailed() },
    { operation: "manual_announcement", icon: "fa-bullhorn", label: m.patreon.actionAnnounce(), failed: m.patreon.notifyAnnounceFailed() },
    { operation: "refresh_token", icon: "fa-key", label: m.patreon.actionRefreshToken(), failed: m.patreon.notifyTokenFailed() }
  ]);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    const [loadedAnalytics, loadedCreator] = await Promise.allSettled([
      patreonApi.getPatreonAnalytics(guildId),
      patreonApi.getPatreonCreator(guildId)
    ]);
    if (loadedAnalytics.status === "fulfilled") analytics = loadedAnalytics.value;
    else logger.error("Failed to load Patreon analytics:", loadedAnalytics.reason);
    if (loadedCreator.status === "fulfilled") creator = loadedCreator.value;
  }

  async function run(action: { operation: string; failed: string }) {
    if (running) return;
    running = action.operation;
    try {
      const result = await patreonApi.triggerPatreonOperation(guildId, { operation: action.operation });
      notify(result.message);
      if (action.operation !== "manual_announcement") await load();
    } catch (err) {
      logger.error(`Patreon operation ${action.operation} failed:`, err);
      notify(errorText(err, action.failed), "error");
    } finally {
      running = null;
    }
  }

  async function disconnect() {
    try {
      const result = await patreonApi.disconnectPatreon(guildId);
      notify(result.message);
      ondisconnect();
    } catch (err) {
      logger.error("Failed to disconnect Patreon:", err);
      notify(errorText(err, m.patreon.errorDisconnectFailed()), "error");
    }
  }

  onMount(() => {
    void load();
  });
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.patreon.overviewConnected()} alwaysOpen>
    <div class="flex items-center gap-3 min-w-0">
      {#if creator?.imageUrl}
        <img src={creator.imageUrl} alt="" class="w-12 h-12 rounded-full object-cover shrink-0">
      {:else}
        <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style="background: {$colorStore.primary}20;">
          <i class="fa-solid fa-heart" style="color: {$colorStore.text};" aria-hidden="true"></i>
        </div>
      {/if}
      <div class="min-w-0 grow">
        <p class="font-medium truncate" style="color: {$colorStore.text}">{creator?.fullName || m.patreon.creatorUnknown()}</p>
        <p class="text-sm" style="color: {$colorStore.muted}">{m.patreon.creatorPatronCount({ count: creator?.patronCount ?? 0 })}</p>
      </div>
      {#if creator?.url}
        <a href={creator.url} target="_blank" rel="noopener noreferrer"
           class="px-4 rounded-lg min-h-[44px] inline-flex items-center gap-2 text-sm shrink-0" style={buttonStyle}>
          <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
          <span class="hidden sm:inline">{m.patreon.creatorViewProfile()}</span>
          <span class="sr-only sm:hidden">{m.patreon.creatorViewProfile()}</span>
        </a>
      {/if}
    </div>
    <dl class="grid gap-3 sm:grid-cols-2 text-sm">
      <div class="min-w-0">
        <dt style="color: {$colorStore.muted}">{m.patreon.overviewCampaignId()}</dt>
        <dd class="font-mono break-all" style="color: {$colorStore.text}">{status.campaignId ?? ""}</dd>
      </div>
      <div>
        <dt style="color: {$colorStore.muted}">{m.patreon.overviewTokenExpires()}</dt>
        <dd style="color: {$colorStore.text}">{formatDate(status.tokenExpiry) || m.common.never()}</dd>
      </div>
    </dl>
  </PluginCard>

  {#if analytics}
    <PluginCard title={m.patreon.supportersTitle()} alwaysOpen>
      <dl class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {#each stats as [label, value] (label)}
          <div class="rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
            <dd class="text-lg font-semibold truncate" style="color: {$colorStore.text}">{value}</dd>
            <dt class="text-xs" style="color: {$colorStore.muted}">{label}</dt>
          </div>
        {/each}
      </dl>
      {#if analytics.topSupporters.length > 0}
        <div class="space-y-2">
          <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.patreon.topSupporters()}</h4>
          {#each analytics.topSupporters as supporter (supporter.name)}
            <div class="flex items-center gap-3 rounded-lg p-2 min-w-0" style="background: {$colorStore.primary}08;">
              <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{supporter.name}</span>
              {#if supporter.tier}
                <span class="text-xs shrink-0 hidden sm:inline" style="color: {$colorStore.muted}">{supporter.tier}</span>
              {/if}
              <span class="text-sm shrink-0 tabular-nums" style="color: {$colorStore.text}">{formatMoney(supporter.amount)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </PluginCard>
  {/if}

  <PluginCard title={m.common.quickActions()} alwaysOpen>
    <div class="grid gap-2 sm:grid-cols-2">
      {#each actions as action (action.operation)}
        <button type="button" class="px-4 rounded-lg min-h-[50px] flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                style={buttonStyle} disabled={running !== null} onclick={() => run(action)}>
          <i class="fa-solid {action.icon} {running === action.operation ? 'fa-spin' : ''}" aria-hidden="true"></i>
          {action.label}
        </button>
      {/each}
    </div>
    <button type="button" class="px-4 rounded-lg min-h-[50px] flex items-center justify-center gap-2 font-medium w-full sm:w-auto"
            style="background: #ef444420; color: {$colorStore.text}; border: 1px solid #ef444440;"
            onclick={() => (confirmOpen = true)}>
      <i class="fa-solid fa-link-slash" aria-hidden="true"></i>
      {m.patreon.actionRelogin()}
    </button>
  </PluginCard>
</div>

<ConfirmationModal
  bind:isOpen={confirmOpen}
  title={m.patreon.disconnectTitle()}
  message={m.patreon.disconnectMessage()}
  confirmText={m.patreon.actionRelogin()}
  variant="danger"
  onconfirm={disconnect}
  oncancel={() => (confirmOpen = false)}
/>
