<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    achievementsApi,
    type AchievementCatalog,
    type AchievementOverview,
    type AchievementRarity
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import { DATA_SOURCES, gradeOf, timeAgo } from "../achievementHelpers";
  import AchievementIcon from "./AchievementIcon.svelte";

  interface Props {
    overview: AchievementOverview;
    catalog: AchievementCatalog;
    onsources: (sources: Record<string, boolean>) => void;
    onopen: (key: string) => void;
    ongoto: (tab: string) => void;
    onerror: (text: string) => void;
  }

  let { overview, catalog, onsources, onopen, ongoto, onerror }: Props = $props();

  let fixingMessages = $state(false);

  const sourceRows = $derived(
    Object.entries(DATA_SOURCES).map(([key, info]) => ({
      key,
      ...info,
      label: sourceLabel(key, info.label),
      off: sourceOff(key, info.off),
      on: overview.dataSources[key] ?? true,
      used: catalog.achievements.some(
        (a) => a.enabled && a.trigger === 0 && catalog.metrics.find((metric) => metric.value === a.metric)?.source === key
      )
    }))
  );

  const stats = $derived([
    { label: m.achievements.overviewStatMembers(), value: overview.members.toLocaleString(), sub: m.achievements.overviewStatMembersSub() },
    { label: m.achievements.overviewStatUnlocks(), value: overview.unlocks.toLocaleString(), sub: m.achievements.overviewStatUnlocksSub({ count: overview.unlocksThisWeek.toLocaleString() }) },
    { label: m.achievements.overviewStatActive(), value: `${overview.earnable} / ${overview.total}`, sub: m.achievements.overviewStatActiveSub() },
    { label: m.achievements.libraryMadeHere(), value: overview.customCount.toLocaleString(), sub: m.achievements.overviewStatCustomSub() }
  ]);

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
  const unlockParts = $derived(
    m.achievements.overviewUnlockLine({ user: USER_TOKEN, achievement: ACHIEVEMENT_TOKEN })
      .split(/(\u0000user|\u0000achievement)/)
      .filter((part) => part !== "")
  );

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

  function gradeColor(grade: number): string {
    return gradeOf(catalog.grades, grade).color;
  }

  const pill = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`);
</script>

{#snippet rarityList(title: string, items: AchievementRarity[])}
  <PluginCard {title} alwaysOpen>
    {#if items.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.achievements.overviewRarityEmpty()}</p>
    {:else}
      <ul class="space-y-2">
        {#each items as item (item.key)}
          <li>
            <button
              type="button"
              class="w-full flex items-center gap-3 p-3 rounded-lg text-left min-h-[44px]"
              style="background: {$colorStore.primary}08;"
              onclick={() => onopen(item.key)}
            >
              <AchievementIcon icon={item.icon} iconUrl={item.iconUrl} color={gradeColor(item.grade)} size={36} />
              <span class="flex-1 min-w-0 truncate text-sm font-medium" style="color: {$colorStore.text}">{item.name}</span>
              <span class="text-xs px-2 py-1 rounded-lg shrink-0" style="background: {$colorStore.primary}10; color: {$colorStore.text}">
                {item.count.toLocaleString()}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </PluginCard>
{/snippet}

<div class="space-y-4 min-w-0">
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
    {#each stats as stat (stat.label)}
      <StatTile label={stat.label} value={stat.value} sub={stat.sub} />
    {/each}
  </div>

  <PluginCard title={m.achievements.overviewSourcesTitle()} alwaysOpen>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      {#each sourceRows as source (source.key)}
        <div class="flex items-center gap-3 p-3 rounded-lg min-h-[56px]" style="background: {$colorStore.primary}08;">
          <i class="fa-solid {source.icon} w-5 text-center" style="color: {$colorStore.muted}" aria-hidden="true"></i>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium" style="color: {$colorStore.text}">{source.label}</div>
            {#if !source.on}
              <div class="text-xs" style="color: {$colorStore.muted}">{source.used ? source.off : m.achievements.overviewSourceUnneeded()}</div>
            {/if}
          </div>
          {#if source.on}
            <span class="text-xs px-2 py-1 rounded-lg" style="background: #10b98120; color: #10b981;">{m.achievements.overviewTracking()}</span>
          {:else if source.key === "messages"}
            <button
              type="button"
              class="text-xs px-3 rounded-lg min-h-[44px] disabled:opacity-50"
              style={pill}
              disabled={fixingMessages}
              onclick={enableMessages}
            >
              {fixingMessages ? m.achievements.overviewStarting() : m.achievements.overviewStartTracking()}
            </button>
          {:else if source.href}
            <a href={source.href} class="text-xs px-3 rounded-lg min-h-[44px] flex items-center" style={pill}>{m.common.open()}</a>
          {:else}
            <span class="text-xs px-2 py-1 rounded-lg" style="background: {$colorStore.accent}20; color: {$colorStore.text};">{m.achievements.overviewNotTracking()}</span>
          {/if}
        </div>
      {/each}
    </div>
  </PluginCard>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
    <div class="lg:col-span-2 min-w-0">
      <PluginCard title={m.achievements.overviewRecentTitle()} alwaysOpen>
        {#snippet actions()}
          <button type="button" class="text-sm px-3 rounded-lg min-h-[44px]" style={pill} onclick={() => ongoto("members")}>
            {m.achievements.overviewAllMembers()}
          </button>
        {/snippet}
        {#if overview.recent.length === 0}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.achievements.overviewRecentEmpty()}</p>
        {:else}
          <ul class="space-y-2">
            {#each overview.recent as unlock (`${unlock.userId}-${unlock.key}-${unlock.unlockedAt}`)}
              <li class="flex items-center gap-3 p-3 rounded-lg min-h-[56px]" style="background: {$colorStore.primary}08;">
                {#if unlock.avatarUrl}
                  <img src={unlock.avatarUrl} alt="" class="w-9 h-9 rounded-full shrink-0" />
                {:else}
                  <span class="w-9 h-9 rounded-full shrink-0" style="background: {$colorStore.primary}20;"></span>
                {/if}
                <div class="flex-1 min-w-0">
                  <div class="text-sm break-words" style="color: {$colorStore.text}">
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
      </PluginCard>
    </div>

    <div class="space-y-4 min-w-0">
      {@render rarityList(m.achievements.librarySortPopular(), overview.mostCommon)}
      {@render rarityList(m.achievements.overviewRarest(), overview.rarest)}
    </div>
  </div>
</div>
