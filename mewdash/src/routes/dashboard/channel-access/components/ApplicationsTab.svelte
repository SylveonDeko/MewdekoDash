<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import {
    AccessApplicationStatus,
    channelAccessApi,
    type ChannelAccessApplication,
    type ChannelAccessGate
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { userStore } from "$lib/stores/userStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ApplicationRow from "./ApplicationRow.svelte";
  import { channelName, errorText, type Named } from "./channelAccessModel";

  interface Props {
    guildId: bigint;
    gates: ChannelAccessGate[];
    channels: Named[];
    refreshKey: number;
    onchanged: () => void;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, gates, channels, refreshKey, onchanged, onerror, onsuccess }: Props = $props();

  let applications: ChannelAccessApplication[] = $state([]);
  let gateFilter = $state("all");
  let statusFilter = $state(String(AccessApplicationStatus.Pending));
  let expandedId: number | null = $state(null);
  let busy = $state(false);
  let loading = $state(true);
  let request = 0;

  const gateOptions = $derived([
    { id: "all", name: m.channelAccess.filterAllGates() },
    ...gates.map((gate) => ({ id: String(gate.id), name: `#${channelName(channels, gate.channelId)}` }))
  ]);
  const statusOptions = $derived([
    { id: "all", name: m.common.anyStatus() },
    { id: String(AccessApplicationStatus.Pending), name: m.common.pending() },
    { id: String(AccessApplicationStatus.Approved), name: m.common.approved() },
    { id: String(AccessApplicationStatus.Denied), name: m.common.denied() },
    { id: String(AccessApplicationStatus.Withdrawn), name: m.channelAccess.statusWithdrawn() },
    { id: String(AccessApplicationStatus.Expired), name: m.common.expired() }
  ]);

  async function load() {
    const current = ++request;
    loading = true;
    try {
      const result = await channelAccessApi.getApplications(guildId, {
        configId: gateFilter === "all" ? undefined : Number(gateFilter),
        status: statusFilter === "all" ? undefined : (Number(statusFilter) as AccessApplicationStatus),
        limit: 200
      });
      if (current === request) applications = result;
    } catch (err) {
      logger.error("Failed to load applications:", err);
      if (current === request) onerror(errorText(err, m.channelAccess.errorLoadApplications()));
    } finally {
      if (current === request) loading = false;
    }
  }

  async function resolve(application: ChannelAccessApplication, approve: boolean, reason: string) {
    busy = true;
    try {
      await channelAccessApi.resolveApplication(guildId, application.id, {
        status: approve ? AccessApplicationStatus.Approved : AccessApplicationStatus.Denied,
        userId: BigInt($userStore?.id ?? 0),
        reason: reason.trim() || null
      });
      onsuccess(
        (approve ? m.channelAccess.notifyApplicationApproved : m.channelAccess.notifyApplicationDenied)({ id: application.id })
      );
      onchanged();
    } catch (err) {
      logger.error("Failed to resolve application:", err);
      onerror(errorText(err, m.channelAccess.errorCloseApplication()));
    } finally {
      busy = false;
    }
  }

  $effect(() => {
    void refreshKey;
    untrack(() => void load());
  });
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.common.filters()} alwaysOpen>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="min-w-0">
        <span id="apps-gate" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.channelAccess.appsGate()}</span>
        <DiscordSelector
          type="custom"
          options={gateOptions}
          customIcon="fa-lock"
          selected={gateFilter}
          searchable={false}
          clearable={false}
          ariaLabelledby="apps-gate"
          onchange={({ selected }) => {
            gateFilter = typeof selected === "string" ? selected : "all";
            void load();
          }}
        />
      </div>
      <div class="min-w-0">
        <span id="apps-status" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.status()}</span>
        <DiscordSelector
          type="custom"
          options={statusOptions}
          customIcon="fa-filter"
          selected={statusFilter}
          searchable={false}
          clearable={false}
          ariaLabelledby="apps-status"
          onchange={({ selected }) => {
            statusFilter = typeof selected === "string" ? selected : "all";
            void load();
          }}
        />
      </div>
    </div>
  </PluginCard>

  <PluginCard title={m.common.applications()} alwaysOpen>
    <div class="space-y-2" aria-busy={loading}>
      {#each applications as application (application.id)}
        <ApplicationRow
          {application}
          channel={channelName(channels, application.channelId)}
          expanded={expandedId === application.id}
          {busy}
          ontoggle={() => (expandedId = expandedId === application.id ? null : application.id)}
          onresolve={(approve, reason) => resolve(application, approve, reason)}
        />
      {:else}
        {#if !loading}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.channelAccess.appsEmpty()}</p>
        {/if}
      {/each}
    </div>
  </PluginCard>
</div>
