<!-- routes/dashboard/+page.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { api } from "$lib/api";
  import { fade, fly } from "svelte/transition";
  import type { BotStatusModel } from "$lib/types/models.ts";
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";
  import reducedMotion from "$lib/reducedMotion";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { browser } from "$app/environment";
  import Vibrant from 'node-vibrant/lib/browser'
  import {
    Play, Pause, SkipForward, SkipBack,
    Volume2, Volume1, Volume, VolumeX,
    List, Repeat, Mic2, Bot, ChartBar,
    Server, Code, Users, Activity, Library,
    Music, Music2, Clock
  } from 'lucide-svelte';

  let botStatus: BotStatusModel | null = null;
  let loading = true;
  let error: string | null = null;
  let musicStatus: any = null;
  let musicInterval: NodeJS.Timeout;
  let isMobile = false;
  let showFullQueue = false;
  let colors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    text: '#ffffff',
    muted: '#9ca3af'
  };
  export let data: PageData;

  async function extractColors() {
    if (!botStatus?.botAvatar) return;
    try {
        const img = new Image();
        img.crossOrigin = "Anonymous";  // Add this for CORS
        img.src = botStatus.botAvatar;

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        const vibrant = new Vibrant(img);
        const palette = await vibrant.getPalette();

        colors = {
            primary: palette.Vibrant?.hex || '#3b82f6',
            secondary: palette.Muted?.hex || '#8b5cf6',
            accent: palette.LightVibrant?.hex || '#ec4899',
            text: palette.Vibrant?.titleTextColor || '#ffffff',
            muted: palette.DarkMuted?.hex || '#9ca3af'
        };
    } catch (err) {
        console.error('Failed to extract colors:', err);
    }
}

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  async function fetchMusicStatus() {
    try {
      if (!$currentGuild?.id || !data.user?.id) return;
      musicStatus = await api.getPlayerStatus($currentGuild.id, data.user.id);
    } catch (err) {
      console.error("Failed to fetch music status:", err);
    }
  }

  async function togglePlayPause() {
    try {
      if (!$currentGuild?.id) return;
      await api.pauseResume($currentGuild.id);
      await fetchMusicStatus();
    } catch (err) {
      console.error("Failed to toggle playback:", err);
    }
  }

  async function skipTrack() {
    try {
      if (!$currentGuild?.id) return;
      await api.skipTrack($currentGuild.id);
      await fetchMusicStatus();
    } catch (err) {
      console.error("Failed to skip track:", err);
    }
  }

  async function previousTrack() {
    try {
      if (!$currentGuild?.id) return;
      await api.previousTrack($currentGuild.id);
      await fetchMusicStatus();
    } catch (err) {
      console.error("Failed to go to previous track:", err);
    }
  }

  async function handleVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    try {
      if (!$currentGuild?.id) return;
      await api.setVolume($currentGuild.id, parseInt(input.value));
      await fetchMusicStatus();
    } catch (err) {
      console.error("Failed to update volume:", err);
    }
  }

  function formatTime(time: any): string {
    if (!time) return "0:00";
    if (typeof time === "string") {
      const parts = time.split(":");
      if (parts.length === 3) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseInt(parts[2]);
        return `${hours * 60 + minutes}:${seconds.toString().padStart(2, "0")}`;
      } else if (parts.length === 2) {
        return time;
      }
    }
    if (typeof time === "object" && time.relativePosition) {
      const match = time.relativePosition.match(/(\d+):(\d+)\.(\d+)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      }
    }
    return "0:00";
  }

  function getVolumeIcon(volume: number) {
    if (volume === 0) return VolumeX;
    if (volume < 0.33) return Volume;
    if (volume < 0.67) return Volume1;
    return Volume2;
  }

  function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "online": return colors.primary;
      case "idle": return colors.secondary;
      case "dnd": return colors.accent;
      default: return colors.muted;
    }
  }

  onMount(async () => {
    if (!data || !data.user) await goto("/api/discord/login");
    try {
      botStatus = await api.getBotStatus();
      await extractColors();
      await fetchMusicStatus();
      musicInterval = setInterval(fetchMusicStatus, 1000);
      checkMobile();
      if (browser) window.addEventListener("resize", checkMobile);
    } catch (err) {
      error = "Failed to fetch status";
      console.error(error, err);
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    if (musicInterval) clearInterval(musicInterval);
    if (browser) window.removeEventListener("resize", checkMobile);
  });

  $: colorVars = `
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-text: ${colors.text};
    --color-muted: ${colors.muted};
  `;
</script>

<div
  class="min-h-screen"
  style="{colorVars} background: radial-gradient(ellipse at top, {colors.primary}10, {colors.secondary}10, {colors.accent}10);"
>
  <div class="container mx-auto px-4 py-6">
    <div class="relative flex justify-center items-center mb-12">
      <h1 class="text-4xl font-bold" style="color: {colors.text}">
        Mewdeko Dashboard
      </h1>
    </div>

    {#if loading}
      <div class="flex justify-center items-center h-64" aria-live="polite">
        <div class="relative">
          <div class="w-16 h-16 border-4 rounded-full animate-spin" style="border-color: {colors.primary}20; border-top-color: {colors.primary}"></div>
        </div>
      </div>
    {:else if error}
      <div class="p-6 rounded-xl mb-6" role="alert" style="background: {colors.accent}10; border: 1px solid {colors.accent}40;">
        <div class="flex items-center gap-3">
          <Bot class="w-6 h-6" style="color: {colors.accent}" />
          <div style="color: {colors.accent}">
            <div class="font-semibold text-lg">Error Occurred</div>
            <div class="text-sm mt-1" style="color: {colors.accent}90">{error}</div>
          </div>
        </div>
      </div>
    {:else}
      {#if musicStatus?.currentTrack}
        <div
          class="w-full backdrop-blur-sm rounded-2xl border p-6 mb-8 shadow-2xl"
          style="background: linear-gradient(to bottom right, {colors.primary}10, {colors.secondary}10);
                 border-color: {colors.primary}30;"
          transition:fade
        >
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Album Art & Track Info -->
            <div class="flex flex-row gap-6 flex-grow">
              <div class="relative group min-w-[120px] md:min-w-[160px]">
                <img
                  src={musicStatus.currentTrack.track.artworkUri || '/default-album.png'}
                  alt="Album Art"
                  class="w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center"
                  style="background: {colors.primary}40;"
                >
                  <Music2 class="w-8 h-8" style="color: {colors.text}" />
                </div>
              </div>

              <div class="flex flex-col justify-between flex-grow">
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <span
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      style="background: {colors.primary}20; color: {colors.primary};"
                    >
                      {musicStatus.currentTrack.track.provider || "Unknown"}
                    </span>
                  </div>
                  <h2
                    class="text-xl md:text-2xl font-bold mb-1 truncate"
                    style="color: {colors.text}"
                  >
                    {musicStatus.currentTrack.track.title}
                  </h2>
                  <p
                    class="text-sm md:text-base truncate"
                    style="color: {colors.muted}"
                  >
                    {musicStatus.currentTrack.track.author}
                  </p>
                </div>

                <!-- Progress Bar -->
                <div class="space-y-2 w-full">
                  <div class="relative w-full h-2 rounded-full overflow-hidden group cursor-pointer" style="background: {colors.primary}20;">
                    <div
                      class="h-full rounded-full transition-all duration-200"
                      style="background: linear-gradient(to right, {colors.primary}, {colors.secondary}); width: {(() => {
                        const position = musicStatus.position?.relativePosition || '00:00:00';
                        const duration = musicStatus.currentTrack.track.duration || '00:00:00';
                        const getSeconds = (timeStr) => {
                          const parts = timeStr.split(':');
                          return parts.length === 3
                            ? parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
                            : 0;
                        };
                        return ((getSeconds(position) / getSeconds(duration)) * 100) + '%';
                      })()}"
                    />
                  </div>
                  <div class="flex justify-between text-xs font-medium" style="color: {colors.muted}">
                    <span>{formatTime(musicStatus.position)}</span>
                    <span>{formatTime(musicStatus.currentTrack.track.duration)}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Controls -->
            {#if musicStatus.isInVoiceChannel}
              <div class="flex md:flex-col justify-between items-center md:items-end gap-6 pt-4 md:pt-0">
                <div class="flex items-center gap-4">
                  <button
                    class="p-3 rounded-full transition-all duration-200"
                    style="color: {colors.muted}; hover:color: {colors.text}; hover:background: {colors.primary}20;"
                    on:click={previousTrack}
                    aria-label="Previous Track"
                  >
                    <SkipBack class="w-6 h-6" />
                  </button>

                  <button
                    class="p-4 rounded-full transition-all duration-300 transform hover:scale-105"
                    style="background: linear-gradient(to right, {colors.primary}, {colors.secondary});"
                    on:click={togglePlayPause}
                    aria-label={musicStatus.state === 'Playing' ? 'Pause' : 'Play'}
                  >
                    <svelte:component this={musicStatus.state === 'Playing' ? Pause : Play} class="w-6 h-6" style="color: {colors.text}" />
                  </button>

                  <button
                    class="p-3 rounded-full transition-all duration-200"
                    style="color: {colors.muted}; hover:color: {colors.text}; hover:background: {colors.primary}20;"
                    on:click={skipTrack}
                    aria-label="Next Track"
                  >
                    <SkipForward class="w-6 h-6" />
                  </button>
                </div>

                <div class="flex items-center gap-3">
                  <svelte:component
                    this={getVolumeIcon(musicStatus.volume)}
                    class="w-5 h-5"
                    style="color: {colors.muted}"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicStatus.volume * 100}
                    class="volume-slider"
                    style="--slider-color: {colors.primary}"
                    aria-label="Volume"
                    on:change={handleVolumeChange}
                  />
                </div>
              </div>
            {:else}
              <div
                class="flex items-center gap-2 px-4 py-2 rounded-lg"
                style="background: {colors.primary}20;"
              >
                <Mic2 class="w-5 h-5" style="color: {colors.muted}" />
                <span style="color: {colors.muted}">Join voice channel for playback</span>
              </div>
            {/if}
          </div>

          <!-- Queue -->
          {#if musicStatus.queue?.length > 0}
            <div class="mt-8 pt-6" style="border-top: 1px solid {colors.primary}20;">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <List class="w-5 h-5" style="color: {colors.primary}" />
                  <h3 style="color: {colors.primary}">Queue</h3>
                  <span
                    class="px-2 py-0.5 text-xs rounded-full"
                    style="background: {colors.primary}20; color: {colors.muted};"
                  >
                    {musicStatus.queue.length} tracks
                  </span>
                </div>
              </div>

              <div class="space-y-2">
                {#each musicStatus.queue.slice(0, showFullQueue ? undefined : (isMobile ? 2 : 3)) as track}
                 <div
                   class="flex items-center gap-4 p-3 rounded-xl transition-all duration-200"
                   style="background: {colors.primary}10; hover:background: {colors.primary}20;"
                 >
                   <Music class="w-5 h-5" style="color: {colors.muted}" />
                   <div class="flex-grow truncate">
                     <p class="text-sm font-medium truncate" style="color: {colors.text}">{track.track.title}</p>
                     <p class="text-xs truncate" style="color: {colors.muted}">{track.track.author}</p>
                   </div>
                   <div class="flex items-center gap-2">
                     <Clock class="w-4 h-4" style="color: {colors.muted}" />
                     <span style="color: {colors.muted}" class="text-xs">{formatTime(track.track.duration)}</span>
                   </div>
                 </div>
               {/each}

               {#if musicStatus.queue.length > (isMobile ? 2 : 3) && !showFullQueue}
                 <button
                   class="w-full p-3 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                   style="background: {colors.primary}10; color: {colors.muted}; hover:background: {colors.primary}20; hover:color: {colors.primary}"
                   on:click={() => showFullQueue = true}
                 >
                   <List class="w-4 h-4" />
                   <span>Show all {musicStatus.queue.length} tracks</span>
                 </button>
               {/if}
             </div>
           </div>
         {/if}
       </div>
     {/if}

     <!-- Bot Status Cards -->
     {#if botStatus}
       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" in:fade>
         <!-- Bot Profile Card -->
         <div
           class="col-span-full backdrop-blur-sm rounded-2xl border shadow-2xl overflow-hidden"
           style="background: linear-gradient(to bottom right, {colors.primary}10, {colors.secondary}10); border-color: {colors.primary}30;"
         >
           <div class="relative h-48 md:h-64">
             {#if botStatus.botBanner}
               <div class="absolute inset-0">
                 <img
                   src={botStatus.botBanner}
                   alt=""
                   class="w-full h-full object-cover"
                 />
                 <div class="absolute inset-0" style="background: linear-gradient(to top, {colors.primary}90, transparent)"></div>
               </div>
             {:else}
               <div class="absolute inset-0" style="background: linear-gradient(to bottom right, {colors.primary}20, {colors.secondary}20, {colors.accent}20)"></div>
             {/if}

             <div class="absolute bottom-0 left-0 right-0 p-6">
               <div class="flex items-end gap-6">
                 <div class="relative group">
                   <div
                     class="absolute -inset-1 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"
                     style="background: linear-gradient(to right, {colors.primary}, {colors.secondary})"
                   ></div>
                   <img
                     src={botStatus.botAvatar}
                     alt=""
                     class="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white object-cover"
                   />
                 </div>
                 <div class="flex-grow">
                   <h2 class="text-3xl md:text-4xl font-bold mb-2" style="color: {colors.text}">{botStatus.botName}</h2>
                   <p style="color: {colors.muted}">Version {botStatus.botVersion}</p>
                 </div>
               </div>
             </div>
           </div>
         </div>

         <!-- Status Card -->
         <div
           class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-colors duration-300"
           style="background: linear-gradient(to bottom right, {colors.primary}10, {colors.secondary}10);
                  border-color: {colors.primary}30;
                  hover:border-color: {colors.primary}50;"
         >
           <div class="flex items-center gap-4 mb-6">
             <div
               class="p-3 rounded-xl"
               style="background: linear-gradient(to bottom right, {colors.primary}20, {colors.secondary}20);
                      color: {colors.primary};"
             >
               <Bot class="w-6 h-6" />
             </div>
             <h2 class="text-xl font-bold" style="color: {colors.text}">Bot Status</h2>
           </div>
           <div class="space-y-4">
             <div class="flex items-center justify-between">
               <span style="color: {colors.muted}">Status</span>
               <div class="flex items-center gap-2">
                 <div class="w-2 h-2 rounded-full" style="background: {getStatusColor(botStatus.botStatus)}"></div>
                 <span class="capitalize" style="color: {colors.text}">{botStatus.botStatus}</span>
               </div>
             </div>
             <div class="flex items-center justify-between">
               <span style="color: {colors.muted}">Latency</span>
               <span class="font-medium" style="color: {colors.text}">{botStatus.botLatency}ms</span>
             </div>
           </div>
         </div>

         <!-- Stats Card -->
         <div
           class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-colors duration-300"
           style="background: linear-gradient(to bottom right, {colors.primary}10, {colors.secondary}10);
                  border-color: {colors.primary}30;
                  hover:border-color: {colors.primary}50;"
         >
           <div class="flex items-center gap-4 mb-6">
             <div
               class="p-3 rounded-xl"
               style="background: linear-gradient(to bottom right, {colors.primary}20, {colors.secondary}20);
                      color: {colors.primary};"
             >
               <ChartBar class="w-6 h-6" />
             </div>
             <h2 class="text-xl font-bold" style="color: {colors.text}">Bot Stats</h2>
           </div>
           <div class="grid grid-cols-1 gap-4">
             <div class="flex items-center justify-between p-3 rounded-xl" style="background: {colors.primary}10">
               <div class="flex items-center gap-3">
                 <Code class="w-5 h-5" style="color: {colors.primary}" />
                 <span style="color: {colors.muted}">Commands</span>
               </div>
               <span class="font-medium" style="color: {colors.text}">{botStatus.commandsCount}</span>
             </div>
             <div class="flex items-center justify-between p-3 rounded-xl" style="background: {colors.primary}10">
               <div class="flex items-center gap-3">
                 <Library class="w-5 h-5" style="color: {colors.secondary}" />
                 <span style="color: {colors.muted}">Modules</span>
               </div>
               <span class="font-medium" style="color: {colors.text}">{botStatus.modulesCount}</span>
             </div>
             <div class="flex items-center justify-between p-3 rounded-xl" style="background: {colors.primary}10">
               <div class="flex items-center gap-3">
                 <Users class="w-5 h-5" style="color: {colors.accent}" />
                 <span style="color: {colors.muted}">Users</span>
               </div>
               <span class="font-medium" style="color: {colors.text}">{botStatus.userCount}</span>
             </div>
           </div>
         </div>

         <!-- Technical Info Card -->
         <div
           class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-colors duration-300"
           style="background: linear-gradient(to bottom right, {colors.primary}10, {colors.secondary}10);
                  border-color: {colors.primary}30;
                  hover:border-color: {colors.primary}50;"
         >
           <div class="flex items-center gap-4 mb-6">
             <div
               class="p-3 rounded-xl"
               style="background: linear-gradient(to bottom right, {colors.primary}20, {colors.secondary}20);
                      color: {colors.primary};"
             >
               <Server class="w-6 h-6" />
             </div>
             <h2 class="text-xl font-bold" style="color: {colors.text}">Technical Info</h2>
           </div>
           <div class="space-y-4">
             <div class="flex items-center justify-between p-3 rounded-xl" style="background: {colors.primary}10">
               <span style="color: {colors.muted}">Discord.NET</span>
               <span class="font-medium" style="color: {colors.text}">{botStatus.dNetVersion}</span>
             </div>
             <div class="flex items-center justify-between p-3 rounded-xl" style="background: {colors.primary}10">
               <span style="color: {colors.muted}">Commit</span>
               <span class="font-mono font-medium" style="color: {colors.text}">{botStatus.commitHash}</span>
             </div>
           </div>
         </div>
       </div>
     {/if}
   {/if}
 </div>
</div>

<style lang="postcss">
 .volume-slider {
   @apply w-24 h-1.5 rounded-full appearance-none cursor-pointer;
   background: var(--slider-color)20;
 }

 .volume-slider::-webkit-slider-thumb {
   @apply appearance-none w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-125;
   background: var(--slider-color);
   margin-top: -3px;
 }

 .volume-slider::-moz-range-thumb {
   @apply w-3 h-3 rounded-full border-0 cursor-pointer transition-all duration-200 hover:scale-125;
   background: var(--slider-color);
 }

 :global(*::-webkit-scrollbar) {
   @apply w-2;
 }

 :global(*::-webkit-scrollbar-track) {
   background: var(--color-primary)10;
   @apply rounded-full;
 }

 :global(*::-webkit-scrollbar-thumb) {
   background: var(--color-primary)30;
   @apply rounded-full;
 }

 :global(*::-webkit-scrollbar-thumb:hover) {
   background: var(--color-primary)50;
 }
</style>