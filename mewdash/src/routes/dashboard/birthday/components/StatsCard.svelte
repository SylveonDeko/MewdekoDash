<script lang="ts">
  import { m } from "$lib/i18n";
  import type { BirthdayStats } from "$lib/api/index.ts";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { formatNumber } from "$lib/components/stats/format";

  interface Props {
    stats: BirthdayStats;
  }

  let { stats }: Props = $props();
</script>

<PluginCard title={m.common.statistics()} alwaysOpen>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <StatTile label={m.common.totalUsers()} value={formatNumber(stats.totalUsers)} />
    <StatTile label={m.birthday.statsSet()} value={formatNumber(stats.usersWithBirthdays)} sub={m.birthday.statsSetSubtitle({ percent: Number(stats.birthdaySetPercentage || 0).toFixed(1) })} />
    <StatTile label={m.birthday.statsPublic()} value={formatNumber(stats.usersWithAnnouncementsEnabled)} />
    <StatTile label={m.birthday.statsToday()} value={formatNumber(stats.todaysBirthdayCount)} />
  </div>
</PluginCard>
