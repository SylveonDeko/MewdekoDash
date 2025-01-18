<!-- routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import FluidContainer from "$lib/util/FluidContainer.svelte";
  import Interactable from "$lib/util/InteractableElement.svelte";
  import Carousel from "$lib/carousel/Carousel.svelte";
  import ImageWrapper from "$lib/carousel/ImageWrapper.svelte";
  import type { RedisGuild } from "$lib/types/redisGuild";
  import MultiButton from "$lib/MultiButton.svelte";
  import { extractColors, type ColorPalette } from "$lib/colorUtils";
  import { logger } from "$lib/logger.ts";

  export let data;


  $: if (data.user) {
    updateColors();
  }

  async function updateColors() {
    try {
      if (data?.user?.avatar) {
        colors = await extractColors(
          data.user.avatar.startsWith("a_")
            ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.gif`
            : `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`
        );
      } else {
        // Default fallback colors when no user
        colors = await extractColors("/img/Mewdeko.png");
      }
    } catch (err) {
      logger.error('Failed to extract colors:', err);
      // Fallback colors in case of error
      colors = {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        text: '#ffffff',
        muted: '#9ca3af',
        gradientStart: '#3b82f6',
        gradientMid: '#8b5cf6',
        gradientEnd: '#ec4899'
      };
    }

    colorVars = `
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-text: ${colors.text};
    --color-muted: ${colors.muted};
  `;
  }
  let colors: ColorPalette;
  let colorVars: string;

  let guilds: RedisGuild[] = [];
  let fetched = false;
  const MAX_GUILD_NAME_LENGTH = 20;
  const MAX_GUILDS_TO_SHOW = 10;
  const buttons = [
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
      href: "https://discord.gg/invite/4stkEfZ6As",
      ariaLabel: "Join the Mewdeko Server"
    }
  ];

  onMount(async () => {
    try {
      await updateColors();
      const response = await fetch("/api/redis/guilds");
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

<main style={colorVars}>
  <header
    class="py-16 px-4 sm:px-12 flex flex-col items-center relative"
    in:fade={{ duration: 300 }}
    style="background: radial-gradient(circle at top,
    {colors?.gradientStart}15 0%,
    {colors?.gradientMid}10 50%,
    {colors?.gradientEnd}05 100%
  );"
  >
    <h1
      class="text-center font-extrabold text-mewd-white max-w-4xl mx-auto text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight mb-8"
    >
      Mewdeko
    </h1>
    <p class="text-center font-extrabold text-mewd-white max-w-4x1">
      The Most Customizable Open Source Bot for Discord!
    </p>

    <MultiButton {buttons} />

    {#if fetched}
      <section
        aria-labelledby="features-heading"
        class="relative mt-16"
      >
      <h2
        id="top-servers-heading"
        class="mb-6 text-2xl lg:text-3xl text-mewd-white font-bold text-center"
      >
        Our Top Servers
      </h2>
      {#if guilds.length > 0}
        <ul
          class="flex flex-wrap justify-center items-center gap-4 p-4"
          aria-label="Top servers list"
        >
          {#each guilds as guild, index (guild.Name)}
            <li
              class="relative group"
              in:fly={{ y: 20, duration: 300, delay: index * 100 }}
            >
              <img
                class="w-12 h-12 rounded-full transition-transform duration-200 transform group-hover:scale-110"
                  src={guild.IconUrl}
                  alt=""
                  loading="lazy"
                  aria-hidden="true"
                />
                <div
                  class="absolute hidden group-hover:block z-10 px-3 py-2 text-xs bg-mewd-dark-grey text-mewd-white rounded-md shadow-lg whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-2"
                  role="tooltip"
                >
                  <p class="font-semibold">
                    {truncateStringToLength(guild.Name, MAX_GUILD_NAME_LENGTH)}
                  </p>
                  <p class="text-mewd-offwhite">
                    {guild.MemberCount.toLocaleString()}
                    Members
                  </p>
                </div>
                <span class="sr-only"
                >{guild.Name}, {guild.MemberCount.toLocaleString()}
                  Members</span
                >
              </li>
            {/each}
          </ul>
        {:else}
          <p class="text-mewd-offwhite">
            No top servers available at the moment.
          </p>
        {/if}
      </section>
    {/if}
  </header>

  <section aria-labelledby="features-heading" class="bg-mewd-dark-grey py-24">
    <div class="container mx-auto px-4 max-w-7xl">
      <h2
        class="text-3xl font-bold text-mewd-white mb-12 text-center"
        id="features-heading"
      >
        Key Features
      </h2>
      <FluidContainer breakpoints={["md", "xl"]}>
        <Interactable
          cta={{
            text: "Invite Me",
            href: "https://discord.com/oauth2/authorize?client_id=752236274261426212&scope=bot&permissions=66186303",
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
          />
        </Interactable>

        <Interactable
          cta={{
            text: "Support Server",
            href: "https://discord.gg/the-deko-tree-843489716674494475",
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
          />
        </Interactable>

        <Interactable
          cta={{
            text: "Source Code",
            href: "https://github.com/SylveonDeko/Mewdeko",
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
          />
        </Interactable>

        <Interactable
          cta={{ text: "Check them out!", href: "/commands" }}
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
</style>
