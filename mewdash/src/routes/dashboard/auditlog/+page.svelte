<!-- routes/dashboard/auditlog/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { auditLogApi, clientApi } from "$lib/api/index.ts";
  import type { AuditLogEntry } from "$lib/api/auditlog/models";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import Notification from "$lib/components/ui/Notification.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import FiltersCard from "./components/FiltersCard.svelte";
  import EntryRow from "./components/EntryRow.svelte";
  import { humanizeKey, sectionLabels, type AuditFilters } from "./components/auditModel";

  let entries: AuditLogEntry[] = $state([]);
  let total = $state(0);
  let page = $state(1);
  let loading = $state(true);
  let failed = $state(false);
  let expandedId: number | null = $state(null);
  let members: Array<{ id: string; name: string }> = $state([]);
  let filters: AuditFilters = $state({ action: null, section: null, userId: null, from: "", to: "", pageSize: 50 });
  let showNotification = $state(false);
  let loadedGuildId = "";
  let request = 0;

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  let totalPages = $derived(Math.max(1, Math.ceil(total / filters.pageSize)));
  const labels = $derived(sectionLabels());

  const sectionOptions = $derived(
    [...new Set([...Object.keys(labels), ...entries.map((e) => e.section)])]
      .map((id) => ({ id, name: labels[id] ?? humanizeKey(id) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  async function fetchLog() {
    const id = guildId;
    if (!id) return;
    const current = ++request;
    loading = true;
    failed = false;
    try {
      const result = await auditLogApi.getAuditLog(id, {
        action: filters.action === null ? undefined : Number(filters.action),
        section: filters.section ?? undefined,
        userId: filters.userId ? BigInt(filters.userId) : undefined,
        after: filters.from ? new Date(`${filters.from}T00:00:00`).toISOString() : undefined,
        before: filters.to ? new Date(`${filters.to}T23:59:59.999`).toISOString() : undefined,
        page,
        pageSize: filters.pageSize
      });
      if (current !== request) return;
      entries = result.items ?? [];
      total = result.total ?? 0;
    } catch (err) {
      if (current !== request) return;
      logger.error("Failed to fetch audit log:", err);
      failed = true;
      showNotification = true;
      setTimeout(() => (showNotification = false), 3000);
    } finally {
      if (current === request) loading = false;
    }
  }

  function applyFilters() {
    page = 1;
    expandedId = null;
    void fetchLog();
  }

  function changePage(next: number) {
    if (next < 1 || next > totalPages) return;
    page = next;
    expandedId = null;
    void fetchLog();
  }

  async function loadMembers(id: bigint) {
    try {
      members = (await clientApi.getMembers(id))
        .map((x) => ({ id: String(x.id), name: x.displayName || x.username || String(x.id) }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      logger.error("Failed to load members:", err);
    }
  }

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    if ($currentGuild.icon) {
      const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(serverIconUrl);
    } else if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
    }
    if (loadedGuildId !== $currentGuild.id.toString()) {
      loadedGuildId = $currentGuild.id.toString();
      page = 1;
      filters = { action: null, section: null, userId: null, from: "", to: "", pageSize: filters.pageSize };
      void fetchLog();
      void loadMembers(BigInt($currentGuild.id));
    }
  });

  const actionButtons = $derived([
    { label: m.common.refresh(), icon: "fa-arrows-rotate", action: () => void fetchLog(), loading }
  ]);
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={m.auditlog.pageErrorLoad()} type="error" />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {actionButtons}
  icon="fa-clipboard-check"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.auditlogName()}
  subtitle={m.auditlog.pageSubtitle()}
>
  <div class="space-y-4 min-w-0">
    <FiltersCard bind:filters {sectionOptions} {members} onchange={applyFilters} />

    <PluginCard title={m.features.auditlogName()} alwaysOpen>
      {#if loading}
        <div class="space-y-2" aria-busy="true" aria-label={m.auditlog.pageLoading()}>
          {#each Array(6) as _, i (i)}
            <SkeletonLoader type="feature" delay={i * 60} />
          {/each}
        </div>
      {:else if failed}
        <div class="flex flex-col items-start gap-3">
          <p class="text-sm" style="color: {$colorStore.accent}">{m.auditlog.pageErrorLoad()}</p>
          <button
            type="button"
            class="px-5 rounded-xl min-h-[50px] font-medium"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
            onclick={() => void fetchLog()}
          >
            {m.common.refresh()}
          </button>
        </div>
      {:else if entries.length === 0}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.auditlog.pageEmpty()}</p>
      {:else}
        <div class="space-y-2" in:fade={{ duration: 150 }}>
          {#each entries as entry (entry.id)}
            <EntryRow
              {entry}
              section={labels[entry.section] ?? humanizeKey(entry.section)}
              expanded={expandedId === entry.id}
              ontoggle={() => (expandedId = expandedId === entry.id ? null : entry.id)}
            />
          {/each}
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span class="text-sm" style="color: {$colorStore.muted}">
            {m.auditlog.pagePagination({ total, page, pages: totalPages })}
          </span>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-40"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              disabled={page <= 1}
              onclick={() => changePage(page - 1)}
            >
              {m.common.previous()}
            </button>
            <button
              type="button"
              class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-40"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              disabled={page >= totalPages}
              onclick={() => changePage(page + 1)}
            >
              {m.common.next()}
            </button>
          </div>
        </div>
      {/if}
    </PluginCard>
  </div>
</PluginPage>
