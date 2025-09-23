<!-- lib/components/dashboard/EntertainmentTab.svelte -->
<script lang="ts">
    import {run} from 'svelte/legacy';

    import {fly} from "svelte/transition";
    import {onMount} from "svelte";
    import {colorStore} from "$lib/stores/colorStore";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {musicStore} from "$lib/stores/musicStore";
    import {api} from "$lib/api";
    import {logger} from "$lib/logger";
    import {Gift, Mic, Music, Play} from "lucide-svelte";

    import MusicPlayer from "$lib/components/music/MusicPlayer.svelte";

    // Props from parent


  // Derived state
  let musicStatus = $derived($musicStore.status);
  let hasActiveMusic = $derived(musicStatus?.CurrentTrack);

  // Entertainment data
  let giveaways: any[] = $state([]);
  let customVoiceConfig: any = $state(null);
  let loading = true;

  async function fetchContentData() {
    if (!$currentGuild?.id) return;

    try {
      // Fetch giveaways and custom voice data
      const [giveawaysData, customVoiceData] = await Promise.all([
        api.getGiveaways($currentGuild.id).catch(() => []),
        api.getCustomVoiceConfig($currentGuild.id).catch(() => null)
      ]);

      giveaways = (giveawaysData || []).slice(0, 3); // Show active 3
      customVoiceConfig = customVoiceData;

    } catch (err) {
      logger.error("Failed to fetch content data:", err);
      giveaways = [];
      customVoiceConfig = null;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchContentData();
  });

  run(() => {
    if ($currentGuild) {
      fetchContentData();
    }
  });

  // Music control helpers
  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
</script>

<div class="space-y-4" in:fly={{ y: 20, duration: 300 }}>
  <!-- 2-Column Layout: Music Player | Entertainment Features -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">

    <!-- Column 1: Music Player (6 columns) -->
    <div class="lg:col-span-6 space-y-4">

      <!-- Main Music Player -->
      <div class="backdrop-blur-xs rounded-xl p-4 transition-all hover:shadow-lg hover:-translate-y-px border"
           style="background: {$colorStore.primary}05;
                  border-color: {$colorStore.primary}15;">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 rounded-lg"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <Music class="w-5 h-5" style="color: {$colorStore.primary}" />
          </div>
          <h2 class="text-lg font-bold" style="color: {$colorStore.text}">Music Player</h2>
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
        <div class="backdrop-blur-xs rounded-lg p-4 transition-all hover:shadow-md border"
             style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
          <h3 class="text-lg font-semibold mb-3" style="color: {$colorStore.text}">Coming Up</h3>
          <div class="space-y-2">
            {#each musicStatus.Queue.slice(0, 3) as track, index}
              <div class="flex items-center gap-3 p-2 rounded-lg"
                   style="background: {$colorStore.primary}08;">
                <div class="w-6 h-6 rounded-sm flex items-center justify-center text-xs font-semibold"
                     style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                  {index + 1}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate text-sm" style="color: {$colorStore.text}">
                    {track.Title}
                  </div>
                  <div class="text-xs" style="color: {$colorStore.muted}">
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

    <!-- Column 2: Entertainment Features (6 columns) -->
    <div class="lg:col-span-6 space-y-4">

      <!-- Entertainment Features -->
      <div class="space-y-3">
        <!-- Custom Voice Channels -->
        <div class="backdrop-blur-xs rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
             style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <Mic class="w-5 h-5" style="color: {$colorStore.primary}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">
                  {customVoiceConfig?.enabled ? 'Active' : 'Inactive'}
                </span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Custom Voice</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">Temporary voice channels</div>
            </div>
            <a class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-105"
               href="/dashboard/customvoice"
               style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              Configure
            </a>
          </div>
        </div>

        <!-- Giveaways -->
        <div class="backdrop-blur-xs rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
             style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.accent}20;">
              <Gift class="w-5 h-5" style="color: {$colorStore.accent}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{giveaways.length}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Active Giveaways</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {giveaways.length > 0 ? `${giveaways[0]?.participants || 0} participants` : 'Host contests & prizes'}
              </div>
            </div>
            <a class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-105"
               href="/dashboard/giveaways"
               style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
              Manage
            </a>
          </div>
        </div>
      </div>

      <!-- Active Giveaways Details -->
      {#if giveaways.length > 0}
        <div class="backdrop-blur-xs rounded-lg p-4 transition-all hover:shadow-md border"
             style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
          <h3 class="text-base font-semibold mb-3" style="color: {$colorStore.text}">Active Giveaways</h3>

          <div class="space-y-2">
            {#each giveaways as giveaway}
              <div class="p-2 rounded-lg" style="background: {$colorStore.primary}08;">
                <div class="font-medium text-sm" style="color: {$colorStore.text}">
                  {giveaway.prize || giveaway.title}
                </div>
                <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                  {giveaway.participants || 0} participants
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

    </div>
  </div>
</div>