<script lang="ts">
  import { m } from "$lib/i18n";
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    achievementsApi,
    type AchievementCatalog,
    type AchievementOverview,
    type AchievementRarity,
    type AchievementSettings
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { DATA_SOURCES, gradeOf, timeAgo } from "../achievementHelpers";
  import AchievementIcon from "./AchievementIcon.svelte";
  import DuoIcon from "./DuoIcon.svelte";

  /** Tab inputs. */
  interface Props {
    overview: AchievementOverview;
    catalog: AchievementCatalog;
    onsettings: (settings: AchievementSettings) => void;
    onsources: (sources: Record<string, boolean>) => void;
    onopen: (key: string) => void;
    ongoto: (tab: string) => void;
    onerror: (text: string) => void;
    onsuccess: (text: string) => void;
  }

  let { overview, catalog, onsettings, onsources, onopen, ongoto, onerror, onsuccess }: Props = $props();

  let toggling = $state(false);
  let fixingMessages = $state(false);

  let sourceRows = $derived(
    Object.entries(DATA_SOURCES).map(([key, info]) => ({
      key,
      ...info,
      label: sourceLabel(key, info.label),
      off: sourceOff(key, info.off),
      on: overview.dataSources[key] ?? true,
      used: catalog.achievements.some((a) => a.enabled && a.trigger === 0 &&
        catalog.metrics.find((metric) => metric.value === a.metric)?.source === key)
    }))
  );
  let problems = $derived(sourceRows.filter((s) => !s.on && s.used));

  let stats = $derived([
    { icon: "fa-users", label: m.achievements.overviewStatMembers(), value: overview.members.toLocaleString(), sub: m.achievements.overviewStatMembersSub() },
    { icon: "fa-unlock", label: m.achievements.overviewStatUnlocks(), value: overview.unlocks.toLocaleString(), sub: m.achievements.overviewStatUnlocksSub({ count: overview.unlocksThisWeek.toLocaleString() }) },
    { icon: "fa-crown", label: m.achievements.overviewStatActive(), value: `${overview.earnable} / ${overview.total}`, sub: m.achievements.overviewStatActiveSub() },
    { icon: "fa-wand-magic-sparkles", label: m.achievements.libraryMadeHere(), value: overview.customCount.toLocaleString(), sub: m.achievements.overviewStatCustomSub() }
  ]);

  /**
   * Starts or pauses earning for the whole server.
   * @param enabled The new state
   */
  async function setEnabled(enabled: boolean) {
    if (!$currentGuild?.id || toggling) return;
    toggling = true;
    try {
      onsettings(await achievementsApi.updateSettings($currentGuild.id, { enabled }));
      if (enabled && !overview.settings.backfilledAt) {
        onsuccess(m.achievements.overviewStartedMessage());
      }
    } catch (err: any) {
      logger.error("Failed to switch achievements:", err);
      onerror(err?.message || m.common.saveFailedInline());
    } finally {
      toggling = false;
    }
  }

  /** Turns on message counting. */
  async function enableMessages() {
    if (!$currentGuild?.id || fixingMessages) return;
    fixingMessages = true;
    try {
      onsources(await achievementsApi.enableMessageCounting($currentGuild.id));
    } catch (err: any) {
      logger.error("Failed to turn on message counting:", err);
      onerror(err?.message || m.achievements.overviewErrorMessages());
    } finally {
      fixingMessages = false;
    }
  }

  const USER_TOKEN = "\u0000user";
  const ACHIEVEMENT_TOKEN = "\u0000achievement";
  /** The unlock sentence split around the user and the achievement, so each can be styled where the locale puts it. */
  const unlockParts = $derived(
    m.achievements.overviewUnlockLine({ user: USER_TOKEN, achievement: ACHIEVEMENT_TOKEN })
      .split(/(\u0000user|\u0000achievement)/)
      .filter((part) => part !== "")
  );

  /**
   * The localized name of a data source.
   * @param key The source key
   * @param fallback The helper's name
   */
  function sourceLabel(key: string, fallback: string): string {
    switch (key) {
      case "messages": return m.achievements.overviewSourceMessages();
      case "voice": return m.achievements.overviewSourceVoice();
      case "invites": return m.features.wizardInvitetrackingName();
      case "commands": return m.achievements.overviewSourceCommands();
      case "xp": return m.common.xp();
      case "reputation": return m.features.reputationName();
      default: return fallback;
    }
  }

  /**
   * The localized note shown when a data source is off.
   * @param key The source key
   * @param fallback The helper's note
   */
  function sourceOff(key: string, fallback: string): string {
    switch (key) {
      case "messages": return m.achievements.overviewSourceMessagesOff();
      case "voice": return m.achievements.overviewSourceVoiceOff();
      case "invites": return m.achievements.overviewSourceInvitesOff();
      case "commands": return m.achievements.overviewSourceCommandsOff();
      case "xp": return m.achievements.overviewSourceXpOff();
      case "reputation": return m.achievements.overviewSourceReputationOff();
      default: return fallback;
    }
  }

  /**
   * Text color for a grade.
   * @param grade 0 to 5
   */
  function gradeColor(grade: number): string {
    return gradeOf(catalog.grades, grade).color;
  }
