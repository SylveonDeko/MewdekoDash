<!-- routes/staff/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";

  let mounted = false;

  onMount(() => {
    mounted = true;
  });

  function handleEasterEggClick(event: MouseEvent, member: any) {
    const element = event.currentTarget as HTMLElement;
    if (element && element.textContent === member.description) {
      element.textContent = member.eggy;
    } else if (element) {
      element.textContent = member.description;
    }
  }

  // Staff data
  const staffMembers = [
    {
      alt: "Owner/Developer",
      image: "https://cdn.mewdeko.tech/sylveon.gif",
      name: "SylveonDeko",
      description: "Owner/Developer",
      eggy: "LEEEEROY JEEEENKINS"
    },
    {
      alt: "Owner/Developer",
      image: "https://cdn.mewdeko.tech/Cottage.png",
      name: "GraveyardDwellingCat",
      description: "Owner/Developer",
      eggy: "Head of evil science/Catgirl shenanigans"
    },
    {
      alt: "Owner/Major Supporter",
      image: "https://cdn.mewdeko.tech/Paw.gif",
      name: "Paw",
      description: "Owner/Major Supporter",
      eggy: "Placeholder"
    }
  ];
</script>

<svelte:head>
  <title>Mewdeko - Our Team</title>
  <meta content="Mewdeko - The people that make the bot possible." property="og:title" />
  <meta content="Meet the talented team behind Mewdeko Discord bot" name="description" />
  <meta content="Meet the talented team behind Mewdeko Discord bot" property="og:description" />
  <meta content="Meet the talented team behind Mewdeko Discord bot" name="twitter:description" />
</svelte:head>

{#if mounted}
  <main
    class="min-h-screen"
    style="--color-primary: {$colorStore.primary};
           --color-secondary: {$colorStore.secondary};
           --color-accent: {$colorStore.accent};
           --color-text: {$colorStore.text};
           --color-muted: {$colorStore.muted};
           background: linear-gradient(135deg, {$colorStore.primary}10 0%, {$colorStore.secondary}05 100%);"
    title="Mewdeko staff members"
    in:fade
  >
    <!-- Header Section -->
    <div class="sticky top-0 z-50 backdrop-blur-lg border-b shadow-lg"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}15 0%, {$colorStore.gradientEnd}10 100%); border-color: {$colorStore.primary}30;">
      <div class="container mx-auto px-4 py-6">
        <div class="text-center">
          <h1 class="text-3xl lg:text-4xl font-bold mb-2" style="color: {$colorStore.text};">
            Meet Our Team
          </h1>
          <p class="text-lg" style="color: {$colorStore.muted};">
            The passionate people behind Mewdeko
          </p>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-16 max-w-7xl">
      <!-- Introduction -->
      <div class="text-center mb-16 max-w-4xl mx-auto" in:fade={{ duration: 300, delay: 100 }}>
        <div class="mb-8">
          <span class="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
            Our Staff
          </span>
        </div>
        <h2 class="text-4xl lg:text-5xl font-black mb-6" style="color: {$colorStore.text};">
          Major People
        </h2>
        <p class="text-xl leading-relaxed" style="color: {$colorStore.muted};">
          Meet the dedicated team that makes Mewdeko possible. Each member brings unique skills and passion to create
          the best Discord bot experience.
        </p>
      </div>

      <!-- Team Grid -->
      <div class="grid lg:grid-cols-3 gap-8 mb-16">
        {#each staffMembers as member, index}
          <div class="group" in:fly={{ y: 40, duration: 400, delay: 200 + (index * 100) }}>
            <div
              class="rounded-2xl p-8 backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}20;">

              <!-- Profile Image -->
              <div class="text-center mb-6">
                <div class="relative inline-block">
                  <img
                    alt={member.alt}
                    class="w-32 h-32 rounded-full mx-auto transition-transform duration-300 group-hover:scale-105 shadow-lg"
                    style="border: 3px solid {$colorStore.primary};"
                    src={member.image}
                    loading="lazy"
                  />
                  <!-- Status indicator -->
                  <div
                    class="absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                    style="background: {$colorStore.primary};">
                    <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  </div>
                </div>
              </div>

              <!-- Profile Info -->
              <div class="text-center">
                <h3 class="text-2xl font-bold mb-4" style="color: {$colorStore.text};">
                  {member.name}
                </h3>
                <div class="easter-egg-container">
                  <button
                    class="description text-base cursor-pointer transition-all duration-200 hover:opacity-70 text-left w-full bg-transparent border-none p-0 font-inherit"
                     style="color: {$colorStore.muted};"
                     on:click={(event) => handleEasterEggClick(event, member)}
                     aria-label="Click to reveal easter egg">
                    {member.description}
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Thank You Section -->
      <div class="text-center rounded-2xl p-12 backdrop-blur-sm border"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12); border-color: {$colorStore.primary}20;"
           in:fly={{ y: 40, duration: 400, delay: 600 }}>
        <div class="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}30, {$colorStore.gradientMid}40);">
          <span class="text-3xl">💖</span>
        </div>
        <h3 class="text-3xl font-bold mb-4" style="color: {$colorStore.text};">
          Thank You for Your Support
        </h3>
        <p class="text-lg max-w-2xl mx-auto leading-relaxed" style="color: {$colorStore.muted};">
          Our team is driven by the amazing community that uses and supports Mewdeko.
          Every suggestion, bug report, and piece of feedback helps us make the bot better for everyone.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <a href="https://github.com/SylveonDeko/Mewdeko"
             class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
             style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
             target="_blank"
             rel="noopener noreferrer">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Contribute on GitHub
          </a>
          <a href="https://discord.gg/Z9DYApMXFN"
             class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}80, {$colorStore.gradientMid}90); color: white; border: 1px solid {$colorStore.primary}50;"
             target="_blank"
             rel="noopener noreferrer">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
            </svg>
            Join Our Discord
          </a>
        </div>
      </div>
    </div>
  </main>
{/if}

<style>
    /* Enhanced profile card effects */
    .group:hover .w-32 {
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    /* Easter egg interaction styling */
    .easter-egg-container .description {
        user-select: none;
        position: relative;
    }

    .easter-egg-container .description:hover::after {
        content: "💡 Click me!";
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-primary);
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0.9;
        pointer-events: none;
    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
        .rounded-2xl {
            border-width: 2px;
        }
    }

    /* Focus states for accessibility */
    .description:focus {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
        border-radius: 4px;
    }
</style>
