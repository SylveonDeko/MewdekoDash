<!-- routes/dashboard/+page.svelte -->
<script lang="ts">

    import { onDestroy, onMount } from "svelte";
    import {
        botStatusApi,
        type BotStatusModel,
        clientApi,
        type GraphStatsResponse,
        guildApi,
        inviteTrackingApi,
        joinLeaveApi,
        roleGreetApi,
        roleStatesApi
    } from "$lib/api/index.ts";
    import { fade, fly, slide } from "svelte/transition";
    import { goto } from "$app/navigation";
    import { currentGuild } from "$lib/stores/currentGuild";
    import { currentInstance } from "$lib/stores/instanceStore";
    import { colorStore } from "$lib/stores/colorStore";
    import { logger } from "$lib/logger";
    import { browser } from "$app/environment";
    import { clickOutside } from "$lib/clickOutside.ts";

    // Import  components
    import TabbedDashboard from "$lib/components/layout/TabbedDashboard.svelte";
    import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";
    import KeyboardShortcuts from "$lib/components/specialized/KeyboardShortcuts.svelte";

    // Import stores
    import { musicStore } from "$lib/stores/musicStore";
    import { inviteStore } from "$lib/stores/inviteStore";
    import { dashboardStore } from "$lib/stores/dashboardStore";
    import { userAdminGuilds } from "$lib/stores/adminGuildsStore.ts";

    // Import search component

    let { data } = $props();

    // State management
    let currentUser = data.user;
    let botStatus: BotStatusModel | null = $state(null);
    let loading = $state(true);
    let error: string | null = $state(null);
    let refreshing = $state(false);
    let joinStats: GraphStatsResponse | null = $state(null);
    let leaveStats: GraphStatsResponse | null = $state(null);
    let showShortcuts = $state(false);
    let showMusicNotification = $state(false);
    let musicJustStarted = $state(false);
    let playerExists = $state(false);
    let compactMode = $state(false);
    let showDetails = $state(true); // Controls visibility of description/stats

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

    // Server selector dropdown state
    let showServerDropdown = $state(false);
    let serverSearchTerm = $state("");
    let serverDropdownRef: HTMLDivElement = $state();
    let serverNameButtonRef: HTMLButtonElement = $state();
    let hasEverSelectedServer = false;
    let switchingServer = $state(false);

    // Guild detailed information
    let guildInfo = $state(null);

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
                starboard: !!guildSettingsResponse?.starboardChannel,
                suggestions: !!(guildSettingsResponse?.sugchan || guildSettingsResponse?.sugchan),
                musicEnabled: true, // Assuming always enabled
                giveawaysEnabled: !!guildSettingsResponse?.GiveawayEndMessage
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
            error = err.message || "An error occurred while fetching data";
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

    // Handler for server selection
    async function handleServerSelect(guild) {
        if (switchingServer) return; // Prevent multiple switches

        showServerDropdown = false;
        serverSearchTerm = "";

        // Start switching animation
        switchingServer = true;

        // Small delay for smooth transition start
        if (browser) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        currentGuild.set(guild);

        if (browser) {
            hasEverSelectedServer = true;
            localStorage.setItem("hasEverSelectedServer", "true");

            // Save the selected guild to localStorage for persistence across page reloads
            try {
                localStorage.setItem("lastSelectedGuild", JSON.stringify({
                    id: guild.id.toString(),
                    name: guild.name,
                    icon: guild.icon,
                    owner: guild.owner,
                    permissions: guild.permissions,
                    features: guild.features
                }));

                // Show success feedback
                logger.info(`Switched to server: ${guild.name}`);
            } catch (err) {
                logger.error("Failed to save guild to localStorage:", err);
            }
        }

        // Clear guild info after transition starts
        setTimeout(() => {
            guildInfo = null;
        }, 100);

        // Reset switching state after transition completes
        setTimeout(() => {
            switchingServer = false;
        }, 600);
    }

    // Filtered guilds for server selector
    let filteredGuilds = $derived(($userAdminGuilds || []).filter(guild =>
        guild.name.toLowerCase().includes(serverSearchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name)));

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

        // Update music store to start polling
        if (currentUser?.id) {
            musicStore.startPolling(currentUser.id);
        }
    }

    function handlePlayerDestroyed(event: Event) {
        logger.info("Dashboard: Player destroyed event received", {
            previousPlayerExists: playerExists,
            hasMusicPlayer
        });
        playerExists = false;

        // Stop music polling when player is destroyed
        musicStore.stopPolling();
    }

    // Server dropdown functions
    function toggleServerDropdown() {
        showServerDropdown = !showServerDropdown;
        if (showServerDropdown) {
            serverSearchTerm = "";
        }
    }

    function closeServerDropdown() {
        showServerDropdown = false;
        serverSearchTerm = "";
    }

    // Compact mode toggle
    async function toggleCompactMode() {
        if (!compactMode) {
            // Entering compact mode: fade out first, then compact
            showDetails = false;
            await new Promise(resolve => setTimeout(resolve, 250)); // Wait for fade out
            compactMode = true;
        } else {
            // Expanding: expand first, then fade in
            compactMode = false;
            await new Promise(resolve => setTimeout(resolve, 300)); // Wait for expansion
            showDetails = true;
        }

        if (browser) {
            localStorage.setItem("compactHeaderMode", compactMode.toString());
        }
    }

    // Handle escape key for server dropdown
    function handleServerDropdownKeydown(event: KeyboardEvent) {
        if (event.key === "Escape" && showServerDropdown) {
            closeServerDropdown();
        }
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
            hasEverSelectedServer = localStorage.getItem("hasEverSelectedServer") === "true";

            // Restore compact mode preference
            compactMode = localStorage.getItem("compactHeaderMode") === "true";
            // Sync showDetails with compactMode on page load
            showDetails = !compactMode;

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
            window.addEventListener("keydown", handleServerDropdownKeydown);

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

            // Start music polling if we have a user
            if (currentUser?.id) {
                musicStore.startPolling(currentUser.id);
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
        musicStore.stopPolling();

        if (browser) {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keydown", handleServerDropdownKeydown);
            window.removeEventListener("musicStarted", handleMusicStarted);
            window.removeEventListener("musicStopped", handleMusicStopped);
            window.removeEventListener("trackChanged", handleTrackChanged);
            window.removeEventListener("playerCreated", handlePlayerCreated);
            window.removeEventListener("playerDestroyed", handlePlayerDestroyed);
        }
    });

    $effect(() => {
        if ($currentInstance) {
            // Extract colors from server icon if available, otherwise use user avatar, then bot avatar as fallback
          // (Halloween swap will be applied automatically if active)
            if (guildInfo?.iconUrl) {
                colorStore.extractFromServerIcon(guildInfo.iconUrl);
            } else if ($currentGuild?.icon) {
                const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
                colorStore.extractFromServerIcon(serverIconUrl);
            } else if (currentUser?.avatar) {
                // Use user avatar when no server is selected
                const userAvatarUrl = currentUser.avatar.startsWith("a_")
                    ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.gif`
                    : `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`;
                colorStore.extractFromImage(userAvatarUrl);
            } else if ($currentInstance?.botAvatar) {
                // Fall back to bot avatar
                colorStore.extractFromImage($currentInstance.botAvatar);
            }

            // Reset music polling
            if (currentUser?.id) {
                musicStore.reset();
                musicStore.startPolling(currentUser.id);
            }

            fetchAllData();
        }
    });

    $effect(() => {
        if ($currentGuild) {
            // When guild changes, update colors based on server icon
          // (Halloween swap will be applied automatically if active)
            if (guildInfo?.iconUrl) {
                colorStore.extractFromServerIcon(guildInfo.iconUrl);
            } else if ($currentGuild.icon) {
                const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
                colorStore.extractFromServerIcon(serverIconUrl);
            }

            // Reset music store when guild changes
            musicStore.reset();
            if (currentUser?.id) {
                musicStore.startPolling(currentUser.id);
            }
            fetchAllData();
        } else if (!$currentGuild) {
          if (currentUser?.avatar) {
            // No guild selected - use user avatar colors
            const userAvatarUrl = currentUser.avatar.startsWith("a_")
              ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.gif`
              : `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`;
            colorStore.extractFromImage(userAvatarUrl);
          } else if ($currentInstance?.botAvatar) {
            // No guild and no user avatar - fall back to bot avatar
            colorStore.extractFromImage($currentInstance.botAvatar);
          }
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

                <!-- Unified Server Banner - Always shown -->
                <div class="relative mb-4 ease-out"
                     class:opacity-75={switchingServer}
                     class:scale-[0.98]={switchingServer}
                     style="min-height: {compactMode ? '80px' : '200px'}; transition: all 500ms {compactMode ? '250ms' : '0ms'};"
                     in:fly={{ y: -20, duration: 600, delay: 100 }}>

                    <!-- Background container with overflow hidden -->
                    <div class="absolute inset-0 rounded-2xl overflow-hidden">
                        {#if switchingServer}
                            <!-- Loading skeleton during server switch -->
                            <div class="absolute inset-0 animate-pulse"
                                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}20, {$colorStore.gradientMid}25, {$colorStore.gradientEnd}20);">
                                <div class="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 opacity-50"></div>
                            </div>
                        {:else}
                            <!-- Banner Background -->
                            {#key $currentGuild?.id}
                                {#if $currentGuild && guildInfo?.bannerUrl}
                                    <!-- Server banner image as background -->
                                    <div class="absolute inset-0"
                                         in:fade={{ duration: 400, delay: 150 }}
                                         out:fade={{ duration: 150 }}>
                                        <img
                                                src="{guildInfo.bannerUrl}?size=1024"
                                                alt="{guildInfo.name} banner"
                                                class="w-full h-full object-cover"
                                        >
                                        <!-- Darker overlay for text readability -->
                                        <div class="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
                                    </div>
                                {:else}
                                    <!-- Fallback gradient background -->
                                    <div class="absolute inset-0"
                                         style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
                            backdrop-filter: blur(10px);"
                                         in:fade={{ duration: 400, delay: 150 }}
                                         out:fade={{ duration: 150 }}>
                                    </div>

                                    <!-- Subtle pattern overlay -->
                                    <div class="absolute inset-0 opacity-5"
                                         style="background-image: radial-gradient(circle at 1px 1px, {$colorStore.primary} 1px, transparent 0);
                            background-size: 20px 20px;">
                                    </div>
                                {/if}
                            {/key}
                        {/if}

                        <!-- Accent line at bottom -->
                        <div class="absolute bottom-0 inset-x-0 h-1 overflow-hidden">
                            <div class="absolute inset-0 animate-gradient"
                                 style="background: linear-gradient(115deg,
                        {$colorStore.primary} 0%,
                        {$colorStore.secondary} 15%,
                        {$colorStore.accent} 30%,
                        {$colorStore.primary} 45%,
                        {$colorStore.accent} 60%,
                        {$colorStore.secondary} 75%,
                        {$colorStore.primary} 90%,
                        {$colorStore.secondary} 100%);
                        background-size: 300% 300%;"></div>
                        </div>
                    </div>

                    <!-- Compact Mode Toggle - Glides from bottom to top -->
                    <div class="absolute z-10"
                         style="right: 12px;
                                top: {compactMode ? '12px' : 'calc(100% - 48px)'};
                                transition: top 500ms ease-out {compactMode ? '250ms' : '0ms'};">
                        <button
                          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 hover:opacity-100 opacity-50 backdrop-blur-sm"
                          style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}25;"
                          onclick={toggleCompactMode}
                          title={compactMode ? "Show header details" : "Hide header details"}
                          aria-label={compactMode ? "Expand header" : "Compact header"}
                        >
                            <!-- Animated chevron -->
                            <div class="relative w-4 h-4 flex items-center justify-center">
                                <i class="fa-solid fa-angles-up text-xs absolute transition-all duration-300"
                                   style="opacity: {compactMode ? '0' : '1'};
                                          transform: translateY({compactMode ? '4px' : '0'}) scale({compactMode ? '0.8' : '1'});"></i>
                                <i class="fa-solid fa-angles-down text-xs absolute transition-all duration-300"
                                   style="opacity: {compactMode ? '1' : '0'};
                                          transform: translateY({compactMode ? '0' : '-4px'}) scale({compactMode ? '1' : '0.8'});"></i>
                            </div>
                            <!-- Animated text -->
                            <div class="relative h-4 overflow-hidden flex items-center transition-all duration-300">
                                <span class="invisible"
                                      style="display: {compactMode ? 'none' : 'inline'};">Compact</span>
                                <span class="invisible"
                                      style="display: {compactMode ? 'inline' : 'none'};">Expand</span>
                                <span class="absolute left-0 transition-all duration-300 whitespace-nowrap"
                                      style="opacity: {compactMode ? '0' : '1'};
                                             transform: translateX({compactMode ? '-4px' : '0'});">Compact</span>
                                <span class="absolute left-0 transition-all duration-300 whitespace-nowrap"
                                      style="opacity: {compactMode ? '1' : '0'};
                                             transform: translateX({compactMode ? '0' : '4px'});">Expand</span>
                            </div>
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="relative p-6 md:p-8 ease-out"
                         class:!p-3={compactMode}
                         class:md:!px-6={compactMode}
                         class:md:!py-3={compactMode}
                         style="transition: all 500ms {compactMode ? '250ms' : '0ms'};">
                        {#if switchingServer}
                            <!-- Loading skeleton for server switch -->
                            <div class="flex flex-col md:flex-row items-start md:items-center gap-6 animate-pulse"
                                 class:!flex-row={compactMode}
                                 class:!items-center={compactMode}
                                 class:!gap-3={compactMode}>
                                <!-- Server Icon Skeleton -->
                                <div class="relative shrink-0">
                                    <div class="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-lg ring-2 ring-opacity-20 animate-pulse"
                                         class:!w-12={compactMode}
                                         class:!h-12={compactMode}
                                         class:!rounded-xl={compactMode}
                                         style="background: {$colorStore.primary}20; ring-color: {$colorStore.primary};">
                                        <div
                                                class="w-full h-full rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 animate-pulse"
                                                class:!rounded-xl={compactMode}></div>
                                    </div>
                                    {#if !compactMode}
                                        <div
                                                class="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full border-2 border-white shadow-xs animate-pulse"></div>
                                    {/if}
                                </div>

                                <!-- Server Info Skeleton -->
                                <div class="flex-1 min-w-0 space-y-3"
                                     class:!space-y-0={compactMode}
                                     class:!min-w-fit={compactMode}
                                     class:!flex-none={compactMode}>
                                    <div class="h-8 bg-gray-600 rounded-lg animate-pulse w-3/4"
                                         class:!h-5={compactMode}
                                         class:!w-32={compactMode}></div>
                                    {#if !compactMode}
                                        <div class="h-4 bg-gray-700 rounded-sm animate-pulse w-1/2"></div>
                                        <div class="flex gap-4">
                                            <div class="h-4 bg-gray-700 rounded-sm animate-pulse w-24"></div>
                                            <div class="h-4 bg-gray-700 rounded-sm animate-pulse w-20"></div>
                                            <div class="h-4 bg-gray-700 rounded-sm animate-pulse w-16"></div>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {:else if $currentGuild}
                            <!-- Selected Server Display -->
                            <div
                              class="flex flex-row items-start gap-4 ease-out md:gap-6"
                              class:items-center={compactMode}
                                    style="transition: all 500ms {compactMode ? '250ms' : '0ms'};"
                                    in:fade={{ duration: 400, delay: 200 }}>

                                <!-- Server Icon -->
                                <div class="relative shrink-0">
                                    <div
                                      class="w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-lg ring-2 ring-opacity-20 hover:scale-[1.02]"
                                            class:!w-12={compactMode}
                                            class:!h-12={compactMode}
                                            class:!rounded-xl={compactMode}
                                            style="ring-color: {$colorStore.primary}; transition: width 500ms {compactMode ? '250ms' : '0ms'}, height 500ms {compactMode ? '250ms' : '0ms'}, border-radius 500ms {compactMode ? '250ms' : '0ms'};">
                                        {#key $currentGuild?.id}
                                            <div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 200 }}>
                                                {#if guildInfo?.iconUrl}
                                                    <img
                                                            src="{guildInfo.iconUrl}?size=256"
                                                            alt="{guildInfo.name} icon"
                                                            class="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                                                            loading="lazy"
                                                    >
                                                {:else if $currentGuild.icon}
                                                    <img
                                                            src="https://cdn.discordapp.com/icons/{$currentGuild.id}/{$currentGuild.icon}.{$currentGuild.icon.startsWith('a_') ? 'gif' : 'png'}?size=256"
                                                            alt="{$currentGuild.name} icon"
                                                            class="w-full h-full object-cover transition-all duration-500 hover:scale-110"
                                                            loading="lazy"
                                                    >
                                                {:else}
                                                    <div
                                                            class="w-full h-full flex items-center justify-center text-2xl font-bold transition-all duration-500 hover:scale-110"
                                                            style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                                                        <i class="fa-utility-duo fa-regular fa-server text-4xl"
                                                           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                                                    </div>
                                                {/if}
                                            </div>
                                        {/key}
                                    </div>
                                </div>

                                <!-- Server Info -->
                                <div class="flex-1 min-w-0"
                                     style="transition: all 500ms {compactMode ? '250ms' : '0ms'};">
                                    <div
                                      class="flex flex-col items-start justify-between gap-2 md:flex-row md:items-start md:gap-4"
                                         class:!flex-row={compactMode}
                                         class:!items-center={compactMode}
                                         class:!gap-3={compactMode}
                                         style="transition: all 500ms {compactMode ? '250ms' : '0ms'};">

                                        <!-- Clickable Server Name Section -->
                                        <div class="flex-1 min-w-0"
                                             class:!min-w-fit={compactMode}
                                             class:!flex-none={compactMode}
                                             style="transition: all 500ms {compactMode ? '250ms' : '0ms'};">
                                            <!-- Clickable server name with dropdown -->
                                            <div class="relative inline-block">
                                                <button
                                                        bind:this={serverNameButtonRef}
                                                        class="group flex items-center gap-2 mb-2 rounded-lg p-2 -m-2 transition-all duration-300 hover:bg-black hover:bg-opacity-10"
                                                        class:!mb-0={compactMode}
                                                        class:!p-1={compactMode}
                                                        class:!gap-1={compactMode}
                                                        onclick={toggleServerDropdown}
                                                        use:clickOutside
                                                        onclickoutside={closeServerDropdown}
                                                >
                                                    {#key $currentGuild?.id}
                                                        <h1
                                                          class="text-2xl md:text-3xl font-bold text-left transform truncate max-w-[calc(100vw-220px)] md:max-w-[400px]"
                                                                class:!text-base={compactMode}
                                                                class:!font-semibold={compactMode}
                                                          style="color: {$colorStore.text};
                                                                       transition: font-size 500ms {compactMode ? '250ms' : '0ms'}, font-weight 500ms {compactMode ? '250ms' : '0ms'};"
                                                          in:fade={{ duration: 300, delay: 300 }}
                                                          out:fade={{ duration: 200 }}>
                                                            {guildInfo?.name || $currentGuild.name}
                                                        </h1>
                                                    {/key}
                                                    <i
                                                      class="fa-utility-duo fa-regular fa-angle-down {compactMode ? 'text-sm' : 'text-xl'} transition-all duration-300 group-hover:scale-110 {showServerDropdown ? 'rotate-180' : ''} shrink-0"
                                                       style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted};"></i>
                                                </button>

                                                <!-- Backdrop for mobile -->
                                                {#if showServerDropdown}
                                                    <div class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99] md:hidden"
                                                         in:fade={{ duration: 200 }}
                                                         out:fade={{ duration: 150 }}
                                                         onclick={closeServerDropdown} role="button" tabindex="0"
                                                         onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); closeServerDropdown; } }}>
                                                    </div>
                                                {/if}

                                                <!-- Server Dropdown -->
                                                {#if showServerDropdown}
                                                    <div
                                                            class="fixed md:absolute left-4 right-4 md:left-0 md:right-auto top-32 md:top-full mt-0 md:mt-2 md:w-80 rounded-xl shadow-2xl border overflow-hidden z-[100]"
                                                            style="border-color: {$colorStore.primary}30;
                                 background: linear-gradient(135deg, {$colorStore.background}f5, {$colorStore.background}ee);
                                 backdrop-filter: blur(10px);"
                                                            in:slide={{ duration: 200, axis: 'y' }}
                                                            out:slide={{ duration: 150, axis: 'y' }}
                                                    >
                                                        <!-- Search -->
                                                        <div class="p-3 border-b"
                                                             style="border-color: {$colorStore.primary}20;">
                                                            <div class="relative">
                                                                <input
                                                                        type="text"
                                                                        placeholder="Search servers..."
                                                                        bind:value={serverSearchTerm}
                                                                        onclick={(e) => e.stopPropagation()}
                                                                        class="w-full px-4 py-2 rounded-lg border text-sm"
                                                                        style="border-color: {$colorStore.primary}30;
                                     color: {$colorStore.text};
                                     background: {$colorStore.primary}08;"
                                                                >
                                                            </div>
                                                        </div>

                                                        <!-- Server List -->
                                                        <div class="max-h-60 overflow-y-auto">
                                                            {#each filteredGuilds as guild (guild.id)}
                                                                <button
                                                                        class="w-full flex items-center gap-3 p-3 transition-colors text-left"
                                                                        style="background: {guild.id === $currentGuild.id ? $colorStore.primary + '15' : 'transparent'}"
                                                                        onmouseenter={(e) => e.currentTarget.style.background = $colorStore.primary + '10'}
                                                                        onmouseleave={(e) => e.currentTarget.style.background = guild.id === $currentGuild.id ? $colorStore.primary + '15' : 'transparent'}
                                                                        onclick={() => handleServerSelect(guild)}
                                                                >
                                                                    <img
                                                                            src={guild.icon ?
                                  `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'png'}?size=64` :
                                  'https://cdn.discordapp.com/embed/avatars/0.png'
                                }
                                                                            alt=""
                                                                            class="w-10 h-10 rounded-lg object-cover"
                                                                    >
                                                                    <div class="flex-1 min-w-0">
                                                                        <div class="font-medium truncate"
                                                                             style="color: {$colorStore.text};">
                                                                            {guild.name}
                                                                        </div>
                                                                        <div class="text-xs"
                                                                             style="color: {$colorStore.muted};">
                                                                            {guild.owner ? 'Owner' : 'Admin'}
                                                                        </div>
                                                                    </div>
                                                                    {#if guild.id === $currentGuild.id}
                                                                        <div class="w-2 h-2 rounded-full"
                                                                             style="background: {$colorStore.primary};"></div>
                                                                    {/if}
                                                                </button>
                                                            {:else}
                                                                <div class="p-4 text-center"
                                                                     style="color: {$colorStore.muted};">
                                                                    No servers found
                                                                </div>
                                                            {/each}
                                                        </div>
                                                    </div>
                                                {/if}
                                            </div>

                                            {#if (guildInfo?.description || $currentGuild.description) && showDetails}
                                                <div in:fade={{ duration: 300, delay: 300 }}
                                                     out:fade={{ duration: 200 }}>
                                                    <p class="text-sm md:text-base mb-3 line-clamp-2 transition-all duration-300"
                                                       style="color: {$colorStore.muted};">
                                                        {guildInfo?.description || $currentGuild.description}
                                                    </p>
                                                </div>
                                            {/if}

                                            <!-- Quick stats -->
                                            {#if showDetails}
                                                <div class="flex flex-wrap items-center gap-4 text-sm transition-all duration-500"
                                                     in:fade={{ duration: 300, delay: 350 }} out:fade={{ duration: 200 }}>
                                                    <div
                                                      class="flex items-center gap-2 transition-all duration-300 hover:scale-[1.02]">
                                                        <i class="fa-utility-duo fa-regular fa-users"
                                                           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                                                        <span style="color: {$colorStore.text}">
                              {(guildInfo?.memberCount || guildMemberStats.totalMembers).toLocaleString()} members
                            </span>
                                                    </div>

                                                    <div
                                                      class="flex items-center gap-2 transition-all duration-300 hover:scale-[1.02]">
                                                        <i class="fa-utility-duo fa-regular fa-user"
                                                           style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
                                                        <span style="color: {$colorStore.text}">
                              {guildMemberStats.humanMembers.toLocaleString()} humans
                            </span>
                                                    </div>

                                                    {#if botStatus?.isReady}
                                                        <div
                                                          class="flex items-center gap-2 transition-all duration-300 hover:scale-[1.02]">
                                                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span style="color: {$colorStore.text}">Bot Online</span>
                                                        </div>
                                                    {/if}
                                                </div>
                                            {/if}
                                        </div>

                                        <!-- Action buttons and Mini Music Player Container -->
                                        <div class="flex items-start gap-3 ease-in-out"
                                             class:!gap-2={compactMode}
                                             style="transition: all 500ms {compactMode ? '250ms' : '0ms'};"
                                             in:fade={{ duration: 300, delay: 400 }} out:fade={{ duration: 150 }}>
                                            <!-- Action buttons section -->
                                            {#if showDetails}
                                            <div
                                              class="flex items-center gap-3 flex-wrap"
                                                 class:!gap-2={compactMode}
                                              in:fade={{ duration: 300, delay: 300 }}
                                              out:fade={{ duration: 200 }}>
                                                {#if $currentGuild.owner}
                                                    <div in:fade={{ duration: 200, delay: 200 }}
                                                         out:fade={{ duration: 200 }}
                                                         class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-[1.02]"
                                                         class:!px-2={compactMode}
                                                         class:!py-1={compactMode}
                                                         style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
                                                        Owner
                                                    </div>
                                                {/if}

                                                <button
                                                  aria-label="View Server on Discord"
                                                        in:fade={{ duration: 200, delay: 200 }}
                                                        out:fade={{ duration: 200 }}
                                                  class="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                                                        class:!px-3={compactMode}
                                                        class:!py-1.5={compactMode}
                                                        class:!text-sm={compactMode}
                                                  class:!min-h-[36px]={compactMode}
                                                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
                                                        onclick={() => window.open(`https://discord.com/channels/${$currentGuild.id}`, '_blank')}
                                                >
                                                  <i
                                                    class="fa-utility-duo fa-regular fa-link {compactMode ? 'text-sm' : 'text-base'}"
                                                       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                                                    <span class="hidden sm:inline">View Server</span>
                                                </button>
                                            </div>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {:else}
                            <!-- No Server Selected State - Same layout as selected state -->
                            <div
                                    class="flex flex-col md:flex-row items-start md:items-center gap-6 ease-out"
                                    class:!flex-row={compactMode}
                                    class:!items-center={compactMode}
                                    class:!gap-3={compactMode}
                                    style="transition: all 500ms {compactMode ? '250ms' : '0ms'};"
                                    in:fade={{ duration: 400, delay: 200 }}>

                                <!-- Server Icon Placeholder -->
                                <div class="relative shrink-0">
                                    <div
                                            class="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-lg ring-2 ring-opacity-20"
                                            class:!w-12={compactMode}
                                            class:!h-12={compactMode}
                                            class:!rounded-xl={compactMode}
                                            style="ring-color: {$colorStore.primary}; transition: width 500ms {compactMode ? '250ms' : '0ms'}, height 500ms {compactMode ? '250ms' : '0ms'}, border-radius 500ms {compactMode ? '250ms' : '0ms'};">
                                        <div
                                                class="w-full h-full flex items-center justify-center text-2xl font-bold"
                                                style="background: linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}30); color: {$colorStore.primary};">
                                            <i class="fa-utility-duo fa-regular fa-server {compactMode ? 'text-2xl' : 'text-4xl'}"
                                               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                                        </div>
                                    </div>
                                </div>

                                <!-- Server Info - Same layout as selected state -->
                                <div class="flex-1 min-w-0 ease-out" style="transition: all 500ms {compactMode ? '250ms' : '0ms'};">
                                    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 ease-out"
                                         class:!flex-row={compactMode}
                                         class:!items-center={compactMode}
                                         class:!gap-3={compactMode}
                                         style="transition: all 500ms {compactMode ? '250ms' : '0ms'};">

                                        <!-- Clickable Server Name Section (same as when server is selected) -->
                                        <div class="flex-1 min-w-0"
                                             class:!min-w-fit={compactMode}
                                             class:!flex-none={compactMode}>
                                            <!-- Clickable server name with dropdown -->
                                            <div class="relative inline-block">
                                                <button
                                                        bind:this={serverNameButtonRef}
                                                        class="group flex items-center gap-2 mb-2 rounded-lg p-2 -m-2 transition-all duration-300 hover:bg-black hover:bg-opacity-10"
                                                        class:!mb-0={compactMode}
                                                        class:!p-1={compactMode}
                                                        class:!gap-1={compactMode}
                                                        onclick={toggleServerDropdown}
                                                        use:clickOutside
                                                        onclickoutside={closeServerDropdown}
                                                >
                                                    <h1
                                                      class="text-2xl md:text-3xl font-bold text-left transform truncate max-w-[calc(100vw-220px)] md:max-w-[400px]"
                                                            class:!text-base={compactMode}
                                                            class:!font-semibold={compactMode}
                                                      style="color: {$colorStore.text};
                                                                   transition: font-size 500ms {compactMode ? '250ms' : '0ms'}, font-weight 500ms {compactMode ? '250ms' : '0ms'};">
                                                        Select a Server
                                                    </h1>
                                                    <i
                                                      class="fa-utility-duo fa-regular fa-angle-down {compactMode ? 'text-sm' : 'text-xl'} transition-all duration-300 group-hover:scale-110 {showServerDropdown ? 'rotate-180' : ''} shrink-0"
                                                       style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted};"></i>
                                                </button>

                                                <!-- Backdrop for mobile -->
                                                {#if showServerDropdown}
                                                    <div class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99] md:hidden"
                                                         in:fade={{ duration: 200 }}
                                                         out:fade={{ duration: 150 }}
                                                         onclick={closeServerDropdown} role="button" tabindex="0"
                                                         onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); closeServerDropdown; } }}>
                                                    </div>
                                                {/if}

                                                <!-- Server Dropdown (same as when server is selected) -->
                                                {#if showServerDropdown}
                                                    <div
                                                            class="fixed md:absolute left-4 right-4 md:left-0 md:right-auto top-32 md:top-full mt-0 md:mt-2 md:w-80 rounded-xl shadow-2xl border overflow-hidden z-[100]"
                                                            style="border-color: {$colorStore.primary}30;
                                 background: linear-gradient(135deg, {$colorStore.background}f5, {$colorStore.background}ee);
                                 backdrop-filter: blur(10px);"
                                                            in:slide={{ duration: 200, axis: 'y' }}
                                                            out:slide={{ duration: 150, axis: 'y' }}
                                                    >
                                                        <!-- Search -->
                                                        <div class="p-3 border-b"
                                                             style="border-color: {$colorStore.primary}20;">
                                                            <div class="relative">
                                                                <i class="fa-utility-duo fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                                                   style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; display: inline-block;"></i>
                                                                <input
                                                                        type="text"
                                                                        placeholder="Search servers..."
                                                                        bind:value={serverSearchTerm}
                                                                        class="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                                                                        style="border-color: {$colorStore.primary}30;
                                       color: {$colorStore.text};
                                       background: {$colorStore.primary}08;"
                                                                >
                                                            </div>
                                                        </div>

                                                        <!-- Server List -->
                                                        <div class="max-h-60 overflow-y-auto">
                                                            {#each filteredGuilds as guild (guild.id)}
                                                                <button
                                                                        class="w-full flex items-center gap-3 p-3 transition-colors text-left"
                                                                        style="background: transparent"
                                                                        onmouseenter={(e) => e.currentTarget.style.background = $colorStore.primary + '10'}
                                                                        onmouseleave={(e) => e.currentTarget.style.background = 'transparent'}
                                                                        onclick={() => handleServerSelect(guild)}
                                                                >
                                                                    <img
                                                                            src={guild.icon ?
                                    `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'png'}?size=64` :
                                    'https://cdn.discordapp.com/embed/avatars/0.png'
                                  }
                                                                            alt=""
                                                                            class="w-10 h-10 rounded-lg object-cover"
                                                                    >
                                                                    <div class="flex-1 min-w-0">
                                                                        <div class="font-medium truncate"
                                                                             style="color: {$colorStore.text};">
                                                                            {guild.name}
                                                                        </div>
                                                                        <div class="text-xs"
                                                                             style="color: {$colorStore.muted};">
                                                                            {guild.owner ? 'Owner' : 'Admin'}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            {:else}
                                                                <div class="p-4 text-center"
                                                                     style="color: {$colorStore.muted};">
                                                                    {$userAdminGuilds && $userAdminGuilds.length === 0 ? 'No servers available' : 'No servers found'}
                                                                </div>
                                                            {/each}
                                                        </div>
                                                    </div>
                                                {/if}
                                            </div>

                                            {#if !compactMode}
                                                <p class="text-sm md:text-base mb-3 transition-all duration-300"
                                                   style="color: {$colorStore.muted};">
                                                    Select a server from the dropdown to view its settings
                                                </p>
                                            {/if}

                                            <!-- Quick stats placeholder -->
                                            {#if !compactMode}
                                                <div class="flex flex-wrap items-center gap-4 text-sm transition-all duration-500">
                                                    <div class="flex items-center gap-2 opacity-50">
                                                        <i class="fa-utility-duo fa-regular fa-users"
                                                           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                                                        <span style="color: {$colorStore.text}">-- members</span>
                                                    </div>

                                                    <div class="flex items-center gap-2 opacity-50">
                                                        <i class="fa-utility-duo fa-regular fa-user"
                                                           style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
                                                        <span style="color: {$colorStore.text}">-- humans</span>
                                                    </div>

                                                    {#if botStatus?.isReady}
                                                        <div
                                                          class="flex items-center gap-2 transition-all duration-300 hover:scale-[1.02]">
                                                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span style="color: {$colorStore.text}">Bot Online</span>
                                                        </div>
                                                    {/if}
                                                </div>
                                            {/if}
                                        </div>

                                        <!-- Action buttons -->
                                        <div class="flex items-start gap-3 transition-all duration-500 ease-in-out">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>
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