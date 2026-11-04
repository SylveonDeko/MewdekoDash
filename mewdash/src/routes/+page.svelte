<!-- routes/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { siteStatParams } from "$lib/config/siteStats";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import type { RedisGuild } from "$lib/types/redisGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import LatestProductUpdate from "$lib/components/home/LatestProductUpdate.svelte";
  import HomeHero from "$lib/components/home/HomeHero.svelte";
  import HomeTails from "$lib/components/home/HomeTails.svelte";
  import ComponentEmbed from "$lib/components/layout/ComponentEmbed.svelte";
  import { buttons, container, gallery, linkButton, SITE_ORIGIN, separator, text } from "$lib/componentEmbed";
  import { productUpdates } from "$lib/content/productUpdates";

  const inviteUrl =
    "https://discord.com/oauth2/authorize?client_id=752236274261426212&permissions=66186303&response_type=code&redirect_uri=https%3A%2F%2Fmewdeko.tech%2Fapi%2Fdiscord%2Fcallback&integration_type=0&scope=identify+guilds+bot";
  const previewEmbed = $derived(
    container(
      gallery(`${SITE_ORIGIN}/img/hero-dashboard.png`),
      text(`## Mewdeko\n${m.home.landingEmbedSummary(siteStatParams(data.stats))}`),
      separator(),
      buttons(
        linkButton(m.home.heroAddToDiscord(), inviteUrl),
        linkButton(m.common.dashboard(), `${SITE_ORIGIN}/dashboard`),
        linkButton(m.common.commands(), `${SITE_ORIGIN}/commands`)
      )
    )
  );

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

<ComponentEmbed embed={previewEmbed} />

