<!-- routes/dashboard/wordoftheday/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    clientApi,
    ScheduleRuleType,
    WordDifficulty,
    wordOfTheDayApi,
    WordPartOfSpeech,
    WordSourceMode,
    type WordOfTheDayConfig,
    type WordOfTheDayConfigRequest,
    type WordOfTheDayHistoryEntry,
    type WordOfTheDaySchedule,
    type WordOfTheDayWord
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { TIMEZONE_OPTIONS } from "$lib/config/timezones";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";

  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  /** Typed fields are not rolled back on failure, since that would fight the user mid-edit. */
  const TEXT_KEYS = new Set(["topic", "threadName", "messageTemplate"]);

  const autoSave = createAutoSave({
    onError: (_err, key) => showMessage(
      TEXT_KEYS.has(key)
        ? m.wordoftheday.notifySaveFailed()
        : m.wordoftheday.notifySaveFailedUndone(),
      "error"
    )
  });

  const DAY_NAMES = $derived([
    m.wordoftheday.daySunday(),
    m.wordoftheday.dayMonday(),
    m.wordoftheday.dayTuesday(),
    m.wordoftheday.dayWednesday(),
    m.wordoftheday.dayThursday(),
    m.wordoftheday.dayFriday(),
    m.wordoftheday.daySaturday()
  ]);
  const MONTH_NAMES = $derived([
    m.wordoftheday.monthJanuary(),
    m.wordoftheday.monthFebruary(),
    m.wordoftheday.monthMarch(),
    m.wordoftheday.monthApril(),
    m.wordoftheday.monthMay(),
    m.wordoftheday.monthJune(),
    m.wordoftheday.monthJuly(),
    m.wordoftheday.monthAugust(),
    m.wordoftheday.monthSeptember(),
    m.wordoftheday.monthOctober(),
    m.wordoftheday.monthNovember(),
    m.wordoftheday.monthDecember()
  ]);

  const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
    id: i.toString(),
    name: `${i.toString().padStart(2, "0")}:00`
  }));

  const MODE_OPTIONS = $derived([
    { id: WordSourceMode.Dictionary.toString(), name: m.wordoftheday.sourceDictionary() },
    { id: WordSourceMode.Custom.toString(), name: m.wordoftheday.sourceCustom() },
    { id: WordSourceMode.Mixed.toString(), name: m.wordoftheday.sourceMixed() }
  ]);

  const POS_OPTIONS = $derived([
    { id: WordPartOfSpeech.Any.toString(), name: m.wordoftheday.optionAny() },
    { id: WordPartOfSpeech.Noun.toString(), name: m.wordoftheday.posNoun() },
    { id: WordPartOfSpeech.Verb.toString(), name: m.wordoftheday.posVerb() },
    { id: WordPartOfSpeech.Adjective.toString(), name: m.wordoftheday.posAdjective() },
    { id: WordPartOfSpeech.Adverb.toString(), name: m.wordoftheday.posAdverb() }
  ]);

  const DIFFICULTY_OPTIONS = $derived([
    { id: WordDifficulty.Any.toString(), name: m.wordoftheday.optionAny() },
    { id: WordDifficulty.Common.toString(), name: m.wordoftheday.difficultyCommon() },
    { id: WordDifficulty.Moderate.toString(), name: m.wordoftheday.difficultyModerate() },
    { id: WordDifficulty.Rare.toString(), name: m.wordoftheday.difficultyRare() }
  ]);

  const THREAD_ARCHIVE_OPTIONS = $derived([
    { id: "60", name: m.common.oneHour() },
    { id: "1440", name: m.common.oneDay() },
    { id: "4320", name: m.wordoftheday.archive3d() },
    { id: "10080", name: m.wordoftheday.archive1w() }
  ]);

  const DEFAULT_THREAD_NAME = "Word of the day: %wotd.word%";

  const RULE_POS_OPTIONS = $derived([{ id: "0", name: m.wordoftheday.optionInherit() }, ...POS_OPTIONS.slice(1)]);
  const RULE_DIFFICULTY_OPTIONS = $derived([{ id: "0", name: m.wordoftheday.optionInherit() }, ...DIFFICULTY_OPTIONS.slice(1)]);

  const TEMPLATE_PLACEHOLDERS = $derived([
    { category: m.common.word(), name: "%wotd.word%", description: m.placeholders.wotdWord() },
    { category: m.common.word(), name: "%wotd.definition%", description: m.placeholders.wotdDefinition() },
    { category: m.common.word(), name: "%wotd.pos%", description: m.placeholders.wotdPos() },
    { category: m.common.word(), name: "%wotd.example%", description: m.placeholders.wotdExample() },
    { category: m.common.word(), name: "%wotd.phonetic%", description: m.placeholders.wotdPhonetic() },
    { category: m.common.word(), name: "%wotd.date%", description: m.placeholders.wotdDate() },
    { category: m.common.word(), name: "%wotd.ping%", description: m.placeholders.wotdPing() },
    { category: m.placeholders.categoryServer(), name: "%server.name%", description: m.placeholders.serverName() }
  ]);

  /** One editable row on the schedule tab. */
  interface RuleDraft {
    type: ScheduleRuleType;
    key: number;
    name: string;
    topic: string;
    partOfSpeech: number;
    difficulty: number;
    exists: boolean;
    saving: boolean;
  }

  let loading = $state(false);
  let saving = $state(false);
  let posting = $state(false);
  let addingWord = $state(false);
  let message = $state("");
  let messageType: "success" | "error" | "info" = $state("info");
  /** Shown after a post when the custom template was ignored in favour of the default embed */
  let templateWarning = $state("");

  let config: WordOfTheDayConfig | null = $state(null);
  let words: WordOfTheDayWord[] = $state([]);
  let history: WordOfTheDayHistoryEntry[] = $state([]);
  let rules: WordOfTheDaySchedule[] = $state([]);
  let guildChannels: Array<{ id: string; name: string }> = $state([]);
  let guildRoles: Array<{ id: string; name: string; color: number }> = $state([]);

  let form = $state({
    channelId: null as bigint | null,
    enabled: false,
    postHour: 9,
    timezone: "UTC",
    pingRoleId: null as bigint | null,
    messageTemplate: {} as string | Record<string, any> | null,
    topic: "",
    partOfSpeech: WordPartOfSpeech.Any as number,
    difficulty: WordDifficulty.Any as number,
    sourceMode: WordSourceMode.Dictionary as number,
    createThread: false,
    threadName: "",
    threadAutoArchiveMinutes: 1440
  });

  let dayDrafts: RuleDraft[] = $state([]);
  let monthDrafts: RuleDraft[] = $state([]);

  let newWord = $state("");
  let newDefinition = $state("");

  let activeTab = $state("settings");

  // Last values the server confirmed, so a failed save can put the field back.
  type SavedSettings = Omit<typeof form, "messageTemplate">;
  let saved: SavedSettings = {
    channelId: null,
    enabled: false,
    postHour: 9,
    timezone: "UTC",
    pingRoleId: null,
    topic: "",
    partOfSpeech: WordPartOfSpeech.Any,
    difficulty: WordDifficulty.Any,
    sourceMode: WordSourceMode.Dictionary,
    createThread: false,
    threadName: "",
    threadAutoArchiveMinutes: 1440
  };
  let savedTemplate = serializeTemplate({});

  /** Turns the builder's value into what the API stores. An empty string clears the template. */
  function serializeTemplate(value: typeof form.messageTemplate): string {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && Object.keys(value).length > 0) return JSON.stringify(value);
    return "";
  }

  /** Copies a freshly loaded config into the form and the saved snapshot. */
  function applyConfig(cfg: WordOfTheDayConfig) {
    let parsed: string | Record<string, any> | null = cfg.messageTemplate;
    try {
      if (typeof parsed === "string" && parsed.trim().startsWith("{")) {
        parsed = JSON.parse(parsed);
      } else if (typeof parsed === "string" && parsed) {
        parsed = { content: parsed };
      } else if (!parsed) {
        parsed = {};
      }
    } catch {
      parsed = parsed ? { content: parsed } : {};
    }

    saved = {
      channelId: cfg.channelId,
      enabled: cfg.enabled,
      postHour: cfg.postHour,
      timezone: cfg.timezone || "UTC",
      pingRoleId: cfg.pingRoleId,
      topic: cfg.topic ?? "",
      partOfSpeech: cfg.partOfSpeech,
      difficulty: cfg.difficulty,
      sourceMode: cfg.sourceMode,
      createThread: cfg.createThread,
      threadName: cfg.threadName ?? "",
      threadAutoArchiveMinutes: cfg.threadAutoArchiveMinutes || 1440
    };
    form = { ...saved, messageTemplate: parsed };
    savedTemplate = serializeTemplate(parsed);
  }

  $effect(() => {
    dayDrafts = DAY_NAMES.map((name, key) => buildDraft(ScheduleRuleType.DayOfWeek, key, name));
    monthDrafts = MONTH_NAMES.map((name, i) => buildDraft(ScheduleRuleType.Month, i + 1, name));
  });

  function buildDraft(type: ScheduleRuleType, key: number, name: string): RuleDraft {
    const rule = rules.find((r) => r.ruleType === type && r.ruleKey === key);
    return {
      type,
      key,
      name,
      topic: rule?.topic ?? "",
      partOfSpeech: rule?.partOfSpeech ?? 0,
      difficulty: rule?.difficulty ?? 0,
      exists: !!rule,
      saving: false
    };
  }

  async function loadAll() {
    if (!$currentGuild?.id) return;

    // Let anything still waiting land first, so the reload shows it.
    await autoSave.flush();
    if (!$currentGuild?.id) return;

    loading = true;
    try {
      const [cfg, wordList, hist, ruleList, channels, roles] = await Promise.all([
        wordOfTheDayApi.getConfig($currentGuild.id).catch(() => null),
        wordOfTheDayApi.getWords($currentGuild.id).catch(() => []),
        wordOfTheDayApi.getHistory($currentGuild.id, 30).catch(() => []),
        wordOfTheDayApi.getSchedule($currentGuild.id).catch(() => []),
        clientApi.getTextChannels($currentGuild.id).catch(() => []),
        clientApi.getRoles($currentGuild.id).catch(() => [])
      ]);

      config = cfg;
      if (cfg) applyConfig(cfg);
      words = wordList;
      history = hist;
      rules = ruleList;

      guildChannels = (channels || []).map((channel: any) => ({
        id: channel.id.toString(),
        name: channel.name
      }));

      guildRoles = (roles || [])
        .filter((role: any) =>
          role.id !== $currentGuild?.id?.toString() && !role.managed && !role.name.startsWith("@"))
        .map((role: any) => ({ id: role.id.toString(), name: role.name, color: role.color || 0 }))
        .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
    } catch (err) {
      logger.error("Failed to load word of the day data:", err);
      showMessage(m.wordoftheday.notifyLoadFailed(), "error");
    } finally {
      loading = false;
    }
  }

  /**
   * Sends a partial config update under `key`. `patch` holds the form fields the request
   * changes; on success they become the saved snapshot (and the summary panel), and on
   * failure they are put back when `rollback` is set. The API leaves missing fields alone.
   */
  function updateSettings(
    key: string,
    request: WordOfTheDayConfigRequest,
    patch: Partial<SavedSettings>,
    { rollback = true, debounce = false }: { rollback?: boolean; debounce?: boolean } = {}
  ) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const fields = Object.keys(patch) as (keyof SavedSettings)[];
    const save = async () => {
      try {
        await wordOfTheDayApi.updateConfig(guildId, request);
        if ($currentGuild?.id !== guildId) return;
        saved = { ...saved, ...patch };
        if (config) config = { ...config, ...patch };
      } catch (err) {
        if (rollback && $currentGuild?.id === guildId) {
          Object.assign(form, Object.fromEntries(fields.map((f) => [f, saved[f]])));
        }
        throw err;
      }
    };
    if (debounce) autoSave.schedule(key, save);
    else autoSave.now(key, save);
  }

  /**
   * The channel and the enabled toggle share a key so their writes land in order: the API
   * only keeps posting enabled while a channel is set.
   */
  function saveChannel(selected: string | string[] | null) {
    const channelId = selected && typeof selected === "string" ? BigInt(selected) : null;
    form.channelId = channelId;
    const request: WordOfTheDayConfigRequest = { channelId: channelId ?? 0n };
    const patch: Partial<SavedSettings> = { channelId };
    if (!channelId) {
      form.enabled = false;
      request.enabled = false;
      patch.enabled = false;
    }
    updateSettings("posting", request, patch);
  }

  function saveEnabled(enabled: boolean) {
    form.enabled = enabled;
    updateSettings("posting", { enabled }, { enabled });
  }

  function savePostHour(postHour: number) {
    form.postHour = postHour;
    updateSettings("postHour", { postHour }, { postHour });
  }

  function saveTimezone(timezone: string) {
    form.timezone = timezone;
    updateSettings("timezone", { timezone }, { timezone });
  }

  function savePingRole(selected: string | string[] | null) {
    const pingRoleId = selected && typeof selected === "string" ? BigInt(selected) : null;
    form.pingRoleId = pingRoleId;
    updateSettings("pingRoleId", { pingRoleId: pingRoleId ?? 0n }, { pingRoleId });
  }

  function saveSourceMode(sourceMode: number) {
    form.sourceMode = sourceMode;
    updateSettings("sourceMode", { sourceMode }, { sourceMode });
  }

  function savePartOfSpeech(partOfSpeech: number) {
    form.partOfSpeech = partOfSpeech;
    updateSettings("partOfSpeech", { partOfSpeech }, { partOfSpeech });
  }

  function saveDifficulty(difficulty: number) {
    form.difficulty = difficulty;
    updateSettings("difficulty", { difficulty }, { difficulty });
  }

  function saveCreateThread(createThread: boolean) {
    form.createThread = createThread;
    updateSettings("createThread", { createThread }, { createThread });
  }

  function saveThreadArchive(threadAutoArchiveMinutes: number) {
    form.threadAutoArchiveMinutes = threadAutoArchiveMinutes;
    updateSettings("threadAutoArchiveMinutes", { threadAutoArchiveMinutes }, { threadAutoArchiveMinutes });
  }

  /** An empty topic clears it, which is a valid setting. */
  function saveTopic() {
    const topic = form.topic.trim();
    updateSettings("topic", { topic }, { topic }, { rollback: false, debounce: true });
  }

  /** An empty thread name falls back to the default, which is a valid setting. */
  function saveThreadName() {
    const threadName = form.threadName.trim();
    updateSettings("threadName", { threadName }, { threadName }, { rollback: false, debounce: true });
  }

  /**
   * Saves the template when the embed builder closes. The builder's Cancel restores the
   * old value before closing, so a cancelled edit is never sent.
   */
  function saveTemplate() {
    if (!$currentGuild?.id) return;
    const template = serializeTemplate(form.messageTemplate);
    if (template === savedTemplate) return;
    const guildId = $currentGuild.id;
    void autoSave.now("messageTemplate", async () => {
      await wordOfTheDayApi.updateConfig(guildId, { messageTemplate: template });
      if ($currentGuild?.id !== guildId) return;
      savedTemplate = template;
      if (config) config = { ...config, messageTemplate: template || null };
    });
  }

  async function resetConfig() {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: m.wordoftheday.resetTitle(),
      message: m.wordoftheday.resetMessage(),
      confirmText: m.common.resetEverything(),
      variant: "danger"
    });
    if (!ok) return;

    saving = true;
    try {
      // Settle queued saves first so none of them lands on top of the reset.
      await autoSave.flush();
      await wordOfTheDayApi.resetConfig($currentGuild.id);
      await loadAll();
    } catch (err) {
      logger.error("Failed to reset word of the day config:", err);
      showMessage(m.common.failedToResetConfiguration(), "error");
    } finally {
      saving = false;
    }
  }

  async function postNow() {
    if (!$currentGuild?.id) return;
    posting = true;
    try {
      const result = await wordOfTheDayApi.postNow($currentGuild.id);
      templateWarning = result.usedFallback
        ? result.warning || m.wordoftheday.templateFallbackWarning()
        : "";
      showMessage(m.wordoftheday.notifyPosted({ word: result.entry.word }), "success");
      history = await wordOfTheDayApi.getHistory($currentGuild.id, 30).catch(() => history);
      config = await wordOfTheDayApi.getConfig($currentGuild.id).catch(() => config);
    } catch (err: any) {
      logger.error("Failed to post word of the day:", err);
      showMessage(err?.message || m.wordoftheday.notifyPostFailed(), "error");
    } finally {
      posting = false;
    }
  }

  async function saveRule(draft: RuleDraft) {
    if (!$currentGuild?.id) return;
    draft.saving = true;
    try {
      const saved = await wordOfTheDayApi.upsertSchedule($currentGuild.id, {
        ruleType: draft.type,
        ruleKey: draft.key,
        topic: draft.topic.trim(),
        partOfSpeech: draft.partOfSpeech,
        difficulty: draft.difficulty
      });
      rules = [...rules.filter((r) => !(r.ruleType === saved.ruleType && r.ruleKey === saved.ruleKey)), saved];
    } catch (err) {
      logger.error("Failed to save schedule rule:", err);
      showMessage(m.wordoftheday.notifyRuleSaveFailed({ name: draft.name }), "error");
    } finally {
      draft.saving = false;
    }
  }

  async function clearRule(draft: RuleDraft) {
    if (!$currentGuild?.id) return;
    draft.saving = true;
    try {
      await wordOfTheDayApi.deleteSchedule($currentGuild.id, draft.type, draft.key);
      rules = rules.filter((r) => !(r.ruleType === draft.type && r.ruleKey === draft.key));
    } catch (err) {
      logger.error("Failed to clear schedule rule:", err);
      showMessage(m.wordoftheday.notifyRuleClearFailed({ name: draft.name }), "error");
    } finally {
      draft.saving = false;
    }
  }

  async function addWord() {
    if (!$currentGuild?.id || !newWord.trim()) return;
    addingWord = true;
    try {
      const added = await wordOfTheDayApi.addWord($currentGuild.id, {
        word: newWord.trim(),
        definition: newDefinition.trim() || null,
        addedBy: BigInt(data.user?.id ?? 0)
      });
      words = [...words, added];
      newWord = "";
      newDefinition = "";
      if (config) config = { ...config, customWordCount: words.length };
    } catch (err: any) {
      logger.error("Failed to add custom word:", err);
      showMessage(err?.message || m.wordoftheday.notifyAddFailed(), "error");
    } finally {
      addingWord = false;
    }
  }

  async function removeWord(word: WordOfTheDayWord) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      message: m.wordoftheday.confirmRemoveWord({ word: word.word }),
      confirmText: m.common.remove()
    });
    if (!ok) return;

    try {
      await wordOfTheDayApi.removeWord($currentGuild.id, word.word);
      words = words.filter((w) => w.id !== word.id);
      if (config) config = { ...config, customWordCount: words.length };
    } catch (err) {
      logger.error("Failed to remove custom word:", err);
      showMessage(m.wordoftheday.notifyRemoveFailed(), "error");
    }
  }

  function showMessage(text: string, type: "success" | "error" | "info") {
    message = text;
    messageType = type;
    setTimeout(() => {
      message = "";
    }, 5000);
  }

  function getChannelName(channelId: bigint | null | undefined): string {
    if (!channelId) return m.common.notSet();
    const channel = guildChannels.find((c) => c.id === channelId.toString());
    return channel ? `#${channel.name}` : m.common.unknownChannel();
  }

  function getRoleName(roleId: bigint | null | undefined): string {
    if (!roleId) return m.common.none();
    const role = guildRoles.find((r) => r.id === roleId.toString());
    return role ? `@${role.name}` : m.common.unknownRole();
  }

  function optionName(options: Array<{ id: string; name: string }>, value: number): string {
    return options.find((o) => o.id === value.toString())?.name ?? m.wordoftheday.optionAny();
  }

  function formatDate(value: string | null | undefined): string {
    if (!value) return m.common.never();
    return new Date(value).toLocaleDateString();
  }

  function selectedNumber(detail: { selected: string | string[] | null }, fallback: number): number {
    return detail.selected && typeof detail.selected === "string" ? parseInt(detail.selected) : fallback;
  }

  function describeRule(draft: RuleDraft): string {
    const parts: string[] = [];
    if (draft.topic.trim()) parts.push(m.wordoftheday.ruleTopic({ topic: draft.topic.trim() }));
    if (draft.partOfSpeech) parts.push(optionName(POS_OPTIONS, draft.partOfSpeech).toLowerCase());
    if (draft.difficulty) parts.push(optionName(DIFFICULTY_OPTIONS, draft.difficulty).toLowerCase());
    return parts.length ? parts.join(", ") : m.wordoftheday.ruleInherits();
  }

  let ruleCount = $derived(rules.length);

  onMount(() => {
    loadAll();
  });

  const tabs = $derived([
    { id: "settings", label: m.common.settings(), icon: "fa-gear" },
    { id: "schedule", label: m.common.schedule(), icon: "fa-calendar" },
    { id: "words", label: m.wordoftheday.tabWords(), icon: "fa-list" },
    { id: "history", label: m.common.history(), icon: "fa-clock-rotate-left" }
  ]);

  let actionButtons = $derived([
    {
      label: m.wordoftheday.actionPostNow(),
      icon: "fa-paper-plane",
      action: postNow,
      loading: posting
    },
    {
      label: m.common.refresh(),
      icon: "fa-arrows-rotate",
      action: loadAll,
      loading: loading
    }
  ]);
