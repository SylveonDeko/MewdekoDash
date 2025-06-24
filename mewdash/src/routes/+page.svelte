<!-- routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import FluidContainer from "$lib/components/FluidContainer.svelte";
  import Interactable from "$lib/components/InteractableElement.svelte";
  import Carousel from "$lib/components/Carousel.svelte";
  import ImageWrapper from "$lib/components/ImageWrapper.svelte";
  import type { RedisGuild } from "$lib/types/redisGuild";
  import MultiButton from "$lib/components/MultiButton.svelte";
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
  let staffCurrentIndex = 0;
  let staffItemCount = 0;
  let responsesCurrentIndex = 0;
  let responsesItemCount = 0;
  let customizableCurrentIndex = 0;
  let customizableItemCount = 0;

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
    content="Discover Mewdeko, the ultimate customizable and open-source Discord bot. Packed with features like Auto Ban, antispam, and custom responses. Join 11077 servers using Mewdeko today!"
    name="description"
  />
  <meta
    content="Discover Mewdeko, the ultimate customizable and open-source Discord bot. Packed with features like Auto Ban, antispam, and custom responses. Join 11077 servers using Mewdeko today!"
    property="og:description"
  />
  <meta
    content="Discover Mewdeko, the ultimate customizable and open-source Discord bot. Packed with features like Auto Ban, antispam, and custom responses. Join 11077 servers using Mewdeko today!"
    name="twitter:description"
  />
  <meta
    content="Mewdeko, free Discord bot, open source Discord bot, customizable Discord bot, Discord music bot, Discord moderation bot, server management, role management, AFK bot, Discord greets, starboard, custom commands, multi-purpose bot"
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
    class="py-12 sm:py-16 px-4 sm:px-12 flex flex-col items-center relative backdrop-blur-sm"
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
            <span class="text-base">💬</span>
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
            <span class="text-base">❤️</span>
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
                    class="absolute hidden group-hover:block group-focus-within:block z-20 px-3 py-2 text-xs rounded-lg shadow-xl whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-3 backdrop-blur-md animate-in fade-in duration-200"
                    role="tooltip"
                    id="tooltip-mobile-{index}"
                    style="background: linear-gradient(135deg, {$colorStore.gradientStart}90, {$colorStore.gradientEnd}90);
                           border: 1px solid {$colorStore.primary}40;
                           box-shadow: 0 10px 40px rgba(0,0,0,0.3);"
                  >
                    <p class="font-bold text-center" style="color: {$colorStore.text}">
                      {truncateStringToLength(guild.Name, 18)}
                    </p>
                    <p class="text-center mt-1" style="color: {$colorStore.muted}">
                      👥 {guild.MemberCount.toLocaleString()} members
                    </p>
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45"
                         style="background: {$colorStore.gradientStart}90; border-bottom: 1px solid {$colorStore.primary}40; border-right: 1px solid {$colorStore.primary}40;"></div>
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
                    class="absolute hidden group-hover:block group-focus-within:block z-20 px-4 py-3 text-sm rounded-xl shadow-2xl whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300"
                    role="tooltip"
                    id="tooltip-desktop-{index}"
                    style="background: linear-gradient(135deg, {$colorStore.gradientStart}90, {$colorStore.gradientEnd}90);
                           border: 1px solid {$colorStore.primary}50;
                           box-shadow: 0 20px 60px rgba(0,0,0,0.4);"
                  >
                    <p class="font-bold text-center mb-1" style="color: {$colorStore.text}">
                      {truncateStringToLength(guild.Name, MAX_GUILD_NAME_LENGTH)}
                    </p>
                    <p class="text-center text-xs" style="color: {$colorStore.muted}">
                      👥 {guild.MemberCount.toLocaleString()} members active
                    </p>
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45"
                         style="background: {$colorStore.gradientStart}90; border-bottom: 1px solid {$colorStore.primary}50; border-right: 1px solid {$colorStore.primary}50;"></div>
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
            <div class="text-4xl mb-4">😔</div>
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
          Discover the powerful features that make Mewdeko the ultimate <span class="font-bold text-green-400">FREE & Open Source</span>
          Discord bot for your community.
        </p>
      </div>
      <FluidContainer breakpoints={["md", "xl"]}>
        <Interactable
          cta={{
            text: "Invite Me",
            href: "https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303",
            target: "_blank"
          }}
          description="With Auto Ban words, Anti Spam, Anti Raid, and two different warning systems, Mewdeko can be as flexible as you want!"
          slot="element-1"
          title="Moderation"
        >
          <Carousel
            items={[
              {
                component: ImageWrapper,
                props: {
                  alt: "Auto Ban Words feature screenshot",
                  src: "img/AutoBan.webp",
                },
              },
              {
                component: ImageWrapper,
                props: {
                  alt: "Moderation Commands feature screenshot",
                  src: "img/Moderation.webp",
                },
              },
              {
                component: ImageWrapper,
                props: {
                  alt: "Anti Raid Protection feature screenshot",
                  src: "img/AntiRaid.webp",
                },
              },
            ]}
            bind:currentIndex={moderationCurrentIndex}
            bind:itemCount={moderationItemCount}
          />
        </Interactable>

        <Interactable
          cta={{
            text: "Support Server",
            href: "https://discord.gg/Z9DYApMXFN",
            target: "_blank"
          }}
          description="With a team that cares about you, we try to help out in the best way possible!"
          slot="element-2"
          title="Helpful and Friendly Staff"
        >
          <Carousel
            items={[
              {
                component: ImageWrapper,
                props: {
                  alt: "Staff helping with hosting a bot",
                  src: "img/FriendlyStaff1.webp",
                },
              },
              {
                component: ImageWrapper,
                props: {
                  alt: "Staff demonstrating help command",
                  src: "img/FriendlyStaff2.webp",
                },
              },
              {
                component: ImageWrapper,
                props: {
                  alt: "Staff walking the dog, showcasing friendliness",
                  src: "img/FriendlyStaff3.webp",
                },
              },
            ]}
            bind:currentIndex={staffCurrentIndex}
            bind:itemCount={staffItemCount}
          />
        </Interactable>

        <Interactable
          cta={{
            text: "Source Code",
            href: "https://github.com/SylveonDeko/Mewdeko",
            target: "_blank"
          }}
          description="Our bot is completely open source with an AGPLv3 license (to combat code resellers)! We have self-host guides/scripts on the repo as well!"
          slot="element-3"
          title="Open Source"
        >
          <img
            alt="Screenshot of Mewdeko Github Repository"
            class="w-full overflow-hidden rounded-xl"
            src="img/clipboard-image.webp"
          />
        </Interactable>

        <Interactable
          description="Create up to 30 MultiGreets in one server!"
          slot="element-4"
          title="MultiGreets"
        >
          <img
            alt="Screenshot showcasing MultiGreets feature"
            class="w-full overflow-hidden rounded-xl"
            src="img/img.webp"
          />
        </Interactable>

        <Interactable
          description="You can create custom text and slash commands using the embed builder and variables, both are optional!<br><br>Go to Resources at the top for links to the embed builder and placeholders!"
          slot="element-5"
          title="Custom Responses"
        >
          <Carousel
            items={[
              {
                component: ImageWrapper,
                props: {
                  alt: "Creating Custom Response screenshot",
                  src: "img/ChatTriggers1.webp",
                },
              },
              {
                component: ImageWrapper,
                props: {
                  alt: "Editing Custom Response screenshot",
                  src: "img/ChatTriggers2.webp",
                },
              },
              {
                component: ImageWrapper,
                props: {
                  alt: "Custom Command In Action screenshot",
                  src: "img/ChatTriggers3.webp",
                },
              },
            ]}
            bind:currentIndex={responsesCurrentIndex}
            bind:itemCount={responsesItemCount}
          />
        </Interactable>

        <Interactable
          description="After spending hours on end making sure this works properly, you can customize many, many aspects of the bot to your liking! It's overkill sometimes honestly."
          slot="element-6"
          title="Customizable"
        >
          <Carousel
            items={[
              {
                component: ImageWrapper,
                props: {
                  alt: "Suggestion Commands customization screenshot",
                  src: "img/Customizeable1.webp",
                },
              },
              {
                component: ImageWrapper,
                props: {
                  alt: "Starboard Commands customization screenshot",
                  src: "img/Customizeable2.webp",
                },
              },
              {
                component: ImageWrapper,
                props: {
                  alt: "AFK Commands customization screenshot",
                  src: "img/Customizeable3.webp",
                },
              },
            ]}
            bind:currentIndex={customizableCurrentIndex}
            bind:itemCount={customizableItemCount}
          />
        </Interactable>

        <Interactable
          cta={{ text: "Check them out!", href: "/commands", target: "_self" }}
          description="With a little over 20 modules, and me coming up with the most niche stuff to add, you definitely won't get bored! (I hope)"
          slot="element-7"
          title="... And Much More!"
        >
          <img
            alt="Screenshot of Mewdeko Modules List"
            class="w-full overflow-hidden rounded-xl"
            src="img/Modules1.webp"
          />
        </Interactable>
      </FluidContainer>
    </div>
  </section>