<svelte:head>
  <title>{m.home.landingMetaTitle(siteStatParams(data.stats))}</title>

  <!-- Open Graph -->
  <meta content={m.home.landingMetaTitle(siteStatParams(data.stats))} property="og:title" />
  <meta content={m.home.landingMetaDescription(siteStatParams(data.stats))}
        property="og:description" />
  <meta content="https://mewdeko.tech/img/hero-dashboard.png" property="og:image" />
  <meta content="https://mewdeko.tech/" property="og:url" />
  <meta content="website" property="og:type" />

  <!-- Twitter Card -->
  <meta content="summary_large_image" name="twitter:card" />
  <meta content={m.home.landingTwitterTitle(siteStatParams(data.stats))} name="twitter:title" />
  <meta content={m.home.landingTwitterDescription(siteStatParams(data.stats))}
        name="twitter:description" />
  <meta content="https://mewdeko.tech/img/hero-dashboard.png" name="twitter:image" />
  <meta content="@MewdekoBot" name="twitter:site" />

  <!-- Primary Meta Tags -->
  <meta content={m.home.landingMetaDescription(siteStatParams(data.stats))}
        name="description" />
  <meta content={m.home.landingMetaKeywords()}
        name="keywords" />
  <link href="https://mewdeko.tech/" rel="canonical" />

  <!-- JSON-LD Structured Data -->
  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Mewdeko",
    "description": "Free and open source Discord bot with ${data.stats.commands.toLocaleString("en-US")} commands across ${data.stats.modules} modules. Features include forms builder, XP/leveling, economy games, music bot, automated moderation, and more.",
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "Discord",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
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
      "${data.stats.commands.toLocaleString("en-US")} commands across ${data.stats.modules} modules",
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
  >
    <HomeHero stats={data.stats} />

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
            {m.home.landingOurTopServers()}
          </h2>
          <p class="text-sm lg:text-base" style="color: {$colorStore.muted}">
            {m.home.landingAFewOfTheServersRunning()}
          </p>
        </div>
        {#if guilds.length > 0}
            <div class="w-full max-w-6xl mx-auto px-4">
                <!-- Responsive grid layout for all screen sizes with centering -->
                <div class="flex flex-wrap justify-center gap-4" role="list"
                 aria-label={m.home.landingTopServerCommunities()}>
                    {#each guilds.slice(0, 8) as guild, index (guild.Name)}
                <div
                        class="group relative rounded-xl border transition-colors duration-300 hover:bg-white/5 overflow-hidden w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)]"
                        style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;"
                  in:fly={{ y: 20, duration: 300, delay: index * 50 }}
                  role="listitem"
                >

                    <div class="relative p-4">
                        <div class="flex items-center gap-3">
                            <!-- Server icon -->
                            <div class="relative flex-shrink-0">
                                <img
                                        src={guild.IconUrl}
                                        alt={m.home.landingServerIconAlt({ name: guild.Name })}
                                        loading="lazy"
                                        class="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-opacity-20"
                                        style="ring-color: {$colorStore.primary};"
                                >                            </div>

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
                            {m.home.landingServersMore({ count: guilds.length - 8 })}
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
                                 style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full opacity-30"
                                         style="background: {$colorStore.primary}20;"></div>
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
                {m.home.landingLoadingServers()}
              </p>
            </div>
          </div>
        {:else}
          <div class="text-center py-8">
            <p style="color: {$colorStore.muted}">
              {m.home.landingNoServersToShowRightNow()}
            </p>
          </div>
        {/if}
      </section>
    {/if}
  </header>

  <HomeTails />

  <section
    aria-labelledby="features-heading"
    class="py-24 relative overflow-hidden"
  >
    <div class="container mx-auto px-4 max-w-7xl relative z-10">
      <div class="text-center mb-16">
        <h2
          class="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight scroll-mt-28"
          id="features-heading"
          style="color: {$colorStore.text}"
        >
          {m.home.landingSeeItForYourself()}
        </h2>
        <p class="text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed" style="color: {$colorStore.muted}">
          {m.home.landingAFewOfTheThingsIt()}
        </p>
      </div>

      <!-- Feature Showcases (Screenshot-based) -->
      <div class="mb-16 px-4">
        <div class="max-w-6xl mx-auto space-y-12">

          <!-- Forms Builder Showcase -->
          <div class="rounded-2xl border overflow-hidden"
               in:fly={{ y: 20, duration: 400, delay: 100 }}
               style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <!-- Text side -->
              <div class="p-6 sm:p-8 flex flex-col justify-center order-2 lg:order-1">
                <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-3" style="color: {$colorStore.text}">
                  {m.home.landingFormBuilder()}
                </h3>
                <p class="text-base sm:text-lg mb-4 leading-relaxed" style="color: {$colorStore.muted}">
                  {m.home.landingBuildAFormOnTheDashboard()}
                </p>
                <ul class="space-y-2 mb-6">
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.muted}">•</span>
                    <span>{@html m.home.landingFormsBulletAppeals()}</span>
                  </li>
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.muted}">•</span>
                    <span>{@html m.home.landingFormsBulletJoins()}</span>
                  </li>
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.muted}">•</span>
                    <span>{m.home.landingCaptchaAndQuestionsThatDependOn()}</span>
                  </li>
                </ul>
                <a class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors hover:bg-white/5 self-start"
                   href="/dashboard/forms"
                   style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;">
                  {m.home.landingSeeItInAction()}                </a>
              </div>

              <!-- Screenshot side -->
              <div class="order-1 lg:order-2 relative p-4 sm:p-6 flex items-center justify-center">
                <img
                  alt={m.home.landingMewdekoFormsBuilderInterface()}
                  class="w-full h-auto"
                  loading="lazy"
                  src="/img/feature-forms-builder.png"
                />
              </div>
            </div>
          </div>

          <!-- XP Leaderboard Showcase -->
          <div class="rounded-2xl border overflow-hidden"
               in:fly={{ y: 20, duration: 400, delay: 200 }}
               style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <!-- Screenshot side (left on desktop) -->
              <div class="relative">
                <img
                  alt={m.home.landingMewdekoXpLeaderboard()}
                  class="w-full h-full object-cover"
                  loading="lazy"
                  src="/img/feature-xp-leaderboard.png"
                />
              </div>

              <!-- Text side (right on desktop) -->
              <div class="p-6 sm:p-8 flex flex-col justify-center">
                <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-3" style="color: {$colorStore.text}">
                  {m.home.landingXpAndLeveling()}
                </h3>
                <p class="text-base sm:text-lg mb-4 leading-relaxed" style="color: {$colorStore.muted}">
                  {m.home.landingLevelsForChattingAndVoiceWith()}
                </p>
                <ul class="space-y-2 mb-6">
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.muted}">•</span>
                    <span>{m.home.landingCompetitionsWithRewardsAndACountdown()}</span>
                  </li>
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.muted}">•</span>
                    <span>{m.home.landingRolesHandedOutWhenMembersReach()}</span>
                  </li>
                </ul>
                <a class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors hover:bg-white/5 self-start"
                   href="/dashboard/xp"
                   style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;">
                  {m.home.landingViewDashboard()}                </a>
              </div>
            </div>
          </div>

          <!-- Bot Customization Showcase -->
          <div class="rounded-2xl border overflow-hidden"
               in:fly={{ y: 20, duration: 400, delay: 300 }}
               style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <!-- Text side -->
              <div class="p-6 sm:p-8 flex flex-col justify-center order-2 lg:order-1">
                <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-3" style="color: {$colorStore.text}">
                  {m.home.landingPerServerBotProfile()}
                </h3>
                <p class="text-base sm:text-lg mb-4 leading-relaxed" style="color: {$colorStore.muted}">
                  {m.home.landingGiveTheBotItsOwnAvatar()}
                </p>
                <ul class="space-y-2 mb-6">
                  <li class="flex items-start gap-2 text-sm sm:text-base" style="color: {$colorStore.text}">
                    <span style="color: {$colorStore.muted}">•</span>
                    <span>{m.home.landingCompletelyFreeOthersChargeForThis()}</span>
                  </li>
                </ul>
                <a class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors hover:bg-white/5 self-start"
                   href="/dashboard/settings"
                   style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;">
                  {m.home.landingCustomizeNow()}                </a>
              </div>

              <!-- Screenshot side -->
              <div class="order-1 lg:order-2 relative p-4 sm:p-6 flex items-center justify-center">
                <img
                  alt={m.home.landingMewdekoBotCustomization()}
                  class="w-full h-auto"
                  loading="lazy"
                  src="/img/feature-bot-customization.png"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Commands Showcase - BIG CTA -->
      <div class="mb-16 px-4">
        <div class="max-w-4xl mx-auto">
          <div class="rounded-2xl border p-8 sm:p-12 text-center"
               in:fly={{ y: 20, duration: 400 }}
               style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;">
            <div class="mb-8">
              <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3" style="color: {$colorStore.text}">
                {m.common.commandReference()}
              </h3>
              <p class="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
                 style="color: {$colorStore.muted}">
                {m.home.landingEveryCommandWithExamplesAndThe()}
              </p>
            </div>

            <a class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-colors hover:bg-white/5"
               href="/commands"
               style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;">
              {m.home.landingBrowseAllCommands(siteStatParams(data.stats))}
            </a>
          </div>
        </div>
      </div>


      <!-- All Modules Grid -->
      <div class="px-4 mb-16">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-8">
            <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3" style="color: {$colorStore.text}">
              {m.common.allModules()}
            </h3>
            <p class="text-base sm:text-lg" style="color: {$colorStore.muted}">
              {m.home.landingEveryModuleHasItsOwnWiki()}
            </p>
          </div>

          <div class="text-center">
            <button
              class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-colors hover:bg-white/5 mb-8"
              onclick={() => showAllFeatures = !showAllFeatures}
              style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;">
              {showAllFeatures ? m.home.landingHideAllModules() : m.home.landingShowAllModules()}
            </button>
          </div>
          
          {#if showAllFeatures}
            <div class="rounded-2xl border p-8"
                 style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;"
                 in:fly={{ y: 20, duration: 300 }}>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <!-- Protection & Moderation -->
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.home.landingServerLogging()}
                  </div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landing35TrackedEvents()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.placeholders.categoryChatTrigger()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingCustomRepliesAndCommands()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.common.embedBuilder()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingBuildEmbedsWithoutWritingJson()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.wizardTicketsName()}
                  </div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingPrivateChannelsForSupport()}</div>
                </div>

                <!-- Engagement Features -->
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.giveawaysName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingTimedWithRandomWinners()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.home.landingVotingSystem()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingPollsWithButtons()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.suggestionsName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingFeedbackWithVoting()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.starboardName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingRepostsTheMostStarredMessages()}</div>
                </div>

                <!-- Community Tools -->
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.home.landingMultiGreets()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landing30WelcomeMessages()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.rolegreetsName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingAMessageWhenSomeoneGetsA()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.home.landingBirthdayTracking()}
                  </div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingAnnouncesMembersBirthdays()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.reputationName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingMembersThankEachOther()}</div>
                </div>

                <!-- Automation -->
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.repeatersName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingScheduledMessages()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.wizardFeedsName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingPostsNewItemsFromAFeed()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.streamsName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingTwitchYoutube()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.statusrolesName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingRolesFromCustomStatuses()}</div>
                </div>

                <!-- User Management -->
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.rolestatesName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingRolesComeBackOnRejoin()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.wizardInvitetrackingName()}
                  </div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingSeeWhoInvitedWhom()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.afkName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingTellsPeopleYouReAway()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.highlightsName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingADmWhenYourWordIs()}</div>
                </div>

                <!-- Content & Social -->
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.todoName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingSharedAndPersonalLists()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.confessionsName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingAnonymousPosts()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.chatsaverName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingExportConversations()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.messagestatsName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingWhoTalksAndWhere()}</div>
                </div>

                <!-- Fun & Games -->
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.home.landingEconomyGames()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landing20GamblingGames()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.common.games()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingTriviaHangmanTictactoe()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.common.countingGames()}
                  </div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingCountUpOneNumberEach()}</div>
                </div>
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.home.landingMusicBot()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingYoutubeSpotifyAndSoundcloud()}</div>
                </div>

                <!-- Voice & Channels -->
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.features.customvoiceName()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingMembersGetTheirOwnVoiceChannel()}</div>
                </div>

                <!-- And More -->
                <div class="p-3 sm:p-4 rounded-lg"
                     style="background: {$colorStore.primary}06; border: 1px solid {$colorStore.primary}20;">
                  <div class="font-bold text-sm sm:text-base mb-1" style="color: {$colorStore.text}">{m.home.landingAnd10More()}</div>
                  <div class="text-xs sm:text-sm" style="color: {$colorStore.muted}">{m.home.landingSeeFullList()}</div>
                </div>
              </div>
              
              <div class="text-center mt-8">
                <a href="/commands"
                   class="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-colors hover:bg-white/5"
                   style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;">
                  {m.home.landingViewCompleteFeatureList()}
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
  >
    <div class="container mx-auto px-4 max-w-7xl relative z-10">
      <div class="mb-16 px-4">
        <div class="max-w-4xl mx-auto">
          <div class="rounded-2xl border p-6 sm:p-8"
               in:fly={{ y: 20, duration: 400 }}
               style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;">
            <div class="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <!-- Content -->
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-xl sm:text-2xl font-bold mb-3" style="color: {$colorStore.text}">
                  {m.home.landingFullyOpenSourceSince2020()}
                </h3>
                <div class="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start text-xs sm:text-sm"
                     style="color: {$colorStore.muted}">
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-star" style="color: {$colorStore.primary};"></i>
                    {m.home.landingGithubStars({ count: githubStars.toLocaleString() })}
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-code-fork" style="color: {$colorStore.primary};"></i>
                    {m.home.landingGithubForks({ count: githubForks })}
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-users" style="color: {$colorStore.primary};"></i>
                    {m.home.landingGithubContributors({ count: githubContributors })}
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-scale-balanced" style="color: {$colorStore.primary};"></i>
                    {m.home.landingAgplv3()}
                  </span>
                </div>
              </div>

              <!-- CTA -->
              <div class="flex-shrink-0">
                <a class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors hover:bg-white/5"
                   href="https://github.com/SylveonDeko/Mewdeko"
                   rel="noreferrer"
                   style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                   target="_blank">
                  <i class="fa-brands fa-github"></i>
                  {m.home.landingViewSource()}                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Request & Community Section -->
      <div class="px-4 mb-16">
        <div class="max-w-4xl mx-auto">
          <div class="rounded-2xl border p-8 sm:p-10"
               in:fly={{ y: 20, duration: 400 }}
               style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;">
            <div class="text-center mb-8">
              <h3 class="text-2xl sm:text-3xl font-bold mb-3" style="color: {$colorStore.text}">
                {m.features.featureRequestsName()}
              </h3>
              <p class="text-base sm:text-lg leading-relaxed" style="color: {$colorStore.muted}">
                {m.home.landingTellUsWhatMewdekoIsMissing()}
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a class="group relative px-8 py-4 rounded-xl font-bold transition-colors hover:bg-white/5 flex items-center justify-center gap-3 overflow-hidden"
                 href="/forms/0lIoQGzMlMBj"
                 style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;">
                <i class="fa-solid fa-lightbulb"></i>
                {m.common.suggestAFeature()}
              </a>
              <a class="group relative px-8 py-4 rounded-xl font-bold transition-colors hover:bg-white/5 flex items-center justify-center gap-3 overflow-hidden"
                 href="https://discord.gg/twQw45rBjN"
                 rel="noreferrer"
                 style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                 target="_blank">
                <i class="fa-brands fa-discord"></i>
                {m.home.landingJoinDiscord()}
              </a>
            </div>

            <p class="text-center text-xs sm:text-sm mt-6" style="color: {$colorStore.muted}">
              {m.home.landingOrJustHopInDiscordFor()}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