</script>

{#snippet statusMessageContent()}
  {#if message}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
         style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
         in:fly={{ x: 20, duration: 300 }}>
      {#if messageType === 'success'}
        <i class="fa-utility-duo fa-regular fa-circle-check"
           style="--fa-primary-color: #10b981; --fa-secondary-color: #059669; font-size: 20px;"></i>
      {:else}
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: {messageType === 'error' ? '#ef4444' : $colorStore.primary}; --fa-secondary-color: {messageType === 'error' ? '#dc2626' : $colorStore.secondary}; font-size: 20px;"></i>
      {/if}
      <span style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
    </div>
  {/if}

  {#if templateWarning}
    <div class="mb-6 p-4 rounded-xl flex items-start gap-3"
         style="background: {$colorStore.accent}20; border: 1px solid {$colorStore.accent}30;"
         in:fly={{ x: -20, duration: 300 }}>
      <i class="fa-utility-duo fa-regular fa-circle-exclamation mt-0.5"
         style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
      <div class="flex-1 min-w-0">
        <p class="font-medium" style="color: {$colorStore.text}">{m.wordoftheday.warningTitle()}</p>
        <p class="text-sm" style="color: {$colorStore.muted}">{templateWarning}</p>
      </div>
      <button type="button" class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
              style="color: {$colorStore.muted}" aria-label={m.common.dismiss()}
              onclick={() => (templateWarning = "")}>
        <i class="fa-utility-duo fa-regular fa-xmark"
           style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted};"></i>
      </button>
    </div>
  {/if}

  {#if config && config.enabled && !config.channelId}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3"
         style="background: {$colorStore.accent}20; border: 1px solid {$colorStore.accent}30;"
         in:fly={{ x: -20, duration: 300 }}>
      <i class="fa-utility-duo fa-regular fa-circle-exclamation"
         style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
      <span style="color: {$colorStore.text}">{m.wordoftheday.warningNoChannel()}</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  {autoSave}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-book-open"
  statusMessages={statusMessageContent}
  subtitle={m.features.wordofthedayDescription()}
  {tabs}
  title={m.features.wordofthedayName()}
>

  {#if activeTab === 'settings'}
    <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>

      <!-- Posting -->
      <div class="relative z-30 rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-paper-plane"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.wordoftheday.postingTitle()}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-hashtag" style="font-size: 14px;"></i>
              {m.common.channel()}
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="channel"
                options={guildChannels}
                selected={form.channelId?.toString() || null}
                placeholder={m.common.noChannelSelected()}
                onchange={(detail) => saveChannel(detail.selected)}
              />
            </div>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-clock" style="font-size: 14px;"></i>
              {m.wordoftheday.postingHour()}
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={HOUR_OPTIONS}
                selected={form.postHour.toString()}
                placeholder={m.wordoftheday.postingHourPlaceholder()}
                searchable={false}
                onchange={(detail) => savePostHour(selectedNumber(detail, 9))}
              />
            </div>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-location-dot" style="font-size: 14px;"></i>
              {m.common.timezone()}
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="timezone"
                options={TIMEZONE_OPTIONS}
                selected={form.timezone}
                placeholder={m.common.selectTimezonePlaceholder()}
                onchange={(detail) => saveTimezone(detail.selected && typeof detail.selected === 'string' ? detail.selected : "UTC")}
              />
            </div>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-bell" style="font-size: 14px;"></i>
              {m.common.pingRole()}
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="role"
                options={guildRoles}
                selected={form.pingRoleId?.toString() || null}
                placeholder={m.common.noPingRole()}
                onchange={(detail) => savePingRole(detail.selected)}
              />
            </div>
          </div>
        </div>

        <div class="mt-6">
          <ToggleRow
            checked={form.enabled}
            title={m.wordoftheday.postingToggle()}
            subtitle={form.channelId ? m.wordoftheday.postingToggleHint() : m.common.pickChannelFirstPlaceholder()}
            colors={$colorStore}
            disabled={!form.channelId}
            onchange={saveEnabled}
          />
        </div>
      </div>

      <!-- Word source -->
      <div class="relative z-20 rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-filter"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.wordoftheday.sourceTitle()}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-book" style="font-size: 14px;"></i>
              {m.wordoftheday.sourceLabel()}
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={MODE_OPTIONS}
                selected={form.sourceMode.toString()}
                placeholder={m.wordoftheday.sourceLabel()}
                searchable={false}
                onchange={(detail) => saveSourceMode(selectedNumber(detail, WordSourceMode.Dictionary))}
              />
            </div>
          </div>

          <div>
            <label for="wotd-topic" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-tag" style="font-size: 14px;"></i>
              {m.wordoftheday.sourceTopic()}
            </label>
            <input id="wotd-topic"
                   type="text"
                   bind:value={form.topic}
                   oninput={saveTopic}
                   onblur={() => autoSave.flush("topic")}
                   placeholder={m.wordoftheday.sourceTopicPlaceholder()}
                   maxlength="80"
                   class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-font" style="font-size: 14px;"></i>
              {m.placeholders.wotdPos()}
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={POS_OPTIONS}
                selected={form.partOfSpeech.toString()}
                placeholder={m.wordoftheday.optionAny()}
                searchable={false}
                onchange={(detail) => savePartOfSpeech(selectedNumber(detail, WordPartOfSpeech.Any))}
              />
            </div>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-sliders" style="font-size: 14px;"></i>
              {m.wordoftheday.sourceDifficulty()}
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={DIFFICULTY_OPTIONS}
                selected={form.difficulty.toString()}
                placeholder={m.wordoftheday.optionAny()}
                searchable={false}
                onchange={(detail) => saveDifficulty(selectedNumber(detail, WordDifficulty.Any))}
              />
            </div>
          </div>
        </div>

        <p class="text-xs mt-4" style="color: {$colorStore.muted}">
          {m.wordoftheday.sourceHint()}
        </p>
      </div>

      <!-- Discussion thread -->
      <div class="relative z-[15] rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-comments"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.wordoftheday.threadTitle()}</h2>
        </div>

        <ToggleRow
          checked={form.createThread}
          title={m.wordoftheday.threadToggle()}
          subtitle={m.wordoftheday.threadToggleHint()}
          colors={$colorStore}
          onchange={saveCreateThread}
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
          <div>
            <label for="wotd-thread-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-input-text" style="font-size: 14px;"></i>
              {m.wordoftheday.threadName()}
            </label>
            <input id="wotd-thread-name"
                   type="text"
                   bind:value={form.threadName}
                   oninput={saveThreadName}
                   onblur={() => autoSave.flush("threadName")}
                   placeholder={DEFAULT_THREAD_NAME}
                   maxlength="100"
                   disabled={!form.createThread}
                   class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base disabled:opacity-50"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
            <p class="text-xs mt-2" style="color: {$colorStore.muted}">
              {m.wordoftheday.threadNameHint({ default: DEFAULT_THREAD_NAME, wordToken: "%wotd.word%", dateToken: "%wotd.date%", posToken: "%wotd.pos%" })}
            </p>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-box-archive" style="font-size: 14px;"></i>
              {m.wordoftheday.threadArchive()}
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={THREAD_ARCHIVE_OPTIONS}
                selected={form.threadAutoArchiveMinutes.toString()}
                placeholder={m.wordoftheday.threadArchivePlaceholder()}
                searchable={false}
                disabled={!form.createThread}
                onchange={(detail) => saveThreadArchive(selectedNumber(detail, 1440))}
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Message template -->
      <div class="relative z-10 rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-comment"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.wordoftheday.templateTitle()}</h2>
        </div>

        <FullscreenEmbedBuilder id="wotd-template"
                                bind:value={form.messageTemplate}
                                onclose={saveTemplate}
                                previewTitle={m.features.wordofthedayName()}
                                previewDescription={m.wordoftheday.templatePreviewDescription()}
                                icon="fa-book-open"
                                allowContent={true}
                                allowMultipleEmbeds={true}
                                maxEmbeds={10}
                                allowComponents={true}
                                additionalPlaceholders={TEMPLATE_PLACEHOLDERS}
                                guildId={$currentGuild?.id}
                                user={data.user}
                                placeholder={m.wordoftheday.templatePlaceholder()}
        />

        <p class="text-xs mt-3" style="color: {$colorStore.muted}">
          {m.wordoftheday.templateHint()}
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
        <button
          class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
          style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30;"
          onclick={resetConfig}
          disabled={saving}
        >
          <i class="fa-solid fa-arrows-rotate" style="font-size: 20px;"></i>
          {m.common.resetEverything()}
        </button>
      </div>

      <!-- Current configuration -->
      <div class="rounded-2xl border p-6 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-circle-exclamation"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.common.currentConfiguration()}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">{m.wordoftheday.summaryStatus()}</span>
            <span style="color: {config?.enabled ? '#10b981' : $colorStore.text}">{config?.enabled ? m.common.enabled() : m.common.disabled()}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">{m.common.channelLabel()}</span>
            <span style="color: {$colorStore.text}">{getChannelName(config?.channelId)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">{m.wordoftheday.summaryPostsAt()}</span>
            <span style="color: {$colorStore.text}">{(config?.postHour ?? 9).toString().padStart(2, "0")}:00 {config?.timezone ?? "UTC"}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">{m.common.pingRoleLabel()}</span>
            <span style="color: {$colorStore.text}">{getRoleName(config?.pingRoleId)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">{m.wordoftheday.summarySource()}</span>
            <span style="color: {$colorStore.text}">{optionName(MODE_OPTIONS, config?.sourceMode ?? 0)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">{m.wordoftheday.summaryCustomWords()}</span>
            <span style="color: {$colorStore.text}">{config?.customWordCount ?? 0}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">{m.wordoftheday.summaryRules()}</span>
            <span style="color: {$colorStore.text}">{ruleCount}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">{m.wordoftheday.summaryThread()}</span>
            <span style="color: {config?.createThread ? '#10b981' : $colorStore.text}">
              {config?.createThread
                ? m.wordoftheday.summaryThreadOn({ archive: optionName(THREAD_ARCHIVE_OPTIONS, config?.threadAutoArchiveMinutes ?? 1440), name: config?.threadName || DEFAULT_THREAD_NAME })
                : m.common.off()}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">{m.wordoftheday.summaryLastPosted()}</span>
            <span style="color: {$colorStore.text}">{formatDate(config?.lastPostedDate)}</span>
          </div>
        </div>
      </div>
    </div>

  {:else if activeTab === 'schedule'}
    <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
      <p class="text-sm" style="color: {$colorStore.muted}">
        {m.wordoftheday.scheduleHint()}
      </p>

      {#each [{ title: m.wordoftheday.scheduleWeekdays(), icon: "fa-calendar", drafts: dayDrafts }, { title: m.wordoftheday.scheduleMonths(), icon: "fa-calendar", drafts: monthDrafts }] as group}
        <div class="rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                    border-color: {$colorStore.primary}30;">
          <div class="flex items-center gap-3 mb-6">
            <i class="fa-utility-duo fa-regular {group.icon}"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{group.title}</h2>
          </div>

          <div class="space-y-3">
            {#each group.drafts as draft (draft.type + '-' + draft.key)}
              <div class="rounded-xl p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center"
                   style="background: {$colorStore.primary}{draft.exists ? '12' : '05'}; border: 1px solid {$colorStore.primary}{draft.exists ? '30' : '15'};">
                <div class="lg:col-span-2 min-w-0">
                  <div class="font-semibold" style="color: {$colorStore.text}">{draft.name}</div>
                  <div class="text-xs truncate" style="color: {$colorStore.muted}">{describeRule(draft)}</div>
                </div>

                <div class="lg:col-span-4">
                  <input type="text"
                         bind:value={draft.topic}
                         placeholder={m.wordoftheday.ruleTopicPlaceholder()}
                         maxlength="80"
                         aria-label={m.wordoftheday.ruleTopicAria({ name: draft.name })}
                         class="w-full p-2.5 rounded-lg border transition-all min-h-[44px] text-sm"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                         onkeydown={(e) => e.key === 'Enter' && saveRule(draft)}
                  >
                </div>

                <div class="lg:col-span-2 min-h-[44px]">
                  <DiscordSelector
                    type="custom"
                    options={RULE_POS_OPTIONS}
                    selected={draft.partOfSpeech.toString()}
                    placeholder={m.placeholders.wotdPos()}
                    searchable={false}
                    onchange={(detail) => { draft.partOfSpeech = selectedNumber(detail, 0); }}
                  />
                </div>

                <div class="lg:col-span-2 min-h-[44px]">
                  <DiscordSelector
                    type="custom"
                    options={RULE_DIFFICULTY_OPTIONS}
                    selected={draft.difficulty.toString()}
                    placeholder={m.wordoftheday.sourceDifficulty()}
                    searchable={false}
                    onchange={(detail) => { draft.difficulty = selectedNumber(detail, 0); }}
                  />
                </div>

                <div class="lg:col-span-2 flex gap-2 justify-end">
                  <button
                    class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] text-sm font-medium"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                    onclick={() => saveRule(draft)}
                    disabled={draft.saving}
                    aria-label={m.wordoftheday.ruleSaveAria({ name: draft.name })}
                  >
                    <i class="fa-solid fa-floppy-disk {draft.saving ? 'fa-spin' : ''}" aria-hidden="true"></i>
                    {m.common.save()}
                  </button>
                  {#if draft.exists}
                    <button
                      class="flex items-center justify-center px-3 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] min-w-[44px] text-sm"
                      style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                      onclick={() => clearRule(draft)}
                      disabled={draft.saving}
                      aria-label={m.wordoftheday.ruleClearAria({ name: draft.name })}
                    >
                      <i class="fa-solid fa-trash" aria-hidden="true"></i>
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

  {:else if activeTab === 'words'}
    <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
      <div class="rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-wand-magic-sparkles"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.wordoftheday.wordsAddTitle()}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input type="text"
                 bind:value={newWord}
                 placeholder={m.common.word()}
                 maxlength="64"
                 aria-label={m.wordoftheday.wordsWordAria()}
                 class="md:col-span-3 p-3 rounded-xl border transition-all min-h-[44px] text-base"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                 onkeydown={(e) => e.key === 'Enter' && addWord()}
          >
          <input type="text"
                 bind:value={newDefinition}
                 placeholder={m.wordoftheday.wordsDefinitionPlaceholder()}
                 maxlength="1000"
                 aria-label={m.wordoftheday.wordsDefinitionAria()}
                 class="md:col-span-7 p-3 rounded-xl border transition-all min-h-[44px] text-base"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                 onkeydown={(e) => e.key === 'Enter' && addWord()}
          >
          <button
            class="md:col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] font-medium"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            onclick={addWord}
            disabled={addingWord || !newWord.trim()}
            aria-busy={addingWord}
          >
            <i class="fa-solid fa-plus {addingWord ? 'fa-spin' : ''}" aria-hidden="true"></i>
            {addingWord ? m.common.adding() : m.common.add()}
          </button>
        </div>
      </div>

      <div class="rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-book"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.wordoftheday.wordsTitle({ count: words.length })}</h2>
        </div>

        {#if words.length === 0}
          <div class="text-center py-8">
            <i class="fa-utility-duo fa-regular fa-book"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5;"></i>
            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">{m.wordoftheday.wordsEmptyTitle()}</h3>
            <p class="text-sm" style="color: {$colorStore.muted}">
              {m.wordoftheday.wordsEmptyHint()}
            </p>
          </div>
        {:else}
          <div class="space-y-3 max-h-[32rem] overflow-y-auto">
            {#each words as word (word.id)}
              <div class="flex items-start gap-4 p-3 rounded-xl transition-all"
                   style="background: {$colorStore.primary}08;">
                <div class="flex-1 min-w-0">
                  <div class="font-semibold" style="color: {$colorStore.text}">
                    {word.word}
                    {#if word.partOfSpeech}
                      <span class="text-xs font-normal italic ml-1" style="color: {$colorStore.muted}">{word.partOfSpeech}</span>
                    {/if}
                  </div>
                  <div class="text-sm" style="color: {$colorStore.muted}">
                    {word.definition || m.wordoftheday.wordsNoDefinition()}
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-xs px-2 py-1 rounded-lg"
                       style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                    {m.wordoftheday.wordsTimesUsed({ count: word.timesUsed })}
                  </div>
                </div>
                <button
                  class="flex items-center justify-center rounded-lg transition-all hover:scale-[1.05] min-h-[44px] min-w-[44px]"
                  style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                  onclick={() => removeWord(word)}
                  aria-label={m.common.ariaRemoveWord({ word: word.word })}
                >
                  <i class="fa-solid fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  {:else if activeTab === 'history'}
    <div class="w-full" in:fade={{ duration: 200 }}>
      <div class="rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-clock"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.wordoftheday.historyTitle()}</h2>
        </div>

        {#if history.length === 0}
          <div class="text-center py-8">
            <i class="fa-utility-duo fa-regular fa-clock"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5;"></i>
            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">{m.wordoftheday.historyEmptyTitle()}</h3>
            <p class="text-sm" style="color: {$colorStore.muted}">
              {m.wordoftheday.historyEmptyHint()}
            </p>
          </div>
        {:else}
          <div class="space-y-3 max-h-[36rem] overflow-y-auto">
            {#each history as entry (entry.id)}
              <div class="p-3 rounded-xl" style="background: {$colorStore.primary}08;">
                <div class="flex items-center justify-between gap-3">
                  <div class="font-semibold" style="color: {$colorStore.text}">
                    {entry.word}
                    {#if entry.phonetic}
                      <span class="text-xs font-normal ml-1" style="color: {$colorStore.muted}">{entry.phonetic}</span>
                    {/if}
                    {#if entry.partOfSpeech}
                      <span class="text-xs font-normal italic ml-1" style="color: {$colorStore.muted}">{entry.partOfSpeech}</span>
                    {/if}
                  </div>
                  <div class="text-xs shrink-0" style="color: {$colorStore.primary}">{formatDate(entry.postedOn)}</div>
                </div>
                <div class="text-sm mt-1" style="color: {$colorStore.muted}">{entry.definition}</div>
                {#if entry.example}
                  <div class="text-xs italic mt-1" style="color: {$colorStore.muted}">"{entry.example}"</div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</DashboardPageLayout>
