<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";

  let {
    reactionRoles,
    availableRoles,
    textChannels,
    showConfirm,
    fetchAllData
  } = $props();

  function getRoleName(roleId: bigint): string {
    const role = availableRoles.find((r: any) => r.id === roleId);
    return role ? role.name : `Role ${roleId.toString()}`;
  }

  function getChannelName(channelId: bigint): string {
    const channel = textChannels?.find((c: any) => c.id === channelId.toString());
    return channel ? `#${channel.name}` : `Channel ${channelId.toString()}`;
  }

  async function removeReactionRole(index: number) {
    if (!$currentGuild) return;
    try {
      await administrationApi.removeReactionRoles($currentGuild.id, index);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to remove reaction role:", err);
    }
  }

  // Parse Discord emoji format to get preview
  function parseEmojiForPreview(emoji: string): { type: "unicode" | "custom" | null; display: string; url?: string } {
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
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 500 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
      <i class="fa-utility-duo fa-regular fa-face-smile"
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
        <i class="fa-utility-duo fa-regular fa-face-smile"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
        <p class="text-lg font-medium mt-4" style="color: {$colorStore.text}">No reaction roles configured</p>
        <p class="text-sm" style="color: {$colorStore.muted}">Set up reaction-based role assignment</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each reactionRoles.reactionRoles as rr, index (`${rr.messageId}-${index}`)}
          <div
            class="p-4 rounded-lg transition-all duration-200 hover:shadow-lg  border"
            style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="font-medium" style="color: {$colorStore.text}">
                  Message ID: {rr.messageId.toString()}
                </p>
                <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                  {getChannelName(rr.channelId)} • {rr.reactionRoles.length}
                  reaction{rr.reactionRoles.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span class="text-xs px-2 py-1 rounded-full"
                    style="background: {rr.exclusive ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
                           color: {rr.exclusive ? $colorStore.accent : $colorStore.secondary}">
                {rr.exclusive ? 'Exclusive' : 'Multiple'}
              </span>
            </div>

            <div class="space-y-2">
              {#each rr.reactionRoles as reaction (`${reaction.emoteName}-${reaction.roleId}`)}
                {@const emojiInfo = parseEmojiForPreview(reaction.emoteName)}
                <div class="flex items-center gap-2 text-sm" style="color: {$colorStore.text}">
                  {#if emojiInfo.type === 'custom' && emojiInfo.url}
                    <img src={emojiInfo.url} alt={emojiInfo.display} class="w-5 h-5 object-contain" />
                    <span class="font-mono text-xs" style="color: {$colorStore.muted}">{emojiInfo.display}</span>
                  {:else if emojiInfo.type === 'unicode'}
                    <span class="text-lg">{emojiInfo.display}</span>
                  {:else}
                    <span class="text-lg">{reaction.emoteName}</span>
                  {/if}
                  <i class="fa-solid fa-arrow-right text-xs" style="color: {$colorStore.muted}"></i>
                  <span class="px-2 py-0.5 rounded-md text-xs font-medium"
                        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                    {getRoleName(reaction.roleId)}
                  </span>
                </div>
              {/each}
            </div>

            <div class="mt-3 flex justify-end">
              <button
                class="px-3 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                onclick={() => showConfirm("Remove Reaction Role", "Remove this reaction role setup?", () => removeReactionRole(index))}
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
