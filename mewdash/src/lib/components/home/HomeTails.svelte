<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import Mascot from "$lib/components/brand/Mascot.svelte";
  import MascotTool, { TOOL_VIEWBOX } from "$lib/components/brand/MascotTool.svelte";
  import { buildTails, type MascotExpression, type MascotToolName } from "$lib/components/brand/mascotGeometry";

  /**
   * What the bot does, shown on the cat's tails.
   */
  interface Feature {
    tool: MascotToolName;
    /** The cat's face while this part is at the top. */
    expression: MascotExpression;
    title: () => string;
    text: () => string;
    commands: string[];
    href: string;
  }

  /** The parts of the bot in the order they come to the top. Every command listed is a real one. */
  const features: Feature[] = [
    {
      tool: "star",
      expression: "happy",
      title: m.home.tailsStarTitle,
      text: m.home.tailsStarText,
      commands: [".rank", ".leaderboard", ".achievements", ".achcard", ".rep"],
      href: "/wiki/xp"
    },
    {
      tool: "chart",
      expression: "look",
      title: m.home.tailsChartTitle,
      text: m.home.tailsChartText,
      commands: [".activitystats", ".topvoice", ".growthstats", ".inviteslb", ".logevents"],
      href: "/wiki/serverstats"
    },
    {
      tool: "bubble",
      expression: "wink",
      title: m.features.ticketsName,
      text: m.home.tailsBubbleText,
      commands: [".ticketpanel", ".ticketclaim", ".ticketclose", ".ticketnote"],
      href: "/wiki/tickets"
    },
    {
      tool: "coins",
      expression: "excited",
      title: m.home.tailsCoinsTitle,
      text: m.home.tailsCoinsText,
      commands: [".daily", ".blackjack", ".slots", ".roulette", ".shop"],
      href: "/wiki/currency"
    },
    {
      tool: "gift",
      expression: "starry",
      title: m.features.giveawaysName,
      text: m.home.tailsGiftText,
      commands: [".gstart", ".greroll", ".gend", ".giveaways"],
      href: "/wiki/giveaways"
    },
    {
      tool: "note",
      expression: "vibing",
      title: m.features.musicName,
      text: m.home.tailsNoteText,
      commands: [".play", ".queue", ".skip", ".nowplaying", ".saveplaylist"],
      href: "/wiki/music"
    },
    {
      tool: "shield",
      expression: "determined",
      title: m.features.categoryModeration,
      text: m.home.tailsShieldText,
      commands: [".warn", ".timeout", ".purge", ".antiraid", ".antispam", ".lockdown"],
      href: "/wiki/moderation"
    },
    {
      tool: "wrench",
      expression: "excited",
      title: m.home.tailsWrenchTitle,
      text: m.home.tailsWrenchText,
      commands: [".addchattrigger", ".alias", ".prefix", ".say"],
      href: "/wiki/chat-triggers"
    },
    {
      tool: "clipboard",
      expression: "look",
      title: m.features.formsName,
      text: m.home.tailsClipboardText,
      commands: [],
      href: "/wiki/forms"
    },
    {
      tool: "pin",
      expression: "starry",
      title: m.features.starboardName,
      text: m.home.tailsPinText,
      commands: [".createstarboard", ".starboardchannel", ".liststarboards"],
      href: "/wiki/starboard"
    },
    {
      tool: "paw",
      expression: "happy",
      title: m.home.tailsPawTitle,
      text: m.home.tailsPawText,
      commands: [".multigreetadd", ".multigreetlist", ".greetdm", ".rolegreetadd"],
      href: "/wiki/multigreets"
    },
    {
      tool: "tag",
      expression: "wink",
      title: m.features.roleMenusName,
      text: m.home.tailsTagText,
      commands: [".rolemenucreate", ".rolemenuadd", ".rolemenulist"],
      href: "/wiki/role-menus"
    },
    {
      tool: "cake",
      expression: "excited",
      title: m.features.birthdayName,
      text: m.home.tailsCakeText,
      commands: [".setbirthday", ".birthdaychannel", ".upcomingbirthdays", ".birthdayrole"],
      href: "/wiki/birthday"
    },
    {
      tool: "bell",
      expression: "surprised",
      title: m.home.tailsBellTitle,
      text: m.home.tailsBellText,
      commands: [".streamadd", ".streamlist", ".feedadd", ".feedlist"],
      href: "/wiki/streams"
    },
    {
      tool: "mic",
      expression: "vibing",
      title: m.features.customvoiceName,
      text: m.home.tailsMicText,
      commands: [".setupvoicehub", ".renamevoice", ".limitvoice", ".lockvoice"],
      href: "/wiki/customvoice"
    },
    {
      tool: "dice",
      expression: "wink",
      title: m.common.games,
      text: m.home.tailsDiceText,
      commands: [".trivia", ".hangman", ".tictactoe", ".countingsetup", ".8ball"],
      href: "/wiki/games"
    },
    {
      tool: "clock",
      expression: "surprised",
      title: m.home.tailsClockTitle,
      text: m.home.tailsClockText,
      commands: [".remind", ".remindlist", ".repeat", ".repeatlist"],
      href: "/wiki/repeaters"
    },
    {
      tool: "bulb",
      expression: "look",
      title: m.features.suggestionsName,
      text: m.home.tailsBulbText,
      commands: [".suggest", ".setsuggestchannel", ".acceptsuggest", ".denysuggest"],
      href: "/wiki/suggestions"
    }
  ];

  const toolSet = features.map((item) => item.tool);

  /** The stage the cat and its cards are laid out on, in the cat's own drawing units. */
  const STAGE = { x: -500, y: -260, width: 1480, height: 740 };
  /** The part of the stage the cat's drawing covers. */
  const CAT = { x: -160, y: -175, width: 810, height: 635 };

  let active = $state(0);
  let position = $state(0);
  let wide = $state(false);
  let feature = $derived(features[active]);
  let cards = $derived(wide ? buildTails(position, toolSet) : []);

  /**
   * A horizontal spot on the stage as a percentage of its width.
   * @param x The spot in drawing units
   */
  function across(x: number): number {
    return ((x - STAGE.x) / STAGE.width) * 100;
  }

  /**
   * A vertical spot on the stage as a percentage of its height.
   * @param y The spot in drawing units
   */
  function down(y: number): number {
    return ((y - STAGE.y) / STAGE.height) * 100;
  }

  /**
   * Turns the tails to a part.
   * @param index Which part, wrapping at either end
   */
  function go(index: number) {
    active = ((index % features.length) + features.length) % features.length;
  }

  onMount(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const size = () => { wide = query.matches; };
    size();
    query.addEventListener("change", size);
    return () => query.removeEventListener("change", size);
  });
