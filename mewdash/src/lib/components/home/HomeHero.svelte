<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import Mascot from "$lib/components/brand/Mascot.svelte";

  /**
   * The landing page's opening: what Mewdeko is in one line, the invite and dashboard buttons, a few real
   * commands, and the cat. It takes no inputs.
   */
  const INVITE_URL =
    "https://discord.com/oauth2/authorize?client_id=752236274261426212&permissions=66186303&response_type=code&redirect_uri=https%3A%2F%2Fmewdeko.tech%2Fapi%2Fdiscord%2Fcallback&integration_type=0&scope=identify+guilds+bot";

  /** Commands shown as a taste of what the bot does. Each is a real command name. */
  const commands = [".achievements", ".rank", ".ticketpanel", ".play", ".gstart", ".antiraid"];
  const totalCommands = 1082;
</script>

<div class="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 px-2 sm:px-6"
     in:fade={{ duration: 300 }}>
  <div class="order-2 lg:order-1 text-center lg:text-left">
    <p class="text-sm sm:text-base font-semibold" style="color: {$colorStore.primary}">
      Mewdeko, the free and open source Discord bot
    </p>
    <h1 class="font-extrabold tracking-tight leading-[1.04] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mt-3"
        style="color: {$colorStore.text}">
      One bot.<br />Way too many <span style="color: {$colorStore.primary}">tails.</span>
    </h1>
    <p class="text-base sm:text-lg lg:text-xl leading-relaxed mt-5 max-w-xl mx-auto lg:mx-0" style="color: {$colorStore.muted}">
      Moderation, tickets, XP, achievements, music, forms, giveaways and about a thousand other things. We might have gone a
      little overboard.
    </p>

    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 mt-7">
      <a href={INVITE_URL} target="_blank" rel="noreferrer"
         class="inline-flex items-center justify-center gap-3 px-6 min-h-[52px] rounded-2xl text-base sm:text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
         style="background: {$colorStore.primary}30; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}80;
                box-shadow: 0 8px 28px {$colorStore.primary}25;">
        <i class="fa-brands fa-discord" aria-hidden="true"></i>
        Add to Discord
      </a>
      <a href="/dashboard"
         class="inline-flex items-center justify-center gap-3 px-5 min-h-[52px] rounded-2xl text-base sm:text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
         style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}25;">
        <i class="fa-solid fa-sliders" aria-hidden="true"></i>
        Open dashboard
      </a>
    </div>

    <div class="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-7">
      {#each commands as command, index (command)}
        <a href="/commands" in:fly={{ y: 8, duration: 300, delay: 150 + index * 50 }}
           class="font-mono text-xs sm:text-sm px-3 py-2 rounded-lg transition-colors"
           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;">
          {command}
        </a>
      {/each}
      <a href="/commands" class="font-mono text-xs sm:text-sm px-3 py-2 rounded-lg"
         style="color: {$colorStore.primary}">
        +{(totalCommands - commands.length).toLocaleString()} more
      </a>
    </div>

    <p class="text-sm mt-5" style="color: {$colorStore.muted}">
      In 11,400+ servers, with every feature free.
    </p>
  </div>

  <div class="order-1 lg:order-2 relative flex justify-center">
    <div class="relative w-full max-w-[300px] sm:max-w-[420px] lg:max-w-[560px]">
      <Mascot pixel={4.5} expression="excited" />
    </div>
  </div>
</div>

