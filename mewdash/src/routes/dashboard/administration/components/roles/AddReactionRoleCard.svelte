<script lang="ts">
  import { slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { administrationApi, clientApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { userStore } from "$lib/stores/userStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { onMount } from "svelte";

  let {
    availableRoles,
    textChannels,
    reactionRoles,
    fetchAllData
  } = $props();

  let expanded = $state(false);
  let saving = $state(false);
  let messageId = $state("");
  let channelId = $state<string | null>(null);
  let exclusive = $state(false);
  let reactions: Array<{ emoji: string | null; roleId: string | null }> = $state([{ emoji: null, roleId: null }]);
  let guildEmojis = $state<GuildEmojiInfo[]>([]);
  let loadingEmojis = $state(false);
  let errorMessage = $state("");
  let warningMessage = $state("");

  const DISCORD_MAX_REACTIONS = 20;

  // Parse Discord emoji format to get preview
  function parseEmojiForPreview(emoji: string | null): {
    type: "unicode" | "custom" | null;
    display: string;
    url?: string
  } {
    if (!emoji) return { type: null, display: "" };

    // Check if it's Discord custom emoji format: <:name:id> or <a:name:id>
    const customMatch = emoji.match(/<(a?):([^:]+):(\d+)>/);
    if (customMatch) {
      const [, animated, name, id] = customMatch;
      return {
        type: "custom",
        display: name,
        url: `https://cdn.discordapp.com/emojis/${id}.${animated === "a" ? "gif" : "webp"}?size=48`
      };
    }

    // Otherwise treat as Unicode emoji
    return {
      type: "unicode",
      display: emoji
    };
  }

  // Get role name from ID
  function getRoleName(roleId: string | null): string {
    if (!roleId) return "Select role...";
    const role = availableRoles.find(r => r.id === roleId);
    return role ? role.name : `Role ${roleId}`;
  }

  // Load guild emojis when component mounts
  onMount(async () => {
    if ($userStore?.id) {
      try {
        loadingEmojis = true;
        guildEmojis = await clientApi.getEmojis(BigInt($userStore.id), true);
      } catch (err) {
        logger.error("Failed to load guild emojis:", err);
      } finally {
        loadingEmojis = false;
      }
    }
  });

  // Calculate total unique emojis that will be on the message
  let totalEmojisOnMessage = $derived(() => {
    // Get unique emojis from current form
    const currentEmojis = new Set<string>();
    reactions.forEach(r => {
      if (r.emoji) {
        currentEmojis.add(r.emoji);
      }
    });

    // If messageId matches an existing reaction role message, add those emojis
    if (messageId.trim() && reactionRoles?.success && Array.isArray(reactionRoles?.reactionRoles)) {
      const existingMessage = reactionRoles.reactionRoles.find(
        rr => rr.messageId.toString() === messageId.trim()
      );
      if (existingMessage) {
        existingMessage.reactionRoles.forEach(r => currentEmojis.add(r.emoteName));
      }
    }

    return currentEmojis.size;
  });

  // Check if we're adding to an existing message
  let existingMessage = $derived(() => {
    if (!messageId.trim() || !reactionRoles?.success || !Array.isArray(reactionRoles?.reactionRoles)) return null;
    return reactionRoles.reactionRoles.find(
      rr => rr.messageId.toString() === messageId.trim()
    );
  });

  // Validation
  $effect(() => {
    errorMessage = "";
    warningMessage = "";

    const total = totalEmojisOnMessage();

    if (total > DISCORD_MAX_REACTIONS) {
      errorMessage = `Total emoji count (${total}) exceeds Discord's limit of ${DISCORD_MAX_REACTIONS} reactions per message!`;
    } else if (total >= DISCORD_MAX_REACTIONS - 2) {
      warningMessage = `Warning: You're approaching Discord's limit of ${DISCORD_MAX_REACTIONS} reactions per message (currently at ${total}).`;
    }

    const existing = existingMessage();
    if (existing) {
      warningMessage = `This message already has ${existing.reactionRoles.length} reaction role${existing.reactionRoles.length !== 1 ? "s" : ""}. Adding to existing setup.`;
    }
  });

  function addReaction() {
    if (reactions.length >= DISCORD_MAX_REACTIONS) {
      errorMessage = `Cannot add more than ${DISCORD_MAX_REACTIONS} reactions!`;
      return;
    }
    reactions = [...reactions, { emoji: null, roleId: null }];
  }

  function removeReaction(index: number) {
    reactions = reactions.filter((_, i) => i !== index);
  }

  function reset() {
    messageId = "";
    channelId = null;
    exclusive = false;
    reactions = [{ emoji: null, roleId: null }];
    errorMessage = "";
    warningMessage = "";
  }

  async function addReactionRole() {
    if (!$currentGuild?.id || !messageId.trim() || !channelId || reactions.length === 0) return;

    // Validate all reactions have both emoji and role selected
    const validReactions = reactions.filter(r => r.emoji && r.roleId);

    if (validReactions.length === 0) {
      errorMessage = "Please select at least one emoji and role pair.";
      return;
    }

    // Check final emoji count
    if (totalEmojisOnMessage() > DISCORD_MAX_REACTIONS) {
      errorMessage = `Cannot add reactions: total would exceed Discord's ${DISCORD_MAX_REACTIONS} emoji limit.`;
      return;
    }

    try {
      saving = true;
      errorMessage = "";

      // Create reaction role entries (one emoji per role)
      const roles: Array<{ emoteName: string; roleId: bigint }> = [];

      for (const reaction of validReactions) {
        if (reaction.emoji && reaction.roleId) {
          roles.push({
            emoteName: reaction.emoji,
            roleId: BigInt(reaction.roleId)
          });
        }
      }

      await administrationApi.addReactionRoles($currentGuild.id, {
        messageId: BigInt(messageId),
        channelId: BigInt(channelId),
        exclusive,
        roles
      });

      reset();
      expanded = false;
      await fetchAllData();
    } catch (err: any) {
      logger.error("Failed to add reaction role:", err);
      errorMessage = err?.error?.message || "Failed to add reaction roles. Please check that the message and channel IDs are correct and the bot has access.";
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
        onclick={() => { expanded = false; reset(); }}
      >
        Cancel
      </button>
    </div>

    <div class="space-y-3">
      <!-- Message ID and Channel -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="reaction-message-id" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Message
            ID</label>
          <input
            id="reaction-message-id"
            type="text"
            bind:value={messageId}
            placeholder="123456789012345678"
            class="w-full px-3 py-2 rounded-lg border transition-colors"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">Channel</label>
          <DiscordSelector
            type="channel"
            options={textChannels}
            bind:selected={channelId}
            placeholder="Select channel..."
            multiple={false}
          />
        </div>
      </div>

      <p class="text-xs" style="color: {$colorStore.muted}">
        <i class="fa-solid fa-circle-info mr-1"></i>
        Right-click a message and "Copy ID" (requires Developer Mode enabled in Discord settings)
      </p>

      <!-- Existing message warning -->
      {#if existingMessage()}
        <div class="p-3 rounded-lg border"
             style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}40;">
          <p class="text-sm" style="color: {$colorStore.accent}">
            <i class="fa-solid fa-triangle-exclamation mr-1"></i>
            This message already has {existingMessage()!.reactionRoles.length} reaction
            role{existingMessage()!.reactionRoles.length !== 1 ? 's' : ''}. Your new reactions will be added to it.
          </p>
        </div>
      {/if}

      <!-- Warning/Error Messages -->
      {#if warningMessage && !errorMessage}
        <div class="p-3 rounded-lg border"
             style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}40;">
          <p class="text-sm" style="color: {$colorStore.accent}">
            <i class="fa-solid fa-triangle-exclamation mr-1"></i>
            {warningMessage}
          </p>
        </div>
      {/if}

      {#if errorMessage}
        <div class="p-3 rounded-lg border" style="background: #ef444410; border-color: #ef444440;">
          <p class="text-sm" style="color: #ef4444">
            <i class="fa-solid fa-circle-exclamation mr-1"></i>
            {errorMessage}
          </p>
        </div>
      {/if}

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
          <span class="text-sm font-medium" style="color: {$colorStore.text}">
            Reactions & Roles
            <span class="text-xs ml-2" style="color: {$colorStore.muted}">
              ({totalEmojisOnMessage()} / {DISCORD_MAX_REACTIONS} emojis on message)
            </span>
          </span>
          <button
            class="px-2 py-1 rounded-lg text-xs"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
            onclick={addReaction}
            disabled={reactions.length >= DISCORD_MAX_REACTIONS || totalEmojisOnMessage() >= DISCORD_MAX_REACTIONS}
          >
            <i class="fa-solid fa-plus mr-1"></i>
            Add Another Pair
          </button>
        </div>

        {#each reactions as reaction, index (index)}
          <div class="grid grid-cols-[2fr,2fr,auto] gap-2 items-end">
            <div>
              <label class="block text-xs font-medium mb-1" style="color: {$colorStore.text}">Emoji</label>
              <EmojiPicker
                {guildEmojis}
                bind:selected={reaction.emoji}
                multiple={false}
                placeholder="Select emoji..."
                showUnicodeEmojis={true}
              />
            </div>
            <div>
              <label class="block text-xs font-medium mb-1" style="color: {$colorStore.text}">Role</label>
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

        <!-- Preview of configured pairs -->
        {#if reactions.filter(r => r.emoji && r.roleId).length > 0}
          <div class="mt-4 p-3 rounded-lg border"
               style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            <div class="text-xs font-medium mb-2" style="color: {$colorStore.muted}">Preview:</div>
            <div class="space-y-1">
              {#each reactions.filter(r => r.emoji && r.roleId) as reaction}
                {@const emojiInfo = parseEmojiForPreview(reaction.emoji)}
                <div class="flex items-center gap-2 text-sm" style="color: {$colorStore.text}">
                  {#if emojiInfo.type === 'custom' && emojiInfo.url}
                    <img src={emojiInfo.url} alt={emojiInfo.display} class="w-5 h-5 object-contain" />
                    <span class="font-mono text-xs" style="color: {$colorStore.muted}">{emojiInfo.display}</span>
                  {:else if emojiInfo.type === 'unicode'}
                    <span class="text-lg">{emojiInfo.display}</span>
                  {:else}
                    <i class="fa-solid fa-question-circle" style="color: {$colorStore.muted}"></i>
                  {/if}
                  <i class="fa-solid fa-arrow-right text-xs" style="color: {$colorStore.muted}"></i>
                  <span class="px-2 py-0.5 rounded-md text-xs font-medium"
                        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                    {getRoleName(reaction.roleId)}
                  </span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <button
        class="w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
        onclick={addReactionRole}
        disabled={!messageId.trim() || !channelId || reactions.filter(r => r.emoji && r.roleId).length === 0 || saving || !!errorMessage}
      >
        {#if saving}
          <i class="fa-solid fa-spinner fa-spin"></i>
          Saving...
        {:else}
          <i class="fa-solid fa-save"></i>
          Save All Reaction Roles
        {/if}
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
    Set Up New Reaction Roles
  </button>
{/if}