</script>

{#snippet stepper()}
  <div class="flex items-center gap-3">
    <button type="button" class="w-[44px] h-[44px] rounded-xl flex items-center justify-center"
            style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
            aria-label={m.home.tailsPrevious()} onclick={() => go(active - 1)}>
      <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
    </button>
    <span class="min-w-[4.5rem] text-center text-sm tabular-nums" style="color: {$colorStore.muted}">
      {m.common.currentOfTotal({ current: active + 1, total: features.length })}
    </span>
    <button type="button" class="w-[44px] h-[44px] rounded-xl flex items-center justify-center"
            style="color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
            aria-label={m.home.tailsNext()} onclick={() => go(active + 1)}>
      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
    </button>
  </div>
{/snippet}

{#snippet details()}
  <div class="flex items-center gap-3">
    <svg viewBox={TOOL_VIEWBOX[feature.tool]} class="w-10 h-10 lg:w-12 lg:h-12 shrink-0" aria-hidden="true">
      <MascotTool tool={feature.tool} />
    </svg>
    <h3 class="text-2xl lg:text-3xl font-bold" style="color: {$colorStore.text}">{feature.title()}</h3>
  </div>
  <p class="text-base leading-relaxed mt-2" style="color: {$colorStore.muted}">{feature.text()}</p>
  <div class="flex flex-wrap gap-2 mt-3">
    {#each feature.commands as command (command)}
      <span class="font-mono text-xs sm:text-sm px-2.5 py-1.5 rounded-lg"
            style="background: {$colorStore.primary}06; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;">
        {command}
      </span>
    {:else}
      <span class="text-sm" style="color: {$colorStore.muted}">{m.home.tailsNoCommands()}</span>
    {/each}
  </div>
  <a href={feature.href} class="inline-flex items-center gap-2 min-h-[44px] mt-1 text-sm font-semibold"
     style="color: {$colorStore.primary}">
    {m.home.tailsReadGuide()}  </a>
{/snippet}

<section aria-labelledby="tails-heading" class="relative px-4 py-16">
  <div class="text-center mb-6">
    <h2 id="tails-heading" class="text-2xl sm:text-3xl lg:text-4xl font-extrabold" style="color: {$colorStore.text}">
      {m.home.tailsHeading()}
    </h2>
    <p class="text-sm sm:text-base mt-1" style="color: {$colorStore.muted}">
      {m.home.tailsSubheading()}
    </p>
  </div>

  {#if wide}
    <div class="max-w-7xl mx-auto grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8 items-center">
      <div class="space-y-4">
        <div class="min-h-[240px] rounded-2xl border p-5"
             style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;" aria-live="polite">
          {#key active}
            <div in:fade={{ duration: 250 }}>
              {@render details()}
            </div>
          {/key}
        </div>
        {@render stepper()}
      </div>

      <div class="stage relative w-full" style="aspect-ratio: {STAGE.width} / {STAGE.height};">
        <div class="absolute"
             style="left: {across(CAT.x)}%; top: {down(CAT.y)}%; width: {(CAT.width / STAGE.width) * 100}%; height: {(CAT.height / STAGE.height) * 100}%;">
          <Mascot turn={-active} bind:position {toolSet} label={null} pixel={4.5} expression={features[active].expression}
                  class="w-full h-full" />
        </div>

        {#each cards as card (card.index)}
          {@const item = features[card.feature]}
          {@const visible = card.shown * (1 - card.featured)}
          <button type="button" tabindex={visible > 0.5 ? 0 : -1}
                  class="travel absolute flex items-center gap-[0.7cqw] rounded-[1cqw] border text-left"
                  style="left: {across(card.cardX)}%; top: {down(card.cardY)}%; opacity: {visible};
                         pointer-events: {visible > 0.5 ? 'auto' : 'none'};
                         background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;"
                  onclick={() => go(card.feature)}>
            <svg viewBox={TOOL_VIEWBOX[item.tool]} class="icon shrink-0" aria-hidden="true">
              <MascotTool tool={item.tool} />
            </svg>
            <span class="label font-semibold" style="color: {$colorStore.text}">{item.title()}</span>
          </button>
        {/each}
      </div>
    </div>
  {:else}
    <div class="w-full max-w-xl mx-auto">
      <div class="min-h-[214px] rounded-2xl border p-4"
           style="background: {$colorStore.primary}06; border-color: {$colorStore.primary}20;" aria-live="polite">
        {#key active}
          <div in:fade={{ duration: 250 }}>
            {@render details()}
          </div>
        {/key}
      </div>
      <div class="mx-auto w-full max-w-[min(100%,40svh)]">
        <Mascot turn={-active} bind:position {toolSet} label={null} pixel={4.5} expression={features[active].expression} />
      </div>
      <div class="flex justify-center">
        {@render stepper()}
      </div>
    </div>
  {/if}
</section>

<style>
  .stage {
    container-type: inline-size;
  }

  .travel {
    width: 17cqw;
    min-height: 44px;
    padding: 0.6cqw 0.9cqw;
    transform: translate(-50%, -50%);
  }

  .travel .icon {
    width: 2.6cqw;
    height: 2.6cqw;
  }

  .travel .label {
    font-size: clamp(11px, 1.15cqw, 16px);
    line-height: 1.2;
  }
</style>
