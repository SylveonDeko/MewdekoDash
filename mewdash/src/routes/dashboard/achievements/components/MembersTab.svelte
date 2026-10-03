<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import {
    achievementsApi,
    type AchievementCatalog,
    type AchievementMember,
    type AchievementMemberDetail
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { gradeOf, timeAgo } from "../achievementHelpers";
  import AchievementIcon from "./AchievementIcon.svelte";
  import DuoIcon from "./DuoIcon.svelte";

  /** Tab inputs. */
  interface Props {
    catalog: AchievementCatalog;
    onchanged: () => void;
    onerror: (text: string) => void;
    onsuccess: (text: string) => void;
  }

  let { catalog, onchanged, onerror }: Props = $props();

  const PAGE_SIZE = 25;

  let search = $state("");
  let sort = $state("0");
  let page = $state(0);
  let total = $state(0);
  let members = $state<AchievementMember[]>([]);
  let loading = $state(false);
  let detail = $state<AchievementMemberDetail | null>(null);
  let detailLoading = $state(false);
  let grantKey = $state<string | null>(null);
  let working = $state(false);
  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  const sortOptions = [
    { id: "0", name: "Most points" },
    { id: "1", name: "Most unlocked" },
    { id: "2", name: "Latest unlock" }
  ];

  let pages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));
  let byKey = $derived(new Map(catalog.achievements.map((a) => [a.key, a])));
  let progressByKey = $derived(new Map((detail?.progress ?? []).map((p) => [p.key, p])));
  let grantOptions = $derived(
    catalog.achievements
      .filter((a) => !a.isGlobal && !progressByKey.get(a.key)?.unlockedAt)
      .map((a) => ({ id: a.key, name: a.name }))
  );
  let detailGroups = $derived(
    catalog.categories
      .map((c) => ({
        category: c,
        items: (detail?.progress ?? [])
          .map((p) => ({ progress: p, achievement: byKey.get(p.key) }))
          .filter((x) => x.achievement && x.achievement.categoryKey === c.key)
      }))
      .filter((g) => g.items.length > 0)
  );

  /** Loads the current page. */
  async function load() {
    if (!$currentGuild?.id) return;
    loading = true;
    try {
      const result = await achievementsApi.members($currentGuild.id, search.trim(), page, PAGE_SIZE, Number(sort));
      members = result.members;
      total = result.total;
    } catch (err: any) {
      logger.error("Failed to load achievement members:", err);
      onerror(err?.message || "Couldn't load members.");
    } finally {
      loading = false;
    }
  }

  /** Reloads from the first page after typing stops. */
  function onSearch() {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      page = 0;
      load();
    }, 300);
  }

  /**
   * Opens a member's detail.
   * @param member The member
   */
  async function open(member: AchievementMember) {
    if (!$currentGuild?.id) return;
    detailLoading = true;
    grantKey = null;
    try {
      detail = await achievementsApi.member($currentGuild.id, member.userId);
    } catch (err: any) {
      logger.error("Failed to load a member's achievements:", err);
      onerror(err?.message || "Couldn't load that member.");
    } finally {
      detailLoading = false;
    }
  }

  /** Hands the picked achievement to the open member. */
  async function grant() {
    if (!$currentGuild?.id || !detail || !grantKey || working) return;
    working = true;
    try {
      detail = await achievementsApi.grant($currentGuild.id, detail.member.userId, grantKey);
      grantKey = null;
      onchanged();
      load();
    } catch (err: any) {
      logger.error("Failed to grant an achievement:", err);
      onerror(err?.message || "Couldn't give that achievement.");
    } finally {
      working = false;
    }
  }

  /**
   * Takes an achievement from the open member after asking.
   * @param key The achievement key
   */
  async function revoke(key: string) {
    if (!$currentGuild?.id || !detail || working) return;
    const name = byKey.get(key)?.name ?? key;
    const ok = await requestConfirmation({
      title: `Take away ${name}?`,
      message: "They lose its points. If it unlocks from activity they still qualify for, it comes back quietly later.",
      confirmText: "Take away",
      variant: "danger"
    });
    if (!ok) return;
    working = true;
    try {
      detail = await achievementsApi.revoke($currentGuild.id, detail.member.userId, key);
      onchanged();
      load();
    } catch (err: any) {
      logger.error("Failed to revoke an achievement:", err);
      onerror(err?.message || "Couldn't take that achievement away.");
    } finally {
      working = false;
    }
  }

  /** Clears every achievement the open member has, after asking. */
  async function resetMember() {
    if (!$currentGuild?.id || !detail || working) return;
    const ok = await requestConfirmation({
      title: `Reset ${detail.member.displayName}?`,
      message: "Every achievement they have here is cleared. Their tracked activity stays, so anything they still qualify for comes back quietly.",
      confirmText: "Reset member",
      variant: "danger"
    });
    if (!ok) return;
    working = true;
    try {
      await achievementsApi.resetMember($currentGuild.id, detail.member.userId);
      detail = await achievementsApi.member($currentGuild.id, detail.member.userId);
      onchanged();
      load();
    } catch (err: any) {
      logger.error("Failed to reset a member:", err);
      onerror(err?.message || "Couldn't reset that member.");
    } finally {
      working = false;
    }
  }

  /**
   * Color for a rank grade.
   * @param tierGrade The rank's grade, or null
   */
  function tierColor(tierGrade: number | null | undefined): string {
    return tierGrade === null || tierGrade === undefined ? $colorStore.muted : gradeOf(catalog.grades, tierGrade).color;
  }

  onMount(() => {
    load();
  });
