<!-- routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import type { RedisGuild } from "$lib/types/redisGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import LatestProductUpdate from "$lib/components/home/LatestProductUpdate.svelte";
  import HomeHero from "$lib/components/home/HomeHero.svelte";
  import HomeTails from "$lib/components/home/HomeTails.svelte";
  import { productUpdates } from "$lib/content/productUpdates";

  let guilds: RedisGuild[] = $state([]);
  let fetched = $state(false);
  let isLoading = $state(true);
  const MAX_GUILD_NAME_LENGTH = 20;
  const MAX_GUILDS_TO_SHOW = 10;

    // GitHub stats
    let githubStars = $state(50);
    let githubForks = $state(10);
    let githubContributors = $state(14);

  
  // Feature expansion state
  let showAllFeatures = $state(false);

    async function fetchGitHubStats() {
      try {
        const response = await fetch("https://api.github.com/repos/SylveonDeko/Mewdeko");
        if (response.ok) {
          const data = await response.json();
          githubStars = data.stargazers_count || 50;
          githubForks = data.forks_count || 10;

          // Fetch contributors count
          const contributorsResponse = await fetch("https://api.github.com/repos/SylveonDeko/Mewdeko/contributors?per_page=1");
          if (contributorsResponse.ok) {
            const linkHeader = contributorsResponse.headers.get("Link");
            if (linkHeader) {
              const match = linkHeader.match(/page=(\d+)>; rel="last"/);
              if (match) {
                githubContributors = parseInt(match[1]);
              }
            }
          }
        }
      } catch (error) {
        logger.error("Error fetching GitHub stats:", error);
        // Keep default values on error
      }
    }

  onMount(async () => {
    try {
      isLoading = true;
      // Fetch both guilds and GitHub stats in parallel
      const [response] = await Promise.all([
        fetch("/api/redis/guilds"),
        fetchGitHubStats()
      ]);

      if (response.ok) {
        guilds = await response.json();
        logger.debug(guilds);
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
  <title>Mewdeko - 1,082 Commands. Free & Open Source Discord Bot</title>

  <!-- Open Graph -->
  <meta content="Mewdeko - 1,082 Commands. Free & Open Source Discord Bot" property="og:title" />
  <meta content="1,082 commands across 34 modules - Forms, XP/Leveling, Economy, Music, Protection, Logging, and more. Trusted by 11,400+ servers. Completely free and open source since 2020."
        property="og:description" />
  <meta content="https://mewdeko.tech/img/hero-dashboard.png" property="og:image" />
  <meta content="https://mewdeko.tech/" property="og:url" />
  <meta content="website" property="og:type" />

  <!-- Twitter Card -->
  <meta content="summary_large_image" name="twitter:card" />
  <meta content="Mewdeko - 1,082 Commands. Ridiculously Over-Engineered." name="twitter:title" />
  <meta content="Free & open source Discord bot with 1,082 commands. Forms builder, XP/leveling, economy, music, protection systems, and more. No limitations, no subscriptions."
        name="twitter:description" />
  <meta content="https://mewdeko.tech/img/hero-dashboard.png" name="twitter:image" />
  <meta content="@MewdekoBot" name="twitter:site" />

  <!-- Primary Meta Tags -->
  <meta content="1,082 commands across 34 modules - Forms, XP/Leveling, Economy, Music, Protection, Logging, and more. Trusted by 11,400+ servers. Completely free and open source since 2020."
        name="description" />
  <meta content="Discord bot, free Discord bot, open source Discord bot, 1082 commands, forms builder, ban appeals, XP leveling bot, Discord economy bot, Discord music bot, Discord moderation bot, anti-raid protection, anti-spam, server logging, chat triggers, embed builder, ticket system, giveaway bot, suggestion bot, starboard, custom commands, role states, multi-purpose bot, Discord reputation system, stream alerts, invite tracking, automated moderation, Mewdeko"
        name="keywords" />
  <link href="https://mewdeko.tech/" rel="canonical" />

  <!-- JSON-LD Structured Data -->
  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Mewdeko",
    "description": "Free and open source Discord bot with 1,082 commands across 34 modules. Features include forms builder, XP/leveling, economy games, music bot, automated moderation, and more.",
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "Discord",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "11400",
      "bestRating": "5",
      "worstRating": "1"
    },
    "creator": {
      "@type": "Person",
      "name": "SylveonDeko"
    },
    "datePublished": "2020-09-06",
    "softwareVersion": "v8",
    "url": "https://mewdeko.tech",
    "screenshot": "https://mewdeko.tech/img/hero-dashboard.png",
    "featureList": [
      "1,082 commands across 34 modules",
      "Visual forms builder with ban appeals and join applications",
      "XP and leveling system with competitions",
      "20+ economy and gambling games",
      "Music bot with Lavalink support",
      "7 automated protection systems (anti-raid, anti-spam, anti-alt)",
      "35+ server logging event types",
      "Chat triggers with regex and custom slash commands",
      "Visual embed builder",
      "Role persistence and management",
      "Server analytics and invite tracking"
    ],
    "codeRepository": "https://github.com/SylveonDeko/Mewdeko",
    "license": "https://www.gnu.org/licenses/agpl-3.0.html",
    "sameAs": [
      "https://github.com/SylveonDeko/Mewdeko",
      "https://discord.gg/twQw45rBjN"
    ]
  }
  <\/script>`}
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
    <HomeHero />

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
            A few of the servers running Mewdeko right now
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
                              <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2"
                                   style="ring-color: {$colorStore.gradientStart};"></div>
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
                            And {guilds.length - 8} more.
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
                Loading servers...
              </p>
            </div>
          </div>
        {:else}
          <div class="text-center py-8">
            <p style="color: {$colorStore.muted}">
              No servers to show right now.
            </p>
          </div>
        {/if}
      </section>
    {/if}
  </header>

  <HomeTails />

  <section
    aria-labelledby="features-heading"
    class="py-24  relative overflow-hidden"
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
          class="text-4xl lg:text-5xl font-extrabold mb-4 bg-gradient-to-r bg-clip-text text-transparent leading-tight scroll-mt-28"
          id="features-heading"
          style="background-image: linear-gradient(135deg, {$colorStore.text}, {$colorStore.primary}, {$colorStore.secondary});"
        >
          See It For Yourself
        </h2>
        <div class="w-24 h-1 mx-auto rounded-full mb-6"
             style="background: linear-gradient(90deg, {$colorStore.primary}, {$colorStore.secondary}, {$colorStore.accent});"></div>
        <p class="text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed" style="color: {$colorStore.muted}">
          A few of the things it does.
        </p>
      </div>

      <!-- Feature Showcases (Screenshot-based) -->
      <div class="mb-16 px-4">
        <div class="max-w-6xl mx-auto space-y-12">

          <!-- Forms Builder Showcase -->
          <div class="rounded-2xl border overflow-hidden shadow-2xl"
               in:fly={{ y: 20, duration: 400, delay: 100 }}
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                      border-color: {$colorStore.primary}30;">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <!-- Text side -->
              <div class="p-6 sm:p-8 flex flex-col justify-center order-2 lg:order-1">
                <div class="inline-block px-3 py-1 rounded-full mb-3 self-start"
                     style="background: {$colorStore.primary}15; border: 1px solid {$colorStore.primary}30;">
                  <span class="text-xs font-semibold" style="color: {$colorStore.primary}">Forms</span>
                </div>
                <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-3" style="color: {$colorStore.text}">
                  Form Builder
                </h3>
                <p class="text-base sm:text-lg mb-4 leading-relaxed" style="color: {$colorStore.muted}">
                  Build a form on the dashboard and share the link for people to fill in.
                </p>
                <ul class="space-y-2 mb-6">
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.primary}">•</span>
                    <span>Ban appeals with <strong>auto-unban</strong> on approval</span>
                  </li>
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.primary}">•</span>
                    <span>Join apps that <strong>generate invite codes</strong> with roles</span>
                  </li>
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.primary}">•</span>
                    <span>Captcha, and questions that depend on earlier answers</span>
                  </li>
                </ul>
                <a class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] self-start"
                   href="/dashboard/forms"
                   style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10); color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30; box-shadow: 0 4px 20px {$colorStore.primary}10;">
                  See It In Action
                  <span>→</span>
                </a>
              </div>

              <!-- Screenshot side -->
              <div class="order-1 lg:order-2 relative bg-gradient-to-br p-4 sm:p-6 flex items-center justify-center"
                   style="background: linear-gradient(135deg, {$colorStore.gradientStart}05, {$colorStore.gradientMid}08);">
                <img
                  alt="Mewdeko Forms Builder Interface"
                  class="w-full h-auto"
                  loading="lazy"
                  src="/img/feature-forms-builder.png"
                />
                <div class="absolute inset-0 opacity-10 pointer-events-none"
                     style="background: radial-gradient(circle at center, {$colorStore.primary}40, transparent 70%);"></div>
              </div>
            </div>
          </div>

          <!-- XP Leaderboard Showcase -->
          <div class="rounded-2xl border overflow-hidden shadow-2xl"
               in:fly={{ y: 20, duration: 400, delay: 200 }}
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                      border-color: {$colorStore.secondary}30;">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <!-- Screenshot side (left on desktop) -->
              <div class="relative">
                <img
                  alt="Mewdeko XP Leaderboard"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  src="/img/feature-xp-leaderboard.png"
                />
                <div class="absolute inset-0 opacity-10 pointer-events-none"
                     style="background: radial-gradient(circle at center, {$colorStore.secondary}40, transparent 70%);"></div>
              </div>

              <!-- Text side (right on desktop) -->
              <div class="p-6 sm:p-8 flex flex-col justify-center">
                <div class="inline-block px-3 py-1 rounded-full mb-3 self-start"
                     style="background: {$colorStore.secondary}15; border: 1px solid {$colorStore.secondary}30;">
                  <span class="text-xs font-semibold" style="color: {$colorStore.secondary}">Engagement</span>
                </div>
                <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-3" style="color: {$colorStore.text}">
                  XP and Leveling
                </h3>
                <p class="text-base sm:text-lg mb-4 leading-relaxed" style="color: {$colorStore.muted}">
                  Levels for chatting and voice, with a rank card you can redesign.
                </p>
                <ul class="space-y-2 mb-6">
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.secondary}">•</span>
                    <span>Competitions with rewards and a countdown</span>
                  </li>
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.secondary}">•</span>
                    <span>Roles handed out when members reach a level</span>
                  </li>
                </ul>
                <a class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] self-start"
                   href="/dashboard/xp"
                   style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.accent}10); color: {$colorStore.text}; border: 1px solid {$colorStore.secondary}30; box-shadow: 0 4px 20px {$colorStore.secondary}10;">
                  View Dashboard
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Bot Customization Showcase -->
          <div class="rounded-2xl border overflow-hidden shadow-2xl"
               in:fly={{ y: 20, duration: 400, delay: 300 }}
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                      border-color: {$colorStore.accent}30;">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <!-- Text side -->
              <div class="p-6 sm:p-8 flex flex-col justify-center order-2 lg:order-1">
                <div class="inline-block px-3 py-1 rounded-full mb-3 self-start"
                     style="background: {$colorStore.accent}15; border: 1px solid {$colorStore.accent}30;">
                  <span class="text-xs font-semibold" style="color: {$colorStore.accent}">Per-Server</span>
                </div>
                <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-3" style="color: {$colorStore.text}">
                  Per-Server Bot Profile
                </h3>
                <p class="text-base sm:text-lg mb-4 leading-relaxed" style="color: {$colorStore.muted}">
                  Give the bot its own avatar, banner and bio in your server.
                </p>
                <ul class="space-y-2 mb-6">
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.accent}">•</span>
                    <span>Completely free (others charge for this)</span>
                  </li>
                </ul>
                <a class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] self-start"
                   href="/dashboard/settings"
                   style="background: linear-gradient(135deg, {$colorStore.accent}15, {$colorStore.primary}10); color: {$colorStore.text}; border: 1px solid {$colorStore.accent}30; box-shadow: 0 4px 20px {$colorStore.accent}10;">
                  Customize Now
                  <span>→</span>
                </a>
              </div>

              <!-- Screenshot side -->
              <div class="order-1 lg:order-2 relative bg-gradient-to-br p-4 sm:p-6 flex items-center justify-center"
                   style="background: linear-gradient(135deg, {$colorStore.gradientStart}05, {$colorStore.gradientMid}08);">
                <img
                  alt="Mewdeko Bot Customization"
                  class="w-full h-auto"
                  loading="lazy"
                  src="/img/feature-bot-customization.png"
                />
                <div class="absolute inset-0 opacity-10 pointer-events-none"
                     style="background: radial-gradient(circle at center, {$colorStore.accent}40, transparent 70%);"></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Commands Showcase - BIG CTA -->
      <div class="mb-16 px-4">
        <div class="max-w-4xl mx-auto">
          <div class="rounded-2xl border p-8 sm:p-12 text-center shadow-2xl"
               in:fly={{ y: 20, duration: 400 }}
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}12, {$colorStore.gradientMid}18);
                      border-color: {$colorStore.primary}30;">
            <div class="mb-6">
              <div
                class="text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-4 bg-gradient-to-r bg-clip-text text-transparent"
                style="background-image: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary}, {$colorStore.accent});">
                1,082
              </div>
              <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3" style="color: {$colorStore.text}">
                Command Reference
              </h3>
              <p class="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
                 style="color: {$colorStore.muted}">
                Every command, with examples and the permissions it needs.
              </p>
            </div>

            <!-- Mini module breakdown -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 max-w-2xl mx-auto">
              <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                <div class="text-xl sm:text-2xl font-bold" style="color: {$colorStore.primary}">34</div>
                <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Modules</div>
              </div>
              <div class="p-3 rounded-lg" style="background: {$colorStore.secondary}15;">
                <div class="text-xl sm:text-2xl font-bold" style="color: {$colorStore.secondary}">200+</div>
                <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Settings</div>
              </div>
              <div class="p-3 rounded-lg" style="background: {$colorStore.accent}15;">
                <div class="text-xl sm:text-2xl font-bold" style="color: {$colorStore.accent}">7</div>
                <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Protection</div>
              </div>
              <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                <div class="text-xl sm:text-2xl font-bold" style="color: {$colorStore.primary}">35+</div>
                <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Log Events</div>
              </div>
            </div>

            <a class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]"
               href="/commands"
               style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.primary}12); color: {$colorStore.text}; border: 1px solid {$colorStore.secondary}30; box-shadow: 0 8px 32px {$colorStore.secondary}10;">
              Browse All 1,082 Commands
              <i class="fa-solid fa-arrow-right"></i>
            </a>

            <p class="text-xs sm:text-sm mt-4" style="color: {$colorStore.muted}">
              We documented every single one of them
            </p>
          </div>
        </div>
      </div>


      <!-- All Modules Grid -->
      <div class="px-4 mb-16">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-8">
            <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3" style="color: {$colorStore.text}">
              All Modules
            </h3>
            <p class="text-base sm:text-lg" style="color: {$colorStore.muted}">
              Every module has its own wiki page.
            </p>
          </div>

          <div class="text-center">
            <button
              class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] mb-8"
              onclick={() => showAllFeatures = !showAllFeatures}
              style="background: {$colorStore.accent}15; color: {$colorStore.accent}; border: 2px solid {$colorStore.accent}30;">
              {showAllFeatures ? 'Hide All' : 'Show All'} 30 Modules
              <span class="transform transition-transform {showAllFeatures ? 'rotate-180' : ''}">↓</span>
            </button>
          </div>
          
          {#if showAllFeatures}
            <div class="rounded-2xl border p-8 shadow-lg" 
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}06, {$colorStore.gradientMid}10);
                        border-color: {$colorStore.primary}20;"
                 in:fly={{ y: 20, duration: 300 }}>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <!-- Protection & Moderation -->
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Server Logging
                  </div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">35+ tracked events</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Chat Triggers</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Custom replies and commands</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Embed Builder</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Build embeds without writing JSON</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Support Tickets
                  </div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Private channels for support</div>
                </div>

                <!-- Engagement Features -->
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Giveaways</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Timed, with random winners</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Voting System</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Polls with buttons</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Suggestions</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Feedback with voting</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Starboard</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Reposts the most starred messages</div>
                </div>

                <!-- Community Tools -->
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Multi-Greets</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">30 welcome messages</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Role Greets</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">A message when someone gets a role</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Birthday Tracking
                  </div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Announces members' birthdays</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Reputation</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Members thank each other</div>
                </div>

                <!-- Automation -->
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Repeaters</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Scheduled messages</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">RSS Feeds</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Posts new items from a feed</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Stream Alerts</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Twitch/YouTube</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Status Roles</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Roles from custom statuses</div>
                </div>

                <!-- User Management -->
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Role States</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Roles come back on rejoin</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Invite Tracking
                  </div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">See who invited whom</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">AFK System</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Tells people you're away</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Highlights</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">A DM when your word is said</div>
                </div>

                <!-- Content & Social -->
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Todo Lists</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Shared and personal lists</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Confessions</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Anonymous posts</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Chat Saver</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Export conversations</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Message Stats</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Who talks, and where</div>
                </div>

                <!-- Fun & Games -->
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Economy Games</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">20+ gambling games</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Games</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Trivia, hangman, TicTacToe</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Counting Games
                  </div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Count up, one number each</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Music Bot</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">YouTube, Spotify and SoundCloud</div>
                </div>

                <!-- Voice & Channels -->
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">Custom Voice</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">Members get their own voice channel</div>
                </div>

                <!-- And More -->
                <div class="p-3 sm:p-4 rounded-lg transition-all hover:scale-[1.02]"
                     style="background: {$colorStore.secondary}10; border: 1px solid {$colorStore.secondary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">And 10+ More</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">See full list →</div>
                </div>
              </div>
              
              <div class="text-center mt-8">
                <a href="/commands"
                   class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]"
                   style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.primary}10); color: {$colorStore.text}; border: 1px solid {$colorStore.secondary}30; box-shadow: 0 8px 32px {$colorStore.secondary}10;">
                  View Complete Feature List
                </a>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <LatestProductUpdate updates={productUpdates} />

  <section
    class="py-16 relative overflow-hidden"
    style="background: radial-gradient(circle at center,
      {$colorStore.gradientStart}15 0%,
      {$colorStore.gradientEnd}10 50%,
      {$colorStore.gradientEnd}05 100%
    );"
  >
    <div class="container mx-auto px-4 max-w-7xl relative z-10">
      <div class="mb-16 px-4">
        <div class="max-w-4xl mx-auto">
          <div class="rounded-2xl border p-6 sm:p-8"
               in:fly={{ y: 20, duration: 400 }}
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                      border-color: {$colorStore.primary}30;">
            <div class="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <div class="w-20 h-20 rounded-2xl flex items-center justify-center"
                     style="background: {$colorStore.primary}15; border: 2px solid {$colorStore.primary}30;">
                  <i class="fa-brands fa-github text-4xl" style="color: {$colorStore.primary};"></i>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-xl sm:text-2xl font-bold mb-3" style="color: {$colorStore.text}">
                  Fully Open Source Since 2020
                </h3>
                <p class="text-base sm:text-lg mb-4" style="color: {$colorStore.muted}">
                  You can read all of it on GitHub.
                </p>
                <div class="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start text-xs sm:text-sm"
                     style="color: {$colorStore.muted}">
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-star" style="color: {$colorStore.primary};"></i>
                    {githubStars.toLocaleString()} stars
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-code-fork" style="color: {$colorStore.primary};"></i>
                    {githubForks} forks
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-users" style="color: {$colorStore.primary};"></i>
                    {githubContributors} contributors
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-scale-balanced" style="color: {$colorStore.primary};"></i>
                    AGPLv3
                  </span>
                </div>
              </div>

              <!-- CTA -->
              <div class="flex-shrink-0">
                <a class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                   href="https://github.com/SylveonDeko/Mewdeko"
                   rel="noreferrer"
                   style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10); color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30; box-shadow: 0 4px 20px {$colorStore.primary}10;"
                   target="_blank">
                  <i class="fa-brands fa-github"></i>
                  View Source
                  <i class="fa-solid fa-arrow-up-right-from-square text-sm"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Request & Community Section -->
      <div class="px-4 mb-16">
        <div class="max-w-4xl mx-auto">
          <div class="rounded-2xl border p-8 sm:p-10 shadow-2xl"
               in:fly={{ y: 20, duration: 400 }}
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12);
                      border-color: {$colorStore.primary}30;">
            <div class="text-center mb-8">
              <div class="inline-block px-4 py-2 rounded-full mb-4"
                   style="background: {$colorStore.secondary}15; border: 1px solid {$colorStore.secondary}30;">
                <span class="text-sm font-semibold" style="color: {$colorStore.secondary}">We Use Our Own Tools</span>
              </div>
              <h3 class="text-2xl sm:text-3xl font-bold mb-3" style="color: {$colorStore.text}">
                Feature Requests
              </h3>
              <p class="text-base sm:text-lg leading-relaxed" style="color: {$colorStore.muted}">
                Tell us what Mewdeko is missing.
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a class="group relative px-8 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
                 href="/forms/0lIoQGzMlMBj"
                 style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.primary}10); color: {$colorStore.text}; border: 1px solid {$colorStore.secondary}30; box-shadow: 0 4px 20px {$colorStore.secondary}10;">
                <i class="fa-solid fa-lightbulb"></i>
                Suggest a Feature
              </a>
              <a class="group relative px-8 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
                 href="https://discord.gg/twQw45rBjN"
                 rel="noreferrer"
                 style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20; box-shadow: 0 2px 12px {$colorStore.primary}05;"
                 target="_blank">
                <i class="fa-brands fa-discord"></i>
                Join Discord
              </a>
            </div>

            <p class="text-center text-xs sm:text-sm mt-6" style="color: {$colorStore.muted}">
              Or just hop in Discord for quick questions and help
            </p>
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
</style>
