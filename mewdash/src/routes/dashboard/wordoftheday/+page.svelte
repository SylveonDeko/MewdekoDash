<!-- routes/dashboard/wordoftheday/+page.svelte -->
<script lang="ts">
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
    type WordOfTheDayHistoryEntry,
    type WordOfTheDaySchedule,
    type WordOfTheDayWord
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { TIMEZONE_OPTIONS } from "$lib/config/timezones";
  import { requestConfirmation } from "$lib/stores/confirmationStore";

  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
    id: i.toString(),
    name: `${i.toString().padStart(2, "0")}:00`
  }));

  const MODE_OPTIONS = [
    { id: WordSourceMode.Dictionary.toString(), name: "Dictionary (Datamuse)" },
    { id: WordSourceMode.Custom.toString(), name: "Custom list only" },
    { id: WordSourceMode.Mixed.toString(), name: "Custom list first, then dictionary" }
  ];

  const POS_OPTIONS = [
    { id: WordPartOfSpeech.Any.toString(), name: "Any" },
    { id: WordPartOfSpeech.Noun.toString(), name: "Noun" },
    { id: WordPartOfSpeech.Verb.toString(), name: "Verb" },
    { id: WordPartOfSpeech.Adjective.toString(), name: "Adjective" },
    { id: WordPartOfSpeech.Adverb.toString(), name: "Adverb" }
  ];

  const DIFFICULTY_OPTIONS = [
    { id: WordDifficulty.Any.toString(), name: "Any" },
    { id: WordDifficulty.Common.toString(), name: "Common" },
    { id: WordDifficulty.Moderate.toString(), name: "Moderate" },
    { id: WordDifficulty.Rare.toString(), name: "Rare" }
  ];

  const THREAD_ARCHIVE_OPTIONS = [
    { id: "60", name: "1 hour" },
    { id: "1440", name: "1 day" },
    { id: "4320", name: "3 days" },
    { id: "10080", name: "1 week" }
  ];

  const DEFAULT_THREAD_NAME = "Word of the day: %wotd.word%";

  const RULE_POS_OPTIONS = [{ id: "0", name: "Inherit" }, ...POS_OPTIONS.slice(1)];
  const RULE_DIFFICULTY_OPTIONS = [{ id: "0", name: "Inherit" }, ...DIFFICULTY_OPTIONS.slice(1)];

  const TEMPLATE_PLACEHOLDERS = [
    { category: "Word", name: "%wotd.word%", description: "The word itself" },
    { category: "Word", name: "%wotd.definition%", description: "The definition" },
    { category: "Word", name: "%wotd.pos%", description: "Part of speech" },
    { category: "Word", name: "%wotd.example%", description: "Example sentence, if any" },
    { category: "Word", name: "%wotd.phonetic%", description: "Pronunciation, if any" },
    { category: "Word", name: "%wotd.date%", description: "Today's date in the server timezone" },
    { category: "Word", name: "%wotd.ping%", description: "Mention of the ping role, if set" },
    { category: "Server", name: "%server.name%", description: "Server name" }
  ];

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

  $effect(() => {
    if (!config) return;

    let parsed: string | Record<string, any> | null = config.messageTemplate;
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

    form = {
      channelId: config.channelId,
      enabled: config.enabled,
      postHour: config.postHour,
      timezone: config.timezone || "UTC",
      pingRoleId: config.pingRoleId,
      messageTemplate: parsed,
      topic: config.topic ?? "",
      partOfSpeech: config.partOfSpeech,
      difficulty: config.difficulty,
      sourceMode: config.sourceMode,
      createThread: config.createThread,
      threadName: config.threadName ?? "",
      threadAutoArchiveMinutes: config.threadAutoArchiveMinutes || 1440
    };
  });

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
      showMessage("Failed to load Word of the Day data", "error");
    } finally {
      loading = false;
    }
  }

  async function saveConfig() {
    if (!$currentGuild?.id) return;
    saving = true;
    try {
      const template =
        typeof form.messageTemplate === "object" && form.messageTemplate !== null &&
        Object.keys(form.messageTemplate).length > 0
          ? JSON.stringify(form.messageTemplate)
          : typeof form.messageTemplate === "string"
            ? form.messageTemplate
            : "";

      await wordOfTheDayApi.updateConfig($currentGuild.id, {
        channelId: form.channelId ?? 0n,
        enabled: form.enabled,
        postHour: form.postHour,
        timezone: form.timezone,
        pingRoleId: form.pingRoleId ?? 0n,
        messageTemplate: template,
        topic: form.topic.trim(),
        partOfSpeech: form.partOfSpeech,
        difficulty: form.difficulty,
        sourceMode: form.sourceMode,
        createThread: form.createThread,
        threadName: form.threadName.trim(),
        threadAutoArchiveMinutes: form.threadAutoArchiveMinutes
      });
      config = await wordOfTheDayApi.getConfig($currentGuild.id);
    } catch (err) {
      logger.error("Failed to save word of the day config:", err);
      showMessage("Failed to save configuration", "error");
    } finally {
      saving = false;
    }
  }

  async function resetConfig() {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: "Reset Word of the Day",
      message: "This removes the configuration, every custom word, all weekday and month rules, and the posting history for this server.",
      confirmText: "Reset everything",
      variant: "danger"
    });
    if (!ok) return;

    saving = true;
    try {
      await wordOfTheDayApi.resetConfig($currentGuild.id);
      await loadAll();
    } catch (err) {
      logger.error("Failed to reset word of the day config:", err);
      showMessage("Failed to reset configuration", "error");
    } finally {
      saving = false;
    }
  }

  async function postNow() {
    if (!$currentGuild?.id) return;
    posting = true;
    try {
      const entry = await wordOfTheDayApi.postNow($currentGuild.id);
      showMessage(`Posted "${entry.word}" to the channel`, "success");
      history = await wordOfTheDayApi.getHistory($currentGuild.id, 30).catch(() => history);
      config = await wordOfTheDayApi.getConfig($currentGuild.id).catch(() => config);
    } catch (err: any) {
      logger.error("Failed to post word of the day:", err);
      showMessage(err?.message || "Failed to post a word. Check the channel and filters.", "error");
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
      showMessage(`Failed to save the ${draft.name} rule`, "error");
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
      showMessage(`Failed to clear the ${draft.name} rule`, "error");
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
      showMessage(err?.message || "Couldn't add that word. Try supplying a definition.", "error");
    } finally {
      addingWord = false;
    }
  }

  async function removeWord(word: WordOfTheDayWord) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      message: `Remove "${word.word}" from the custom list?`,
      confirmText: "Remove"
    });
    if (!ok) return;

    try {
      await wordOfTheDayApi.removeWord($currentGuild.id, word.word);
      words = words.filter((w) => w.id !== word.id);
      if (config) config = { ...config, customWordCount: words.length };
    } catch (err) {
      logger.error("Failed to remove custom word:", err);
      showMessage("Failed to remove the word", "error");
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
    if (!channelId) return "Not set";
    const channel = guildChannels.find((c) => c.id === channelId.toString());
    return channel ? `#${channel.name}` : "Unknown channel";
  }

  function getRoleName(roleId: bigint | null | undefined): string {
    if (!roleId) return "None";
    const role = guildRoles.find((r) => r.id === roleId.toString());
    return role ? `@${role.name}` : "Unknown role";
  }

  function optionName(options: Array<{ id: string; name: string }>, value: number): string {
    return options.find((o) => o.id === value.toString())?.name ?? "Any";
  }

  function formatDate(value: string | null | undefined): string {
    if (!value) return "Never";
    return new Date(value).toLocaleDateString();
  }

  function selectedNumber(detail: { selected: string | string[] | null }, fallback: number): number {
    return detail.selected && typeof detail.selected === "string" ? parseInt(detail.selected) : fallback;
  }

  function describeRule(draft: RuleDraft): string {
    const parts: string[] = [];
    if (draft.topic.trim()) parts.push(`topic "${draft.topic.trim()}"`);
    if (draft.partOfSpeech) parts.push(optionName(POS_OPTIONS, draft.partOfSpeech).toLowerCase());
    if (draft.difficulty) parts.push(optionName(DIFFICULTY_OPTIONS, draft.difficulty).toLowerCase());
    return parts.length ? parts.join(", ") : "inherits base settings";
  }

  let ruleCount = $derived(rules.length);

  onMount(() => {
    loadAll();
  });

  const tabs = [
    { id: "settings", label: "Settings", icon: "fa-gear" },
    { id: "schedule", label: "Schedule", icon: "fa-calendar" },
    { id: "words", label: "Custom Words", icon: "fa-list" },
    { id: "history", label: "History", icon: "fa-clock-rotate-left" }
  ];

  let actionButtons = $derived([
    {
      label: "Post now",
      icon: "fa-paper-plane",
      action: postNow,
      loading: posting
    },
    {
      label: "Refresh",
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

  {#if config && config.enabled && !config.channelId}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3"
         style="background: {$colorStore.accent}20; border: 1px solid {$colorStore.accent}30;"
         in:fly={{ x: -20, duration: 300 }}>
      <i class="fa-utility-duo fa-regular fa-circle-exclamation"
         style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
      <span style="color: {$colorStore.text}">Posting is enabled but no channel is set, so nothing will be posted.</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-book-open"
  statusMessages={statusMessageContent}
  subtitle="A daily vocabulary word with topics, filters, and a custom list"
  {tabs}
  title="Word of the Day"
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
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Posting</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-hashtag" style="font-size: 14px;"></i>
              Channel
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="channel"
                options={guildChannels}
                selected={form.channelId?.toString() || null}
                placeholder="No channel selected"
                onchange={(detail) => {
                  form.channelId = detail.selected && typeof detail.selected === 'string' ? BigInt(detail.selected) : null;
                  if (!form.channelId) form.enabled = false;
                }}
              />
            </div>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-clock" style="font-size: 14px;"></i>
              Post at
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={HOUR_OPTIONS}
                selected={form.postHour.toString()}
                placeholder="Hour"
                searchable={false}
                onchange={(detail) => { form.postHour = selectedNumber(detail, 9); }}
              />
            </div>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-location-dot" style="font-size: 14px;"></i>
              Timezone
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="timezone"
                options={TIMEZONE_OPTIONS}
                selected={form.timezone}
                placeholder="Select timezone"
                onchange={(detail) => {
                  form.timezone = detail.selected && typeof detail.selected === 'string' ? detail.selected : "UTC";
                }}
              />
            </div>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-bell" style="font-size: 14px;"></i>
              Ping role
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="role"
                options={guildRoles}
                selected={form.pingRoleId?.toString() || null}
                placeholder="No ping role"
                onchange={(detail) => {
                  form.pingRoleId = detail.selected && typeof detail.selected === 'string' ? BigInt(detail.selected) : null;
                }}
              />
            </div>
          </div>
        </div>

        <div class="mt-6">
          <ToggleRow
            checked={form.enabled}
            title="Post a word every day"
            subtitle={form.channelId ? "Runs at the hour above in the selected timezone" : "Pick a channel first"}
            colors={$colorStore}
            disabled={!form.channelId}
            onchange={(checked) => { form.enabled = checked; }}
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
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Word source</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-book" style="font-size: 14px;"></i>
              Source
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={MODE_OPTIONS}
                selected={form.sourceMode.toString()}
                placeholder="Source"
                searchable={false}
                onchange={(detail) => { form.sourceMode = selectedNumber(detail, WordSourceMode.Dictionary); }}
              />
            </div>
          </div>

          <div>
            <label for="wotd-topic" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-tag" style="font-size: 14px;"></i>
              Topic
            </label>
            <input id="wotd-topic"
                   type="text"
                   bind:value={form.topic}
                   placeholder="e.g. science, cooking, space"
                   maxlength="80"
                   class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-font" style="font-size: 14px;"></i>
              Part of speech
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={POS_OPTIONS}
                selected={form.partOfSpeech.toString()}
                placeholder="Any"
                searchable={false}
                onchange={(detail) => { form.partOfSpeech = selectedNumber(detail, WordPartOfSpeech.Any); }}
              />
            </div>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-sliders" style="font-size: 14px;"></i>
              Difficulty
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={DIFFICULTY_OPTIONS}
                selected={form.difficulty.toString()}
                placeholder="Any"
                searchable={false}
                onchange={(detail) => { form.difficulty = selectedNumber(detail, WordDifficulty.Any); }}
              />
            </div>
          </div>
        </div>

        <p class="text-xs mt-4" style="color: {$colorStore.muted}">
          Topic and filters apply to dictionary words. Up to five topic words, e.g. "medieval history". Difficulty is based on how often a word appears in written English. Weekday and month rules on the Schedule tab override these.
        </p>
      </div>

      <!-- Discussion thread -->
      <div class="relative z-[15] rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-comments"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Discussion thread</h2>
        </div>

        <ToggleRow
          checked={form.createThread}
          title="Create a thread under each post"
          subtitle="Invites people to use the word in a sentence"
          colors={$colorStore}
          onchange={(checked) => { form.createThread = checked; }}
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
          <div>
            <label for="wotd-thread-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-input-text" style="font-size: 14px;"></i>
              Thread name
            </label>
            <input id="wotd-thread-name"
                   type="text"
                   bind:value={form.threadName}
                   placeholder={DEFAULT_THREAD_NAME}
                   maxlength="100"
                   disabled={!form.createThread}
                   class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base disabled:opacity-50"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
            <p class="text-xs mt-2" style="color: {$colorStore.muted}">
              Leave empty to use the default, "{DEFAULT_THREAD_NAME}". Supports %wotd.word%, %wotd.date%, %wotd.pos%, and server placeholders.
            </p>
          </div>

          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              <i class="fa-solid fa-box-archive" style="font-size: 14px;"></i>
              Auto-archive after
            </span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={THREAD_ARCHIVE_OPTIONS}
                selected={form.threadAutoArchiveMinutes.toString()}
                placeholder="Auto-archive"
                searchable={false}
                disabled={!form.createThread}
                onchange={(detail) => { form.threadAutoArchiveMinutes = selectedNumber(detail, 1440); }}
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
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Message template</h2>
        </div>

        <FullscreenEmbedBuilder id="wotd-template"
                                bind:value={form.messageTemplate}
                                previewTitle="Word of the Day"
                                previewDescription="Message posted each day"
                                icon="fa-book-open"
                                allowContent={true}
                                allowMultipleEmbeds={true}
                                maxEmbeds={10}
                                allowComponents={true}
                                additionalPlaceholders={TEMPLATE_PLACEHOLDERS}
                                guildId={$currentGuild?.id}
                                user={data.user}
                                placeholder="Click to build a custom message, or leave empty for the default embed"
        />

        <p class="text-xs mt-3" style="color: {$colorStore.muted}">
          Leave empty to use the built-in embed with pronunciation, definition, and example.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
        <button
          class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          onclick={saveConfig}
          disabled={saving}
          aria-busy={saving}
        >
          <i class="fa-solid fa-floppy-disk {saving ? 'fa-spin' : ''}" style="font-size: 18px;" aria-hidden="true"></i>
          <span class="text-sm sm:text-base">{saving ? "Saving..." : "Save Configuration"}</span>
        </button>

        <button
          class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
          style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30;"
          onclick={resetConfig}
          disabled={saving}
        >
          <i class="fa-solid fa-arrows-rotate" style="font-size: 20px;"></i>
          Reset everything
        </button>
      </div>

      <!-- Current configuration -->
      <div class="rounded-2xl border p-6 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-circle-exclamation"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Current configuration</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">Status:</span>
            <span style="color: {config?.enabled ? '#10b981' : $colorStore.text}">{config?.enabled ? "Enabled" : "Disabled"}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">Channel:</span>
            <span style="color: {$colorStore.text}">{getChannelName(config?.channelId)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">Posts at:</span>
            <span style="color: {$colorStore.text}">{(config?.postHour ?? 9).toString().padStart(2, "0")}:00 {config?.timezone ?? "UTC"}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">Ping role:</span>
            <span style="color: {$colorStore.text}">{getRoleName(config?.pingRoleId)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">Source:</span>
            <span style="color: {$colorStore.text}">{optionName(MODE_OPTIONS, config?.sourceMode ?? 0)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">Custom words:</span>
            <span style="color: {$colorStore.text}">{config?.customWordCount ?? 0}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">Schedule rules:</span>
            <span style="color: {$colorStore.text}">{ruleCount}</span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">Discussion thread:</span>
            <span style="color: {config?.createThread ? '#10b981' : $colorStore.text}">
              {config?.createThread
                ? `On, ${optionName(THREAD_ARCHIVE_OPTIONS, config?.threadAutoArchiveMinutes ?? 1440)}, "${config?.threadName || DEFAULT_THREAD_NAME}"`
                : "Off"}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span style="color: {$colorStore.muted}">Last posted:</span>
            <span style="color: {$colorStore.text}">{formatDate(config?.lastPostedDate)}</span>
          </div>
        </div>
      </div>
    </div>

  {:else if activeTab === 'schedule'}
    <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
      <p class="text-sm" style="color: {$colorStore.muted}">
        Each rule only overrides what it sets and inherits the rest from the Settings tab. Weekday rules win over month rules.
      </p>

      {#each [{ title: "Weekdays", icon: "fa-calendar", drafts: dayDrafts }, { title: "Months", icon: "fa-calendar", drafts: monthDrafts }] as group}
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
                         placeholder="Topic (optional)"
                         maxlength="80"
                         aria-label="{draft.name} topic"
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
                    placeholder="Part of speech"
                    searchable={false}
                    onchange={(detail) => { draft.partOfSpeech = selectedNumber(detail, 0); }}
                  />
                </div>

                <div class="lg:col-span-2 min-h-[44px]">
                  <DiscordSelector
                    type="custom"
                    options={RULE_DIFFICULTY_OPTIONS}
                    selected={draft.difficulty.toString()}
                    placeholder="Difficulty"
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
                    aria-label="Save {draft.name} rule"
                  >
                    <i class="fa-solid fa-floppy-disk {draft.saving ? 'fa-spin' : ''}" aria-hidden="true"></i>
                    Save
                  </button>
                  {#if draft.exists}
                    <button
                      class="flex items-center justify-center px-3 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] min-w-[44px] text-sm"
                      style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                      onclick={() => clearRule(draft)}
                      disabled={draft.saving}
                      aria-label="Clear {draft.name} rule"
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
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Add a word</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input type="text"
                 bind:value={newWord}
                 placeholder="Word"
                 maxlength="64"
                 aria-label="Word to add"
                 class="md:col-span-3 p-3 rounded-xl border transition-all min-h-[44px] text-base"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                 onkeydown={(e) => e.key === 'Enter' && addWord()}
          >
          <input type="text"
                 bind:value={newDefinition}
                 placeholder="Definition (optional, looked up if empty)"
                 maxlength="1000"
                 aria-label="Definition"
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
            {addingWord ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      <div class="rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-book"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Custom words ({words.length})</h2>
        </div>

        {#if words.length === 0}
          <div class="text-center py-8">
            <i class="fa-utility-duo fa-regular fa-book"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5;"></i>
            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No custom words yet</h3>
            <p class="text-sm" style="color: {$colorStore.muted}">
              Add words above, then switch the source to "Custom" or "Mixed" on the Settings tab.
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
                    {word.definition || "No definition, one will be looked up when posted"}
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-xs px-2 py-1 rounded-lg"
                       style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
                    posted {word.timesUsed}×
                  </div>
                </div>
                <button
                  class="flex items-center justify-center rounded-lg transition-all hover:scale-[1.05] min-h-[44px] min-w-[44px]"
                  style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                  onclick={() => removeWord(word)}
                  aria-label="Remove {word.word}"
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
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Recent words</h2>
        </div>

        {#if history.length === 0}
          <div class="text-center py-8">
            <i class="fa-utility-duo fa-regular fa-clock"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5;"></i>
            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">Nothing posted yet</h3>
            <p class="text-sm" style="color: {$colorStore.muted}">
              Words appear here after the first scheduled post or "Post now".
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
