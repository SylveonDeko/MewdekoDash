<!-- lib/components/InviteStats.svelte -->
<script lang="ts">
  import { Link, Users } from "lucide-svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { inviteStore } from "$lib/stores/inviteStore";
  import StatCard from "$lib/components/StatCard.svelte";

  $: stats = $inviteStore.stats;
</script>

{#if stats && stats !== undefined && stats.averageJoins !== undefined}
  <div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                border-color: {$colorStore.primary}30;">
    <div class="flex items-center gap-4 mb-6">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                    color: {$colorStore.primary};">
        <Link class="w-6 h-6" />
      </div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Invite Stats</h2>
    </div>

    <div class="space-y-4">
      <StatCard
        icon={Users}
        label="Total Invites"
        value={new Intl.NumberFormat().format(stats.totalInvites)}
        iconColor="primary"
      />

      <StatCard
        icon={Users}
        label="Average Joins"
        value={stats.averageJoins}
        subtitle="per day"
        iconColor="secondary"
      />

      {#if stats.topInviters.length > 0}
        <div class="mt-6 space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium" style="color: {$colorStore.text}">Top Inviters</span>
            <span class="text-xs px-2 py-0.5 rounded-full"
                  style="background: {$colorStore.primary}20; color: {$colorStore.muted}">
                Top {stats.topInviters.length}
              </span>
          </div>

          {#each stats.topInviters as inviter, index}
            <StatCard
              icon={Users}
              label={inviter.username}
              value={new Intl.NumberFormat().format(inviter.inviteCount)}
              valueColor="primary"
              iconColor="primary"
            />
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}