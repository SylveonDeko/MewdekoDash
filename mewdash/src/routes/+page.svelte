<!-- routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import FluidContainer from "$lib/components/display/FluidContainer.svelte";
  import Interactable from "$lib/components/display/InteractableElement.svelte";
  import Carousel from "$lib/components/display/Carousel.svelte";
  import ImageWrapper from "$lib/components/display/ImageWrapper.svelte";
  import type { RedisGuild } from "$lib/types/redisGuild";
  import MultiButton from "$lib/components/display/MultiButton.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";

  export let data;

  let guilds: RedisGuild[] = [];
  let fetched = false;
  let isLoading = true;
  const MAX_GUILD_NAME_LENGTH = 20;
  const MAX_GUILDS_TO_SHOW = 10;

  // Carousel state variables
  let moderationCurrentIndex = 0;
  let moderationItemCount = 0;
  let responsesCurrentIndex = 0;
  let responsesItemCount = 0;
  let suggestionsCurrentIndex = 0;
  let suggestionsItemCount = 0;
  
  // Feature expansion state
  let showAllFeatures = false;

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

  // Full buttons list for desktop
  const buttons = [
    {
      label: "Dashboard",
      href: "/dashboard",
      ariaLabel: "Open Mewdeko Dashboard"
    },
    {
      label: "Invite",
      ariaLabel: "Invite Mewdeko",
      options: [
        {
          label: "Stable",
          href: "https://discord.com/oauth2/authorize?client_id=752236274261426212&permissions=66186303&response_type=code&redirect_uri=https%3A%2F%2Fmewdeko.tech%2Fapi%2Fdiscord%2Fcallback&integration_type=0&scope=identify+guilds+bot",
          ariaLabel: "Invite Stable Version of Mewdeko"
        },
        {
          label: "Nightly",
          href: "https://discord.com/oauth2/authorize?client_id=964590728397344868&permissions=6618603&scope=bot",
          ariaLabel: "Invite Nightly Version of Mewdeko"
        }
      ]
    },
    {
      label: "Donate",
      ariaLabel: "Donate to Mewdeko",
      options: [
        {
          label: "Ko-fi",
          href: "https://ko-fi.com/mewdeko",
          ariaLabel: "Donate via Ko-fi"
        },
        {
          label: "Paypal",
          href: "https://paypal.me/eugenevernik",
          ariaLabel: "Donate via Paypal"
        }
      ]
    },
    {
      label: "Server",
      href: "https://discord.gg/Z9DYApMXFN",
      ariaLabel: "Join the Mewdeko Server"
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
</script>

<svelte:head>
  <title>Mewdeko - The Most Customizable Free Open Source Discord Bot</title>
  <meta
    content="Mewdeko - The Most Customizable Free Open Source Bot for Discord"
    property="og:title"
  />
  <meta
    content="Discover Mewdeko, the ultimate open-source Discord bot with 34 feature modules including XP/Leveling, Economy, Music, Tickets, Moderation, Giveaways, and more. Join 11,000+ servers!"
    name="description"
  />
  <meta
    content="Discover Mewdeko, the ultimate open-source Discord bot with 34 feature modules including XP/Leveling, Economy, Music, Tickets, Moderation, Giveaways, and more. Join 11,000+ servers!"
    property="og:description"
  />
  <meta
    content="Discover Mewdeko, the ultimate open-source Discord bot with 34 feature modules including XP/Leveling, Economy, Music, Tickets, Moderation, Giveaways, and more. Join 11,000+ servers!"
    name="twitter:description"
  />
  <meta
    content="Mewdeko, free Discord bot, open source Discord bot, XP leveling bot, Discord economy bot, Discord music bot, Discord moderation bot, ticket system, giveaway bot, suggestion bot, starboard, custom commands, multi-purpose bot, Discord reputation system"
    name="keywords"
  />
</svelte:head>

<main
  style="--color-primary: {$colorStore.primary};
         --color-secondary: {$colorStore.secondary};
         --color-accent: {$colorStore.accent};
         --color-text: {$colorStore.text};
         --color-muted: {$colorStore.muted};"
>
  <header
    class="py-12 sm:py-16 px-4 sm:px-12 flex flex-col items-center relative backdrop-blur-md"
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

    <!-- Mobile-first button layout -->
    <div class="w-full max-w-2xl mx-auto">
      <!-- Primary CTAs for mobile -->
      <div class="flex flex-col sm:hidden gap-4 mb-6 px-4">
        {#each primaryButtons as button, index}
          <a
            href={button.href}
            class="group relative w-full px-8 py-4 rounded-2xl font-bold text-lg text-center transition-all duration-300 backdrop-blur-sm hover:shadow-xl hover:scale-105 active:scale-95"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}25, {$colorStore.gradientMid}35);
                   color: {$colorStore.text};
                   border: 1px solid {$colorStore.primary}50;
                   box-shadow: 0 8px 32px {$colorStore.primary}20;"
            aria-label={button.ariaLabel}
            in:fly={{ y: 20, duration: 300, delay: index * 100 }}
          >
            <span class="relative z-10">{button.label}</span>
            <div
              class="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </a>
        {/each}
      </div>

      <!-- Desktop buttons -->
      <div class="hidden sm:block">
        <MultiButton {buttons} />
      </div>

      <!-- Secondary actions for mobile -->
      <div class="flex sm:hidden justify-center gap-3 mt-4">
        <a
          aria-label="Join Discord Server"
          class="group px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
          href="https://discord.gg/Z9DYApMXFN"
          style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
        >
          <span class="flex items-center gap-2">
            Discord
          </span>
        </a>
        <a
          aria-label="Donate on Ko-fi"
          class="group px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
          href="https://ko-fi.com/mewdeko"
          style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
        >
          <span class="flex items-center gap-2">
            Donate
          </span>
        </a>
      </div>
    </div>

    {#if fetched}
      <section
        aria-labelledby="top-servers-heading"
        class="relative mt-16 w-full z-40"
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
          <div class="px-4 max-w-4xl mx-auto">
            <!-- Mobile: Grid layout -->
            <div class="grid grid-cols-5 sm:hidden gap-4 justify-items-center mb-4" role="list"
                 aria-label="Top server communities">
              {#each guilds.slice(0, 10) as guild, index (guild.Name)}
                <div
                  class="relative group server-icon-mobile focus-within:ring-2 focus-within:ring-offset-2 rounded-full"
                  style="--tw-ring-color: {$colorStore.accent};"
                  in:fly={{ y: 20, duration: 300, delay: index * 50 }}
                  role="listitem"
                >
                  <button
                    class="w-12 h-12 rounded-full server-icon border-2 border-transparent group-hover:border-primary/50 focus:border-primary/70 focus:outline-none transition-all duration-300 relative overflow-hidden"
                    style="border-color: {$colorStore.primary}20;"
                    aria-label="{guild.Name} server with {guild.MemberCount.toLocaleString()} members"
                    tabindex="0"
                    aria-describedby="tooltip-mobile-{index}"
                  >
                    <img
                      src={guild.IconUrl}
                      alt=""
                      loading="lazy"
                      class="w-full h-full object-cover rounded-full"
                      role="presentation"
                    />
                  </button>
                  <div
                    class="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white opacity-90 animate-pulse"
                    aria-hidden="true"></div>

                  <!-- Enhanced mobile tooltip -->
                  <div
                    class="absolute hidden group-hover:block group-focus-within:block z-20 px-3 py-2 text-xs rounded-lg shadow-xl whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-3 backdrop-blur-lg animate-in fade-in duration-200"
                    role="tooltip"
                    id="tooltip-mobile-{index}"
                    style="background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.75)), linear-gradient(135deg, {$colorStore.gradientStart}60, {$colorStore.gradientEnd}60);
                           border: 1px solid {$colorStore.primary}60;
                           box-shadow: 0 10px 40px rgba(0,0,0,0.3);"
                  >
                    <p class="font-bold text-center" style="color: {$colorStore.text}">
                      {truncateStringToLength(guild.Name, 18)}
                    </p>
                    <p class="text-center mt-1" style="color: {$colorStore.muted}">
                      {guild.MemberCount.toLocaleString()} members
                    </p>
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45"
                         style="background: linear-gradient(135deg, rgba(0,0,0,0.85), {$colorStore.gradientStart}60); border-bottom: 1px solid {$colorStore.primary}60; border-right: 1px solid {$colorStore.primary}60;"></div>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Desktop: Flex layout -->
            <ul
              class="hidden sm:flex flex-wrap justify-center items-center gap-6 p-4"
              aria-label="Top server communities"
              role="list"
            >
              {#each guilds as guild, index (guild.Name)}
                <li
                  class="relative group server-icon-desktop focus-within:ring-4 focus-within:ring-offset-4 rounded-full"
                  style="--tw-ring-color: {$colorStore.accent};"
                  in:fly={{ y: 20, duration: 300, delay: index * 75 }}
                  role="listitem"
                >
                  <button
                    class="w-16 h-16 lg:w-20 lg:h-20 rounded-full server-icon border-3 border-transparent group-hover:border-primary/60 focus:border-primary/80 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden"
                    style="border-color: {$colorStore.primary}25;"
                    aria-label="{guild.Name} server with {guild.MemberCount.toLocaleString()} members"
                    aria-describedby="tooltip-desktop-{index}"
                    tabindex="0"
                  >
                    <img
                      src={guild.IconUrl}
                      alt=""
                      loading="lazy"
                      class="w-full h-full object-cover rounded-full"
                      role="presentation"
                    />
                  </button>
                  <div
                    class="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white opacity-90 animate-pulse"
                    aria-hidden="true"></div>

                  <!-- Enhanced desktop tooltip -->
                  <div
                    class="absolute hidden group-hover:block group-focus-within:block z-20 px-4 py-3 text-sm rounded-xl shadow-2xl whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-4 backdrop-blur-lg animate-in fade-in slide-in-from-bottom-2 duration-300"
                    role="tooltip"
                    id="tooltip-desktop-{index}"
                    style="background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.75)), linear-gradient(135deg, {$colorStore.gradientStart}60, {$colorStore.gradientEnd}60);
                           border: 1px solid {$colorStore.primary}60;
                           box-shadow: 0 20px 60px rgba(0,0,0,0.4);"
                  >
                    <p class="font-bold text-center mb-1" style="color: {$colorStore.text}">
                      {truncateStringToLength(guild.Name, MAX_GUILD_NAME_LENGTH)}
                    </p>
                    <p class="text-center text-xs" style="color: {$colorStore.muted}">
                      {guild.MemberCount.toLocaleString()} members active
                    </p>
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45"
                         style="background: linear-gradient(135deg, rgba(0,0,0,0.85), {$colorStore.gradientStart}60); border-bottom: 1px solid {$colorStore.primary}60; border-right: 1px solid {$colorStore.primary}60;"></div>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {:else if isLoading}
          <!-- Loading skeleton -->
          <div class="px-4 max-w-4xl mx-auto">
            <!-- Mobile skeleton -->
            <div class="grid grid-cols-5 sm:hidden gap-4 justify-items-center mb-4">
              {#each Array(10) as _, index}
                <div class="animate-pulse" in:fly={{ y: 20, duration: 300, delay: index * 50 }}>
                  <div class="w-12 h-12 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 opacity-50"></div>
                </div>
              {/each}
            </div>

            <!-- Desktop skeleton -->
            <div class="hidden sm:flex flex-wrap justify-center items-center gap-6 p-4">
              {#each Array(10) as _, index}
                <div class="animate-pulse" in:fly={{ y: 20, duration: 300, delay: index * 75 }}>
                  <div
                    class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 opacity-50"></div>
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
    class="py-24 backdrop-blur-sm relative overflow-hidden"
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
            on:click={() => showAllFeatures = !showAllFeatures}
            class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 mb-8"
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
                   class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
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
          <div class="backdrop-blur-sm rounded-2xl border p-8 shadow-lg"
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
               class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
               style="background: {$colorStore.primary}; color: {$colorStore.text}; box-shadow: 0 8px 32px {$colorStore.primary}40;">
              Join Our Discord Community
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

