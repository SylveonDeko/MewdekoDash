<!-- components/tabs/AdvancedTab.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    blacklistedUsers: any[];
    panels: any[];
    categories: any[];
    availableRoles: any[];
    saving: boolean;
    blacklistUser: (userId: bigint, reason: string) => Promise<void>;
    unblacklistUser: (userId: bigint) => Promise<void>;
    closeInactiveTickets: (hours: number) => Promise<void>;
    showConfirm: (title: string, message: string, action: () => void, variant?: "danger" | "warning" | "info") => void;
    fetchAllData: () => Promise<void>;
  }

  let {
    blacklistedUsers,
    panels,
    categories,
    availableRoles,
    saving,
    blacklistUser,
    unblacklistUser,
    closeInactiveTickets,
    showConfirm,
    fetchAllData
  }: Props = $props();

  let inactiveHours = $state(48);
  let newBlacklistUserId = $state("");
  let newBlacklistReason = $state("");
</script>

<div class="space-y-6">
  <!-- Batch Operations -->
  <div class="rounded-2xl border p-6 shadow-2xl transition-all"
       in:fly={{ y: 20, duration: 300, delay: 100 }}
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;">

    <div class="flex items-center gap-4 mb-6">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-bolt"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Batch Operations</h2>
    </div>

    <div class="space-y-4">
      <!-- Close Inactive Tickets -->
      <div class="p-4 rounded-lg"
           style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
        <h4 class="font-semibold mb-3" style="color: {$colorStore.text}">Close Inactive Tickets</h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              Inactive for (hours)
            </label>
            <input
              bind:value={inactiveHours}
              class="w-full px-3 py-2 rounded-lg border transition-colors"
              min="1"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              type="number"
            />
          </div>
          <div class="flex items-end">
            <button
              class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] flex items-center gap-2"
              disabled={saving}
              onclick={() => showConfirm(
                "Close Inactive Tickets",
                `Close all tickets inactive for ${inactiveHours} hours?`,
                () => closeInactiveTickets(inactiveHours),
                "warning"
              )}
              style="background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b30;"
            >
              <i class="fa-solid fa-clock"></i>
              Close Inactive
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Blacklist Management -->
  <div class="rounded-2xl border p-6 shadow-2xl transition-all"
       in:fly={{ y: 20, duration: 300, delay: 200 }}
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;">

    <div class="flex items-center gap-4 mb-6">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-ban"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div class="flex-1">
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Blacklist Management</h2>
        <p class="text-sm mt-1" style="color: {$colorStore.muted}">Prevent users from creating tickets</p>
      </div>
    </div>

    <!-- Add to Blacklist -->
    <div class="p-4 rounded-lg mb-6"
         style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
      <h4 class="font-semibold mb-3" style="color: {$colorStore.text}">Add User to Blacklist</h4>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            User ID
          </label>
          <input
            bind:value={newBlacklistUserId}
            class="w-full px-3 py-2 rounded-lg border transition-colors"
            placeholder="123456789012345678"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            type="text"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Reason (Optional)
          </label>
          <input
            bind:value={newBlacklistReason}
            class="w-full px-3 py-2 rounded-lg border transition-colors"
            placeholder="Spam / Abuse"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            type="text"
          />
        </div>
        <button
          class="w-full px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] flex items-center justify-center gap-2"
          disabled={saving || !newBlacklistUserId}
          onclick={() => {
            blacklistUser(BigInt(newBlacklistUserId), newBlacklistReason);
            newBlacklistUserId = "";
            newBlacklistReason = "";
          }}
          style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
        >
          <i class="fa-solid fa-ban"></i>
          Blacklist User
        </button>
      </div>
    </div>

    <!-- Blacklisted Users List -->
    <div>
      <h4 class="font-semibold mb-4" style="color: {$colorStore.text}">
        Blacklisted Users ({blacklistedUsers.length})
      </h4>
      {#if blacklistedUsers.length === 0}
        <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">No blacklisted users</p>
      {:else}
        <div class="space-y-3">
          {#each blacklistedUsers as user}
            <div class="p-4 rounded-lg" style="background: #ef444410; border: 1px solid #ef444420;">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <p class="font-medium" style="color: {$colorStore.text}">{user.username}</p>
                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                    ID: {user.userId}
                  </p>
                  {#if user.restrictedTypes && user.restrictedTypes.length > 0}
                    <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                      Restricted: {user.restrictedTypes.join(', ')}
                    </p>
                  {/if}
                </div>
                <button
                  class="px-3 py-2 rounded-lg transition-all hover:scale-[1.02] text-sm font-medium"
                  style="background: #10b98120; color: #10b981; border: 1px solid #10b98130;"
                  onclick={() => showConfirm(
                    "Remove from Blacklist",
                    `Allow ${user.username} to create tickets again?`,
                    () => unblacklistUser(user.userId),
                    "info"
                  )}
                >
                  <i class="fa-solid fa-check"></i>
                  Remove
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
