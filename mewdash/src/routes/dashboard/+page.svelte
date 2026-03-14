<script lang="ts">

    import { onDestroy, onMount } from "svelte";
    import {
        botStatusApi,
        type BotStatus,
        clientApi,
        type GraphStatsResponse,
        guildApi,
        inviteTrackingApi,
        joinLeaveApi,
        roleGreetApi,
        roleStatesApi
    } from "$lib/api/index.ts";
    import { fade, fly } from "svelte/transition";
    import { goto } from "$app/navigation";
    import { currentGuild } from "$lib/stores/currentGuild";
    import { currentInstance } from "$lib/stores/instanceStore";
    import { colorStore } from "$lib/stores/colorStore";
    import { logger } from "$lib/logger";
    import { browser } from "$app/environment";

    // Import  components
    import TabbedDashboard from "$lib/components/layout/TabbedDashboard.svelte";
    import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
    import KeyboardShortcuts from "$lib/components/specialized/KeyboardShortcuts.svelte";

    // Import stores
    import { musicStore } from "$lib/stores/musicStore";
    import { inviteStore } from "$lib/stores/inviteStore";
    import { dashboardStore } from "$lib/stores/dashboardStore";
    import { userAdminGuilds } from "$lib/stores/adminGuildsStore.ts";
    import { switchingServer as switchingServerStore } from "$lib/stores/guildSwitchStore";

    // Import search component

    let { data } = $props();

    // State management
    let currentUser = data.user;
    let botStatus: BotStatus | null = $state(null);
    let loading = $state(true);
    let error: string | null = $state(null);
    let refreshing = $state(false);
    let joinStats: GraphStatsResponse | null = $state(null);
    let leaveStats: GraphStatsResponse | null = $state(null);
    let showShortcuts = $state(false);
    let showMusicNotification = $state(false);
    let musicJustStarted = $state(false);
    let playerExists = $state(false);
    // Halloween easter egg state
    let showWitch = $state(false);
    let witchMessage = $state("");
    let showBats = $state(false);
    let halloweenTriggered = $state(false);
    let halloweenKeySequence = $state("");
    const HALLOWEEN_SECRET = "hallo"; // Secret word to trigger manually

    // Derived state
    let musicStatus = $derived($musicStore.status);
    // Track if music player exists based on status
    let hasMusicPlayer = $derived(!!musicStatus && (musicStatus.IsInVoiceChannel === true || !!musicStatus.CurrentTrack));

    // Tab state for mini player - initialize with default value
    let currentActiveTab = $state("overview");

    // Track when data is being fetched to prevent duplicate requests
    let fetchingData = false;

    let switchingServer = $derived($switchingServerStore);

    // Guild detailed information
    let guildInfo = $state<any>(null);

    // Role statistics
    let roleStats = $state({
        totalRoleStates: 0,
        activeRoleGreets: 0,
        savedRoles: 0,
        totalRoles: 0,
        previousTotalRoles: 0
    });

    // Guild member statistics
    let guildMemberStats = $state({
        totalMembers: 0,
        botMembers: 0,
        humanMembers: 0,
        previousMemberCount: 0
    });

    // Feature flags for guild
    let guildFeatures = $state({
        inviteTracking: false,
        roleStates: false,
        roleGreets: false,
        multiGreets: false,
        starboard: false,
        suggestions: false,
        musicEnabled: false,
        giveawaysEnabled: false
    });

    // Description for features


    // Tooltip data for stats
    let memberTooltipData = $derived([
        {label: "Human Members", value: guildMemberStats.humanMembers},
        {label: "Bot Members", value: guildMemberStats.botMembers},
        {label: "Total Members", value: guildMemberStats.totalMembers}
    ]);

    let roleTooltipData = $derived([
        {label: "Total Roles", value: roleStats.totalRoles},
        {label: "Saved Roles", value: roleStats.savedRoles},
        {label: "Role States", value: roleStats.totalRoleStates},
        {label: "Role Greets", value: roleStats.activeRoleGreets}
    ]);

    // Unified data fetching
    async function fetchRoleStats() {
        try {
            if (!$currentGuild?.id) return;

            const [roleStates, roleGreets, roleList] = await Promise.all([
                roleStatesApi.getAllRoleStates($currentGuild.id),
                roleGreetApi.getAllRoleGreets($currentGuild.id),
                clientApi.getRoles($currentGuild.id)
            ]);

            // Store previous value for trend
            roleStats.previousTotalRoles = roleStats.totalRoles;

            roleStats = {
                totalRoleStates: roleStates?.length || 0,
                activeRoleGreets: roleGreets.filter(g => !g.disabled).length || 0,
                savedRoles: roleStates.reduce((sum, state) => {
                    if (!state.savedRoles || state.savedRoles.trim() === "") return sum;
                    return sum + state.savedRoles.split(",").filter(role => role.trim() !== "").length;
                }, 0),
                totalRoles: roleList.length || 0,
                previousTotalRoles: roleStats.totalRoles
            };
        } catch (err) {
            logger.error("Failed to fetch role stats:", err);
        }
    }

    async function fetchGuildMemberStats() {
        try {
            if (!$currentGuild?.id) return;

            const members = await clientApi.getMembers($currentGuild.id);

            // Store previous value for trends
            guildMemberStats.previousMemberCount = guildMemberStats.totalMembers;

            // Count bots vs humans using Discord.NET's IsBot property
            const botMembers = members.filter(member => member.isBot).length;

            guildMemberStats = {
                totalMembers: members.length,
                botMembers: botMembers,
                humanMembers: members.length - botMembers,
                previousMemberCount: guildMemberStats.totalMembers
            };
        } catch (err) {
            logger.error("Failed to fetch guild member stats:", err);
        }
    }

    async function fetchStats() {
        if (!$currentGuild?.id) return;

        try {
            const [joinData, leaveData] = await Promise.all([
                joinLeaveApi.getJoinStats($currentGuild.id),
                joinLeaveApi.getLeaveStats($currentGuild.id)
            ]);

            joinStats = joinData;
            leaveStats = leaveData;
        } catch (err) {
            logger.error("Failed to fetch join/leave stats:", err);
        }
    }

    async function fetchFeatures() {
        try {
            if (!$currentGuild?.id) return;

            const [
                roleStateSettings,
                guildSettingsResponse,
                roleGreets,
                inviteTrackingSettings
            ] = await Promise.all([
                roleStatesApi.getRoleStateSettings($currentGuild.id),
                guildApi.getGuildConfig($currentGuild.id),
                roleGreetApi.getAllRoleGreets($currentGuild.id),
                inviteTrackingApi.getInviteSettings($currentGuild.id)
            ]);

            guildFeatures = {
                // Fix the circular reference by using actual response data
                inviteTracking: inviteTrackingSettings?.isEnabled || false,
                roleStates: roleStateSettings?.enabled || false,
                roleGreets: (roleGreets?.length || 0) > 0,
                multiGreets: (guildSettingsResponse?.multiGreetType || 0) > 0,
                starboard: false,
                suggestions: !!(guildSettingsResponse?.sugchan || guildSettingsResponse?.sugchan),
                musicEnabled: true,
                giveawaysEnabled: !!guildSettingsResponse?.giveawayEndMessage
            };
        } catch (err) {
            logger.error("Failed to fetch features:", err);
            // Ensure all features have boolean values even on error
            guildFeatures = {
                inviteTracking: false,
                roleStates: false,
                roleGreets: false,
                multiGreets: false,
                starboard: false,
                suggestions: false,
                musicEnabled: true,
                giveawaysEnabled: false
            };
        }
    }

    // Format numbers nicely

    // Calculate role trend

    // Unified data fetch
    async function fetchAllData() {
        if (fetchingData) return;
        fetchingData = true;
        refreshing = true;

        try {
            if (browser) {
                // Add a subtle refresh animation
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            if (!$currentGuild?.id) {
                botStatus = await botStatusApi.getBotStatus();
                return;
            }

            await Promise.all([
                fetchBotStatus(),
                fetchGuildInfo(),
                fetchRoleStats(),
                fetchGuildMemberStats(),
                fetchStats(),
                fetchFeatures(),
                inviteStore.fetchStats($currentGuild.id)
            ]);

            dashboardStore.setLastUpdated(new Date());
        } catch (err) {
            error = (err as any).message || "An error occurred while fetching data";
            logger.error("Dashboard data fetch error:", err);
        } finally {
            fetchingData = false;
            refreshing = false;
        }
    }

    async function fetchBotStatus() {
        try {
            botStatus = await botStatusApi.getBotStatus();
        } catch (err) {
            logger.error("Failed to fetch bot status:", err);
            error = "Failed to fetch bot status";
        }
    }

    async function fetchGuildInfo() {
        try {
            if (!$currentGuild?.id) return;
            guildInfo = await guildApi.getGuildInfo($currentGuild.id);
        } catch (err) {
            logger.error("Failed to fetch guild info:", err);
        }
    }

    // Music event handlers
    function handleMusicStarted(event: Event) {
        const customEvent = event as CustomEvent;
        logger.info("Music started event received", customEvent.detail);
        musicJustStarted = true;
        showMusicNotification = true;

        // Auto-hide notification after 5 seconds
        setTimeout(() => {
            showMusicNotification = false;
        }, 5000);

        // Reset the "just started" flag after animation
        setTimeout(() => {
            musicJustStarted = false;
        }, 1000);
    }

    function handleMusicStopped(event: Event) {
        logger.info("Music stopped event received");
        // Could show a "music stopped" notification if desired
    }

    function handleTrackChanged(event: Event) {
        const customEvent = event as CustomEvent;
        logger.info("Track changed event received", customEvent.detail);
        // Could show track change notification
    }

    function handlePlayerCreated(event: Event) {
        logger.info("Dashboard: Player created event received", {
            previousPlayerExists: playerExists,
            hasMusicPlayer
        });
        playerExists = true;

        // Music polling is managed at the dashboard layout level
    }

    function handlePlayerDestroyed(event: Event) {
        logger.info("Dashboard: Player destroyed event received", {
            previousPlayerExists: playerExists,
            hasMusicPlayer
        });
        playerExists = false;

        // Music polling is managed at the dashboard layout level
    }

    // Halloween trigger function
    function triggerHalloweenEffect() {
      if (halloweenTriggered) return; // Only trigger once per session

      halloweenTriggered = true;
      showWitch = true;

      // Random witch messages
      const messages = [
        "Your colors are MINE! 🎃",
        "Trick or treat! 🧙‍♀️",
        "Happy Halloween! 👻",
        "Color swap spell cast! ✨",
        "Boo! 🦇"
      ];
      witchMessage = messages[Math.floor(Math.random() * messages.length)];

      // Swap the colors immediately for better UX
      colorStore.halloweenSwap();

      // Hide witch after showing message
      setTimeout(() => {
        showWitch = false;
      }, 3000);

      // Mark as triggered in session
      if (browser) {
        sessionStorage.setItem("mewdeko-halloween-triggered", "true");
      }
    }

    // Keyboard shortcut handler
    function handleKeyDown(event: KeyboardEvent) {
        // Only process if no input element is focused
        const target = event.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      // Track Halloween secret key sequence
      const key = event.key.toLowerCase();
      halloweenKeySequence += key;
      if (halloweenKeySequence.length > HALLOWEEN_SECRET.length) {
        halloweenKeySequence = halloweenKeySequence.slice(-HALLOWEEN_SECRET.length);
      }

      // Check for Halloween trigger
      if (halloweenKeySequence === HALLOWEEN_SECRET && !halloweenTriggered) {
        event.preventDefault();
        triggerHalloweenEffect();
        halloweenKeySequence = ""; // Reset sequence
        return;
      }

      // Check if current key could be part of Halloween sequence
      // If so, don't trigger other shortcuts to avoid conflicts
      const potentialSequence = HALLOWEEN_SECRET.slice(0, halloweenKeySequence.length);
      if (halloweenKeySequence === potentialSequence && halloweenKeySequence.length > 0) {
        // We're potentially typing the Halloween sequence, skip shortcuts
        return;
      }

        // Keyboard shortcuts
        switch (event.key.toLowerCase()) {
            case "r": // Refresh data
                if (!event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    fetchAllData();
                }
                break;
            case "m": // Go to music page
                if (!event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    goto("/dashboard/music");
                }
                break;
            case "h": // Go to home
                if (!event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    goto("/dashboard");
                }
                break;
            case "s": // Go to settings
                if (!event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    goto("/dashboard/settings");
                }
                break;
            case "?": // Show shortcuts
                if (!event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    showShortcuts = true;
                }
                break;
        }
    }

    onMount(async () => {
        loading = true;

        // Check for previously selected server
        if (browser) {
          // Clean up Halloween state if it's after Halloween
          if (!colorStore.isHalloween() && sessionStorage.getItem("mewdeko-halloween-active") === "true") {
            sessionStorage.removeItem("mewdeko-halloween-active");
            sessionStorage.removeItem("mewdeko-halloween-triggered");
          }

          // Check if Halloween was already triggered this session
          if (sessionStorage.getItem("mewdeko-halloween-triggered") === "true") {
            halloweenTriggered = true;
          }

          // Check for Halloween and trigger effect if not already done
          if (colorStore.isHalloween() && !halloweenTriggered && !colorStore.isHalloweenActive()) {
            // Delay Halloween effect until page is loaded
            setTimeout(() => {
              if (!loading) {
                triggerHalloweenEffect();
              }
            }, 2000);
          }

            // Set up keyboard event listeners
            // Listen for music events
            window.addEventListener("musicStarted", handleMusicStarted);
            window.addEventListener("musicStopped", handleMusicStopped);
            window.addEventListener("trackChanged", handleTrackChanged);
            window.addEventListener("playerCreated", handlePlayerCreated);
            window.addEventListener("playerDestroyed", handlePlayerDestroyed);
        }

        try {
            // Fetch data first to get guildInfo
            await fetchAllData();

            // Extract colors: server icon > user avatar > bot avatar
          // (Halloween swap will be applied automatically if active)
            if (guildInfo?.iconUrl) {
                await colorStore.extractFromServerIcon(guildInfo.iconUrl);
            } else if ($currentGuild?.icon) {
                const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
                await colorStore.extractFromServerIcon(serverIconUrl);
            } else if (currentUser?.avatar) {
                const userAvatarUrl = currentUser.avatar.startsWith("a_")
                    ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.gif`
                    : `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`;
                await colorStore.extractFromImage(userAvatarUrl);
            } else if ($currentInstance?.botAvatar) {
                await colorStore.extractFromImage($currentInstance.botAvatar);
            }

            // Setup keyboard shortcuts
            if (browser) {
                window.addEventListener("keydown", handleKeyDown);

              // Add debug commands to window for easy testing (no console spam)
              // @ts-ignore
              window.mewdekoHalloween = {
                trigger: () => triggerHalloweenEffect(),
                enableDebug: () => {
                  colorStore.enableHalloweenDebug();
                },
                disableDebug: () => {
                  colorStore.disableHalloweenDebug();
                  colorStore.reset();
                },
                reset: () => {
                  halloweenTriggered = false;
                  colorStore.reset();
                  colorStore.disableHalloweenDebug();
                  sessionStorage.removeItem("mewdeko-halloween-triggered");
                }
              };
            }
        } catch (err) {
            error = "Failed to fetch dashboard data";
            logger.error(error, err);
        } finally {
            loading = false;
        }
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("musicStarted", handleMusicStarted);
            window.removeEventListener("musicStopped", handleMusicStopped);
            window.removeEventListener("trackChanged", handleTrackChanged);
            window.removeEventListener("playerCreated", handlePlayerCreated);
            window.removeEventListener("playerDestroyed", handlePlayerDestroyed);
        }
    });

    // Fetch data when instance changes
    $effect(() => {
        if ($currentInstance) {
            fetchAllData();
        }
    });

    // Fetch data when guild changes
    $effect(() => {
        if ($currentGuild) {
            fetchAllData();
        }
    });

    // Separate effect for color extraction - reacts to guildInfo/guild/instance changes
    // without triggering data fetches (guildInfo is updated by fetchAllData)
    $effect(() => {
        if (guildInfo?.iconUrl) {
            colorStore.extractFromServerIcon(guildInfo.iconUrl);
        } else if ($currentGuild?.icon) {
            const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
            colorStore.extractFromServerIcon(serverIconUrl);
        } else if (currentUser?.avatar) {
            const userAvatarUrl = currentUser.avatar.startsWith("a_")
                ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.gif`
                : `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`;
            colorStore.extractFromImage(userAvatarUrl);
        } else if ($currentInstance?.botAvatar) {
            colorStore.extractFromImage($currentInstance.botAvatar);
        }
    });

    // Watch for userAdminGuilds to be populated and restore saved guild if needed
    $effect(() => {
        if (browser && $userAdminGuilds) {
            try {
                const savedGuild = localStorage.getItem("lastSelectedGuild");
                if (savedGuild) {
                    const guildData = JSON.parse(savedGuild);
                    const restoredGuild = {
                        ...guildData,
                        id: BigInt(guildData.id)
                    };

                    // Check if this guild is still in the user's admin guilds
                    const guildExists = $userAdminGuilds.some(guild => guild.id === restoredGuild.id);
                    if (guildExists) {
                        currentGuild.set(restoredGuild);
                    } else {
                        // Guild no longer available, clear saved data
                        localStorage.removeItem("lastSelectedGuild");
                    }
                }
            } catch (err) {
                logger.error("Failed to restore saved guild after admin guilds loaded:", err);
                localStorage.removeItem("lastSelectedGuild");
            }
        }
    });
</script>

<!-- Keyboard Shortcuts Dialog -->
<KeyboardShortcuts bind:isVisible={showShortcuts} />

<!-- Main Dashboard -->
<div
        class="min-h-screen overflow-x-hidden w-full transition-all duration-500 relative"
        style="{colorStore.getCssVars()}"
>
    <!-- Subtle mesh gradient background using colorStore -->
    <div class="fixed inset-0 -z-10"
         style="background: {$colorStore.primary}03;">
        <!-- Subtle color accents -->
        <div class="absolute inset-0"
             style="background-image: radial-gradient(circle at 20% 30%, {$colorStore.primary}08 0%, transparent 40%),
                radial-gradient(circle at 80% 60%, {$colorStore.secondary}06 0%, transparent 40%),
                radial-gradient(circle at 50% 90%, {$colorStore.accent}04 0%, transparent 40%);">
        </div>
        <!-- Very subtle grid pattern -->
        <div class="absolute inset-0 opacity-30"
             style="background-image: linear-gradient(0deg, {$colorStore.primary}05 1px, transparent 1px),
                linear-gradient(90deg, {$colorStore.primary}05 1px, transparent 1px);
                background-size: 50px 50px;">
        </div>
    </div>
    <div class="w-full p-4 md:p-6">
        <div class="space-y-8">
            {#if loading}
                <div role="status" aria-live="polite">
                    <!-- Skeleton Loaders -->
                    <div class="flex flex-col gap-6">
                        <!-- Music Player Skeleton -->
                        <div class="w-full">
                            <SkeletonLoader type="music"/>
                        </div>

                        <!-- Bot Profile Skeleton -->
                        <div class="w-full">
                            <SkeletonLoader type="card" height="360px"/>
                        </div>

                        <!-- Stats Cards Skeletons - Flexbox layout -->
                        <div class="flex flex-col md:flex-row gap-6">
                            <div class="flex-1">
                                <SkeletonLoader type="stats"/>
                            </div>
                            <div class="flex-1">
                                <SkeletonLoader type="stats" delay={100}/>
                            </div>
                            <div class="flex-1">
                                <SkeletonLoader type="stats" delay={200}/>
                            </div>
                        </div>

                        <!-- Features Skeleton -->
                        <div class="flex-1">
                            <div class="grid grid-cols-2 gap-4">
                                <SkeletonLoader type="feature" delay={300}/>
                                <SkeletonLoader type="feature" delay={350}/>
                                <SkeletonLoader type="feature" delay={400}/>
                                <SkeletonLoader type="feature" delay={450}/>
                            </div>
                        </div>
                    </div>
                </div>
            {:else if error}
                <div class="p-6 rounded-xl mb-6 transition-all" role="alert"
                     style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;">
                    <div class="flex items-center gap-3">
                        <i class="fa-utility-duo fa-regular fa-robot text-2xl"
                           style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.accent};"></i>
                        <div style="color: {$colorStore.accent}">
                            <div class="font-semibold text-lg">Error Occurred</div>
                            <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
                        </div>
                    </div>

                    <div class="mt-4 flex justify-end">
                        <button
                                class="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors"
                                onclick={fetchAllData}
                                style="background: {$colorStore.accent}20; color: {$colorStore.accent}"
                        >
                            <i class="fa-utility-duo fa-regular fa-sync"
                               style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.accent};"></i>
                            Retry
                        </button>
                    </div>
                </div>
            {:else}
                <!-- Refresh button -->
                <div class="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-30" class:hidden={refreshing}>
                    <button aria-label="Button action"
                            class="flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all hover:scale-[1.02]"
                            style="background: {$colorStore.primary}; color: white"
                            onclick={fetchAllData}

                    >
          <span class:animate-spin={refreshing}>
            <i class="fa-utility-duo fa-regular fa-sync"
               style="--fa-primary-color: white; --fa-secondary-color: white; --fa-secondary-opacity: 0.7;"></i>
          </span>
                    </button>
                </div>

                <!-- Music Started Notification -->
                {#if showMusicNotification}
                    <div
                            class="fixed top-20 right-4 z-50 max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-sm transition-all"
                            style="background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientMid}95);
                 border-color: {$colorStore.primary}40;"
                            in:fly={{ x: 300, duration: 500 }}
                            out:fly={{ x: 300, duration: 400 }}
                    >
                        <div class="flex items-center gap-3">
                            <div class="p-2 rounded-full" style="background: {$colorStore.primary}20;">
                                <i class="fa-utility-duo fa-regular fa-music text-xl"
                                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                            </div>
                            <div class="flex-1">
                                <div class="font-semibold" style="color: {$colorStore.text};">
                                    Music Started Playing!
                                </div>
                                <div class="text-sm mt-1" style="color: {$colorStore.muted};">
                                    Now playing music in your server
                                </div>
                            </div>
                            <button
                                    class="p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
                                    onclick={() => showMusicNotification = false}
                                    aria-label="Close notification"
                            >
                                <i class="fa-utility-duo fa-regular fa-times"
                                   style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted};"></i>
                            </button>
                        </div>

                        <div class="mt-3 flex gap-2">
                            <button
                              aria-label="Open Music Player"
                              class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                                    onclick={() => {
                showMusicNotification = false;
                goto('/dashboard/music');
              }}
                            >
                                Open Music Player
                            </button>
                            <button
                              aria-label="Dismiss notification"
                              class="flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                                    onclick={() => showMusicNotification = false}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                {/if}

                <!-- Tabbed Dashboard -->
                {#key $currentGuild?.id}
                    <div class="transition-all duration-700 ease-out transform-gpu {!$currentGuild ? 'pointer-events-none' : ''}"
                         class:opacity-75={switchingServer}
                         class:scale-[0.98]={switchingServer}
                         style="{!$currentGuild ?
               'transform: scale(0.94) translateY(15px); opacity: 0.5; filter: blur(1px);' :
               'transform: scale(1) translateY(0); opacity: 1; filter: blur(0);'}"
                         in:fade={{ duration: switchingServer ? 500 : 300, delay: switchingServer ? 400 : 0 }}
                         out:fade={{ duration: 200 }}>
                        <TabbedDashboard
                                {botStatus}
                                {guildMemberStats}
                                {roleStats}
                                {joinStats}
                                {leaveStats}
                                {guildFeatures}
                                onRefresh={fetchAllData}
                                {refreshing}
                                bind:activeTab={currentActiveTab}
                                showMusicPlayer={hasMusicPlayer}
                        />
                    </div>
                {/key}

            {/if}

            <!-- Last Updated Indicator -->
            {#if $dashboardStore.lastUpdated && !loading}
                <div class="text-center text-sm py-4 opacity-60" style="color: {$colorStore.muted}">
                    Last updated: {$dashboardStore.lastUpdated.toLocaleTimeString()}
                    <!-- Press R to refresh (hidden for screen readers) -->
                    <span class="ml-2 hidden md:inline" aria-hidden="true">
          (Press <kbd class="px-1 py-0.5 rounded-sm" style="background: {$colorStore.primary}20">R</kbd> to refresh)
        </span>
                </div>
            {/if}
        </div>
    </div>

  <!-- Halloween Message -->
  {#if showWitch}
    <div
      class="fixed top-24 left-1/2 transform -translate-x-1/2 z-[200] pointer-events-none"
      style="animation: fadeInOut 3s ease-in-out forwards;"
    >
      <div class="bg-purple-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
        <span class="text-2xl">🎃</span>
        <span class="font-medium">{witchMessage}</span>
        <span class="text-2xl">🎃</span>
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
    @reference '../../app.css';

    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-300;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 100000px;
    }

    /* Add smooth transition for hover effects */

    /* Animation for the refresh button */
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }

    /* Gradient animation for accent line */
    @keyframes gradient-shift {
        0% {
            background-position: 0 50%;
        }
        100% {
            background-position: 200% 50%;
        }
    }

    .animate-gradient {
        animation: gradient-shift 20s ease infinite;
    }

    /* Smooth loading transitions for better UX */

    /* Smooth height transitions */
    [style*="min-height"] {
        transition: min-height 0.5s ease-out;
    }

    /* Performance optimizations for transforms */
    .transform {
        transform: translateZ(0);
        backface-visibility: hidden;
    }

    /* Halloween Animation - Simple fade in/out */
    @keyframes fadeInOut {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px) scale(0.95);
        }
        20% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
        }
        80% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px) scale(0.95);
        }
    }
</style>