</script>

<div class="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start" in:fade={{ duration: 200 }}>
  <div class="xl:col-span-2 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="relative flex-1">
        <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none" aria-hidden="true">
          <DuoIcon icon="fa-magnifying-glass" color={$colorStore.muted} />
        </span>
        <input type="search" bind:value={search} oninput={onSearch} placeholder="Find a member"
               aria-label="Find a member"
               class="w-full pl-10 pr-3 h-[44px] rounded-xl border text-sm"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
      </div>
      <div class="sm:w-48">
        <DiscordSelector type="custom" options={sortOptions} selected={sort} searchable={false} ariaLabel="Sort members"
                         onchange={(d) => { if (typeof d.selected === "string") { sort = d.selected; page = 0; load(); } }} />
      </div>
    </div>

    <div class="rounded-2xl border overflow-hidden"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                border-color: {$colorStore.primary}30;">
      {#if loading && members.length === 0}
        <div class="p-10 text-center" style="color: {$colorStore.muted}"><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i></div>
      {:else if members.length === 0}
        <div class="p-10 text-center text-sm" style="color: {$colorStore.muted}">
          {search ? "No members match." : "Nobody has unlocked anything yet."}
        </div>
      {:else}
        <ul>
          {#each members as m (m.userId.toString())}
            {@const active = detail?.member.userId.toString() === m.userId.toString()}
            <li>
              <button type="button"
                      class="w-full flex items-center gap-3 p-3 text-left min-h-[60px] border-b transition-all"
                      style="border-color: {$colorStore.primary}15; background: {active ? $colorStore.primary + '20' : 'transparent'};"
                      onclick={() => open(m)}>
                <span class="w-8 text-center text-sm font-bold shrink-0" style="color: {$colorStore.muted}">{m.rank > 0 ? `#${m.rank}` : ""}</span>
                {#if m.avatarUrl}
                  <img src={m.avatarUrl} alt="" class="w-9 h-9 rounded-full shrink-0" />
                {:else}
                  <span class="w-9 h-9 rounded-full shrink-0" style="background: {$colorStore.primary}20;"></span>
                {/if}
                <span class="flex-1 min-w-0">
                  <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">
                    {m.displayName}{#if !m.inServer}<span class="font-normal" style="color: {$colorStore.muted}"> (left)</span>{/if}
                  </span>
                  <span class="block text-xs truncate" style="color: {$colorStore.muted}">@{m.username}</span>
                  <span class="block text-xs" style="color: {$colorStore.muted}">{m.unlocked} unlocked · {timeAgo(m.lastUnlockAt)}</span>
                </span>
                <span class="text-right shrink-0">
                  <span class="block text-sm font-bold" style="color: {$colorStore.primary}">{m.points.toLocaleString()}</span>
                  <span class="text-xs px-2 py-0.5 rounded-md" style="background: {tierColor(m.tierGrade)}20; color: {tierColor(m.tierGrade)}">{m.tier}</span>
                </span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    {#if pages > 1}
      <div class="flex items-center justify-between gap-3">
        <button type="button" class="px-4 py-2 rounded-xl min-h-[44px] disabled:opacity-40"
                style="background: {$colorStore.primary}08; color: {$colorStore.text};"
                disabled={page === 0 || loading} onclick={() => { page -= 1; load(); }}>Previous</button>
        <span class="text-sm" style="color: {$colorStore.muted}">Page {page + 1} of {pages}</span>
        <button type="button" class="px-4 py-2 rounded-xl min-h-[44px] disabled:opacity-40"
                style="background: {$colorStore.primary}08; color: {$colorStore.text};"
                disabled={page >= pages - 1 || loading} onclick={() => { page += 1; load(); }}>Next</button>
      </div>
    {/if}
  </div>

  <div class="xl:col-span-3">
    {#if detailLoading}
      <div class="p-10 text-center" style="color: {$colorStore.muted}"><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i></div>
    {:else if !detail}
      <div class="rounded-2xl border p-10 text-center"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <DuoIcon icon="fa-user" size={36} />
        <p class="text-sm mt-4" style="color: {$colorStore.muted}">Pick a member to see their progress, give achievements, or take them away.</p>
      </div>
    {:else}
      <div class="relative rounded-2xl border p-5 md:p-6 shadow-2xl space-y-5" style="z-index: 10;
           background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
           border-color: {$colorStore.primary}30;"
           in:fly={{ x: 20, duration: 200 }}>
        <div class="flex items-center gap-4">
          {#if detail.member.avatarUrl}
            <img src={detail.member.avatarUrl} alt="" class="w-14 h-14 rounded-full" style="box-shadow: 0 0 0 3px {tierColor(detail.member.tierGrade)};" />
          {/if}
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-bold truncate" style="color: {$colorStore.text}">{detail.member.displayName}</h3>
            <p class="text-sm truncate" style="color: {$colorStore.muted}">
              @{detail.member.username}{#if detail.member.globalName && detail.member.globalName !== detail.member.displayName} · {detail.member.globalName}{/if}
              · {detail.member.userId.toString()}
            </p>
            <div class="flex flex-wrap items-center gap-2 text-sm mt-1">
              <span class="px-2 py-0.5 rounded-md text-xs font-medium" style="background: {tierColor(detail.member.tierGrade)}20; color: {tierColor(detail.member.tierGrade)}">{detail.member.tier}</span>
              <span style="color: {$colorStore.primary}">{detail.member.points.toLocaleString()} points</span>
              <span style="color: {$colorStore.muted}">{detail.member.unlocked} of {detail.total} · {detail.member.rank > 0 ? `#${detail.member.rank}` : "unranked"}</span>
            </div>
          </div>
          <button type="button" class="w-11 h-11 rounded-xl shrink-0" aria-label="Close"
                  style="background: {$colorStore.primary}08; color: {$colorStore.text};"
                  onclick={() => { detail = null; }}>
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        {#if detail.badges.length > 0}
          <div class="flex flex-wrap gap-2">
            {#each detail.badges.slice(0, 12) as badge (badge.key)}
              {@const color = gradeOf(catalog.grades, badge.grade).color}
              <span class="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md" style="background: {color}20; color: {color}; border: 1px solid {color}30;"
                    title={badge.source}>
                <AchievementIcon icon={badge.icon} iconUrl={badge.iconUrl} {color} size={13} bare />{badge.name}
                {#if detail.equipped.includes(badge.key)}<DuoIcon icon="fa-star" {color} />{/if}
              </span>
            {/each}
          </div>
        {/if}

        {#if detail.member.inServer}
          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="flex-1 min-w-0">
              <DiscordSelector type="custom" options={grantOptions} selected={grantKey} placeholder="Give an achievement"
                               ariaLabel="Achievement to give"
                               onchange={(d) => { grantKey = typeof d.selected === "string" ? d.selected : null; }} />
            </div>
            <button type="button" class="px-5 h-[44px] rounded-xl font-medium disabled:opacity-50"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                    disabled={!grantKey || working} onclick={grant}>Give</button>
          </div>
        {/if}

        <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {#each detailGroups as group (group.category.key)}
            {@const done = group.items.filter((x) => x.progress.unlockedAt).length}
            <div>
              <div class="flex items-center gap-2 mb-2">
                <AchievementIcon icon={group.category.icon} iconUrl={group.category.iconUrl} color={$colorStore.primary}
                                 size={15} bare />
                <span class="text-sm font-semibold" style="color: {$colorStore.text}">{group.category.name}</span>
                <span class="text-xs" style="color: {$colorStore.muted}">{done} of {group.items.length}</span>
                <span class="flex-1 h-1.5 rounded-full overflow-hidden" style="background: {$colorStore.primary}15;">
                  <span class="block h-full rounded-full" style="width: {(done / group.items.length) * 100}%; background: {$colorStore.primary};"></span>
                </span>
              </div>
              <ul class="space-y-1">
                {#each group.items as item (item.progress.key)}
                  {@const a = item.achievement!}
                  {@const grade = gradeOf(catalog.grades, a.grade)}
                  {@const unlocked = !!item.progress.unlockedAt}
                  {@const fraction = a.threshold > 0 && item.progress.current != null ? Math.min(1, item.progress.current / a.threshold) : 0}
                  <li class="flex items-center gap-3 p-2 rounded-lg min-h-[44px]" style="background: {$colorStore.primary}08;" class:opacity-60={!unlocked}>
                    <AchievementIcon icon={a.icon} iconUrl={a.iconUrl} color={grade.color} size={32} />
                    <span class="flex-1 min-w-0">
                      <span class="block text-sm truncate" style="color: {$colorStore.text}">{a.name}</span>
                      {#if unlocked}
                        <span class="block text-xs" style="color: {$colorStore.muted}">Unlocked {timeAgo(item.progress.unlockedAt)}</span>
                      {:else if item.progress.current != null && a.threshold > 0}
                        <span class="flex items-center gap-2 text-xs" style="color: {$colorStore.muted}">
                          <span class="flex-1 h-1 rounded-full overflow-hidden" style="background: {$colorStore.primary}15;">
                            <span class="block h-full" style="width: {fraction * 100}%; background: {grade.color};"></span>
                          </span>
                          {Math.min(item.progress.current, a.threshold).toLocaleString()} / {a.threshold.toLocaleString()}
                        </span>
                      {/if}
                    </span>
                    {#if unlocked}
                      <button type="button" class="w-9 h-9 rounded-lg shrink-0 disabled:opacity-50" aria-label="Take away {a.name}"
                              style="background: #ef444415; color: #ef4444;"
                              disabled={working} onclick={() => revoke(a.key)}>
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                      </button>
                    {/if}
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>

        <button type="button" class="w-full sm:w-auto px-4 py-2.5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
                style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                disabled={working || detail.member.unlocked === 0} onclick={resetMember}>
          <i class="fa-solid fa-rotate-left mr-2" aria-hidden="true"></i>Reset member
        </button>
      </div>
    {/if}
  </div>
</div>
