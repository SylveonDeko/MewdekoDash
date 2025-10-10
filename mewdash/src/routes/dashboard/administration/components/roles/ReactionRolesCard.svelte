<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";

  let {
    reactionRoles,
    availableRoles,
    showConfirm
  } = $props();

  function getRoleName(roleId: bigint): string {
    const role = availableRoles.find((r: any) => BigInt(r.id) === roleId);
    return role ? role.name : `Role ${roleId.toString()}`;
  }
</script>

<div class="backdrop-blur-xs rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 500 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
      <i class="fa-utility-duo fa-regular fa-at"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
    </div>
    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Reaction Roles</h2>
  </div>

  <div class="space-y-4">
    <p class="text-sm" style="color: {$colorStore.muted}">
      Allow users to get roles by reacting to messages with specific emojis
    </p>

    {#if !reactionRoles.success || reactionRoles.reactionRoles.length === 0}
      <div class="text-center py-8">
        <i class="fa-utility-duo fa-regular fa-at"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
        <p class="text-lg font-medium mt-4" style="color: {$colorStore.text}">No reaction roles configured</p>
        <p class="text-sm" style="color: {$colorStore.muted}">Set up reaction-based role assignment</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each reactionRoles.reactionRoles as rr (rr.messageId)}
          <div
            class="p-4 rounded-lg transition-all duration-200 hover:shadow-lg backdrop-blur-xs border"
            style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            <div class="flex items-center justify-between mb-3">
              <p class="font-medium" style="color: {$colorStore.text}">
                Message ID: {rr.messageId}
              </p>
              <span class="text-xs px-2 py-1 rounded-full"
                    style="background: {rr.exclusive ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
                           color: {rr.exclusive ? $colorStore.accent : $colorStore.secondary}">
                {rr.exclusive ? 'Exclusive' : 'Multiple'}
              </span>
            </div>

            <div class="space-y-2">
              {#each rr.reactionRoles as reaction (`${reaction.emoteName}-${reaction.roleId}`)}
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.muted}">
                  <span>{reaction.emoteName}</span>
                  <span>→</span>
                  <span>{getRoleName(reaction.roleId)}</span>
                </div>
              {/each}
            </div>

            <div class="mt-3 flex justify-end">
              <button
                class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                onclick={() => $currentGuild && showConfirm("Remove Reaction Role", "Remove this reaction role setup?", () => administrationApi.removeReactionRoles($currentGuild.id, rr.index))}
              >
                Remove
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