</main>

<style lang="postcss">
    :global(body) {
        @apply text-mewd-white;
        background: var(--color-primary);
    }

    /* Add smooth transitions for color changes */
    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-300;
    }

    /* Improve gradient transitions */
    .backdrop-blur-sm {
        @apply transition-all duration-300;
    }

    /* Consistent border styling */
    [class*="border"] {
        @apply transition-colors duration-300;
    }

    /* Ensure proper gradient overlays */
    [style*="gradient"] {
        @apply transition-all duration-300;
    }

    /* Hero animations */
    @keyframes pulse-subtle {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.9;
        }
    }

    .animate-pulse-subtle {
        animation: pulse-subtle 4s ease-in-out infinite;
    }

    /* Button hover effects */
    .group:hover .absolute {
        @apply transition-transform duration-700;
    }

    /* Mobile touch improvements */
    @media (max-width: 640px) {
        .group:active {
            @apply scale-95;
        }
    }

    /* Custom scrollbar styling */
    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary) 10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary) 30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary) 50;
    }

    /* Image hover effects */
    img {
        @apply transition-transform duration-300;
    }

    .group:hover img {
        @apply scale-110 rotate-2;
    }

    /* Enhanced server icon animations */
    .server-icon {
        @apply transition-all duration-300 ease-out;
        filter: brightness(1.0) saturate(1.0) contrast(1.0);
    }

    .server-icon:hover {
        @apply scale-125;
        filter: brightness(1.15) saturate(1.3) contrast(1.1);
        transform: scale(1.25) rotate(5deg);
    }

    .server-icon-mobile .server-icon:hover {
        @apply scale-110;
        transform: scale(1.1) rotate(3deg);
    }

    .server-icon-desktop .server-icon:hover {
        @apply scale-125;
        transform: scale(1.25) rotate(8deg);
    }

    /* Tooltip animations */
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(10px) translateX(-50%);
        }
        to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
        }
    }

    .animate-in {
        animation: fade-in 0.3s ease-out;
    }

    /* Grid layout improvements for mobile */
    .server-icon-mobile {
        @apply relative;
    }

    .server-icon-mobile:nth-child(n+6) {
        @apply mt-2;
    }

    /* Status indicator pulse */
    @keyframes status-pulse {
        0%, 100% {
            opacity: 0.9;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.1);
        }
    }

    .animate-pulse {
        animation: status-pulse 2s ease-in-out infinite;
    }

    /* Loading skeleton animations */
    @keyframes skeleton-loading {
        0% {
            background-position: -200px 0;
        }
        100% {
            background-position: calc(200px + 100%) 0;
        }
    }

    /* Improved loading spinner */
    @keyframes spin-smooth {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin-smooth 1s linear infinite;
    }

    /* Focus styles for accessibility */
    .focus-within\:ring-2:focus-within {
        --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
        --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
        box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
    }

    .focus-within\:ring-4:focus-within {
        --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
        --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color);
        box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
    }

    .focus-within\:ring-offset-2:focus-within {
        --tw-ring-offset-width: 2px;
    }

    .focus-within\:ring-offset-4:focus-within {
        --tw-ring-offset-width: 4px;
    }

    /* High contrast mode support */
    @media (prefers-contrast: more) {
        .server-icon {
            border-width: 3px !important;
        }

    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        .server-icon,
        .animate-pulse,
        .animate-spin,
        [class*="transition"],
        [class*="animate"] {
            animation: none !important;
            transition: none !important;
        }
    }

    /* Better tooltip visibility */
    .group-focus-within\:block:focus-within {
        display: block !important;
    }

    /* Floating animations for background elements */
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
        }
        25% {
            transform: translateY(-20px) translateX(10px) rotate(1deg);
        }
        50% {
            transform: translateY(-10px) translateX(-5px) rotate(-1deg);
        }
        75% {
            transform: translateY(-30px) translateX(15px) rotate(2deg);
        }
    }

    @keyframes float-slow {
        0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
        }
        25% {
            transform: translateY(-15px) translateX(-8px) rotate(-1deg);
        }
        50% {
            transform: translateY(-25px) translateX(12px) rotate(1deg);
        }
        75% {
            transform: translateY(-5px) translateX(-15px) rotate(-2deg);
        }
    }

    @keyframes float-slower {
        0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
        }
        33% {
            transform: translateY(-10px) translateX(8px) rotate(1deg);
        }
        66% {
            transform: translateY(-20px) translateX(-12px) rotate(-1deg);
        }
    }

    .animate-float {
        animation: float 6s ease-in-out infinite;
    }

    .animate-float-slow {
        animation: float-slow 8s ease-in-out infinite;
    }

    .animate-float-slower {
        animation: float-slower 10s ease-in-out infinite;
    }

    /* Enhanced text gradients */
    .bg-gradient-to-r {
        background: linear-gradient(135deg, var(--color-text), var(--color-primary), var(--color-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    /* Smooth scroll behavior */

    /* Enhanced container animations */
    .container {
        animation: fadeInUp 0.8s ease-out;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Parallax scroll effects */
    @media (prefers-reduced-motion: no-preference) {

    }
</style>