</script>

{#snippet rarityList(title: string, icon: string, items: AchievementRarity[], empty: string)}
  <div class="rounded-2xl border p-5 md:p-6 shadow-2xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
              border-color: {$colorStore.primary}30;">
    <h3 class="flex items-center gap-2 font-semibold mb-4" style="color: {$colorStore.text}">
      <DuoIcon {icon} />
      {title}
    </h3>
    {#if items.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{empty}</p>
    {:else}
      <ul class="space-y-2">
        {#each items as item (item.key)}
          <li>
            <button type="button"
                    class="w-full flex items-center gap-3 p-3 rounded-xl text-left min-h-[44px] transition-all hover:scale-[1.01]"
                    style="background: {$colorStore.primary}08;"
                    onclick={() => onopen(item.key)}>
              <AchievementIcon icon={item.icon} iconUrl={item.iconUrl} color={gradeColor(item.grade)} size={36} />
              <span class="flex-1 min-w-0 truncate text-sm font-medium" style="color: {$colorStore.text}">{item.name}</span>
              <span class="text-xs px-2 py-1 rounded-lg shrink-0" style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                {item.count.toLocaleString()}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/snippet}

<div class="space-y-6" in:fade={{ duration: 200 }}>
  <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
              border-color: {$colorStore.primary}30;">
    <div class="flex flex-col md:flex-row md:items-center gap-6">
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
           style="background: {$colorStore.primary}20; border: 1px solid {$colorStore.primary}30;">
        <i class="fa-utility-duo fa-regular fa-crown"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 30px;"></i>
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">
          {overview.settings.enabled ? m.achievements.overviewEarningTitle() : m.achievements.overviewPausedTitle()}
        </h2>
        <p class="text-sm mt-1" style="color: {$colorStore.muted}">
          {overview.settings.enabled
            ? m.achievements.overviewEarningText()
            : m.achievements.overviewPausedText()}
        </p>
      </div>
      {#if overview.settings.enabled}
        <button type="button" class="px-5 h-[44px] rounded-xl text-sm font-medium shrink-0 disabled:opacity-50"
                style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                disabled={toggling} onclick={() => setEnabled(false)}>
          <i class="fa-solid {toggling ? 'fa-spinner fa-spin' : 'fa-pause'} mr-2" aria-hidden="true"></i>{m.achievements.overviewPause()}
        </button>
      {:else}
        <button type="button" class="px-5 h-[44px] rounded-xl text-sm font-semibold shrink-0 disabled:opacity-50"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                disabled={toggling} onclick={() => setEnabled(true)}>
          <i class="fa-solid {toggling ? 'fa-spinner fa-spin' : 'fa-play'} mr-2" aria-hidden="true"></i>{m.achievements.overviewStart()}
        </button>
      {/if}
    </div>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {#each stats as stat (stat.label)}
      <div class="rounded-2xl border p-4 md:p-5 shadow-xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide" style="color: {$colorStore.muted}">
          <DuoIcon icon={stat.icon} />
          {stat.label}
        </div>
        <div class="text-2xl md:text-3xl font-bold mt-2" style="color: {$colorStore.primary}">{stat.value}</div>
        <div class="text-xs mt-1" style="color: {$colorStore.muted}">{stat.sub}</div>
      </div>
    {/each}
  </div>

  <div class="rounded-2xl border p-5 md:p-6 shadow-2xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
              border-color: {problems.length > 0 ? $colorStore.accent : $colorStore.primary}30;">
    <h3 class="flex items-center gap-2 font-semibold mb-1" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-link" />
      {m.achievements.overviewSourcesTitle()}
    </h3>
    <p class="text-sm mb-4" style="color: {$colorStore.muted}">
      {m.achievements.overviewSourcesHint()}
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      {#each sourceRows as source (source.key)}
        <div class="flex items-center gap-3 p-3 rounded-xl min-h-[56px]" style="background: {$colorStore.primary}08;">
          <DuoIcon icon={source.icon} color={source.on ? null : $colorStore.accent} class="w-5 text-center" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium" style="color: {$colorStore.text}">{source.label}</div>
            {#if !source.on}
              <div class="text-xs" style="color: {$colorStore.muted}">{source.used ? source.off : m.achievements.overviewSourceUnneeded()}</div>
            {/if}
          </div>
          {#if source.on}
            <span class="text-xs px-2 py-1 rounded-lg font-medium" style="background: #10b98120; color: #10b981;">{m.achievements.overviewTracking()}</span>
          {:else if source.key === "messages"}
            <button type="button"
                    class="text-xs px-3 py-2 rounded-lg font-medium min-h-[36px] disabled:opacity-50"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                    disabled={fixingMessages}
                    onclick={enableMessages}>
              {fixingMessages ? m.achievements.overviewStarting() : m.achievements.overviewStartTracking()}
            </button>
          {:else if source.href}
            <a href={source.href}
               class="text-xs px-3 py-2 rounded-lg font-medium min-h-[36px] flex items-center"
               style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;">
              {m.common.open()}
            </a>
          {:else}
            <span class="text-xs px-2 py-1 rounded-lg font-medium" style="background: {$colorStore.accent}20; color: {$colorStore.accent};">{m.achievements.overviewNotTracking()}</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 rounded-2xl border p-5 md:p-6 shadow-2xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                border-color: {$colorStore.primary}30;">
      <div class="flex items-center justify-between gap-3 mb-4">
        <h3 class="flex items-center gap-2 font-semibold" style="color: {$colorStore.text}">
          <DuoIcon icon="fa-clock" />
          {m.achievements.overviewRecentTitle()}
        </h3>
        <button type="button" class="text-sm px-3 py-2 rounded-lg min-h-[40px]"
                style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                onclick={() => ongoto("members")}>
          {m.achievements.overviewAllMembers()}
        </button>
      </div>
      {#if overview.recent.length === 0}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.achievements.overviewRecentEmpty()}</p>
      {:else}
        <ul class="space-y-2">
          {#each overview.recent as unlock (`${unlock.userId}-${unlock.key}-${unlock.unlockedAt}`)}
            <li class="flex items-center gap-3 p-3 rounded-xl min-h-[56px]" style="background: {$colorStore.primary}08;">
              {#if unlock.avatarUrl}
                <img src={unlock.avatarUrl} alt="" class="w-9 h-9 rounded-full shrink-0" />
              {:else}
                <span class="w-9 h-9 rounded-full shrink-0" style="background: {$colorStore.primary}20;"></span>
              {/if}
              <div class="flex-1 min-w-0">
                <div class="text-sm truncate" style="color: {$colorStore.text}">
                  {#each unlockParts as part, i (i)}
                    {#if part === USER_TOKEN}
                      <span class="font-semibold">{unlock.username}</span>
                    {:else if part === ACHIEVEMENT_TOKEN}
                      <span class="inline-flex items-center gap-1 align-bottom" style="color: {gradeColor(unlock.grade)}">
                        <AchievementIcon icon={unlock.icon} iconUrl={unlock.iconUrl} color={gradeColor(unlock.grade)} size={14} bare />
                        {unlock.name}
                      </span>
                    {:else}{part}{/if}
                  {/each}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">{timeAgo(unlock.unlockedAt)}</div>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div class="space-y-6">
      {@render rarityList(m.achievements.librarySortPopular(), "fa-fire", overview.mostCommon, m.achievements.overviewRarityEmpty())}
      {@render rarityList(m.achievements.overviewRarest(), "fa-sparkles", overview.rarest, m.achievements.overviewRarityEmpty())}
    </div>
  </div>
</div>
