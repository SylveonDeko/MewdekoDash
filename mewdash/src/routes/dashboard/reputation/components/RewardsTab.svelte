<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { reputationApi } from "$lib/api/index.ts";
  import type { RoleReward } from "$lib/api/reputation/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import RewardSheet from "./RewardSheet.svelte";
  import { idString, type Named, type Notify } from "./repModel";

  interface Props {
    guildId: bigint;
    roles: Named[];
    channels: Named[];
    notify: Notify;
  }

  let { guildId, roles, channels, notify }: Props = $props();

  let rewards = $state<RoleReward[]>([]);
  let loaded = $state(false);
  let editing = $state<{ reward: RoleReward | null } | null>(null);

  const roleNames = $derived(new Map(roles.map((r) => [r.id, r.name])));
  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      rewards = (await reputationApi.getRoleRewards(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load role rewards:", err);
      notify(m.reputation.errorLoad(), "error");
    } finally {
      loaded = true;
    }
  }

  async function remove(reward: RoleReward) {
    const confirmed = await requestConfirmation({
      message: m.reputation.confirmRemoveReward(),
      confirmText: m.common.remove(),
      variant: "danger"
    });
    if (!confirmed) return;
    try {
      await reputationApi.removeRoleReward(guildId, reward.roleId);
      notify(m.common.roleRewardRemoved());
      await load();
    } catch (err) {
      logger.error("Failed to remove a role reward:", err);
      notify(m.common.failedToRemoveRoleReward(), "error");
    }
  }

  onMount(() => {
    void load();
  });
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.reputation.rewardsHeading({ count: rewards.length })} alwaysOpen>
    {#snippet actions()}
      <button
        type="button"
        class="px-4 rounded-lg min-h-[44px] text-sm font-medium"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        onclick={() => (editing = { reward: null })}
      >
        <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>{m.common.addRoleReward()}
      </button>
    {/snippet}

    {#if loaded && rewards.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.reputation.rewardsEmptyHint()}</p>
    {/if}

    {#each rewards as reward (idString(reward.roleId))}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="grow min-w-0">
          <div class="text-sm font-medium truncate" style="color: {$colorStore.text}">{roleNames.get(idString(reward.roleId)) ?? reward.roleName ?? m.common.unknownRole()}</div>
          <div class="text-xs" style="color: {$colorStore.muted}">
            {reward.xpReward ? m.reputation.rewardRequirementXp({ rep: reward.repRequired, xp: reward.xpReward }) : m.reputation.rewardRequirement({ rep: reward.repRequired })}
          </div>
        </div>
        <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton} aria-label="{m.common.edit()}: {reward.roleName}" onclick={() => (editing = { reward })}>
          <i class="fa-solid fa-pen" aria-hidden="true"></i>
        </button>
        <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton} aria-label="{m.common.delete()}: {reward.roleName}" onclick={() => remove(reward)}>
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {/each}
  </PluginCard>
</div>

{#if editing}
  <RewardSheet {guildId} reward={editing.reward} {roles} {channels} {notify} onclose={() => (editing = null)} onsaved={load} />
{/if}
