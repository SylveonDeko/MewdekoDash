<!-- routes/+page.svelte -->
<script lang="ts">
    import {onMount} from "svelte";
    import {fade, fly} from "svelte/transition";
    import type {RedisGuild} from "$lib/types/redisGuild";
    import {colorStore} from "$lib/stores/colorStore";
    import {logger} from "$lib/logger.ts";

    let {data} = $props();

  let guilds: RedisGuild[] = $state([]);
  let fetched = $state(false);
  let isLoading = $state(true);
  const MAX_GUILD_NAME_LENGTH = 20;
  const MAX_GUILDS_TO_SHOW = 10;

  // Mouse tracking for desktop button effects
  let buttonMousePositions = $state<{ [key: string]: { x: number, y: number } }>({});

  // Carousel state variables
  let moderationCurrentIndex = 0;
  let moderationItemCount = 0;
  let responsesCurrentIndex = 0;
  let responsesItemCount = 0;
  let suggestionsCurrentIndex = 0;
  let suggestionsItemCount = 0;
  
  // Feature expansion state
  let showAllFeatures = $state(false);

  // Primary buttons for mobile view
  const primaryButtons = [
    {
      label: "Dashboard",
      href: "/dashboard",
      ariaLabel: "Open Mewdeko Dashboard",
      primary: true
    },
    {
      label: "Invite Bot",
      href: "https://discord.com/oauth2/authorize?client_id=752236274261426212&permissions=66186303&response_type=code&redirect_uri=https%3A%2F%2Fmewdeko.tech%2Fapi%2Fdiscord%2Fcallback&integration_type=0&scope=identify+guilds+bot",
      ariaLabel: "Invite Stable Version of Mewdeko",
      primary: true
    }
  ];

  // Desktop buttons list
  const buttons = [
    {
      label: "Dashboard",
      href: "/dashboard",
        ariaLabel: "Open Mewdeko Dashboard",
        icon: "home"
    },
    {
        label: "Invite Bot",
        href: "https://discord.com/oauth2/authorize?client_id=752236274261426212&permissions=66186303&response_type=code&redirect_uri=https%3A%2F%2Fmewdeko.tech%2Fapi%2Fdiscord%2Fcallback&integration_type=0&scope=identify+guilds+bot",
        ariaLabel: "Invite Mewdeko to your server",
        icon: "add"
    },
    {
      label: "Donate",
        href: "https://ko-fi.com/mewdeko",
        ariaLabel: "Support Mewdeko on Ko-fi",
        icon: "heart"
    },
    {
        label: "Discord",
      href: "https://discord.gg/Z9DYApMXFN",
        ariaLabel: "Join the Mewdeko Discord Server",
        icon: "discord"
    }
  ];

  onMount(async () => {
    try {
      isLoading = true;
      // Add artificial delay for better UX perception
      const [response] = await Promise.all([
        fetch("/api/redis/guilds"),
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
      
      if (response.ok) {
        guilds = await response.json();
        guilds.sort((a, b) => b.MemberCount - a.MemberCount);
        guilds = guilds.slice(0, MAX_GUILDS_TO_SHOW);
        fetched = true;
      } else {
        throw new Error("Failed to fetch guilds");
      }
    } catch (error) {
      logger.error("Error fetching guilds:", error);
    } finally {
      isLoading = false;
    }
  });

  function truncateStringToLength(str: string, num: number): string {
    return str.length <= num ? str : str.slice(0, num) + "...";
  }

  function handleButtonMouseMove(e: MouseEvent, buttonId: string) {
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      buttonMousePositions[buttonId] = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      };
  }

  function handleButtonMouseLeave(buttonId: string) {
      delete buttonMousePositions[buttonId];
  }
</script>

<svelte:head>
  <title>Mewdeko - The Most Customizable Free Open Source Discord Bot</title>
  <meta
    content="Mewdeko - The Most Customizable Free Open Source Bot for Discord"
    property="og:title"
  >
  <meta
    content="Discover Mewdeko, the ultimate open-source Discord bot with 34 feature modules including XP/Leveling, Economy, Music, Tickets, Moderation, Giveaways, and more. Join 11,000+ servers!"
    name="description"
  >
  <meta
    content="Discover Mewdeko, the ultimate open-source Discord bot with 34 feature modules including XP/Leveling, Economy, Music, Tickets, Moderation, Giveaways, and more. Join 11,000+ servers!"
    property="og:description"
  >
  <meta
    content="Discover Mewdeko, the ultimate open-source Discord bot with 34 feature modules including XP/Leveling, Economy, Music, Tickets, Moderation, Giveaways, and more. Join 11,000+ servers!"
    name="twitter:description"
  >
  <meta
    content="Mewdeko, free Discord bot, open source Discord bot, XP leveling bot, Discord economy bot, Discord music bot, Discord moderation bot, ticket system, giveaway bot, suggestion bot, starboard, custom commands, multi-purpose bot, Discord reputation system"
    name="keywords"
  >
</svelte:head>

<main
  style="--color-primary: {$colorStore.primary};
         --color-secondary: {$colorStore.secondary};
         --color-accent: {$colorStore.accent};
         --color-text: {$colorStore.text};
         --color-muted: {$colorStore.muted};"
>
  <header
          class="py-12 sm:py-16 px-4 sm:px-12 flex flex-col items-center relative"
    in:fade={{ duration: 300 }}
    style="background: radial-gradient(circle at top,
      {$colorStore.gradientStart}15 0%,
      {$colorStore.gradientEnd}10 50%,
      {$colorStore.gradientEnd}05 100%
    );"
  >
    <div class="text-center mb-6 sm:mb-8">
      <h1
        class="font-extrabold max-w-4xl mx-auto text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-3 sm:mb-4 animate-pulse-subtle"
        style="color: {$colorStore.text}"
      >
        Mewdeko
      </h1>
      <p class="font-bold text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto px-4 leading-relaxed"
         style="color: {$colorStore.text}">
        The Most Customizable Open Source Bot for Discord!
      </p>
      <div class="mt-4 flex items-center justify-center gap-2 text-sm" style="color: {$colorStore.muted}">
        <span class="inline-flex items-center gap-1">
          <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Online & Ready
        </span>
        <span>•</span>
        <span>Trusted by 11,000+ servers</span>
      </div>
    </div>

      <!-- Subtle login notice -->
      {#if !data.user}
          <div class="mt-6 mb-4 px-4 animate-fade-in" in:fade={{ duration: 600, delay: 300 }}>
              <p class="text-sm text-center italic opacity-75 max-w-md mx-auto" style="color: {$colorStore.muted}">
                  <span class="inline-block animate-pulse-subtle">✨</span>
                  Psst... login and watch the site come to life with your profile icon colors
                  <span class="inline-block animate-pulse-subtle">✨</span>
              </p>
          </div>
      {/if}

      <!-- Mobile-first button layout -->
    <div class="w-full max-w-2xl mx-auto">
        <!-- Mobile card layout -->
      <div class="flex flex-col sm:hidden gap-4 mb-6 px-4">
          <!-- Dashboard Card -->
          <a
                  aria-label="Open Mewdeko Dashboard"
                  class="group relative p-5 rounded-2xl transition-all duration-300 active:scale-[0.98] overflow-hidden {data.user ? 'animate-gradient-bg' : ''}"
                  href="/dashboard"
                  in:fly={{ y: 20, duration: 400, delay: 100 }}
                  style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10);
                 border: 1px solid {$colorStore.primary}30;
                 box-shadow: 0 4px 20px {$colorStore.primary}10;
                 background-size: {data.user ? '200% 200%' : '100% 100%'};"
          >
              <div class="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-500"
                   style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}15);"></div>

              <div class="relative">
                  <div class="flex items-start justify-between mb-3">
                      <i class="fa-utility-duo fa-regular fa-house text-3xl"
                         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                      <span class="text-xs px-2 py-1 rounded-full"
                            style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                Manage
              </span>
                  </div>
                  <h3 class="font-bold text-lg mb-1" style="color: {$colorStore.text}">Dashboard</h3>
                  <p class="text-sm" style="color: {$colorStore.muted}">Configure your bot settings</p>
              </div>
          </a>

          <!-- Invite Bot Card -->
          <a
                  aria-label="Invite Mewdeko to your server"
                  class="group relative p-5 rounded-2xl transition-all duration-300 active:scale-[0.98] overflow-hidden {data.user ? 'animate-gradient-bg' : ''}"
                  href="https://discord.com/oauth2/authorize?client_id=752236274261426212&permissions=66186303&response_type=code&redirect_uri=https%3A%2F%2Fmewdeko.tech%2Fapi%2Fdiscord%2Fcallback&integration_type=0&scope=identify+guilds+bot"
                  in:fly={{ y: 20, duration: 400, delay: 200 }}
                  rel="noreferrer"
                  style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.primary}10);
                 border: 1px solid {$colorStore.secondary}30;
                 box-shadow: 0 4px 20px {$colorStore.secondary}10;
                 background-size: {data.user ? '200% 200%' : '100% 100%'};"
                  target="_blank"
          >
              <div class="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-500"
                   style="background: linear-gradient(135deg, {$colorStore.secondary}20, {$colorStore.primary}15);"></div>

              <div class="relative">
                  <div class="flex items-start justify-between mb-3">
                      <i class="fa-utility-duo fa-regular fa-user-plus text-3xl"
                         style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
                      <span class="text-xs px-2 py-1 rounded-full"
                            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                Free
              </span>
                  </div>
                  <h3 class="font-bold text-lg mb-1" style="color: {$colorStore.text}">Add to Server</h3>
                  <p class="text-sm" style="color: {$colorStore.muted}">Invite Mewdeko to your Discord</p>
              </div>
          </a>

          <!-- Secondary Actions Row -->
          <div class="grid grid-cols-2 gap-3">
              <!-- Discord Card -->
              <a
                      aria-label="Join the Mewdeko Discord Server"
                      class="group relative p-4 rounded-xl transition-all duration-300 active:scale-[0.98] overflow-hidden"
                      href="https://discord.gg/Z9DYApMXFN"
                      in:fly={{ y: 20, duration: 400, delay: 300 }}
                      rel="noreferrer"
                      style="background: {$colorStore.primary}08;
                   border: 1px solid {$colorStore.primary}20;
                   box-shadow: 0 2px 12px {$colorStore.primary}05;"
                      target="_blank"
              >
                  <div class="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-300"
                       style="background: {$colorStore.primary}12;"></div>

                  <div class="relative">
                      <i class="fa-brands fa-discord text-2xl mb-2" style="color: {$colorStore.text}"></i>
                      <p class="font-semibold text-sm" style="color: {$colorStore.text}">Discord</p>
                      <p class="text-xs mt-1" style="color: {$colorStore.muted}">Join us</p>
                  </div>
              </a>

              <!-- Support Card -->
              <a
                      aria-label="Support Mewdeko on Ko-fi"
                      class="group relative p-4 rounded-xl transition-all duration-300 active:scale-[0.98] overflow-hidden"
                      href="https://ko-fi.com/mewdeko"
                      in:fly={{ y: 20, duration: 400, delay: 400 }}
                      rel="noreferrer"
                      style="background: {$colorStore.secondary}08;
                   border: 1px solid {$colorStore.secondary}20;
                   box-shadow: 0 2px 12px {$colorStore.secondary}05;"
                      target="_blank"
              >
                  <div class="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-300"
                       style="background: {$colorStore.secondary}12;"></div>

                  <div class="relative">
                      <i class="fa-solid fa-heart text-2xl mb-2" style="color: {$colorStore.text}"></i>
                      <p class="font-semibold text-sm" style="color: {$colorStore.text}">Support</p>
                      <p class="text-xs mt-1" style="color: {$colorStore.muted}">Donate</p>
                  </div>
              </a>
          </div>
      </div>

        <!-- Desktop buttons - New Layout -->
        <div class="hidden sm:block mt-8 max-w-3xl mx-auto">
            <div class="grid grid-cols-2 gap-4 px-4">
                <!-- Primary CTAs - Top Row -->
                <a
                        aria-label="Open Mewdeko Dashboard"
                        class="group relative p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden {data.user ? 'animate-gradient-bg' : ''}"
                        href="/dashboard"
                        in:fly={{ y: 20, duration: 400, delay: 100 }}
                        onmouseleave={() => handleButtonMouseLeave('dashboard')}
                        onmousemove={(e) => handleButtonMouseMove(e, 'dashboard')}
                        style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10);
                   border: 1px solid {$colorStore.primary}30;
                   box-shadow: 0 4px 20px {$colorStore.primary}10;
                   background-size: {data.user ? '200% 200%' : '100% 100%'};"
                >
                    <!-- Mouse spotlight inside button -->
                    {#if buttonMousePositions['dashboard']}
                        <div
                                class="pointer-events-none absolute w-32 h-32 rounded-full opacity-30 transition-all duration-100 ease-out"
                                style="background: radial-gradient(circle at center, {$colorStore.primary}60, transparent 70%);
                       left: {buttonMousePositions['dashboard'].x}px;
                       top: {buttonMousePositions['dashboard'].y}px;
                       transform: translate(-50%, -50%);
                       filter: blur(20px);"
                        ></div>
                    {/if}

                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}15);"></div>

                    <div class="relative z-10">
                        <div class="flex items-center justify-between mb-3">
                            <i class="fa-utility-duo fa-regular fa-house text-3xl"
                               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
                            <span class="text-xs px-2 py-1 rounded-full"
                                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                  Manage
                </span>
                        </div>
                        <h3 class="font-bold text-xl mb-1" style="color: {$colorStore.text}">Dashboard</h3>
                        <p class="text-sm" style="color: {$colorStore.muted}">Configure your bot settings</p>
                    </div>
                </a>

                <a
                        aria-label="Invite Mewdeko to your server"
                        class="group relative p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden {data.user ? 'animate-gradient-bg' : ''}"
                        href="https://discord.com/oauth2/authorize?client_id=752236274261426212&permissions=66186303&response_type=code&redirect_uri=https%3A%2F%2Fmewdeko.tech%2Fapi%2Fdiscord%2Fcallback&integration_type=0&scope=identify+guilds+bot"
                        in:fly={{ y: 20, duration: 400, delay: 200 }}
                        onmouseleave={() => handleButtonMouseLeave('invite')}
                        onmousemove={(e) => handleButtonMouseMove(e, 'invite')}
                        rel="noreferrer"
                        style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.primary}10);
                   border: 1px solid {$colorStore.secondary}30;
                   box-shadow: 0 4px 20px {$colorStore.secondary}10;
                   background-size: {data.user ? '200% 200%' : '100% 100%'};"
                        target="_blank"
                >
                    <!-- Mouse spotlight inside button -->
                    {#if buttonMousePositions['invite']}
                        <div
                                class="pointer-events-none absolute w-32 h-32 rounded-full opacity-30 transition-all duration-100 ease-out"
                                style="background: radial-gradient(circle at center, {$colorStore.secondary}60, transparent 70%);
                       left: {buttonMousePositions['invite'].x}px;
                       top: {buttonMousePositions['invite'].y}px;
                       transform: translate(-50%, -50%);
                       filter: blur(20px);"
                        ></div>
                    {/if}

                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                         style="background: linear-gradient(135deg, {$colorStore.secondary}20, {$colorStore.primary}15);"></div>

                    <div class="relative z-10">
                        <div class="flex items-center justify-between mb-3">
                            <i class="fa-utility-duo fa-regular fa-user-plus text-3xl"
                               style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
                            <span class="text-xs px-2 py-1 rounded-full"
                                  style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                  Free
                </span>
                        </div>
                        <h3 class="font-bold text-xl mb-1" style="color: {$colorStore.text}">Add to Server</h3>
                        <p class="text-sm" style="color: {$colorStore.muted}">Invite Mewdeko to your Discord</p>
                    </div>
                </a>

                <!-- Secondary CTAs - Bottom Row -->
                <a
                        aria-label="Join the Mewdeko Discord Server"
                        class="group relative p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                        href="https://discord.gg/Z9DYApMXFN"
                        in:fly={{ y: 20, duration: 400, delay: 300 }}
                        onmouseleave={() => handleButtonMouseLeave('discord')}
                        onmousemove={(e) => handleButtonMouseMove(e, 'discord')}
                        rel="noreferrer"
                        style="background: {$colorStore.primary}08;
                   border: 1px solid {$colorStore.primary}20;
                   box-shadow: 0 2px 12px {$colorStore.primary}05;"
                        target="_blank"
                >
                    <!-- Mouse spotlight inside button -->
                    {#if buttonMousePositions['discord']}
                        <div
                                class="pointer-events-none absolute w-24 h-24 rounded-full opacity-25 transition-all duration-100 ease-out"
                                style="background: radial-gradient(circle at center, {$colorStore.primary}50, transparent 70%);
                       left: {buttonMousePositions['discord'].x}px;
                       top: {buttonMousePositions['discord'].y}px;
                       transform: translate(-50%, -50%);
                       filter: blur(15px);"
                        ></div>
                    {/if}

                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                         style="background: {$colorStore.primary}12;"></div>

                    <div class="relative z-10 flex items-center gap-3">
                        <i class="fa-brands fa-discord text-2xl flex-shrink-0" style="color: {$colorStore.text}"></i>
                        <div>
                            <p class="font-semibold" style="color: {$colorStore.text}">Join Community</p>
                            <p class="text-xs" style="color: {$colorStore.muted}">Get help & chat</p>
                        </div>
                    </div>
                </a>

                <a
                        aria-label="Support Mewdeko on Ko-fi"
                        class="group relative p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                        href="https://ko-fi.com/mewdeko"
                        in:fly={{ y: 20, duration: 400, delay: 400 }}
                        onmouseleave={() => handleButtonMouseLeave('donate')}
                        onmousemove={(e) => handleButtonMouseMove(e, 'donate')}
                        rel="noreferrer"
                        style="background: {$colorStore.secondary}08;
                   border: 1px solid {$colorStore.secondary}20;
                   box-shadow: 0 2px 12px {$colorStore.secondary}05;"
                        target="_blank"
                >
                    <!-- Mouse spotlight inside button -->
                    {#if buttonMousePositions['donate']}
                        <div
                                class="pointer-events-none absolute w-24 h-24 rounded-full opacity-25 transition-all duration-100 ease-out"
                                style="background: radial-gradient(circle at center, {$colorStore.secondary}50, transparent 70%);
                       left: {buttonMousePositions['donate'].x}px;
                       top: {buttonMousePositions['donate'].y}px;
                       transform: translate(-50%, -50%);
                       filter: blur(15px);"
                        ></div>
                    {/if}

                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                         style="background: {$colorStore.secondary}12;"></div>

                    <div class="relative z-10 flex items-center gap-3">
                        <i class="fa-solid fa-heart text-2xl flex-shrink-0" style="color: {$colorStore.text}"></i>
                        <div>
                            <p class="font-semibold" style="color: {$colorStore.text}">Support Us</p>
                            <p class="text-xs" style="color: {$colorStore.muted}">Buy us a coffee</p>
                        </div>
                    </div>
                </a>
            </div>
        </div>

    </div>

      {#if fetched}
      <section
        aria-labelledby="top-servers-heading"
        class="relative mt-16 w-full"
      >
        <div class="text-center mb-8">
          <h2
            id="top-servers-heading"
            class="mb-3 text-2xl lg:text-3xl font-bold"
            style="color: {$colorStore.text}"
          >
            Our Top Servers
          </h2>
          <p class="text-sm lg:text-base" style="color: {$colorStore.muted}">
            Join thousands of communities already using Mewdeko
          </p>
        </div>
        {#if guilds.length > 0}
            <div class="w-full max-w-6xl mx-auto px-4">
                <!-- Responsive grid layout for all screen sizes with centering -->
                <div class="flex flex-wrap justify-center gap-4" role="list"
                 aria-label="Top server communities">
                    {#each guilds.slice(0, 8) as guild, index (guild.Name)}
                <div
                        class="group relative rounded-xl border transition-all duration-300 hover:scale-[1.02] overflow-hidden w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)]"
                        style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}10);
                         border-color: {$colorStore.primary}20;
                         box-shadow: 0 2px 12px {$colorStore.primary}05;"
                  in:fly={{ y: 20, duration: 300, delay: index * 50 }}
                  role="listitem"
                >
                    <!-- Hover gradient overlay -->
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                         style="background: linear-gradient(135deg, {$colorStore.primary}10, {$colorStore.secondary}08);"></div>

                    <div class="relative p-4">
                        <div class="flex items-center gap-3">
                            <!-- Server icon -->
                            <div class="relative flex-shrink-0">
                                <img
                                        src={guild.IconUrl}
                                        alt="{guild.Name} icon"
                                        loading="lazy"
                                        class="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-opacity-20"
                                        style="ring-color: {$colorStore.primary};"
                                >
                                <!-- Online indicator -->
                                <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-opacity-90"
                                     style="ring-color: {$colorStore.background};"></div>
                            </div>

                            <!-- Server info -->
                            <div class="flex-1 min-w-0">
                                <h3 class="font-semibold text-sm sm:text-base truncate"
                                    style="color: {$colorStore.text}">
                                    {guild.Name}
                                </h3>
                                <div class="flex items-center gap-1 mt-1">
                                    <i class="fa-solid fa-users text-xs sm:text-sm" style="color: {$colorStore.muted}"></i>
                                    <span class="text-xs sm:text-sm" style="color: {$colorStore.muted}">
                            {guild.MemberCount.toLocaleString()}
                          </span>
                                </div>
                            </div>
                        </div>
                  </div>
                </div>
              {/each}
            </div>

                <!-- View more indicator -->
                {#if guilds.length > 8}
                    <div class="text-center mt-6">
                        <p class="text-sm" style="color: {$colorStore.muted}">
                            And {guilds.length - 8} more amazing communities...
                        </p>
                    </div>
                {/if}
          </div>
        {:else if isLoading}
          <!-- Loading skeleton -->
            <div class="w-full max-w-6xl mx-auto px-4">
                <div class="flex flex-wrap justify-center gap-4">
                    {#each Array(8) as _, index}
                        <div class="animate-pulse w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)]"
                             in:fly={{ y: 20, duration: 300, delay: index * 50 }}>
                            <div class="rounded-xl border p-4"
                                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}05, {$colorStore.gradientMid}08);
                              border-color: {$colorStore.primary}15;">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r opacity-30"
                                         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);"></div>
                                    <div class="flex-1">
                                        <div class="h-4 rounded-lg mb-2 opacity-20"
                                             style="background: {$colorStore.text}; width: 70%;"></div>
                                        <div class="h-3 rounded-lg opacity-15"
                                             style="background: {$colorStore.muted}; width: 40%;"></div>
                                    </div>
                                </div>
                            </div>
                </div>
              {/each}
            </div>

            <div class="text-center mt-6">
              <div class="animate-spin w-8 h-8 border-2 border-dashed rounded-full mx-auto mb-4"
                   style="border-color: {$colorStore.primary}60;"></div>
              <p class="text-sm animate-pulse" style="color: {$colorStore.muted}">
                Loading our amazing communities...
              </p>
            </div>
          </div>
        {:else}
          <div class="text-center py-8">
            <p style="color: {$colorStore.muted}">
              No communities to display right now.
            </p>
          </div>
        {/if}
      </section>
    {/if}
  </header>

  <section
    aria-labelledby="features-heading"
    class="py-24 backdrop-blur-xs relative overflow-hidden"
    style="background: radial-gradient(circle at center,
      {$colorStore.gradientStart}15 0%,
      {$colorStore.gradientEnd}10 50%,
      {$colorStore.gradientEnd}05 100%
    );"
  >
    <!-- Floating background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 animate-float-slow"
           style="background: radial-gradient(circle, {$colorStore.primary}40, transparent);"></div>
      <div class="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-15 animate-float-slower"
           style="background: radial-gradient(circle, {$colorStore.secondary}40, transparent);"></div>
      <div class="absolute top-1/2 right-1/3 w-32 h-32 rounded-full opacity-20 animate-float"
           style="background: radial-gradient(circle, {$colorStore.accent}40, transparent);"></div>
    </div>

    <div class="container mx-auto px-4 max-w-7xl relative z-10">
      <div class="text-center mb-16">
        <h2
          class="text-4xl lg:text-5xl font-extrabold mb-4 bg-gradient-to-r bg-clip-text text-transparent leading-tight"
          id="features-heading"
          style="background-image: linear-gradient(135deg, {$colorStore.text}, {$colorStore.primary}, {$colorStore.secondary});"
        >
          Key Features
        </h2>
        <div class="w-24 h-1 mx-auto rounded-full mb-6"
             style="background: linear-gradient(90deg, {$colorStore.primary}, {$colorStore.secondary}, {$colorStore.accent});"></div>
        <p class="text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed" style="color: {$colorStore.muted}">
          Discover why thousands are switching from premium bots to Mewdeko. Everything you need, <span class="font-bold text-green-400">completely free</span>, with <span class="font-bold text-green-400">zero limitations</span>.
        </p>
      </div>
      
      <!-- Simple Premium Bot Callout -->
      <div class="mb-16 px-4">
        <div class="rounded-2xl border p-6 sm:p-8 max-w-4xl mx-auto text-center"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                    border-color: {$colorStore.accent}30;">
          <div class="inline-block px-4 py-2 rounded-full mb-4"
               style="background: {$colorStore.accent}15; border: 1px solid {$colorStore.accent}30;">
            <span class="text-sm font-semibold" style="color: {$colorStore.accent}">Why pay for basic features?</span>
          </div>
          <h3 class="text-2xl sm:text-3xl font-bold mb-4" style="color: {$colorStore.text}">
            Premium bots charge <span style="color: {$colorStore.accent}">$12+/month</span> for what Mewdeko gives you <span style="color: {$colorStore.secondary}">free</span>
          </h3>
          <p class="text-lg mb-6" style="color: {$colorStore.muted}">
            <span class="font-bold" style="color: {$colorStore.secondary}">Absolutely Free.</span>
            <span class="font-bold" style="color: {$colorStore.primary}">Absolutely Overkill.</span>
            <span style="color: {$colorStore.muted}">No Compromises.</span>
          </p>
        </div>
      </div>

      <!-- Bot Customization Callout -->
      <div class="mb-16 px-4">
        <div class="rounded-2xl border p-6 sm:p-8 max-w-4xl mx-auto"
             style="background: linear-gradient(135deg, {$colorStore.primary}08, {$colorStore.secondary}12);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 400 }}>
          <div class="flex flex-col md:flex-row items-center gap-6">
            <!-- Icon/Visual -->
            <div class="flex-shrink-0">
              <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
                   style="background: {$colorStore.primary}15; border: 2px solid {$colorStore.primary}30;">
                🎨
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 text-center md:text-left">
              <div class="inline-block px-3 py-1 rounded-full mb-3"
                   style="background: {$colorStore.primary}15; border: 1px solid {$colorStore.primary}30;">
                <span class="text-xs font-semibold" style="color: {$colorStore.primary}">Unique Feature</span>
              </div>
              <h3 class="text-xl sm:text-2xl font-bold mb-2" style="color: {$colorStore.text}">
                Don't like the default avatar? <span style="color: {$colorStore.primary}">Change it!</span>
              </h3>
              <p class="text-base sm:text-lg" style="color: {$colorStore.muted}">
                Customize the bot's <span class="font-semibold" style="color: {$colorStore.text}">avatar, banner, and bio</span> in <span class="font-semibold" style="color: {$colorStore.text}">every server you invite it to</span> — completely free.
                Make Mewdeko truly yours with per-server customization!
              </p>
            </div>

            <!-- CTA -->
            <div class="flex-shrink-0">
              <a href="/dashboard"
                 class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                 style="background: {$colorStore.primary}; color: {$colorStore.text}; box-shadow: 0 4px 20px {$colorStore.primary}30;">
                Try Now
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Top 4 Core Features -->
      <div class="px-4 mb-16">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-12">
            <h3 class="text-3xl sm:text-4xl font-bold mb-4" style="color: {$colorStore.text}">
              Core Features
            </h3>
            <p class="text-lg sm:text-xl" style="color: {$colorStore.muted}">
              Everything you need to run a Discord server
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
            <!-- XP & Leveling -->
            <div class="rounded-2xl border p-8 shadow-lg transition-all hover:scale-[1.02]"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                        border-color: {$colorStore.primary}30;">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                     style="background: {$colorStore.primary}15; border: 1px solid {$colorStore.primary}30; color: {$colorStore.primary};">XP</div>
                <div>
                  <h3 class="text-2xl font-bold" style="color: {$colorStore.text}">Leveling System</h3>
                  <p class="text-base" style="color: {$colorStore.muted}">Keep members engaged and active</p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.primary};"></div>
                  <span>XP competitions with rewards</span>
                </div>
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.primary};"></div>
                  <span>Voice channel XP tracking</span>
                </div>
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.primary};"></div>
                  <span>Custom level-up messages</span>
                </div>
              </div>
            </div>
        
            <!-- Economy & Games -->
            <div class="rounded-2xl border p-8 shadow-lg transition-all hover:scale-[1.02]"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                        border-color: {$colorStore.secondary}30;">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                     style="background: {$colorStore.secondary}15; border: 1px solid {$colorStore.secondary}30; color: {$colorStore.secondary};">20+</div>
                <div>
                  <h3 class="text-2xl font-bold" style="color: {$colorStore.text}">Economy Games</h3>
                  <p class="text-base" style="color: {$colorStore.muted}">Boost activity with gambling & rewards</p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.secondary};"></div>
                  <span>Blackjack, Roulette, Slots, Horse Racing</span>
                </div>
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.secondary};"></div>
                  <span>Daily challenges & leaderboards</span>
                </div>
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.secondary};"></div>
                  <span>User balance & transaction tracking</span>
                </div>
              </div>
            </div>
        
            <!-- Moderation -->
            <div class="rounded-2xl border p-8 shadow-lg transition-all hover:scale-[1.02]"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                        border-color: {$colorStore.accent}30;">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                     style="background: {$colorStore.accent}15; border: 1px solid {$colorStore.accent}30; color: {$colorStore.accent};">MD</div>
                <div>
                  <h3 class="text-2xl font-bold" style="color: {$colorStore.text}">Auto Moderation</h3>
                  <p class="text-base" style="color: {$colorStore.muted}">Keep your server safe automatically</p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.accent};"></div>
                  <span>Auto-ban words & anti-spam protection</span>
                </div>
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.accent};"></div>
                  <span>Warning systems & user punishment</span>
                </div>
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.accent};"></div>
                  <span>Bulk moderation tools</span>
                </div>
              </div>
            </div>
        
            <!-- Music Bot -->
            <div class="rounded-2xl border p-8 shadow-lg transition-all hover:scale-[1.02]"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                        border-color: {$colorStore.primary}30;">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                     style="background: {$colorStore.primary}15; border: 1px solid {$colorStore.primary}30; color: {$colorStore.primary};">MX</div>
                <div>
                  <h3 class="text-2xl font-bold" style="color: {$colorStore.text}">Music Bot</h3>
                  <p class="text-base" style="color: {$colorStore.muted}">High-quality audio streaming</p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.primary};"></div>
                  <span>Lavalink-powered audio quality</span>
                </div>
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.primary};"></div>
                  <span>Queue & playlist management</span>
                </div>
                <div class="flex items-center gap-3 text-sm" style="color: {$colorStore.text}">
                  <div class="w-2 h-2 rounded-full" style="background: {$colorStore.primary};"></div>
                  <span>Music effects & filters</span>
                </div>
              </div>
            </div>
        
          </div>
        </div>
      </div>
      
      
      <!-- Show More Features Section -->
      <div class="px-4 mb-16">
        <div class="max-w-6xl mx-auto text-center">
          <button
                  onclick={() => showAllFeatures = !showAllFeatures}
                  class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] mb-8"
            style="background: {$colorStore.accent}15; color: {$colorStore.accent}; border: 2px solid {$colorStore.accent}30;">
            {showAllFeatures ? 'Hide' : 'Show All'} 25+ Additional Features
            <span class="transform transition-transform {showAllFeatures ? 'rotate-180' : ''}">↓</span>
          </button>
          
          {#if showAllFeatures}
            <div class="rounded-2xl border p-8 shadow-lg" 
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}06, {$colorStore.gradientMid}10);
                        border-color: {$colorStore.primary}20;"
                 in:fly={{ y: 20, duration: 300 }}>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div class="p-4 rounded-lg" style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Support Tickets</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Professional help desk system</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Giveaways</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Contest management & prizes</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Suggestions</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Community feedback with voting</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Starboard</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Highlight popular messages</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Multi-Greets</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">30 welcome messages per server</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Todo Lists</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Task management with permissions</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Birthday Tracking</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Automatic celebrations</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Reputation System</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">User reputation tracking</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Highlights</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Word notification alerts</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Games</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Trivia, hangman, tic-tac-toe</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Confessions</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Anonymous messaging</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Role States</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Persistent role management</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Custom Voice</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Voice channel automation</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">Counting Games</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Interactive counting with rules</div>
                </div>
                <div class="p-4 rounded-lg" style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-base mb-2" style="color: {$colorStore.text}">AFK System</div>
                  <div class="text-sm" style="color: {$colorStore.muted}">Away status management</div>
                </div>
              </div>
              
              <div class="text-center mt-8">
                <a href="/commands"
                   class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]"
                   style="background: {$colorStore.secondary}; color: {$colorStore.text}; box-shadow: 0 8px 32px {$colorStore.secondary}40;">
                  View Complete Feature List
                </a>
              </div>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Community CTA Section -->
      <div class="text-center py-16 px-4">
        <div class="max-w-4xl mx-auto">
            <div class="backdrop-blur-xs rounded-2xl border p-8 shadow-lg"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                      border-color: {$colorStore.primary}20;">
            <h3 class="text-2xl font-bold mb-4" style="color: {$colorStore.text}">
              Questions? Suggestions? Missing Features?
            </h3>
            <p class="text-lg mb-6 leading-relaxed" style="color: {$colorStore.muted}">
              Notice something missing or have a feature request? Got questions about setup or usage? 
              Join our Discord community - we're always happy to help and hear your ideas!
            </p>
            <a href="https://discord.gg/Z9DYApMXFN"
               target="_blank"
               class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]"
               style="background: {$colorStore.primary}; color: {$colorStore.text}; box-shadow: 0 8px 32px {$colorStore.primary}40;">
              Join Our Discord Community
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<style>
    @keyframes pulse-border {
        0%, 100% {
            opacity: 0.5;
            transform: scale(1);
        }
        50% {
            opacity: 0.8;
            transform: scale(1.01);
        }
    }

    .animate-float {
        animation: float 20s ease-in-out infinite;
    }

    .animate-float-slow {
        animation: float 25s ease-in-out infinite;
    }

    .animate-float-slower {
        animation: float 30s ease-in-out infinite;
    }

    @keyframes float {
        0%, 100% {
            transform: translate(0, 0);
        }
        25% {
            transform: translate(-20px, -20px);
        }
        50% {
            transform: translate(20px, -10px);
        }
        75% {
            transform: translate(-10px, 20px);
        }
    }

    .animate-pulse-subtle {
        animation: pulse-subtle 4s ease-in-out infinite;
    }

    @keyframes pulse-subtle {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.9;
        }
    }

    @keyframes gradient-shift {
        0% {
            background-position: 0 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0 50%;
        }
    }

    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fade-in {
        animation: fade-in 0.6s ease-out forwards;
    }
</style>