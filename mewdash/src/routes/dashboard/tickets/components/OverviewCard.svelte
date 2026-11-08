<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { StaffResponseStats, TicketOverview, TicketPriority } from "$lib/api/ticket/models";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import ListRow from "./ListRow.svelte";
  import { averageMinutes } from "../ticketModel";

  interface Props {
    overview: TicketOverview | null;
    priorities: TicketPriority[];
    loading: boolean;
  }

  let { overview, priorities, loading }: Props = $props();

  const stats = $derived(overview?.statistics ?? null);
  const staff = $derived<StaffResponseStats[]>(overview?.staffResponseStats ?? []);

  const byPriority = $derived(
    Object.entries(stats?.ticketsByPriority ?? {})
      .map(([id, count]) => ({ name: priorities.find(p => p.priorityId === id)?.name ?? id, count }))
      .sort((a, b) => b.count - a.count)
  );

  const activity = $derived(
    Object.entries(overview?.ticketActivity ?? {})
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
  );
  const peak = $derived(Math.max(1, ...activity.map(([, count]) => count)));
</script>

<PluginCard title={m.common.overview()}>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    <StatTile label={m.common.total()} value={String(stats?.totalTickets ?? 0)} {loading} />
    <StatTile label={m.common.open()} value={String(stats?.openTickets ?? 0)} {loading} />
    <StatTile label={m.common.closed()} value={String(stats?.closedTickets ?? 0)} {loading} />
    <StatTile label={m.tickets.statResponse()} value={m.tickets.minutesValue({ value: averageMinutes(stats?.averageResponseTime).toFixed(1) })} {loading} />
    <StatTile label={m.tickets.statResolution()} value={m.tickets.hoursValue({ value: averageMinutes(stats?.averageResolutionTime).toFixed(1) })} {loading} />
  </div>

  {#if activity.length > 0}
    <div class="space-y-2">
      <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.tickets.activityHeading()}</h4>
      <div class="flex items-end gap-1 h-16" role="img" aria-label={m.tickets.activityHeading()}>
        {#each activity as [day, count] (day)}
          <div class="grow rounded-sm min-w-0" style="height: {Math.max(6, (count / peak) * 100)}%; background: {$colorStore.primary}60;" title="{new Date(day).toLocaleDateString()}: {count}"></div>
        {/each}
      </div>
    </div>
  {/if}

  {#if byPriority.length > 0}
    <div class="space-y-2">
      <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.tickets.byPriorityHeading()}</h4>
      {#each byPriority as row (row.name)}
        <ListRow title={row.name} badges={[String(row.count)]} />
      {/each}
    </div>
  {/if}

  {#if staff.length > 0}
    <div class="space-y-2">
      <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.tickets.staffHeading()}</h4>
      {#each staff as member (member.staffId)}
        <ListRow title={member.staffName} badges={[m.tickets.minutesValue({ value: averageMinutes(member.averageResponseTimeMinutes).toFixed(1) })]} />
      {/each}
    </div>
  {/if}
</PluginCard>
