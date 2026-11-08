<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { moderationApi, type ModCase, type ModCaseAction, type ModCaseChannels, type ModLeaderboardEntry } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";

  interface Props {
    guildId: bigint;
    channels: Array<{ id: string; name: string }>;
    autoSave: AutoSave;
    onerror: (message: string) => void;
  }

  let { guildId, channels, autoSave, onerror }: Props = $props();

  const ALL = "*";
  const caseActions: ModCaseAction[] = ["Warn", "Mute", "Unmute", "Timeout", "Untimeout", "Kick", "Ban", "Softban", "Unban", "HardMute", "RemoveRoles"];
  const pageSize = 25;

  let cases: ModCase[] = $state([]);
  let total = $state(0);
  let page = $state(0);
  let memberFilter = $state("");
  let moderatorFilter = $state("");
  let actionFilter: string | null = $state(ALL);
  let editing: { caseNumber: number; reason: string } | null = $state(null);
  let pendingDelete: ModCase | null = $state(null);
  let leaderboard: ModLeaderboardEntry[] | null = $state(null);
  let caseChannels: ModCaseChannels = $state({ logChannelId: null, reportChannelId: null });

  const actionOptions = $derived([{ id: ALL, name: m.moderation.casesAllActions() }, ...caseActions.map(a => ({ id: a, name: a }))]);
  const pageCount = $derived(Math.max(1, Math.ceil(total / pageSize)));
  const inputStyle = $derived(
    `background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function idOrNull(value: string): string | null {
    return /^\d{15,22}$/.test(value.trim()) ? value.trim() : null;
  }

  async function load() {
    try {
      const result = await moderationApi.getCases(guildId, {
        userId: idOrNull(memberFilter),
        moderatorId: idOrNull(moderatorFilter),
        action: actionFilter && actionFilter !== ALL ? (actionFilter as ModCaseAction) : null,
        page,
        pageSize
      });
      cases = result.cases;
      total = result.total;
    } catch (err) {
      logger.error("Failed to load cases:", err);
      onerror(m.moderation.casesLoadFailed());
    }
  }

  function applyFilters() {
    page = 0;
    void load();
  }

  async function loadChannels() {
    try {
      caseChannels = await moderationApi.getCaseChannels(guildId);
    } catch (err) {
      logger.error("Failed to load case channels:", err);
    }
  }

  function saveChannels(change: Partial<ModCaseChannels>, key: string) {
    const previous = caseChannels;
    const next = { ...caseChannels, ...change };
    caseChannels = next;
    return autoSave.now(`caseChannels:${key}`, async () => {
      try {
        await moderationApi.setCaseChannels(guildId, {
          logChannelId: next.logChannelId ? BigInt(next.logChannelId.toString()) : null,
          reportChannelId: next.reportChannelId ? BigInt(next.reportChannelId.toString()) : null
        });
      } catch (err) {
        caseChannels = previous;
        throw err;
      }
    });
  }

  function saveReason() {
    if (!editing?.reason.trim()) return;
    const { caseNumber, reason } = editing;
    editing = null;
    return autoSave.now(`caseReason:${caseNumber}`, async () => {
      await moderationApi.setCaseReason(guildId, caseNumber, reason.trim());
      await load();
    });
  }

  async function removeCase(entry: ModCase) {
    try {
      await moderationApi.deleteCase(guildId, entry.caseNumber);
      await load();
    } catch (err) {
      logger.error("Failed to delete case:", err);
      onerror(m.moderation.casesDeleteFailed());
    }
  }

  async function exportCases() {
    try {
      const { csv } = await moderationApi.exportCases(guildId);
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "cases.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error("Failed to export cases:", err);
      onerror(m.moderation.casesExportFailed());
    }
  }

  async function toggleLeaderboard() {
    if (leaderboard) {
      leaderboard = null;
      return;
    }
    try {
      leaderboard = await moderationApi.getCaseLeaderboard(guildId);
    } catch (err) {
      logger.error("Failed to load leaderboard:", err);
      onerror(m.moderation.casesLoadFailed());
    }
  }

  onMount(() => {
    void load();
    void loadChannels();
  });
</script>

<PluginCard title={m.moderation.casesTitle()}>
  {#snippet actions()}
    <button class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={toggleLeaderboard}>
      {m.moderation.casesLeaderboard()}
    </button>
    <button class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={exportCases}>
      {m.moderation.casesExport()}
    </button>
  {/snippet}

  {#if leaderboard}
    <ol class="space-y-1">
      {#each leaderboard as entry, index (entry.moderatorId.toString())}
        <li class="flex items-center justify-between p-3 rounded-lg text-sm" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
          <span>{index + 1}. {entry.moderatorName}</span>
          <span style="color: {$colorStore.muted}">{m.moderation.casesCount({ count: entry.count })}</span>
        </li>
      {:else}
        <li class="text-sm" style="color: {$colorStore.muted}">{m.moderation.casesEmpty()}</li>
      {/each}
    </ol>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <SettingField label={m.moderation.casesMemberFilter()} id="cases-member">
      <input id="cases-member" type="text" inputmode="numeric" bind:value={memberFilter} onchange={applyFilters}
             class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
    </SettingField>
    <SettingField label={m.moderation.casesModeratorFilter()} id="cases-moderator">
      <input id="cases-moderator" type="text" inputmode="numeric" bind:value={moderatorFilter} onchange={applyFilters}
             class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
    </SettingField>
    <SettingField label={m.common.action()} id="cases-action">
      <DiscordSelector id="cases-action" type="custom" options={actionOptions} selected={actionFilter} searchable={false} clearable={false} customIcon="fa-filter"
                       onchange={(e) => { actionFilter = typeof e.selected === "string" ? e.selected : ALL; applyFilters(); }} />
    </SettingField>
  </div>

  {#if cases.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.moderation.casesEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each cases as entry (entry.caseNumber)}
        <div class="p-3 rounded-xl border space-y-2" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="font-medium" style="color: {$colorStore.text}">
              {m.moderation.caseLabel({ number: entry.caseNumber })} · {entry.action} · {entry.userName}
            </div>
            <div class="flex items-center gap-1">
              <button
                class="p-2 rounded-lg min-h-[44px] min-w-[44px]"
                style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                aria-label={m.moderation.casesEditReason()}
                title={m.moderation.casesEditReason()}
                onclick={() => (editing = { caseNumber: entry.caseNumber, reason: entry.reason ?? "" })}
              >
                <i class="fa-solid fa-pen" style="font-size: 14px;" aria-hidden="true"></i>
              </button>
              <button
                class="p-2 rounded-lg min-h-[44px] min-w-[44px]"
                style="background: {$colorStore.primary}10; color: {$colorStore.muted};"
                aria-label={m.common.delete()}
                title={m.common.delete()}
                onclick={() => (pendingDelete = entry)}
              >
                <i class="fa-solid fa-trash" style="font-size: 14px;" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          {#if editing?.caseNumber === entry.caseNumber}
            <div class="flex flex-col sm:flex-row gap-2">
              <input type="text" bind:value={editing.reason} maxlength="500" aria-label={m.common.reason()}
                     class="grow p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
              <button
                class="px-6 rounded-xl font-medium min-h-[50px]"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                onclick={saveReason}
              >
                {m.common.save()}
              </button>
              <button class="px-6 rounded-xl min-h-[50px]" style={buttonStyle} onclick={() => (editing = null)}>
                {m.common.cancel()}
              </button>
            </div>
          {:else}
            <p class="text-sm break-words" style="color: {$colorStore.text}">{entry.reason || m.common.noReasonProvided()}</p>
          {/if}
          <div class="text-xs" style="color: {$colorStore.muted}">
            {m.moderation.warningsBy({ name: entry.moderatorName })} · {new Date(entry.dateAdded).toLocaleString()}
          </div>
        </div>
      {/each}
    </div>

    <div class="flex items-center justify-between gap-3">
      <button class="px-4 rounded-xl min-h-[50px] disabled:opacity-50" style={buttonStyle} disabled={page === 0}
              onclick={() => { page -= 1; void load(); }}>
        {m.common.previous()}
      </button>
      <span class="text-sm" style="color: {$colorStore.muted}">{m.moderation.casesPage({ page: page + 1, pages: pageCount })}</span>
      <button class="px-4 rounded-xl min-h-[50px] disabled:opacity-50" style={buttonStyle} disabled={page + 1 >= pageCount}
              onclick={() => { page += 1; void load(); }}>
        {m.common.next()}
      </button>
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.moderation.casesLogChannel()} id="cases-log-channel">
      <div class="flex gap-2">
        <div class="grow">
          <DiscordSelector id="cases-log-channel" type="channel" options={channels} selected={caseChannels.logChannelId?.toString() ?? null}
                           placeholder={m.common.noChannel()}
                           onchange={(e) => typeof e.selected === "string" && saveChannels({ logChannelId: BigInt(e.selected) }, "log")} />
        </div>
        {#if caseChannels.logChannelId}
          <button class="px-4 rounded-xl min-h-[50px]" style={buttonStyle} onclick={() => saveChannels({ logChannelId: null }, "log")}>
            {m.moderation.casesTurnOff()}
          </button>
        {/if}
      </div>
    </SettingField>
    <SettingField label={m.moderation.casesReportChannel()} id="cases-report-channel">
      <div class="flex gap-2">
        <div class="grow">
          <DiscordSelector id="cases-report-channel" type="channel" options={channels} selected={caseChannels.reportChannelId?.toString() ?? null}
                           placeholder={m.common.noChannel()}
                           onchange={(e) => typeof e.selected === "string" && saveChannels({ reportChannelId: BigInt(e.selected) }, "report")} />
        </div>
        {#if caseChannels.reportChannelId}
          <button class="px-4 rounded-xl min-h-[50px]" style={buttonStyle} onclick={() => saveChannels({ reportChannelId: null }, "report")}>
            {m.moderation.casesTurnOff()}
          </button>
        {/if}
      </div>
    </SettingField>
  </div>
</PluginCard>

<ConfirmationModal
  isOpen={pendingDelete !== null}
  title={m.moderation.casesDeleteTitle()}
  message={pendingDelete ? m.moderation.casesDeleteMessage({ number: pendingDelete.caseNumber }) : ""}
  confirmText={m.common.delete()}
  onconfirm={async () => {
    const target = pendingDelete;
    pendingDelete = null;
    if (target) await removeCase(target);
  }}
  oncancel={() => (pendingDelete = null)}
/>
