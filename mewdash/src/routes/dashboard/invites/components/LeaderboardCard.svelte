<script lang="ts">
  import { m } from "$lib/i18n";
  import { inviteTrackingApi, statsRangeLabels, type InviteLeaderboardEntry, type StatsRangeValue } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import RankList, { type RankRow } from "$lib/components/stats/RankList.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { formatNumber, formatPercent, saveBlob } from "$lib/components/stats/format";
  import RangePicker from "./RangePicker.svelte";
  import { errorText, type Member, type Role } from "./inviteModel";

  interface Props {
    guildId: bigint;
    members: Member[];
    roles: Role[];
    version: number;
    onmember: (userId: string) => void;
    onerror: (message: string) => void;
  }

  let { guildId, members, roles, version, onmember, onerror }: Props = $props();

  const PAGE_SIZE = 10;

  let range = $state(0);
  let roleFilter: string | null = $state(null);
  let lookup: string | null = $state(null);
  let page = $state(1);
  let entries: InviteLeaderboardEntry[] = $state([]);
  let loaded = $state(false);

  const rows = $derived<RankRow[]>(
    entries.map(entry => ({
      rank: entry.rank,
      id: entry.userId.toString(),
      name: entry.username,
      avatarUrl: entry.avatarUrl ?? null,
      value: formatNumber(entry.total),
      detail:
        entry.retention !== null && entry.retention !== undefined
          ? m.invites.leaderboardDetailRetained({ regular: entry.regular, left: entry.left, fake: entry.fake, bonus: entry.bonus, retention: formatPercent(entry.retention) })
          : m.invites.leaderboardDetail({ regular: entry.regular, left: entry.left, fake: entry.fake, bonus: entry.bonus })
    }))
  );

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      entries = await inviteTrackingApi.getInviteLeaderboard(
        guildId,
        range as StatsRangeValue,
        page,
        PAGE_SIZE,
        roleFilter ? BigInt(roleFilter) : undefined
      );
    } catch (err) {
      logger.error("Failed to load the invite leaderboard:", err);
      onerror(errorText(err, m.common.failedToLoadLeaderboard()));
    } finally {
      loaded = true;
    }
  }

  function restart() {
    page = 1;
    void load();
  }

  function go(next: number) {
    if (next < 1) return;
    page = next;
    void load();
  }

  async function exportCsv() {
    try {
      const blob = await inviteTrackingApi.exportLeaderboard(guildId, range as StatsRangeValue);
      saveBlob(blob, `invites-${statsRangeLabels[range as StatsRangeValue].replace(/\s+/g, "-").toLowerCase()}.csv`);
    } catch (err) {
      logger.error("Failed to export the invite leaderboard:", err);
      onerror(errorText(err, m.invites.errorExportLeaderboard()));
    }
  }

  $effect(() => {
    void version;
    void load();
  });
</script>

{#snippet exportButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={iconButton} onclick={exportCsv}>
    <i class="fa-solid fa-download" aria-hidden="true"></i>
    CSV
  </button>
{/snippet}

<PluginCard title={m.common.inviteLeaderboard()} actions={exportButton} alwaysOpen>
  <RangePicker value={range} onchange={(value) => { range = value; restart(); }} />

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.common.role()} id="invites-board-role">
      <DiscordSelector id="invites-board-role" type="role" options={roles} bind:selected={roleFilter} placeholder={m.invites.boardRolePlaceholder()} onchange={restart} />
    </SettingField>
    <SettingField label={m.common.member()} id="invites-board-member">
      <DiscordSelector
        id="invites-board-member"
        type="custom"
        options={members}
        customIcon="fa-user"
        placeholder={m.common.pickMemberPlaceholder()}
        selected={lookup}
        onchange={(detail) => {
          if (typeof detail.selected === "string" && detail.selected) onmember(detail.selected);
          lookup = null;
        }}
      />
    </SettingField>
  </div>

  {#if rows.length > 0}
    <RankList {rows} onselect={(row) => onmember(row.id)} />
  {:else if loaded}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.invites.boardEmpty()}</p>
  {/if}

  <div class="flex items-center justify-between gap-3">
    <button type="button" class="px-4 rounded-xl min-h-[44px] disabled:opacity-50" style={iconButton} disabled={page <= 1} aria-label={m.common.previous()} onclick={() => go(page - 1)}>
      <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
    </button>
    <span class="text-sm tabular-nums" style="color: {$colorStore.muted}">{page}</span>
    <button type="button" class="px-4 rounded-xl min-h-[44px] disabled:opacity-50" style={iconButton} disabled={entries.length < PAGE_SIZE} aria-label={m.common.next()} onclick={() => go(page + 1)}>
      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
    </button>
  </div>
</PluginCard>
