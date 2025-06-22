<!-- lib/components/dashboard/ContentTab.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { musicStore } from "$lib/stores/musicStore";
  import { api } from "$lib/api";
  import { logger } from "$lib/logger";
  import { Gift, Link, MessageSquare, Music, Play } from "lucide-svelte";

  import MusicPlayer from "$lib/components/MusicPlayer.svelte";
  import FeatureCard from "$lib/components/FeatureCard.svelte";

  // Props from parent
  export let guildFeatures: any;

  // Derived state
  $: musicStatus = $musicStore.status;
  $: hasActiveMusic = musicStatus?.CurrentTrack;

  // Chat triggers and content data
  let chatTriggers: any[] = [];
  let giveaways: any[] = [];
  let loading = true;

  async function fetchContentData() {
    if (!$currentGuild?.id) return;

    try {
      // Fetch chat triggers and giveaways data
      const [triggersData, giveawaysData] = await Promise.all([
        api.getChatTriggers($currentGuild.id).catch(() => []),
        api.getGiveaways($currentGuild.id).catch(() => [])
      ]);

      chatTriggers = (triggersData || []).slice(0, 5); // Show recent 5
      giveaways = (giveawaysData || []).slice(0, 3); // Show active 3

    } catch (err) {
      logger.error("Failed to fetch content data:", err);
      chatTriggers = [];
      giveaways = [];
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchContentData();
  });

  $: if ($currentGuild) {
    fetchContentData();
  }

  // Music control helpers
  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
</script>

<div class="space-y-6" in:fly={{ y: 20, duration: 300 }}>
  <!-- 2-Column Layout: Music Player (60%) | Content Management (40%) -->
  <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">

    <!-- Music Player Section (60% - 3 columns) -->
    <div class="xl:col-span-3 space-y-6">

      <!-- Main Music Player -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <Music class="w-6 h-6" style="color: {$colorStore.primary}" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Music Player</h2>
        </div>

        {#if hasActiveMusic}
          <MusicPlayer {musicStatus} />
        {:else}
          <!-- No Music State -->
          <div class="text-center py-12">
            <div class="w-20 h-20 rounded-full mb-6 flex items-center justify-center mx-auto"
                 style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
              <Music class="w-10 h-10" style="color: {$colorStore.primary}" />
            </div>
            <h3 class="text-xl font-semibold mb-3" style="color: {$colorStore.text}">
              No music playing
            </h3>
            <p class="mb-6" style="color: {$colorStore.muted}">
              Join a voice channel and use music commands to start playing
            </p>
            <a href="/dashboard/music"
               class="inline-flex items-center gap-2 py-3 px-6 rounded-xl transition-all hover:scale-105"
               style="background: {$colorStore.primary}; color: white; box-shadow: 0 4px 12px {$colorStore.primary}30;">
              <Play size={18} />
              Open Music Dashboard
            </a>
          </div>
        {/if}
      </div>

      <!-- Music Queue Preview (if music is playing) -->
      {#if hasActiveMusic && musicStatus?.Queue?.length > 0}
        <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text}">Coming Up</h3>
          <div class="space-y-3">
            {#each musicStatus.Queue.slice(0, 3) as track, index}
              <div class="flex items-center gap-3 p-3 rounded-xl"
                   style="background: {$colorStore.primary}08;">
                <div class="w-8 h-8 rounded flex items-center justify-center text-sm font-semibold"
                     style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                  {index + 1}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate" style="color: {$colorStore.text}">
                    {track.Title}
                  </div>
                  <div class="text-sm" style="color: {$colorStore.muted}">
                    {track.Author} • {formatDuration(track.Duration)}
                  </div>
                </div>
              </div>
            {/each}
          </div>
          {#if musicStatus.Queue.length > 3}
            <div class="mt-4 text-center">
              <a href="/dashboard/music"
                 class="text-sm" style="color: {$colorStore.primary}">
                +{musicStatus.Queue.length - 3} more tracks
              </a>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Content Management Section (40% - 2 columns) -->
    <div class="xl:col-span-2 space-y-6">

      <!-- Content Features Overview -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <MessageSquare class="w-6 h-6" style="color: {$colorStore.primary}" />
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Content Tools</h2>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <!-- Chat Triggers -->
          <FeatureCard
            animationDelay={0}
            compact={true}
            description="Automated responses to text patterns"
            href="/dashboard/chat-triggers"
            icon={MessageSquare}
            isActive={chatTriggers.length > 0}
            title="Chat Triggers"
          />

          <!-- Embed Builder -->
          <FeatureCard
            animationDelay={50}
            compact={true}
            description="Create rich embedded messages"
            href="/dashboard/embedbuilder"
            icon={Link}
            isActive={true}
            title="Embed Builder"
          />

          <!-- Giveaways -->
          <FeatureCard
            animationDelay={100}
            compact={true}
            description="Host contests and prize giveaways"
            href="/dashboard/giveaways"
            icon={Gift}
            isActive={giveaways.length > 0}
            title="Giveaways"
          />
        </div>
      </div>

      <!-- Recent Chat Triggers -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text}">Chat Triggers</h3>

        {#if loading}
          <!-- Loading state -->
          {#each Array(3).fill(0) as _}
            <div class="p-3 rounded-xl animate-pulse mb-3" style="background: {$colorStore.primary}08;">
              <div class="space-y-2">
                <div class="h-4 rounded" style="background: {$colorStore.primary}20; width: 70%;"></div>
                <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 50%;"></div>
              </div>
            </div>
          {/each}
        {:else if chatTriggers.length === 0}
          <div class="text-center py-6">
            <MessageSquare class="w-8 h-8 mx-auto mb-3" style="color: {$colorStore.primary}50" />
            <p class="text-sm" style="color: {$colorStore.muted}">
              No chat triggers configured yet.
            </p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each chatTriggers as trigger}
              <div class="p-3 rounded-xl" style="background: {$colorStore.primary}08;">
                <div class="font-medium text-sm" style="color: {$colorStore.text}">
                  {trigger.trigger || trigger.name}
                </div>
                <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                  {trigger.response ? trigger.response.substring(0, 60) + '...' : 'Custom response'}
                </div>
              </div>
            {/each}
          </div>

          <div class="mt-4 text-center">
            <a href="/dashboard/chat-triggers"
               class="text-sm" style="color: {$colorStore.primary}">
              Manage all triggers →
            </a>
          </div>
        {/if}
      </div>

      <!-- Active Giveaways -->
      {#if giveaways.length > 0}
        <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text}">Active Giveaways</h3>

          <div class="space-y-3">
            {#each giveaways as giveaway}
              <div class="p-3 rounded-xl" style="background: {$colorStore.primary}08;">
                <div class="font-medium text-sm" style="color: {$colorStore.text}">
                  {giveaway.prize || giveaway.title}
                </div>
                <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                  {giveaway.participants || 0} participants
                </div>
              </div>
            {/each}
          </div>

          <div class="mt-4 text-center">
            <a href="/dashboard/giveaways"
               class="text-sm" style="color: {$colorStore.primary}">
              Manage giveaways →
            </a>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>