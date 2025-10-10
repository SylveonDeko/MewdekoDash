<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    gameVoiceChannel,
    newVoiceChannelRole = $bindable(),
    voiceChannels,
    guildChannels,
    toggleGameVoiceChannel
  } = $props();

  function getChannelName(channelId: bigint | null): string {
    if (!channelId) return "None";
    const channel = guildChannels.find((c: any) => BigInt(c.id) === channelId);
    return channel ? channel.name : `Channel ${channelId.toString()}`;
  }
</script>

<div class="backdrop-blur-xs rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 500 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
      <i class="fa-utility-duo fa-regular fa-headphones"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
    </div>
    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Game Voice Channel</h2>
  </div>

  <div class="space-y-4">
    <p class="text-sm" style="color: {$colorStore.muted}">
      Automatically move users to matching voice channels based on their game activity
    </p>

    <div class="flex items-center justify-between">
      <div>
        <p class="font-medium" style="color: {$colorStore.text}">
          Current Channel: {gameVoiceChannel ? getChannelName(gameVoiceChannel) : "None"}
        </p>
      </div>

      {#if gameVoiceChannel}
        <button
          class="px-4 py-2 rounded-lg font-medium transition-colors"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
          onclick={() => toggleGameVoiceChannel(gameVoiceChannel)}
        >
          Disable
        </button>
      {/if}
    </div>

    <div class="space-y-2">
      <span class="block text-sm font-medium" id="set-game-voice-channel-label"
            style="color: {$colorStore.text}">
        Set Game Voice Channel
      </span>
      <DiscordSelector
        bind:selected={newVoiceChannelRole.channelId}
        multiple={false}
        options={voiceChannels}
        placeholder="Select voice channel..."
        type="channel"
      />
      <p class="text-xs" style="color: {$colorStore.muted}">
        Select voice channel for automatic game-based voice routing
      </p>

      {#if newVoiceChannelRole.channelId}
        <button
          class="px-4 py-2 rounded-lg font-medium transition-colors"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => toggleGameVoiceChannel(BigInt(newVoiceChannelRole.channelId))}
        >
          Set as Game Voice Channel
        </button>
      {/if}
    </div>
  </div>
</div>
