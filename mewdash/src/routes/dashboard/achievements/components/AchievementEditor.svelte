<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import {
    achievementsApi,
    AchievementTrigger,
    type Achievement,
    type AchievementCatalog,
    type AchievementLookups
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { m } from "$lib/i18n";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import {
    criteriaText,
    CUSTOM_CATEGORY,
    CUSTOM_TRIGGERS,
    draftIconSrc,
    GRADE_ICON,
    gradeOf,
    metricOf,
    RESERVED_CATEGORIES
  } from "../achievementHelpers";
  import AchievementIcon from "./AchievementIcon.svelte";
  import DuoIcon from "./DuoIcon.svelte";
  import IconPicker from "./IconPicker.svelte";

  /** Editor inputs. A null achievement makes a new server achievement. */
  interface Props {
    achievement: Achievement | null;
    catalog: AchievementCatalog;
    lookups: AchievementLookups | null;
    defaultCategory?: string;
    onsaved: (achievement: Achievement, created: boolean) => void;
    onremoved: (key: string) => void;
    onclose: () => void;
    onerror: (text: string) => void;
    /** Called after an icon upload or delete so the page can refresh its catalog. */
    onuploadschanged?: () => void;
  }

  let {
    achievement,
    catalog,
    lookups,
    defaultCategory,
    onsaved,
    onremoved,
    onclose,
    onerror,
    onuploadschanged
  }: Props = $props();

  const isNew = untrack(() => achievement === null);
  const isBuiltIn = untrack(() => achievement !== null && !achievement.isCustom);
  const isGlobal = untrack(() => achievement?.isGlobal ?? false);

  let saving = $state(false);
  let deleting = $state(false);

  let draft = $state(untrack(() => initialDraft()));
  const initialJson = untrack(() => JSON.stringify(draft));
  let dirty = $derived(JSON.stringify(draft) !== initialJson);

  /** The editable fields, seeded from the achievement. */
  function initialDraft() {
    const a = achievement;
    const startCategory = defaultCategory && !RESERVED_CATEGORIES.includes(defaultCategory) &&
      catalog.categories.some((c) => c.key === defaultCategory)
      ? defaultCategory
      : CUSTOM_CATEGORY;
    return {
      enabled: a?.selfEnabled ?? true,
      name: a ? (a.isCustom ? a.name : a.rawName ?? "") : "",
      description: a?.rawDescription ?? "",
      icon: a?.rawIcon ?? null as string | null,
      points: a?.rawPoints ?? null as number | null,
      hidden: a?.hidden ?? false,
      categoryKey: a?.categoryKey ?? startCategory,
      grade: a?.grade ?? 0,
      trigger: a?.trigger ?? AchievementTrigger.Metric,
      metric: a?.metric || (catalog.metrics.find((metric) => metric.allowCustom)?.value ?? 1),
      threshold: a?.threshold || 100,
      keyword: a?.keyword ?? "",
      channelId: a?.channelId ? a.channelId.toString() : null as string | null,
      roleRewardId: a?.roleRewardId ? a.roleRewardId.toString() : null as string | null,
      currencyReward: a?.currencyReward ?? 0,
      xpReward: a?.xpReward ?? 0
    };
  }

  let grade = $derived(gradeOf(catalog.grades, draft.grade));
  let defaultPoints = $derived(isBuiltIn ? achievement?.defaultPoints ?? grade.points : grade.points);
  let shownPoints = $derived(draft.points ?? defaultPoints);
  let previewName = $derived(draft.name.trim() || (isBuiltIn ? achievement?.defaultName ?? "" : m.achievements.editorNewTitle()));
  let draftCategory = $derived(catalog.categories.find((c) => c.key === draft.categoryKey) ?? null);
  let headerIcon = $derived(draft.icon ?? draftCategory?.icon ?? achievement?.icon ?? null);
  let headerIconUrl = $derived(
    draft.icon ? draftIconSrc(draft.icon, catalog.uploads) : draftCategory?.iconUrl ?? null
  );

  let previewImage = $state<string | null>(null);
  let previewLoading = $state(false);
  let previewTimer: ReturnType<typeof setTimeout> | null = null;
  let previewRequest = 0;

  $effect(() => {
    const request = {
      key: achievement?.key ?? null,
      categoryKey: draft.categoryKey,
      name: previewName,
      description: previewDescription,
      icon: draft.icon,
      grade: isBuiltIn ? achievement?.grade ?? 0 : draft.grade,
      points: shownPoints
    };
    if (isGlobal || !$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(async () => {
      const token = ++previewRequest;
      previewLoading = true;
      try {
        const result = await achievementsApi.previewImage(guildId, request);
        if (token === previewRequest) previewImage = result.image;
      } catch (err) {
        logger.error("Failed to draw the achievement preview:", err);
      } finally {
        if (token === previewRequest) previewLoading = false;
      }
    }, 450);
    return () => {
      if (previewTimer) clearTimeout(previewTimer);
    };
  });
  let previewDescription = $derived(draft.description.trim() || autoDescription());

  let categoryOptions = $derived(
    catalog.categories
      .filter((c) => !RESERVED_CATEGORIES.includes(c.key))
      .map((c) => ({ id: c.key, name: c.name }))
  );
  let metricOptions = $derived(
    catalog.metrics
      .filter((metric) => metric.allowCustom)
      .map((metric) => ({ id: metric.value.toString(), name: metric.label, displayName: `${metric.label}: ${metric.description}` }))
  );
  let roleOptions = $derived(
    (lookups?.roles ?? []).map((r) => ({
      id: r.id.toString(),
      name: r.assignable ? r.name : m.achievements.editorRoleUnassignable({ name: r.name }),
      color: r.color
    }))
  );
  let channelOptions = $derived(
    (lookups?.channels ?? []).filter((c) => c.type === 0).map((c) => ({ id: c.id.toString(), name: c.name, type: 0 }))
  );
  let guildEmojis = $derived(
    lookups && $currentGuild
      ? [{
        guild: { id: $currentGuild.id.toString(), name: $currentGuild.name },
        emojis: lookups.emojis.map((e) => ({
          id: e.id.toString(),
          name: e.name,
          animated: e.formatted.startsWith("<a:"),
          isAvailable: true,
          roleIds: [],
          requireColons: true,
          url: e.url
        }))
      }]
      : []
  );
  let rewardRoleProblem = $derived(
    draft.roleRewardId && lookups
      ? !(lookups.roles.find((r) => r.id.toString() === draft.roleRewardId)?.assignable ?? false)
      : false
  );
  let selectedMetric = $derived(metricOf(catalog, draft.metric));
  let triggerChoices = $derived(CUSTOM_TRIGGERS.map((choice) => {
    switch (choice.value) {
      case AchievementTrigger.Metric:
        return { ...choice, title: m.achievements.editorTriggerMetricTitle(), text: m.achievements.editorTriggerMetricText() };
      case AchievementTrigger.Keyword:
        return { ...choice, title: m.achievements.editorAutoSayAPhrase(), text: m.achievements.editorTriggerKeywordText() };
      case AchievementTrigger.Reaction:
        return { ...choice, title: m.achievements.editorAutoReactEmoji(), text: m.achievements.editorTriggerReactionText() };
      default:
        return { ...choice, title: m.achievements.editorTriggerManualTitle(), text: m.achievements.editorTriggerManualText() };
    }
  }));


  /** The description the bot writes when none is given. */
  function autoDescription(): string {
    if (isBuiltIn) return achievement?.defaultDescription ?? "";
    switch (draft.trigger) {
      case AchievementTrigger.Keyword:
        return draft.keyword.trim() ? m.achievements.editorAutoSayPhrase({ phrase: draft.keyword.trim() }) : m.achievements.editorAutoSayAPhrase();
      case AchievementTrigger.Reaction:
        return draft.keyword.trim() ? m.achievements.editorAutoReactWith({ emoji: draft.keyword.trim() }) : m.achievements.editorAutoReactEmoji();
      case AchievementTrigger.Manual:
        return m.achievements.editorAutoManual();
      default: {
        const metric = selectedMetric;
        if (!metric) return "";
        const unit = draft.threshold === 1 ? metric.unit : metric.unitPlural;
        return m.achievements.editorAutoReach({ count: Number(draft.threshold || 0).toLocaleString(), unit, metric: metric.label.toLowerCase() });
      }
    }
  }

  /** Why the form can't be saved yet, or null. */
  let blocker = $derived.by(() => {
    if (!isBuiltIn && !draft.name.trim()) return m.achievements.editorBlockerName();
    if (draft.name.length > catalog.limits.nameLength) return m.achievements.editorBlockerNameLength({ max: catalog.limits.nameLength });
    if (draft.description.length > catalog.limits.descriptionLength) return m.achievements.editorBlockerDescriptionLength();
    if (!isBuiltIn && draft.trigger === AchievementTrigger.Metric && (!draft.threshold || draft.threshold < 1)) return m.achievements.editorBlockerGoal();
    if (!isBuiltIn && (draft.trigger === AchievementTrigger.Keyword || draft.trigger === AchievementTrigger.Reaction) && !draft.keyword.trim()) {
      return draft.trigger === AchievementTrigger.Keyword ? m.achievements.editorBlockerPhrase() : m.achievements.editorBlockerEmoji();
    }
    if (draft.points !== null && (draft.points < 0 || draft.points > catalog.limits.maxPoints)) return m.achievements.editorBlockerPoints({ max: catalog.limits.maxPoints });
    if (draft.currencyReward < 0 || draft.xpReward < 0) return m.achievements.editorBlockerNegative();
    if (rewardRoleProblem) return m.achievements.editorBlockerRole();
    return null;
  });

  /** Saves the achievement. */
  async function save() {
    if (!$currentGuild?.id || saving || blocker || isGlobal) return;
    saving = true;
    try {
      const guildId = $currentGuild.id;
      let saved: Achievement;
      if (isBuiltIn && achievement) {
        saved = await achievementsApi.saveBuiltIn(guildId, achievement.key, {
          enabled: draft.enabled,
          name: draft.name.trim() || null,
          description: draft.description.trim() || null,
          icon: draft.icon,
          points: draft.points !== null && draft.points !== achievement.defaultPoints ? draft.points : null,
          hidden: draft.hidden !== achievement.defaultHidden ? draft.hidden : null,
          roleRewardId: draft.roleRewardId,
          currencyReward: Number(draft.currencyReward) || 0,
          xpReward: Number(draft.xpReward) || 0
        });
      } else {
        const request = {
          categoryKey: draft.categoryKey,
          name: draft.name.trim(),
          description: draft.description.trim() || null,
          icon: draft.icon,
          grade: draft.grade,
          points: draft.points,
          hidden: draft.hidden,
          enabled: draft.enabled,
          trigger: draft.trigger,
          metric: draft.trigger === AchievementTrigger.Metric ? draft.metric : 0,
          threshold: draft.trigger === AchievementTrigger.Metric ? Number(draft.threshold) || 0 : 0,
          keyword: draft.trigger === AchievementTrigger.Keyword || draft.trigger === AchievementTrigger.Reaction ? draft.keyword.trim() : null,
          channelId: draft.trigger === AchievementTrigger.Keyword || draft.trigger === AchievementTrigger.Reaction ? draft.channelId : null,
          roleRewardId: draft.roleRewardId,
          currencyReward: Number(draft.currencyReward) || 0,
          xpReward: Number(draft.xpReward) || 0
        };
        saved = achievement?.customId
          ? await achievementsApi.updateCustom(guildId, achievement.customId, request)
          : await achievementsApi.createCustom(guildId, request);
      }
      onsaved(saved, isNew);
    } catch (err: any) {
      logger.error("Failed to save an achievement:", err);
      onerror(err?.message || m.achievements.editorErrorSave());
    } finally {
      saving = false;
    }
  }

  /** Puts a built in achievement back to its default, after asking. */
  async function resetToDefault() {
    if (!$currentGuild?.id || !achievement || !isBuiltIn) return;
    const ok = await requestConfirmation({
      title: m.achievements.editorResetTitle(),
      message: m.achievements.editorResetMessage(),
      confirmText: m.common.reset(),
      variant: "danger"
    });
    if (!ok) return;
    saving = true;
    try {
      onsaved(await achievementsApi.resetBuiltIn($currentGuild.id, achievement.key), false);
    } catch (err: any) {
      logger.error("Failed to reset an achievement:", err);
      onerror(err?.message || m.achievements.editorErrorReset());
    } finally {
      saving = false;
    }
  }

  /** Deletes a server achievement, after asking. */
  async function remove() {
    if (!$currentGuild?.id || !achievement?.customId) return;
    const ok = await requestConfirmation({
      title: m.achievements.editorDeleteTitle({ name: achievement.name }),
      message: achievement.unlockCount === 0
        ? m.achievements.editorDeleteMessageNone()
        : achievement.unlockCount === 1
          ? m.achievements.editorDeleteMessageOne({ count: "1" })
          : m.achievements.editorDeleteMessageOther({ count: achievement.unlockCount.toLocaleString() }),
      confirmText: m.common.delete(),
      variant: "danger"
    });
    if (!ok) return;
    deleting = true;
    try {
      await achievementsApi.deleteCustom($currentGuild.id, achievement.customId);
      onremoved(achievement.key);
    } catch (err: any) {
      logger.error("Failed to delete an achievement:", err);
      onerror(err?.message || m.achievements.editorErrorDelete());
    } finally {
      deleting = false;
    }
  }

  /** Closes, asking first when there are unsaved changes. */
  async function close() {
    if (dirty) {
      const ok = await requestConfirmation({
        title: m.common.discardChanges(),
        message: m.achievements.editorDiscardMessage(),
        confirmText: m.common.discard(),
        variant: "danger"
      });
      if (!ok) return;
    }
    onclose();
  }

  /**
   * Reads a number input, treating blank as null.
   * @param value The input value
   */
  function optionalNumber(value: string): number | null {
    if (value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
  }

  onMount(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
</script>

{#snippet field(label: string, id: string, hint: string | null)}
  <label for={id} class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{label}</label>
  {#if hint}<p class="text-xs -mt-1 mb-2" style="color: {$colorStore.muted}">{hint}</p>{/if}
{/snippet}

{#snippet sectionHeading(icon: string, title: string)}
  <h3 class="flex items-center gap-2 font-semibold mb-4" style="color: {$colorStore.text}">
    <DuoIcon {icon} />
    {title}
  </h3>
{/snippet}

<div class="fixed inset-0 z-50 flex items-stretch md:items-center justify-center md:p-6 backdrop-blur-md"
     style="background: #00000080;"
     role="presentation"
     onclick={(e) => { if (e.target === e.currentTarget) close(); }}
     transition:fade={{ duration: 150 }}>
  <div class="w-full md:max-w-5xl md:max-h-[90vh] flex flex-col md:rounded-2xl border shadow-2xl overflow-hidden"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10), #1a202c;
              border-color: {$colorStore.primary}30;"
       role="dialog"
       aria-modal="true"
       aria-labelledby="ach-editor-title"
       in:fly={{ y: 24, duration: 200 }}>
    <div class="flex items-center gap-3 p-4 md:p-5 border-b" style="border-color: {$colorStore.primary}20;">
      <AchievementIcon icon={headerIcon} iconUrl={headerIconUrl} color={grade.color} />
      <div class="flex-1 min-w-0">
        <h2 id="ach-editor-title" class="text-lg font-bold truncate" style="color: {$colorStore.text}">
          {isNew ? m.achievements.editorNewTitle() : previewName}
        </h2>
        <p class="text-xs truncate" style="color: {$colorStore.muted}">
          {#if isNew}{m.achievements.editorSubtitleNew()}{:else if isBuiltIn}{m.achievements.editorSubtitleBuiltIn({ criteria: achievement ? criteriaText(achievement, catalog) : "" })}{:else}{m.achievements.editorSubtitleCustom({ key: achievement?.key ?? "" })}{/if}
        </p>
      </div>
      <button type="button" class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style="background: {$colorStore.primary}08; color: {$colorStore.text};"
              aria-label={m.common.close()} onclick={close}>
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 md:p-6">
      {#if isGlobal}
        <div class="p-4 rounded-xl text-sm" style="background: {$colorStore.primary}08; color: {$colorStore.text}">
          {m.achievements.editorGlobalNotice()}
        </div>
      {:else}
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div class="lg:col-span-3 space-y-6">
            <section class="relative rounded-2xl border p-5" style="z-index: 40; background: {$colorStore.primary}05; border-color: {$colorStore.primary}25;">
              {@render sectionHeading("fa-circle-info", m.common.basics())}
              <div class="space-y-4">
                <div>
                  {@render field(m.common.name(), "ach-name", isBuiltIn ? m.achievements.editorNameHintBuiltIn({ name: achievement?.defaultName ?? "" }) : null)}
                  <input id="ach-name" type="text" bind:value={draft.name} maxlength={catalog.limits.nameLength}
                         placeholder={isBuiltIn ? achievement?.defaultName ?? "" : m.achievements.editorNamePlaceholder()}
                         class="w-full px-3 h-[44px] rounded-xl border text-sm"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
                </div>
                <div>
                  {@render field(m.common.description(), "ach-description", m.achievements.editorDescriptionHint())}
                  <textarea id="ach-description" bind:value={draft.description} maxlength={catalog.limits.descriptionLength} rows="2"
                            placeholder={autoDescription()}
                            class="w-full p-3 rounded-xl border text-base resize-y"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"></textarea>
                </div>
                {#if !isBuiltIn}
                  <div>
                    <span id="ach-category-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.category()}</span>
                    <div class="min-h-[44px]">
                      <DiscordSelector type="custom" options={categoryOptions} selected={draft.categoryKey}
                                       placeholder={m.common.pickCategoryPlaceholder()} ariaLabelledby="ach-category-label"
                                       onchange={(detail) => { if (typeof detail.selected === "string") draft.categoryKey = detail.selected; }} />
                    </div>
                  </div>
                {/if}
                <div>
                  <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.achievements.editorIconLabel()}</span>
                  <p class="text-xs -mt-1 mb-2" style="color: {$colorStore.muted}">
                    {m.achievements.editorIconHint()}
                  </p>
                  <IconPicker value={draft.icon} defaultIcon={draftCategory?.icon ?? null}
                              defaultIconUrl={draftCategory?.iconUrl ?? null} defaultLabel={m.achievements.editorIconDefaultLabel()}
                              uploads={catalog.uploads} emojis={lookups?.emojis ?? []} color={grade.color}
                              label={m.achievements.editorIconChange()} onchange={(icon) => { draft.icon = icon; }}
                              onuploadschanged={onuploadschanged} {onerror} />
                </div>
                <ToggleRow checked={draft.enabled} title={m.common.active()}
                           subtitle={isNew ? m.achievements.editorActiveSubtitleNew() : m.achievements.editorActiveSubtitleExisting()}
                           colors={$colorStore} onchange={(v) => { draft.enabled = v; }} />
                <ToggleRow checked={draft.hidden} title={m.achievements.editorSecretTitle()}
                           subtitle={m.achievements.editorSecretSubtitle()}
                           colors={$colorStore} onchange={(v) => { draft.hidden = v; }} />
              </div>
            </section>

            {#if !isBuiltIn}
              <section class="relative rounded-2xl border p-5" style="z-index: 30; background: {$colorStore.primary}05; border-color: {$colorStore.primary}25;">
                {@render sectionHeading("fa-unlock", m.achievements.editorSectionUnlock())}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {#each triggerChoices as choice (choice.value)}
                    {@const pressed = draft.trigger === choice.value}
                    <button type="button"
                            class="flex items-start gap-3 p-4 rounded-xl border text-left transition-all hover:scale-[1.01] min-h-[44px]"
                            style="background: {pressed ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                                   border-color: {pressed ? $colorStore.primary : $colorStore.primary + '30'};"
                            aria-pressed={pressed}
                            onclick={() => { draft.trigger = choice.value; }}>
                      <DuoIcon icon={choice.icon} color={pressed ? null : $colorStore.muted} class="mt-1" />
                      <span class="min-w-0">
                        <span class="block font-semibold" style="color: {pressed ? $colorStore.primary : $colorStore.text}">{choice.title}</span>
                        <span class="block text-sm" style="color: {$colorStore.muted}">{choice.text}</span>
                      </span>
                    </button>
                  {/each}
                </div>

                {#if draft.trigger === AchievementTrigger.Metric}
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                    <div class="sm:col-span-2">
                      <span id="ach-metric-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.achievements.editorMetricLabel()}</span>
                      <div class="min-h-[44px]">
                        <DiscordSelector type="custom" options={metricOptions} selected={draft.metric.toString()}
                                         placeholder={m.achievements.editorMetricPlaceholder()} ariaLabelledby="ach-metric-label"
                                         onchange={(detail) => { if (typeof detail.selected === "string") draft.metric = Number(detail.selected); }} />
                      </div>
                      {#if selectedMetric}
                        <p class="text-xs mt-2" style="color: {$colorStore.muted}">{selectedMetric.description}.</p>
                      {/if}
                    </div>
                    <div>
                      {@render field(m.achievements.editorGoalLabel(), "ach-threshold", null)}
                      <input id="ach-threshold" type="number" min="1" bind:value={draft.threshold}
                             class="w-full px-3 h-[44px] rounded-xl border text-sm"
                             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
                    </div>
                  </div>
                {:else if draft.trigger === AchievementTrigger.Keyword || draft.trigger === AchievementTrigger.Reaction}
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                    <div>
                      {#if draft.trigger === AchievementTrigger.Keyword}
                        {@render field(m.achievements.editorPhraseLabel(), "ach-keyword", m.achievements.editorPhraseHint())}
                        <input id="ach-keyword" type="text" bind:value={draft.keyword} maxlength={catalog.limits.keywordLength}
                               placeholder={m.achievements.editorPhrasePlaceholder()}
                               class="w-full px-3 h-[44px] rounded-xl border text-sm"
                               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
                      {:else}
                        <span id="ach-reaction-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.emojiToReactWith()}</span>
                        <div class="min-h-[44px]">
                          <EmojiPicker {guildEmojis} selected={draft.keyword || null} placeholder={m.achievements.editorReactionPlaceholder()}
                                       showUnicodeEmojis={true} ariaLabelledby="ach-reaction-label"
                                       onchange={(detail) => { draft.keyword = typeof detail.selected === "string" ? detail.selected : ""; }} />
                        </div>
                      {/if}
                    </div>
                    <div>
                      <span id="ach-channel-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.achievements.editorChannelLabel()}</span>
                      <div class="min-h-[44px]">
                        <DiscordSelector type="channel" options={channelOptions} selected={draft.channelId}
                                         placeholder={m.common.anyChannel()} ariaLabelledby="ach-channel-label"
                                         onchange={(detail) => { draft.channelId = typeof detail.selected === "string" && detail.selected ? detail.selected : null; }} />
                      </div>
                      {#if draft.channelId}
                        <button type="button" class="text-xs mt-2 underline" style="color: {$colorStore.muted}"
                                onclick={() => { draft.channelId = null; }}>{m.common.anyChannel()}</button>
                      {/if}
                    </div>
                  </div>
                {:else}
                  <p class="text-sm mt-5" style="color: {$colorStore.muted}">
                    {m.achievements.editorManualHint()}
                  </p>
                {/if}
              </section>
            {/if}

            <section class="relative rounded-2xl border p-5" style="z-index: 20; background: {$colorStore.primary}05; border-color: {$colorStore.primary}25;">
              {@render sectionHeading(GRADE_ICON, isBuiltIn ? m.common.points() : m.achievements.editorSectionGradePoints())}
              {#if !isBuiltIn}
                <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4" role="radiogroup" aria-label={m.achievements.editorGradeLabel()}>
                  {#each catalog.grades as option (option.value)}
                    {@const pressed = draft.grade === option.value}
                    <button type="button" role="radio" aria-checked={pressed}
                            class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border min-h-[64px] transition-all hover:scale-[1.03]"
                            style="background: {option.color}{pressed ? '30' : '10'}; border-color: {option.color}{pressed ? '' : '40'};"
                            onclick={() => { draft.grade = option.value; }}>
                      <DuoIcon icon={GRADE_ICON} color={option.color} size={18} />
                      <span class="text-xs font-semibold" style="color: {option.color}">{option.name}</span>
                    </button>
                  {/each}
                </div>
              {/if}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {@render field(m.common.points(), "ach-points", m.achievements.editorPointsHint({ points: defaultPoints.toLocaleString() }))}
                  <input id="ach-points" type="number" min="0" max={catalog.limits.maxPoints}
                         value={draft.points ?? ""}
                         placeholder={defaultPoints.toString()}
                         oninput={(e) => { draft.points = optionalNumber((e.target as HTMLInputElement).value); }}
                         class="w-full px-3 h-[44px] rounded-xl border text-sm"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
                </div>
                <div class="text-xs self-end pb-3" style="color: {$colorStore.muted}">
                  {m.achievements.editorPointsRanks({ ranks: catalog.tiers.filter((t) => t.minPoints > 0).map((t) => `${t.name} ${t.minPoints.toLocaleString()}`).join(", ") })}
                </div>
              </div>
            </section>

            <section class="relative rounded-2xl border p-5" style="z-index: 10; background: {$colorStore.primary}05; border-color: {$colorStore.primary}25;">
              {@render sectionHeading("fa-gift", m.common.rewards())}
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="sm:col-span-3">
                  <span id="ach-role-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.role()}</span>
                  <div class="flex items-center gap-2">
                    <div class="flex-1 min-w-0 min-h-[44px]">
                      <DiscordSelector type="role" options={roleOptions} selected={draft.roleRewardId}
                                       placeholder={m.common.noRole()} ariaLabelledby="ach-role-label"
                                       onchange={(detail) => { draft.roleRewardId = typeof detail.selected === "string" && detail.selected ? detail.selected : null; }} />
                    </div>
                    {#if draft.roleRewardId}
                      <button type="button" class="w-[44px] h-[44px] rounded-xl shrink-0"
                              style="background: {$colorStore.primary}08; color: {$colorStore.muted};"
                              aria-label={m.achievements.editorRoleClear()} onclick={() => { draft.roleRewardId = null; }}>
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                      </button>
                    {/if}
                  </div>
                  {#if rewardRoleProblem}
                    <p class="text-xs mt-2" style="color: #ef4444">{m.achievements.editorRoleProblem()}</p>
                  {/if}
                </div>
                <div>
                  {@render field(m.features.currencyName(), "ach-currency", null)}
                  <input id="ach-currency" type="number" min="0" bind:value={draft.currencyReward}
                         class="w-full px-3 h-[44px] rounded-xl border text-sm"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
                </div>
                <div>
                  {@render field(m.common.xp(), "ach-xp", null)}
                  <input id="ach-xp" type="number" min="0" bind:value={draft.xpReward}
                         class="w-full px-3 h-[44px] rounded-xl border text-sm"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
                </div>
              </div>
            </section>
          </div>

          <div class="lg:col-span-2 lg:sticky lg:top-0 space-y-4">
            <div class="text-xs font-semibold uppercase tracking-wide" style="color: {$colorStore.muted}">{m.achievements.editorUnlockImage()}</div>
            <div class="relative rounded-xl overflow-hidden" style="background: #2b2d31; aspect-ratio: 1200 / 420;">
              {#if previewImage}
                <img src={previewImage} alt={m.achievements.editorPreviewAlt({ name: previewName, description: previewDescription, points: shownPoints.toLocaleString() })}
                     class="w-full h-full object-contain transition-opacity"
                     class:opacity-60={previewLoading} />
              {:else}
                <div class="absolute inset-0 flex items-center justify-center text-sm" style="color: {$colorStore.muted}">
                  {previewLoading ? m.achievements.cardDesignerDrawing() : m.achievements.editorPreviewEmpty()}
                </div>
              {/if}
            </div>
            <p class="text-xs" style="color: {$colorStore.muted}">
              {m.achievements.editorPreviewHint()}
            </p>
            {#if !isNew && achievement}
              <div class="rounded-xl p-4 space-y-2 text-sm" style="background: {$colorStore.primary}08;">
                <div class="flex justify-between gap-2"><span style="color: {$colorStore.muted}">{m.achievements.editorUnlockedBy()}</span>
                  <span style="color: {$colorStore.text}">{achievement.unlockCount === 1 ? m.achievements.editorUnlockedMembersOne({ count: "1" }) : m.common.membersCount({ count: achievement.unlockCount.toLocaleString() })}</span></div>
                <div class="flex justify-between gap-2"><span style="color: {$colorStore.muted}">{m.achievements.editorKeyLabel()}</span>
                  <code class="text-xs" style="color: {$colorStore.primary}">{achievement.key}</code></div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="flex flex-col-reverse sm:flex-row sm:items-center gap-3 p-4 md:p-5 border-t" style="border-color: {$colorStore.primary}20;">
      {#if !isNew && achievement?.isCustom}
        <button type="button" class="px-4 py-2.5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
                style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                disabled={deleting} onclick={remove}>
          <i class="fa-solid fa-trash mr-2" aria-hidden="true"></i>{m.common.delete()}
        </button>
      {:else if isBuiltIn && achievement?.isOverridden}
        <button type="button" class="px-4 py-2.5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
                style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                disabled={saving} onclick={resetToDefault}>
          <i class="fa-solid fa-rotate-left mr-2" aria-hidden="true"></i>{m.common.resetToDefault()}
        </button>
      {/if}
      <div class="sm:ml-auto flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
        {#if blocker && dirty}
          <span class="text-sm" style="color: {$colorStore.accent}">{blocker}</span>
        {/if}
        <button type="button" class="px-4 py-2.5 rounded-xl min-h-[44px] font-medium"
                style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                onclick={close}>{m.common.cancel()}</button>
        {#if !isGlobal}
          <button type="button" class="px-5 py-2.5 rounded-xl min-h-[44px] font-semibold disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  disabled={saving || !!blocker || (!dirty && !isNew)} onclick={save}>
            {#if saving}<i class="fa-solid fa-spinner fa-spin mr-2" aria-hidden="true"></i>{/if}
            {isNew ? m.achievements.editorCreate() : m.common.save()}
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>
