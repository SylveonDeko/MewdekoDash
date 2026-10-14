<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { achievementsApi, type AchievementMe, type AchievementUserSettings } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import AchievementIcon from "../dashboard/achievements/components/AchievementIcon.svelte";

  /** Card inputs. */
  interface Props {
    guildId: bigint | string;
    userId: bigint;
    onerror: (text: string) => void;
  }

  let { guildId, userId, onerror }: Props = $props();

  let data = $state<AchievementMe | null>(null);
  let loading = $state(true);
  let savingSlots = $state(false);
  let savingSettings = $state(false);
  let openCategory = $state<string | null>(null);

  const dmOptions = $derived([
    { id: "0", name: m.common.serverDefault() },
    { id: "1", name: m.me.achDmAlways() },
    { id: "2", name: m.common.never() }
  ]);

  let progressByKey = $derived(new Map((data?.progress ?? []).map((p) => [p.key, p])));
  let badgeOptions = $derived([
    { id: "", name: m.common.empty() },
    ...(data?.badges ?? []).map((b) => ({ id: b.key, name: b.name }))
  ]);
  let tierFraction = $derived.by(() => {
    if (!data || !data.nextTierPoints) return 1;
    const span = data.nextTierPoints - data.tierPoints;
    return span <= 0 ? 1 : Math.min(1, Math.max(0, (data.member.points - data.tierPoints) / span));
  });

  /**
   * The color of a grade.
   * @param grade 0 to 5
   */
  function gradeColor(grade: number | null | undefined): string {
    if (grade === null || grade === undefined) return $colorStore.muted;
    return data?.grades.find((g) => g.value === grade)?.color ?? $colorStore.primary;
  }

  /** Loads the member's achievements. */
  async function load() {
    loading = true;
    try {
      data = await achievementsApi.me(guildId, userId);
    } catch (err) {
      logger.error("Failed to load my achievements:", err);
      data = null;
    } finally {
      loading = false;
    }
  }

  /**
   * Puts a badge in a slot.
   * @param slot 0 to 3
   * @param key The badge key, or "" for empty
   */
  async function setSlot(slot: number, key: string) {
    if (!data || savingSlots) return;
    const slots = [...data.equipped];
    while (slots.length < 4) slots.push(null);
    for (let i = 0; i < slots.length; i++) if (key && slots[i] === key) slots[i] = null;
    slots[slot] = key || null;
    savingSlots = true;
    try {
      const result = await achievementsApi.setMyBadges(guildId, userId, slots);
      data = { ...data, equipped: result.equipped };
    } catch (err: any) {
      logger.error("Failed to save badges:", err);
      onerror(err?.message || m.me.achSaveBadgesFailed());
    } finally {
      savingSlots = false;
    }
  }

  /**
   * Saves one preference.
   * @param change The changed preference
   */
  async function setPreference(change: Partial<AchievementUserSettings>) {
    if (!data || savingSettings) return;
    savingSettings = true;
    try {
      const settings = await achievementsApi.updateMySettings(guildId, userId, change);
      data = { ...data, settings };
    } catch (err: any) {
      logger.error("Failed to save achievement preferences:", err);
      onerror(err?.message || m.common.saveFailedInline());
    } finally {
      savingSettings = false;
    }
  }

  onMount(() => {
    load();
  });
</script>

