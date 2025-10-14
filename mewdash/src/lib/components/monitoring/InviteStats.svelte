<!-- lib/components/InviteStats.svelte -->
<script lang="ts">
    import {colorStore} from "$lib/stores/colorStore";
    import {inviteStore} from "$lib/stores/inviteStore";
    import StatCard from "$lib/components/monitoring/StatCard.svelte";

    interface Props {
    animationDelay?: number;
  }

  let { animationDelay = 0 }: Props = $props();

  let stats = $derived($inviteStore.stats);
</script>

{#if stats && stats !== undefined && stats.averageJoins !== undefined}
  <div class=" rounded-2xl border p-6 shadow-2xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                border-color: {$colorStore.primary}30;">
    <div class="flex items-center gap-4 mb-6">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-link text-2xl"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
      </div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Invite Stats</h2>
    </div>

    <div class="space-y-4">
      <StatCard
        icon="fa-users"
        label="Total Invites"
        value={new Intl.NumberFormat().format(stats.totalInvites)}
        iconColor="primary"
        animationDelay={animationDelay}
      />

      <StatCard
        icon="fa-users"
        label="Average Joins"
        value={stats.averageJoins}
        subtitle="per day"
        iconColor="secondary"
        animationDelay={animationDelay + 150}
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
              icon="fa-user"
              label={inviter.username}
              value={new Intl.NumberFormat().format(inviter.inviteCount)}
              iconColor="primary"
              animationDelay={animationDelay + 300 + (index * 100)}
            />
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
