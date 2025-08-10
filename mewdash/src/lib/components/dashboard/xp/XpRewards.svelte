<script lang="ts">
  import { AlertCircle, Star } from "lucide-svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  export let roleRewards: any[] = [];
  export let currencyRewards: any[] = [];
  export let guildRoles: any[] = [];
  export let loading: boolean = false;
  export let error: string | null = null;
  export let onAddRoleReward: (level: number, roleId: string) => void;
  export let onRemoveRoleReward: (rewardId: number) => void;
  export let onAddCurrencyReward: (level: number, amount: number) => void;
  export let onRemoveCurrencyReward: (rewardId: number) => void;

  let newRoleReward = { level: 1, roleId: "" };
  let newCurrencyReward = { level: 1, amount: 100 };

  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  function handleAddRoleReward() {
    if (newRoleReward.roleId && newRoleReward.level >= 1) {
      onAddRoleReward(newRoleReward.level, newRoleReward.roleId);
      newRoleReward = { level: 1, roleId: "" };
    }
  }

  function handleAddCurrencyReward() {
    if (newCurrencyReward.amount > 0 && newCurrencyReward.level >= 1) {
      onAddCurrencyReward(newCurrencyReward.level, newCurrencyReward.amount);
      newCurrencyReward = { level: 1, amount: 100 };
    }
  }

  $: roleOptions = guildRoles.map(role => ({
    id: role.id,
    name: role.name,
    color: role.color
  }));
</script>

<div class="flex items-center gap-3 mb-6">
  <div
    class="p-3 rounded-xl"
    style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
           color: {$colorStore.primary};"
  >
    <Star aria-hidden="true" class="w-6 h-6" />
  </div>
  <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Rewards</h2>
</div>

{#if loading}
  <div class="flex justify-center items-center min-h-[200px]">
    <div
      class="w-12 h-12 border-4 rounded-full animate-spin"
      style="border-color: {$colorStore.primary}20;
             border-top-color: {$colorStore.primary};"
      aria-label="Loading"
    >
    </div>
  </div>
{:else if error}
  <div
    class="rounded-xl p-4 flex items-center gap-3"
    style="background: {$colorStore.accent}10;"
    role="alert"
  >
    <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
    <p style="color: {$colorStore.accent}">{error}</p>
  </div>
{:else}
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
    <!-- Role Rewards -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.primary}10;"
    >
      <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Role Rewards</h3>

      <!-- Add Role Reward Form -->
      <div class="mb-6 p-4 rounded-lg" style="background: {$colorStore.primary}15;">
        <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.muted}">Add Role Reward</h4>
        <div class="grid grid-cols-1 gap-3 mb-3">
          <div>
            <label class="block text-xs mb-1" for="role-reward-level"
                   style="color: {$colorStore.muted}">Level</label>
            <input
              id="role-reward-level"
              bind:value={newRoleReward.level}
              class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200 min-h-[50px]"
              style="border-color: {$colorStore.primary}30;
                     color: {$colorStore.text};"
              type="number"
              min="1"
              aria-label="Level required for role reward"
            />
          </div>
          <div>
            <label class="block text-xs mb-1" for="role-reward-role"
                   style="color: {$colorStore.muted}">Role</label>
            <DiscordSelector
              type="role"
              options={roleOptions}
              selected={newRoleReward.roleId}
              placeholder="Select Role"
              on:change={(e) => newRoleReward.roleId = e.detail.selected}
            />
          </div>
        </div>
        <button
          class="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 min-h-[44px]"
          style="background: {$colorStore.primary}20;
                 color: {$colorStore.text};"
          on:click={handleAddRoleReward}
          aria-label="Add role reward"
        >
          Add Role Reward
        </button>
      </div>

      <!-- Role Rewards List -->
      {#if roleRewards.length === 0}
        <div class="text-center py-4" style="color: {$colorStore.muted}">
          No role rewards configured
        </div>
      {:else}
        <ul class="space-y-2">
          {#each roleRewards as reward}
            <li
              class="flex items-center justify-between p-3 rounded-lg"
              style="background: {$colorStore.primary}15;"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <div
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
                  style="background: {$colorStore.primary}20;
                         color: {$colorStore.primary};"
                >
                  {reward.level}
                </div>
                <span class="truncate" style="color: {$colorStore.text}">{reward.roleName || `Role ID: ${reward.roleId}`}</span>
              </div>
              <button
                class="p-2 rounded-full transition-all duration-200 flex-shrink-0 min-w-[44px] min-h-[44px]"
                style="background: {$colorStore.accent}20;
                       color: {$colorStore.accent};"
                on:click={() => onRemoveRoleReward(reward.id)}
                aria-label={`Remove role reward for level ${reward.level}`}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Currency Rewards -->
    <div
      class="rounded-xl p-4"
      style="background: {$colorStore.secondary}10;"
    >
      <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Currency Rewards</h3>

      <!-- Add Currency Reward Form -->
      <div class="mb-6 p-4 rounded-lg" style="background: {$colorStore.secondary}15;">
        <h4 class="text-sm font-medium mb-3" style="color: {$colorStore.muted}">Add Currency Reward</h4>
        <div class="grid grid-cols-1 gap-3 mb-3">
          <div>
            <label class="block text-xs mb-1" for="currency-reward-level" style="color: {$colorStore.muted}">Level</label>
            <input
              id="currency-reward-level"
              bind:value={newCurrencyReward.level}
              class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200 min-h-[50px]"
              style="border-color: {$colorStore.secondary}30;
                     color: {$colorStore.text};"
              type="number"
              min="1"
              aria-label="Level required for currency reward"
            />
          </div>
          <div>
            <label class="block text-xs mb-1" for="currency-reward-amount" style="color: {$colorStore.muted}">Amount</label>
            <input
              id="currency-reward-amount"
              bind:value={newCurrencyReward.amount}
              class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200 min-h-[50px]"
              style="border-color: {$colorStore.secondary}30;
                     color: {$colorStore.text};"
              type="number"
              min="1"
              aria-label="Currency amount to award"
            />
          </div>
        </div>
        <button
          class="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 min-h-[44px]"
          style="background: {$colorStore.secondary}20;
                 color: {$colorStore.text};"
          on:click={handleAddCurrencyReward}
          aria-label="Add currency reward"
        >
          Add Currency Reward
        </button>
      </div>

      <!-- Currency Rewards List -->
      {#if currencyRewards.length === 0}
        <div class="text-center py-4" style="color: {$colorStore.muted}">
          No currency rewards configured
        </div>
      {:else}
        <ul class="space-y-2">
          {#each currencyRewards as reward}
            <li
              class="flex items-center justify-between p-3 rounded-lg"
              style="background: {$colorStore.secondary}15;"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <div
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
                  style="background: {$colorStore.secondary}20;
                         color: {$colorStore.secondary};"
                >
                  {reward.level}
                </div>
                <span class="truncate" style="color: {$colorStore.text}">{formatNumber(reward.amount)} currency</span>
              </div>
              <button
                class="p-2 rounded-full transition-all duration-200 flex-shrink-0 min-w-[44px] min-h-[44px]"
                style="background: {$colorStore.accent}20;
                       color: {$colorStore.accent};"
                on:click={() => onRemoveCurrencyReward(reward.id)}
                aria-label={`Remove currency reward for level ${reward.level}`}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
{/if}