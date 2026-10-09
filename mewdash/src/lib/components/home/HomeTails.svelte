<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import Mascot from "$lib/components/brand/Mascot.svelte";
  import MascotTool, { TOOL_VIEWBOX } from "$lib/components/brand/MascotTool.svelte";
  import { buildTails, type MascotExpression, type MascotToolName } from "$lib/components/brand/mascotGeometry";

  /**
   * What the bot does, shown on the cat's tails. The cat stays pinned while the visitor scrolls, and each step
   * turns the tails so the one carrying the current part comes to the top. On wide screens a small card
   * travels beside every tail and the part at the top opens out above the cat. There are more parts than
   * tails, so a tail picks up a new one each time it passes behind the cat.
   */
  interface Feature {
    tool: MascotToolName;
    /** The cat's face while this part is at the top. */
    expression: MascotExpression;
    title: string;
    text: string;
    commands: string[];
    href: string;
  }

  /** The parts of the bot in the order they come to the top. Every command listed is a real one. */
  const features: Feature[] = [
    {
      tool: "star",
      expression: "happy",
      title: "XP and achievements",
      text: "Levels for chatting and voice, and achievements members can show off.",
      commands: [".rank", ".leaderboard", ".achievements", ".achcard", ".rep"],
      href: "/wiki/xp"
    },
    {
      tool: "chart",
      expression: "look",
      title: "Stats and logging",
      text: "See who is active in your server, and keep a log of what happens.",
      commands: [".activitystats", ".topvoice", ".growthstats", ".inviteslb", ".logevents"],
      href: "/wiki/serverstats"
    },
    {
      tool: "bubble",
      expression: "wink",
      title: "Tickets",
      text: "Support tickets in private channels, with claiming and transcripts.",
      commands: [".ticketpanel", ".ticketclaim", ".ticketclose", ".ticketnote"],
      href: "/wiki/tickets"
    },
    {
      tool: "coins",
      expression: "excited",
      title: "Economy and games",
      text: "A server currency, with games to win it and a shop to spend it in.",
      commands: [".daily", ".blackjack", ".slots", ".roulette", ".shop"],
      href: "/wiki/currency"
    },
    {
      tool: "gift",
      expression: "starry",
      title: "Giveaways",
      text: "Timed giveaways with entry requirements and rerolls.",
      commands: [".gstart", ".greroll", ".gend", ".giveaways"],
      href: "/wiki/giveaways"
    },
    {
      tool: "note",
      expression: "vibing",
      title: "Music",
      text: "Plays YouTube, Spotify and SoundCloud in voice, with a queue and saved playlists.",
      commands: [".play", ".queue", ".skip", ".nowplaying", ".saveplaylist"],
      href: "/wiki/music"
    },
    {
      tool: "shield",
      expression: "determined",
      title: "Moderation",
      text: "Warnings that lead to punishments by themselves, and protection against raids and spam.",
      commands: [".warn", ".timeout", ".purge", ".antiraid", ".antispam", ".lockdown"],
      href: "/wiki/moderation"
    },
    {
      tool: "wrench",
      expression: "excited",
      title: "Make it yours",
      text: "Write your own commands and replies, and change how the bot looks in your server.",
      commands: [".addchattrigger", ".alias", ".prefix", ".say"],
      href: "/wiki/chat-triggers"
    },
    {
      tool: "clipboard",
      expression: "look",
      title: "Forms",
      text: "Applications and ban appeals that people fill in from a link and your staff approve in Discord.",
      commands: [],
      href: "/wiki/forms"
    },
    {
      tool: "pin",
      expression: "starry",
      title: "Starboard",
      text: "Members star a message, and the ones with enough stars get reposted in their own channel.",
      commands: [".createstarboard", ".starboardchannel", ".liststarboards"],
      href: "/wiki/starboard"
    },
    {
      tool: "paw",
      expression: "happy",
      title: "Welcomes",
      text: "Greet new members in a channel or by DM.",
      commands: [".multigreetadd", ".multigreetlist", ".greetdm", ".rolegreetadd"],
      href: "/wiki/multigreets"
    },
    {
      tool: "tag",
      expression: "wink",
      title: "Role menus",
      text: "Let members pick their own roles from buttons or a dropdown.",
      commands: [".rolemenucreate", ".rolemenuadd", ".rolemenulist"],
      href: "/wiki/role-menus"
    },
    {
      tool: "cake",
      expression: "excited",
      title: "Birthdays",
      text: "Members set their birthday and the bot announces it on the day.",
      commands: [".setbirthday", ".birthdaychannel", ".upcomingbirthdays", ".birthdayrole"],
      href: "/wiki/birthday"
    },
    {
      tool: "bell",
      expression: "surprised",
      title: "Stream alerts and feeds",
      text: "Posts when a streamer goes live or a feed has something new.",
      commands: [".streamadd", ".streamlist", ".feedadd", ".feedlist"],
      href: "/wiki/streams"
    },
    {
      tool: "mic",
      expression: "vibing",
      title: "Custom voice",
      text: "Members get a temporary voice channel of their own.",
      commands: [".setupvoicehub", ".renamevoice", ".limitvoice", ".lockvoice"],
      href: "/wiki/customvoice"
    },
    {
      tool: "dice",
      expression: "wink",
      title: "Games",
      text: "Small games for when chat goes quiet.",
      commands: [".trivia", ".hangman", ".tictactoe", ".countingsetup", ".8ball"],
      href: "/wiki/games"
    },
    {
      tool: "clock",
      expression: "surprised",
      title: "Reminders and repeaters",
      text: "Personal reminders, and messages that repost on a schedule.",
      commands: [".remind", ".remindlist", ".repeat", ".repeatlist"],
      href: "/wiki/repeaters"
    },
    {
      tool: "bulb",
      expression: "look",
      title: "Suggestions",
      text: "Members post ideas and vote on each other's.",
      commands: [".suggest", ".setsuggestchannel", ".acceptsuggest", ".denysuggest"],
      href: "/wiki/suggestions"
    }
  ];

  const toolSet = features.map((item) => item.tool);

  /**
   * How far the visitor scrolls between one part and the next, in pixels. It is under two notches of a mouse
   * wheel, so a single notch always carries past the half way point and on to the next part.
   */
  const STEP_PX = 150;

  /** The stage the cat and its cards are laid out on, in the cat's own drawing units. */
  const STAGE = { x: -500, y: -560, width: 1480, height: 1040 };
  /** The part of the stage the cat's drawing covers. */
  const CAT = { x: -160, y: -175, width: 810, height: 635 };

  let section: HTMLElement | undefined = $state();
  let active = $state(0);
  let turn = $state(0);
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
   * Works out how far the visitor has scrolled through the parts, which turns the tails by exactly that much,
   * fractions included, and which part is nearest. The page only settles on resting points while the
   * visitor is strictly between the first and last of them. On those two it scrolls freely, so the visitor can
   * always leave the section in either direction.
   */
  function track() {
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    if (span <= 0) return;
    const offset = -rect.top;
    const along = Math.min(Math.max(offset / STEP_PX - 0.5, 0), features.length - 1);
    turn = -along;
    active = Math.round(along);

    const first = STEP_PX / 2;
    const last = (features.length - 0.5) * STEP_PX;
    const between = offset > first + 8 && offset < last - 8;
    document.documentElement.style.scrollSnapType = between ? "y proximity" : "";
  }

  /**
   * Scrolls to a part.
   * @param index Which part
   */
  function go(index: number) {
    if (!section) return;
    const target = ((index % features.length) + features.length) % features.length;
    const span = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: top + (span * (target + 0.5)) / features.length, behavior: smooth ? "smooth" : "auto" });
  }

  onMount(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const size = () => { wide = query.matches; };
    const root = document.documentElement;
    const before = root.style.scrollSnapType;
    size();
    track();
    query.addEventListener("change", size);
    window.addEventListener("scroll", track, { passive: true });
    window.addEventListener("resize", track);
    return () => {
      root.style.scrollSnapType = before;
      query.removeEventListener("change", size);
      window.removeEventListener("scroll", track);
      window.removeEventListener("resize", track);
    };
  });
