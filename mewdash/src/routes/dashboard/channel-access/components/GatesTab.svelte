<script lang="ts">
  import { m } from "$lib/i18n";
  import {
    AccessGrantMode,
    channelAccessApi,
    type ChannelAccessGate,
    type ChannelAccessQuestion
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import GateSheet from "./GateSheet.svelte";
  import NewGateSheet from "./NewGateSheet.svelte";
  import { channelName, errorText, type GatePatch, type Named } from "./channelAccessModel";

  interface Props {
    guildId: bigint;
    gates: ChannelAccessGate[];
    blockedCount: number;
    channels: Named[];
    roles: Named[];
    onpatch: GatePatch;
    onflush: () => void;
    onreload: () => void;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, gates = $bindable(), blockedCount, channels, roles, onpatch, onflush, onreload, onerror, onsuccess }: Props = $props();

  let editingId: number | null = $state(null);
  let creating = $state(false);

  const editing = $derived(gates.find((x) => x.id === editingId) ?? null);
  const pendingCount = $derived(gates.reduce((total, gate) => total + gate.pendingApplications, 0));
  const tiles = $derived([
    { label: m.channelAccess.tabGates(), value: gates.length },
    { label: m.channelAccess.statOpenApplications(), value: pendingCount },
    { label: m.common.blockedUsers(), value: blockedCount }
  ]);

  function setQuestions(gateId: number, questions: ChannelAccessQuestion[]) {
    gates = gates.map((x) => (x.id === gateId ? { ...x, questions } : x));
  }

  function summary(gate: ChannelAccessGate): string {
    return gate.grantMode === AccessGrantMode.Role
      ? m.common.grantsRole({ role: roles.find((x) => x.id === gate.accessRoleId?.toString())?.name ?? String(gate.accessRoleId) })
      : m.channelAccess.grantSummaryChannel();
  }

  function badges(gate: ChannelAccessGate): string[] {
    return [
      gate.enabled ? m.channelAccess.gateAccepting() : m.common.closed(),
      m.channelAccess.gateVotesNeeded({ approvals: gate.requiredApprovals, denials: gate.requiredDenials }),
      gate.voteDurationHours > 0 ? m.channelAccess.gateWindowHours({ hours: gate.voteDurationHours }) : m.channelAccess.gateNoTimeLimit(),
      m.channelAccess.gateOpenCount({ count: gate.pendingApplications })
    ];
  }

  async function remove(gate: ChannelAccessGate) {
    const name = channelName(channels, gate.channelId);
    if (
      !(await requestConfirmation({
        title: m.channelAccess.deleteTitle(),
        message: m.channelAccess.deleteMessage({ channel: name }),
        confirmText: m.channelAccess.deleteConfirm()
      }))
    )
      return;
    try {
      await channelAccessApi.deleteGate(guildId, gate.id);
      if (editingId === gate.id) editingId = null;
      onreload();
    } catch (err) {
      logger.error("Failed to delete gate:", err);
      onerror(errorText(err, m.channelAccess.errorDeleteGate()));
    }
  }
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.channelAccess.tabGates()} alwaysOpen>
    <div class="grid grid-cols-3 gap-3">
      {#each tiles as tile (tile.label)}
        <div class="rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
          <p class="text-xs truncate" style="color: {$colorStore.muted}">{tile.label}</p>
          <p class="text-lg font-semibold tabular-nums" style="color: {$colorStore.text}">{tile.value}</p>
        </div>
      {/each}
    </div>

    <div class="space-y-2">
      {#each gates as gate (gate.id)}
        {@const name = channelName(channels, gate.channelId)}
        <div
          class="flex items-center gap-2 rounded-xl border p-2 min-w-0"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
        >
          <button
            type="button"
            class="grow min-w-0 text-left min-h-[44px] px-1"
            aria-label="{m.common.settings()}: #{name}"
            onclick={() => (editingId = gate.id)}
          >
            <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">#{name}</span>
            <span class="block text-sm truncate" style="color: {$colorStore.muted}">{summary(gate)}</span>
            <span class="flex flex-wrap items-center gap-1.5 mt-1">
              {#each badges(gate) as badge (badge)}
                <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
              {/each}
            </span>
          </button>
          <button
            type="button"
            class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            aria-label="{m.common.delete()}: #{name}"
            onclick={() => remove(gate)}
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      {:else}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.channelAccess.gatesEmpty()}</p>
      {/each}
    </div>

    <button
      type="button"
      class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      onclick={() => (creating = true)}
    >
      <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>{m.channelAccess.createButton()}
    </button>
  </PluginCard>
</div>

{#if creating}
  <NewGateSheet
    {guildId}
    {channels}
    {roles}
    taken={gates.map((x) => x.channelId.toString())}
    {onerror}
    onclose={() => (creating = false)}
    oncreated={(gate) => {
      gates = [...gates, gate];
      creating = false;
      editingId = gate.id;
    }}
  />
{/if}

{#if editing}
  {@const current = editing}
  <GateSheet
    {guildId}
    gate={current}
    {channels}
    {roles}
    {onpatch}
    {onflush}
    {onreload}
    {onerror}
    {onsuccess}
    onquestions={(questions) => setQuestions(current.id, questions)}
    ondelete={() => remove(current)}
    onclose={() => (editingId = null)}
  />
{/if}