<div class="rounded-2xl p-6 border"
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20);
            border-color: {$colorStore.primary}30; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"
     in:fly={{ y: 20, duration: 300 }}>
  <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
    <i class="fa-utility-duo fa-regular fa-crown text-xl"
       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
    {m.features.achievementsName()}
  </h3>

  {#if loading}
    <div class="py-8 text-center" style="color: {$colorStore.muted}"><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i></div>
  {:else if !data}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.me.couldnTLoadYourAchievements()}</p>
  {:else}
    {#if !data.enabled}
      <p class="text-sm mb-4 p-3 rounded-lg" style="background: {$colorStore.accent}15; color: {$colorStore.text}">
        {m.me.earningIsPausedInThisServer()}
      </p>
    {/if}

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div class="p-3 rounded-xl text-center" style="background: {gradeColor(data.member.tierGrade)}15; border: 1px solid {gradeColor(data.member.tierGrade)}30;">
        <div class="text-lg font-bold" style="color: {gradeColor(data.member.tierGrade)}">{data.member.tier}</div>
        <div class="text-xs" style="color: {$colorStore.muted}">{m.common.rank()}</div>
      </div>
      <div class="p-3 rounded-xl text-center" style="background: {$colorStore.primary}08;">
        <div class="text-lg font-bold" style="color: {$colorStore.primary}">{data.member.points.toLocaleString()}</div>
        <div class="text-xs" style="color: {$colorStore.muted}">{data.member.rank > 0 ? m.me.achPointsRanked({ rank: data.member.rank }) : m.common.points()}</div>
      </div>
      <div class="p-3 rounded-xl text-center" style="background: {$colorStore.primary}08;">
        <div class="text-lg font-bold" style="color: {$colorStore.primary}">{data.member.unlocked} / {data.total}</div>
        <div class="text-xs" style="color: {$colorStore.muted}">{m.common.unlocked()}</div>
      </div>
      <div class="p-3 rounded-xl text-center" style="background: {$colorStore.primary}08;">
        <div class="text-lg font-bold" style="color: {$colorStore.primary}">{data.globalPoints.toLocaleString()}</div>
        <div class="text-xs" style="color: {$colorStore.muted}">{m.me.achGlobalPoints({ servers: data.globalServers })}</div>
      </div>
    </div>

    <div class="mb-6">
      <div class="flex justify-between text-xs mb-1" style="color: {$colorStore.muted}">
        <span>{data.member.tier}</span>
        <span>{data.nextTier ? m.me.achPointsToTier({ points: (data.nextTierPoints! - data.member.points).toLocaleString(), tier: data.nextTier }) : m.common.topRank()}</span>
      </div>
      <div class="h-2 rounded-full overflow-hidden" style="background: {$colorStore.primary}15;">
        <div class="h-full rounded-full" style="width: {tierFraction * 100}%; background: {gradeColor(data.member.tierGrade)};"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-2">
        <h4 class="text-sm font-semibold" style="color: {$colorStore.text}">{m.common.progress()}</h4>
        {#each data.categories as category (category.key)}
          {@const items = data.achievements.filter((a) => a.categoryKey === category.key)}
          {@const done = items.filter((a) => progressByKey.get(a.key)?.unlockedAt).length}
          <div class="rounded-xl" style="background: {$colorStore.primary}08;">
            <button type="button" class="w-full flex items-center gap-3 p-3 min-h-[48px] text-left"
                    aria-expanded={openCategory === category.key}
                    onclick={() => { openCategory = openCategory === category.key ? null : category.key; }}>
              <span class="w-5 flex justify-center">
                <AchievementIcon icon={category.icon} iconUrl={category.iconUrl} color={$colorStore.primary} size={16} bare />
              </span>
              <span class="flex-1 text-sm font-medium" style="color: {$colorStore.text}">{category.name}</span>
              <span class="text-xs" style="color: {$colorStore.muted}">{done} / {items.length}</span>
              <span class="w-20 h-1.5 rounded-full overflow-hidden" style="background: {$colorStore.primary}15;">
                <span class="block h-full" style="width: {items.length ? (done / items.length) * 100 : 0}%; background: {$colorStore.primary};"></span>
              </span>
            </button>
            {#if openCategory === category.key}
              <ul class="px-3 pb-3 space-y-1" transition:slide={{ duration: 150 }}>
                {#each items as a (a.key)}
                  {@const p = progressByKey.get(a.key)}
                  {@const unlocked = !!p?.unlockedAt}
                  <li class="flex items-center gap-3 p-2 rounded-lg" class:opacity-60={!unlocked} style="background: {$colorStore.primary}06;">
                    <AchievementIcon icon={a.icon} iconUrl={a.iconUrl} color={gradeColor(a.grade)} size={28} />
                    <span class="flex-1 min-w-0">
                      <span class="block text-sm truncate" style="color: {$colorStore.text}">{a.name}</span>
                      <span class="block text-xs truncate" style="color: {$colorStore.muted}">
                        {#if unlocked}{m.common.unlocked()}{:else if p?.current != null && a.threshold > 0}{Math.min(p.current, a.threshold).toLocaleString()} / {a.threshold.toLocaleString()}{:else}{a.description}{/if}
                      </span>
                    </span>
                    <span class="text-xs shrink-0" style="color: {gradeColor(a.grade)}">+{a.points}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {/each}
      </div>

      <div class="space-y-5">
        <div>
          <h4 class="text-sm font-semibold mb-2" style="color: {$colorStore.text}">{m.me.profileBadges()}</h4>
          {#if data.badges.length === 0}
            <p class="text-sm" style="color: {$colorStore.muted}">{m.me.unlockAchievementsToEarnBadgesFor()}</p>
          {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {#each [0, 1, 2, 3] as slot (slot)}
                <div class="min-h-[44px]">
                  <DiscordSelector type="custom" options={badgeOptions} selected={data.equipped[slot] ?? ""}
                                   placeholder={m.me.achSlot({ number: slot + 1 })} ariaLabel={m.me.achBadgeSlotAria({ number: slot + 1 })} disabled={savingSlots}
                                   onchange={(d) => setSlot(slot, typeof d.selected === "string" ? d.selected : "")} />
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2" style="color: {$colorStore.text}">{m.common.privacy()}</h4>
          <p class="text-xs mb-2" style="color: {$colorStore.muted}">{m.me.theseApplyInEveryServer()}</p>
          <div class="space-y-2">
            <ToggleRow checked={data.settings.profileVisibility === 0} title={m.me.othersCanSeeMyProfileCard()}
                       colors={$colorStore} disabled={savingSettings}
                       onchange={(v) => setPreference({ profileVisibility: v ? 0 : 1 })} />
            <ToggleRow checked={data.settings.achievementsVisibility === 0} title={m.me.othersCanSeeMyAchievements()}
                       colors={$colorStore} disabled={savingSettings}
                       onchange={(v) => setPreference({ achievementsVisibility: v ? 0 : 1 })} />
            <ToggleRow checked={data.settings.badgesVisibility === 0} title={m.me.othersCanSeeMyBadges()}
                       colors={$colorStore} disabled={savingSettings}
                       onchange={(v) => setPreference({ badgesVisibility: v ? 0 : 1 })} />
            <ToggleRow checked={!data.settings.hideFromLeaderboards} title={m.me.showMeOnLeaderboards()}
                       colors={$colorStore} disabled={savingSettings}
                       onchange={(v) => setPreference({ hideFromLeaderboards: !v })} />
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-2" style="color: {$colorStore.text}">{m.me.notifications()}</h4>
          <div class="space-y-2">
            <div class="flex items-center gap-3 p-3 rounded-lg" style="background: {$colorStore.primary}08;">
              <span id="ach-dm-label" class="flex-1 text-sm" style="color: {$colorStore.text}">{m.me.unlocksInMyDms()}</span>
              <div class="w-44">
                <DiscordSelector type="custom" options={dmOptions} selected={data.settings.dmUnlocks.toString()}
                                 searchable={false} ariaLabelledby="ach-dm-label" disabled={savingSettings}
                                 onchange={(d) => { if (typeof d.selected === "string") setPreference({ dmUnlocks: Number(d.selected) }); }} />
              </div>
            </div>
            <ToggleRow checked={data.settings.showInLog} title={m.me.announceMyUnlocksInServers()}
                       colors={$colorStore} disabled={savingSettings}
                       onchange={(v) => setPreference({ showInLog: v })} />
            <ToggleRow checked={data.settings.mentionMe} title={m.me.mentionMeInUnlockMessages()}
                       colors={$colorStore} disabled={savingSettings}
                       onchange={(v) => setPreference({ mentionMe: v })} />
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