</script>

{#snippet details()}
  <div class="flex items-center gap-3">
    <svg viewBox={TOOL_VIEWBOX[feature.tool]} class="w-10 h-10 lg:w-12 lg:h-12 shrink-0" aria-hidden="true">
      <MascotTool tool={feature.tool} />
    </svg>
    <h3 class="text-2xl lg:text-3xl font-bold" style="color: {$colorStore.text}">{feature.title}</h3>
  </div>
  <p class="text-base leading-relaxed mt-2" style="color: {$colorStore.muted}">{feature.text}</p>
  <div class="flex flex-wrap gap-2 mt-3">
    {#each feature.commands as command (command)}
      <span class="font-mono text-xs sm:text-sm px-2.5 py-1.5 rounded-lg"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;">
        {command}
      </span>
    {:else}
      <span class="text-sm" style="color: {$colorStore.muted}">No commands for this one. You build forms on the dashboard.</span>
    {/each}
  </div>
  <a href={feature.href} class="inline-flex items-center gap-2 min-h-[44px] mt-1 text-sm font-semibold"
     style="color: {$colorStore.primary}">
    Read the guide
    <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
  </a>
{/snippet}

<section bind:this={section} aria-labelledby="tails-heading" class="relative"
         style="height: calc({features.length * STEP_PX}px + 100vh);">
  {#each features as item, index (item.tool)}
    <div class="rest absolute left-0 w-px h-px pointer-events-none" aria-hidden="true"
         style="top: {(index + 0.5) * STEP_PX}px;"></div>
  {/each}
  <div class="sticky top-0 h-[100svh] flex flex-col justify-center px-4 py-3 overflow-hidden">
    <div class="text-center mb-2">
      <h2 id="tails-heading" class="text-2xl sm:text-3xl lg:text-4xl font-extrabold" style="color: {$colorStore.text}">
        What each tail does
      </h2>
      <p class="text-sm sm:text-base mt-1" style="color: {$colorStore.muted}">
        Every tail has more than one job.
      </p>
    </div>

    {#if wide}
      <div class="stage relative mx-auto mt-3"
           style="width: min(100%, calc((100svh - 140px) * {STAGE.width / STAGE.height})); aspect-ratio: {STAGE.width} / {STAGE.height};">
        <div class="absolute"
             style="left: {across(CAT.x)}%; top: {down(CAT.y)}%; width: {(CAT.width / STAGE.width) * 100}%; height: {(CAT.height / STAGE.height) * 100}%;">
          <Mascot {turn} follow bind:position {toolSet} label={null} pixel={4.5} expression={features[active].expression}
                  class="w-full h-full" />
        </div>

        {#each cards as card (card.index)}
          {@const item = features[card.feature]}
          {@const visible = card.shown * (1 - card.featured)}
          <button type="button" tabindex={visible > 0.5 ? 0 : -1}
                  class="travel absolute flex items-center gap-[0.7cqw] rounded-[1cqw] border text-left"
                  style="left: {across(card.cardX)}%; top: {down(card.cardY)}%; opacity: {visible};
                         pointer-events: {visible > 0.5 ? 'auto' : 'none'};
                         background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
                  onclick={() => go(card.feature)}>
            <svg viewBox={TOOL_VIEWBOX[item.tool]} class="icon shrink-0" aria-hidden="true">
              <MascotTool tool={item.tool} />
            </svg>
            <span class="label font-semibold" style="color: {$colorStore.text}">{item.title}</span>
          </button>
        {/each}

        <div class="absolute rounded-2xl border p-4 xl:p-5"
             style="left: {across(240)}%; top: {down(-196)}%; width: 40%; transform: translate(-50%, -100%);
                    background: {$colorStore.primary}12; border-color: {$colorStore.primary}50;"
             aria-live="polite">
          {#key active}
            <div in:fade={{ duration: 250 }}>
              {@render details()}
            </div>
          {/key}
        </div>
      </div>
    {:else}
      <div class="w-full max-w-xl mx-auto">
        <div class="min-h-[214px] rounded-2xl border p-4 mt-1"
             style="background: {$colorStore.primary}12; border-color: {$colorStore.primary}50;" aria-live="polite">
          {#key active}
            <div in:fade={{ duration: 250 }}>
              {@render details()}
            </div>
          {/key}
        </div>
        <div class="mx-auto w-full max-w-[min(100%,40svh)]">
          <Mascot {turn} follow bind:position {toolSet} label={null} pixel={4.5} expression={features[active].expression} />
        </div>
        <div class="flex items-center justify-center gap-3">
          <button type="button" class="w-[44px] h-[44px] rounded-xl flex items-center justify-center"
                  style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  aria-label="Previous part" onclick={() => go(active - 1)}>
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>
          <span class="min-w-[4.5rem] text-center text-sm tabular-nums" style="color: {$colorStore.muted}">
            {active + 1} of {features.length}
          </span>
          <button type="button" class="w-[44px] h-[44px] rounded-xl flex items-center justify-center"
                  style="background: {$colorStore.primary}15; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  aria-label="Next part" onclick={() => go(active + 1)}>
            <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .rest {
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

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
