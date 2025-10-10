<script lang="ts">
  import { slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    availableRoles,
    fetchAllData
  } = $props();

  let expanded = $state(false);
  let saving = $state(false);
  let messageId = $state("");
  let exclusive = $state(false);
  let reactions: Array<{ emoteName: string; roleId: string | null }> = $state([{ emoteName: "", roleId: null }]);

  function addReaction() {
    reactions = [...reactions, { emoteName: "", roleId: null }];
  }

  function removeReaction(index: number) {
    reactions = reactions.filter((_, i) => i !== index);
  }

  async function addReactionRole() {
    if (!$currentGuild?.id || !messageId.trim() || reactions.length === 0) return;

    try {
      saving = true;
      await administrationApi.addReactionRoles($currentGuild.id, {
        messageId: BigInt(messageId),
        exclusive,
        roles: reactions
          .filter(r => r.emoteName.trim() && r.roleId)
          .map(r => ({
            emoteName: r.emoteName,
            roleId: BigInt(r.roleId!)
          }))
      });

      messageId = "";
      exclusive = false;
      reactions = [{ emoteName: "", roleId: null }];
      expanded = false;
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to add reaction role:", err);
    } finally {
      saving = false;
    }
  }
</script>

{#if expanded}
  <div transition:slide={{ duration: 300 }} class="mb-4 p-4 rounded-xl border-2 border-dashed"
       style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}05;">
    <div class="flex items-center justify-between mb-3">
      <h5 class="font-medium" style="color: {$colorStore.text}">Add Reaction Role</h5>
      <button
        class="px-2 py-1 rounded-lg text-sm"
        style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
        onclick={() => { expanded = false; messageId = ""; exclusive = false; reactions = [{ emoteName: "", roleId: null }]; }}
      >
        Cancel
      </button>
    </div>

    <div class="space-y-3">
      <div>
        <label for="reaction-message-id" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Message
          ID</label>
        <input
          id="reaction-message-id"
          type="text"
          bind:value={messageId}
          placeholder="Enter message ID..."
          class="w-full px-3 py-2 rounded-lg border transition-colors"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
        />
        <p class="text-xs mt-1" style="color: {$colorStore.muted}">
          Right-click a message and copy ID (requires Developer Mode)
        </p>
      </div>

      <div class="flex items-center gap-2">
        <input
          id="reaction-exclusive"
          type="checkbox"
          bind:checked={exclusive}
          class="w-4 h-4 rounded"
          style="accent-color: {$colorStore.primary};"
        />
        <label for="reaction-exclusive" class="text-sm cursor-pointer" style="color: {$colorStore.text}">
          Exclusive (users can only have one role from this message)
        </label>
      </div>

      <!-- Reaction-Role Pairs -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium" style="color: {$colorStore.text}">Reactions & Roles</span>
          <button
            class="px-2 py-1 rounded-lg text-xs"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
            onclick={addReaction}
          >
            <i class="fa-solid fa-plus mr-1"></i>
            Add Reaction
          </button>
        </div>

        {#each reactions as reaction, index (index)}
          <div class="grid grid-cols-[1fr,2fr,auto] gap-2 items-end">
            <div>
              <input
                type="text"
                bind:value={reaction.emoteName}
                placeholder="Emoji or :name:"
                class="w-full px-2 py-2 rounded-lg border transition-colors text-sm"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
              />
            </div>
            <div>
              <DiscordSelector
                type="role"
                options={availableRoles}
                bind:selected={reaction.roleId}
                placeholder="Select role..."
                multiple={false}
              />
            </div>
            <button
              class="px-2 py-2 rounded-lg"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
              onclick={() => removeReaction(index)}
              disabled={reactions.length === 1}
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        {/each}
      </div>

      <button
        class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
        onclick={addReactionRole}
        disabled={!messageId.trim() || reactions.filter(r => r.emoteName.trim() && r.roleId).length === 0 || saving}
      >
        {#if saving}
          <i class="fa-solid fa-spinner fa-spin"></i>
        {:else}
          <i class="fa-solid fa-plus"></i>
        {/if}
        Add Reaction Role
      </button>
    </div>
  </div>
{:else}
  <button
    class="w-full mb-4 px-4 py-2 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
    style="background: {$colorStore.secondary}10; color: {$colorStore.secondary}; border: 2px dashed {$colorStore.secondary}40;"
    onclick={() => expanded = true}
  >
    <i class="fa-solid fa-plus"></i>
    Add Reaction Role
  </button>
{/if}
