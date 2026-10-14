<!-- lib/components/dashboard/import/ImportFlow.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import {
    dataImportApi,
    packImportFile,
    ImportJobStatus,
    ImportKind,
    ImportMergeMode,
    ImportSource,
    type ImportPreview,
    type ImportResult,
    type ImportSettingsResult
  } from "$lib/api/index.ts";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import { logger } from "$lib/logger";
  import { mee6ExportBookmarklet, mee6ExportSnippet } from "./mee6ExportScript";

  interface Props {
    guildId: bigint;
    /** Hides the longer explanations, for the setup wizard. */
    compact?: boolean;
    /** Called after data is written, so the page can refresh its history. */
    onimported?: () => void;
  }

  let { guildId, compact = false, onimported }: Props = $props();

  interface SourceInfo {
    id: ImportSource;
    name: () => string;
    icon: string;
    input: "none" | "file" | "key";
    brings: () => string;
    how: () => string;
    link?: { label: () => string; href: string };
  }

  const sources: SourceInfo[] = [
    {
      id: ImportSource.Mee6,
      name: () => "MEE6",
      icon: "fa-crown",
      input: "none",
      brings: m.import.flowSourceMee6Brings,
      how: m.import.flowSourceMee6How
    },
    {
      id: ImportSource.Mee6Settings,
      name: m.import.pageSourceMee6Settings,
      icon: "fa-sliders",
      input: "file",
      brings: m.import.flowSourceMee6settingsBrings,
      how: m.import.flowSourceMee6settingsHow
    },
    {
      id: ImportSource.Lurkr,
      name: () => "Lurkr",
      icon: "fa-chart-simple",
      input: "file",
      brings: m.import.flowSourceAmariBrings,
      how: m.import.flowSourceLurkrHow
    },
    {
      id: ImportSource.Polaris,
      name: () => "Polaris",
      icon: "fa-star",
      input: "file",
      brings: m.import.flowSourcePolarisBrings,
      how: m.import.flowSourcePolarisHow
    },
    {
      id: ImportSource.Arcane,
      name: () => "Arcane",
      icon: "fa-wand-magic-sparkles",
      input: "file",
      brings: m.import.flowSectionLevels,
      how: m.import.flowSourceArcaneHow,
      link: { label: m.import.flowSourceArcaneLink, href: "https://gist.github.com/SomeAspy/2b27a6d66b97db6bd1b62afac5343285" }
    },
    {
      id: ImportSource.Amari,
      name: () => "Amari",
      icon: "fa-trophy",
      input: "key",
      brings: m.import.flowSourceAmariBrings,
      how: m.import.flowSourceAmariHow,
      link: { label: m.import.flowSourceAmariLink, href: "https://amaribot.com/developer" }
    },
    {
      id: ImportSource.Tatsu,
      name: () => "Tatsu",
      icon: "fa-sparkles",
      input: "key",
      brings: m.common.xp,
      how: m.import.flowSourceTatsuHow
    },
    {
      id: ImportSource.UnbelievaBoat,
      name: () => "UnbelievaBoat",
      icon: "fa-money-bill",
      input: "key",
      brings: m.import.flowSourceUnbelievaboatBrings,
      how: m.import.flowSourceUnbelievaboatHow,
      link: { label: m.common.applications, href: "https://unbelievaboat.com/applications" }
    },
    {
      id: ImportSource.File,
      name: m.import.flowSourceFileName,
      icon: "fa-file",
      input: "file",
      brings: m.import.flowSourceFileBrings,
      how: m.import.flowSourceFileHow
    }
  ];

  let mergeOptions = $derived([
    { id: ImportMergeMode.Replace.toString(), name: m.import.flowMergeReplace() },
    { id: ImportMergeMode.KeepHigher.toString(), name: m.import.flowMergeKeepHigher() },
    { id: ImportMergeMode.Add.toString(), name: m.import.flowMergeAdd() }
  ]);

  const curveNames: Record<number, () => string> = {
    0: m.common.default,
    1: m.common.linear,
    2: m.common.quadratic,
    3: m.common.exponential,
    4: m.common.custom,
    5: m.common.legacy,
    6: () => "MEE6",
    7: () => "Lurkr",
    8: () => "Amari"
  };

  /**
   * The display name of an XP curve.
   * @param id The curve id
   */
  function curveName(id: number | null | undefined): string {
    return id === undefined || id === null ? "" : (curveNames[id]?.() ?? String(id));
  }

  const errorText: Record<string, () => string> = {
    SourceFailed: m.import.flowErrorSourceFailed,
    LeaderboardPrivate: m.import.flowErrorLeaderboardPrivate,
    NotFound: m.import.flowErrorNotFound,
    BadKey: m.import.flowErrorBadKey,
    KeyRequired: m.import.flowErrorKeyRequired,
    FileRequired: m.import.flowErrorFileRequired,
    RateLimited: m.import.flowErrorRateLimited,
    UnreadableFile: m.import.flowErrorUnreadableFile,
    Empty: m.import.flowErrorEmpty,
    GlobalCurrency: m.import.flowErrorGlobalCurrency,
    Busy: m.import.flowErrorBusy,
    JobMissing: m.import.flowErrorJobMissing,
    NotReady: m.import.flowErrorNotReady,
    WrongKind: m.import.flowErrorWrongKind,
    WrongServer: m.import.flowErrorWrongServer
  };

  const sectionNames: Record<string, () => string> = {
    welcome: m.import.flowSectionWelcome,
    levels: m.import.flowSectionLevels,
    birthdays: m.features.birthdayName,
    commands: m.common.customCommands,
    reactionRoles: m.common.reactionRoles,
    automod: m.import.flowSectionAutomod,
    twitch: m.import.flowSectionTwitch,
    economy: m.import.flowSectionEconomy
  };

  /**
   * The display name of a settings section.
   * @param key The section key
   */
  function sectionName(key: string): string {
    return sectionNames[key]?.() ?? key;
  }

  let source = $state<SourceInfo | null>(null);
  let apiKey = $state("");
  let file = $state<File | null>(null);
  let preview = $state<ImportPreview | null>(null);
  let result = $state<ImportResult | null>(null);
  let reading = $state(false);
  let writing = $state(false);
  let error = $state("");

  let mergeMode = $state(ImportMergeMode.Replace.toString());
  let minimumLevel = $state(0);
  let useSourceCurve = $state(true);
  let importRoleRewards = $state(true);
  let syncRoles = $state(false);

  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let fileInput = $state<HTMLInputElement | null>(null);
  let dragging = $state(false);

  let settingsResult = $state<ImportSettingsResult | null>(null);
  let chosenSections = $state<string[]>([]);
  let copied = $state(false);

  let isCurrency = $derived(preview?.kind === ImportKind.Currency);
  let isSettings = $derived(preview?.kind === ImportKind.Settings);
  let readyRewards = $derived(preview?.roleRewards.filter((r) => r.exists).length ?? 0);
  let canRead = $derived(
    !!source && !reading && (source.input === "none" || (source.input === "key" ? apiKey.trim().length > 0 : !!file))
  );

  onDestroy(() => {
    if (pollTimer) clearTimeout(pollTimer);
  });

  /**
   * Picks a source and clears anything read from the previous one.
   * @param next The source
   */
  function choose(next: SourceInfo) {
    source = next;
    reset();
  }

  /** Clears the read data and results, keeping the chosen source. */
  function reset() {
    if (pollTimer) clearTimeout(pollTimer);
    preview = null;
    result = null;
    settingsResult = null;
    error = "";
    apiKey = "";
    file = null;
    reading = false;
  }

  /**
   * Turns an API failure into words.
   * @param err The thrown error
   */
  function describe(err: unknown): string {
    const code = err instanceof Error ? err.message : "";
    return errorText[code]?.() ?? m.import.flowErrorGeneric();
  }

  /** Sends the source to the bot and follows the job until the data is read. */
  async function read() {
    if (!source || !canRead) return;
    error = "";
    result = null;
    reading = true;
    try {
      const fileGzip = source.input === "file" && file ? await packImportFile(file) : undefined;
      preview = await dataImportApi.start(guildId, {
        source: source.id,
        apiKey: source.input === "key" ? apiKey.trim() : undefined,
        fileGzip
      });
      useSourceCurve = preview.nativeCurve !== undefined && preview.nativeCurve !== null;
      follow();
    } catch (err) {
      logger.error("Failed to start an import:", err);
      error = describe(err);
      reading = false;
    }
  }

  /** Polls the job once a second while it is still reading. */
  function follow() {
    if (!preview) return;
    if (preview.status !== ImportJobStatus.Fetching) {
      reading = false;
      chosenSections = preview.sections?.map((s) => s.key) ?? [];
      if (preview.status === ImportJobStatus.Failed) {
        error = (errorText[preview.error ?? ""] ?? errorText.SourceFailed)();
        preview = null;
      }
      return;
    }

    pollTimer = setTimeout(async () => {
      try {
        if (preview) preview = await dataImportApi.getJob(guildId, preview.jobId);
        follow();
      } catch (err) {
        logger.error("Failed to check an import:", err);
        error = describe(err);
        reading = false;
        preview = null;
      }
    }, 1000);
  }

  /** Writes the previewed data. */
  async function write() {
    if (!preview) return;
    writing = true;
    error = "";
    try {
      if (isSettings) {
        settingsResult = await dataImportApi.applySettings(guildId, preview.jobId, chosenSections);
        onimported?.();
        return;
      }
      result = isCurrency
        ? await dataImportApi.applyCurrency(guildId, preview.jobId, Number(mergeMode))
        : await dataImportApi.applyXp(guildId, preview.jobId, {
          mergeMode: Number(mergeMode),
          minimumLevel: Math.max(0, Math.floor(minimumLevel || 0)),
          useSourceCurve,
          importRoleRewards,
          syncRoles
        });
      onimported?.();
    } catch (err) {
      logger.error("Failed to write an import:", err);
      error = describe(err);
    } finally {
      writing = false;
    }
  }

  /** Copies the MEE6 export script for pasting into the browser console. */
  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(mee6ExportSnippet);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (err) {
      logger.error("Failed to copy the export script:", err);
    }
  }

  /**
   * Adds or removes a settings section from the import.
   * @param key The section key
   * @param on Whether to include it
   */
  function toggleSection(key: string, on: boolean) {
    chosenSections = on ? [...new Set([...chosenSections, key])] : chosenSections.filter((k) => k !== key);
  }

  /**
   * Takes a dropped or picked file.
   * @param files The files
   */
  function takeFile(files: FileList | null | undefined) {
    const picked = files?.[0];
    if (picked) file = picked;
  }

  /**
   * A whole number with separators.
   * @param value The number
   */
  function count(value: unknown): string {
    return Number(value ?? 0).toLocaleString();
  }
</script>

<div class="space-y-6">
  {#if !compact}
    <p class="text-sm" style="color: {$colorStore.muted}">
      {m.import.flowIntro()}
    </p>
  {/if}

  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {#each sources as option (option.id)}
      {@const active = source?.id === option.id}
      <button
        type="button"
        class="flex flex-col items-center justify-center gap-2 p-4 rounded-xl min-h-[88px] transition-all hover:scale-[1.02]"
        style="background: {active ? $colorStore.primary + '20' : $colorStore.primary + '08'};
               border: 1px solid {active ? $colorStore.primary : $colorStore.primary + '20'};"
        aria-pressed={active}
        onclick={() => choose(option)}
      >
        <i class="fa-utility-duo fa-regular {option.icon}" aria-hidden="true"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 22px;"></i>
        <span class="text-sm font-medium" style="color: {$colorStore.text}">{option.name()}</span>
      </button>
    {/each}
  </div>

  {#if source}
    <div class="rounded-xl p-4 space-y-4" style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;"
         in:fly={{ y: 10, duration: 200 }}>
      <div>
        <p class="text-sm font-medium" style="color: {$colorStore.text}">{m.import.flowBringsOver({ brings: source.brings() })}</p>
        <p class="text-sm mt-1" style="color: {$colorStore.muted}">
          {source.how()}
          {#if source.link}
            <a class="underline ml-1" href={source.link.href} rel="noopener noreferrer" target="_blank"
               style="color: {$colorStore.primary}">{source.link.label()}</a>
          {/if}
        </p>
      </div>

      {#if source.id === ImportSource.Mee6Settings}
        <div class="flex flex-wrap items-center gap-3">
          <a
            href={mee6ExportBookmarklet}
            class="px-4 rounded-lg min-h-[44px] text-sm font-medium flex items-center gap-2 cursor-grab"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px dashed {$colorStore.primary}60;"
            onclick={(e) => e.preventDefault()}
            draggable="true"
            title={m.import.flowBookmarkletTitle()}
          >
            <i class="fa-solid fa-bookmark" aria-hidden="true"></i>
            {m.import.flowExportFromMee6()}
          </a>
          <button
            type="button"
            class="px-4 rounded-lg min-h-[44px] text-sm font-medium flex items-center gap-2"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            onclick={copySnippet}
          >
            <i class="fa-solid {copied ? 'fa-check' : 'fa-copy'}" aria-hidden="true"></i>
            {copied ? m.common.copied() : m.import.flowCopyScript()}
          </button>
        </div>
        <p class="text-xs" style="color: {$colorStore.muted}">
          {m.import.flowMee6Instructions()}
        </p>
      {/if}

      {#if source.input === "key"}
        <input
          type="password"
          autocomplete="off"
          class="w-full px-3 rounded-lg border min-h-[44px]"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          placeholder={m.import.flowKeyPlaceholder()}
          aria-label={m.import.flowKeyAria({ name: source.name() })}
          bind:value={apiKey}
        />
      {:else if source.input === "file"}
        <button
          type="button"
          class="w-full flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed min-h-[88px] transition-all"
          style="border-color: {dragging ? $colorStore.primary : $colorStore.primary + '30'}; background: {dragging ? $colorStore.primary + '10' : 'transparent'};"
          onclick={() => fileInput?.click()}
          ondragover={(e) => { e.preventDefault(); dragging = true; }}
          ondragleave={() => { dragging = false; }}
          ondrop={(e) => { e.preventDefault(); dragging = false; takeFile(e.dataTransfer?.files); }}
        >
          <i class="fa-utility-duo fa-regular fa-cloud-arrow-up" aria-hidden="true"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 22px;"></i>
          <span class="text-sm" style="color: {$colorStore.text}">
            {file ? m.import.flowFileSummary({ name: file.name, size: (file.size / 1024 / 1024).toFixed(1) }) : m.import.flowDropFile()}
          </span>
        </button>
        <input bind:this={fileInput} type="file" accept=".json,.csv,.txt,application/json,text/csv,text/plain"
               class="hidden" onchange={(e) => takeFile((e.target as HTMLInputElement).files)} />
      {/if}

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="px-5 rounded-lg min-h-[44px] text-sm font-medium flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          disabled={!canRead}
          onclick={read}
        >
          <i class="fa-solid {reading ? 'fa-arrows-rotate fa-spin' : 'fa-download'}" aria-hidden="true"></i>
          {reading ? m.import.flowReading() : preview ? m.import.flowReadAgain() : m.import.flowReadData()}
        </button>
        {#if reading && preview}
          <span class="text-sm" style="color: {$colorStore.muted}">{m.import.flowMembersSoFar({ count: count(preview.progress) })}</span>
        {/if}
      </div>
    </div>
  {/if}

  {#if error}
    <div class="p-4 rounded-xl flex items-center gap-3" role="alert"
         style="background: #ef444415; border: 1px solid #ef444430; color: #ef4444;">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <span class="text-sm">{error}</span>
    </div>
  {/if}

  {#if preview && isSettings && preview.status !== ImportJobStatus.Fetching && !settingsResult}
    <div class="rounded-xl p-4 space-y-4" style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;"
         in:fly={{ y: 10, duration: 200 }}>
      <p class="text-sm" style="color: {$colorStore.muted}">
        {m.import.flowSettingsIntro()}
      </p>
      {#each preview.sections ?? [] as section (section.key)}
        <div class="space-y-2">
          <ToggleRow
            checked={chosenSections.includes(section.key)}
            colors={$colorStore}
            title={sectionName(section.key)}
            subtitle={section.count === 1 ? m.common.itemsOne({ count: section.count }) : m.common.itemsOther({ count: section.count })}
            onchange={(value) => toggleSection(section.key, value)}
          />
          <ul class="pl-4 space-y-1">
            {#each section.details.slice(0, 12) as line, i (i)}
              <li class="text-xs" style="color: {$colorStore.muted}">{line}</li>
            {/each}
            {#if section.details.length > 12}
              <li class="text-xs" style="color: {$colorStore.muted}">{m.import.flowAndMore({ count: section.details.length - 12 })}</li>
            {/if}
          </ul>
        </div>
      {/each}
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="px-5 rounded-lg min-h-[44px] text-sm font-medium flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          disabled={writing || chosenSections.length === 0}
          onclick={write}
        >
          <i class="fa-solid {writing ? 'fa-arrows-rotate fa-spin' : 'fa-file-import'}" aria-hidden="true"></i>
          {writing ? m.import.flowImporting() : m.import.flowImportSettings()}
        </button>
        <span class="text-xs" style="color: {$colorStore.muted}">{m.import.flowUndoHint()}</span>
      </div>
    </div>
  {/if}

  {#if settingsResult}
    <div class="p-4 rounded-xl space-y-1" role="status" in:fly={{ y: 10, duration: 200 }}
         style="background: #10b98115; border: 1px solid #10b98130;">
      {#each settingsResult.sections as section (section.section)}
        <p class="text-sm" style="color: {section.failed ? '#ef4444' : $colorStore.text}">
          {#if section.failed}
            {m.import.flowSectionFailed({ section: sectionName(section.section) })}
          {:else if section.skipped}
            {m.import.flowSectionWrittenSkipped({ section: sectionName(section.section), written: section.written, skipped: section.skipped })}
          {:else}
            {m.import.flowSectionWritten({ section: sectionName(section.section), written: section.written })}
          {/if}
        </p>
      {/each}
    </div>
  {/if}

  {#if preview && !isSettings && preview.status !== ImportJobStatus.Fetching && !result}
    <div class="rounded-xl p-4 space-y-5" style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;"
         in:fly={{ y: 10, duration: 200 }}>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}10;">
          <p class="text-xs" style="color: {$colorStore.muted}">{m.import.flowMembersFound()}</p>
          <p class="text-xl font-bold" style="color: {$colorStore.text}">{count(preview.memberCount)}</p>
        </div>
        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}10;">
          <p class="text-xs" style="color: {$colorStore.muted}">{isCurrency ? m.import.flowHaveBalance() : m.import.flowHaveXp()}</p>
          <p class="text-xl font-bold" style="color: {$colorStore.text}">{count(preview.existingCount)}</p>
        </div>
        {#if !isCurrency}
          <div class="p-3 rounded-lg" style="background: {$colorStore.primary}10;">
            <p class="text-xs" style="color: {$colorStore.muted}">{m.import.flowLevelRoles()}</p>
            <p class="text-xl font-bold" style="color: {$colorStore.text}">{readyRewards}</p>
          </div>
        {/if}
      </div>

      {#if preview.top.length}
        <div>
          <p class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.topMembers()}</p>
          <ul class="space-y-1">
            {#each preview.top as member, i (member.userId)}
              <li class="flex items-center gap-3 px-3 rounded-lg min-h-[44px]" style="background: {$colorStore.primary}06;">
                <span class="w-6 text-sm text-right" style="color: {$colorStore.muted}">{i + 1}</span>
                {#if member.avatarUrl}
                  <img src={member.avatarUrl} alt="" class="w-7 h-7 rounded-full" loading="lazy" />
                {:else}
                  <span class="w-7 h-7 rounded-full" style="background: {$colorStore.primary}20;"></span>
                {/if}
                <span class="flex-1 truncate text-sm" style="color: {$colorStore.text}">{member.name ?? member.userId}</span>
                <span class="text-sm" style="color: {$colorStore.muted}">
                  {#if isCurrency}
                    {m.import.flowMemberCurrency({ cash: count(member.cash), bank: count(member.bank) })}
                  {:else}
                    {member.level !== undefined && member.level !== null ? m.import.flowMemberXpLevel({ level: member.level, xp: count(member.xp) }) : m.common.xpXp({ xp: count(member.xp) })}
                  {/if}
                </span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if !isCurrency && preview.roleRewards.length}
        <div>
          <p class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.import.flowLevelRoles()}</p>
          <div class="flex flex-wrap gap-2">
            {#each preview.roleRewards as reward (reward.level)}
              <span class="px-3 py-1.5 rounded-lg text-sm"
                    style="background: {reward.exists ? $colorStore.primary + '15' : '#ef444415'}; color: {reward.exists ? $colorStore.text : '#ef4444'};">
                {reward.exists ? m.import.flowRewardRole({ level: reward.level, role: reward.roleName ?? '' }) : m.import.flowRewardDeleted({ level: reward.level })}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <div class="space-y-3">
        <div>
          <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            {isCurrency ? m.import.flowMergeBalances() : m.import.flowMergeXp()}
          </span>
          <DiscordSelector type="custom" options={mergeOptions} bind:selected={mergeMode} searchable={false} />
        </div>

        {#if !isCurrency}
          {#if preview.nativeCurve !== undefined && preview.nativeCurve !== null}
            <ToggleRow
              checked={useSourceCurve}
              colors={$colorStore}
              title={m.import.flowUseCurve({ curve: curveName(preview.nativeCurve) })}
              subtitle={useSourceCurve
                ? m.import.flowCurveKeepExact({ curve: curveName(preview.currentCurve) })
                : m.import.flowCurveKeepLevels({ curve: curveName(preview.currentCurve) })}
              onchange={(value) => { useSourceCurve = value; }}
            />
          {/if}

          {#if readyRewards > 0}
            <ToggleRow
              checked={importRoleRewards}
              colors={$colorStore}
              title={m.import.flowImportRoles()}
              subtitle={m.import.flowImportRolesHint()}
              onchange={(value) => { importRoleRewards = value; }}
            />
          {/if}

          <ToggleRow
            checked={syncRoles}
            colors={$colorStore}
            title={m.import.flowSyncRoles()}
            subtitle={m.import.flowSyncRolesHint()}
            onchange={(value) => { syncRoles = value; }}
          />

          <div>
            <label for="import-min-level" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.import.flowMinLevel()}
            </label>
            <input
              id="import-min-level"
              type="number"
              min="0"
              class="w-32 px-3 rounded-lg border min-h-[44px]"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              bind:value={minimumLevel}
            />
          </div>
        {/if}
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="px-5 rounded-lg min-h-[44px] text-sm font-medium flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          disabled={writing}
          onclick={write}
        >
          <i class="fa-solid {writing ? 'fa-arrows-rotate fa-spin' : 'fa-file-import'}" aria-hidden="true"></i>
          {writing ? m.import.flowImporting() : m.import.flowImportMembers({ count: count(preview.memberCount) })}
        </button>
        <span class="text-xs" style="color: {$colorStore.muted}">{m.import.flowUndoHint()}</span>
      </div>
    </div>
  {/if}

  {#if result}
    <div class="p-4 rounded-xl space-y-1" role="status" in:fly={{ y: 10, duration: 200 }}
         style="background: #10b98115; border: 1px solid #10b98130;">
      <p class="text-sm font-medium" style="color: #10b981">
        {isCurrency ? m.import.flowResultBalances({ count: count(result.members) }) : m.import.flowResultXp({ count: count(result.members) })}
      </p>
      {#if result.skipped > 0}
        <p class="text-sm" style="color: {$colorStore.text}">{m.import.flowResultSkipped({ count: count(result.skipped) })}</p>
      {/if}
      {#if result.roleRewards > 0}
        <p class="text-sm" style="color: {$colorStore.text}">{m.import.flowResultRoles({ count: result.roleRewards })}</p>
      {/if}
      {#if result.curveChanged !== undefined && result.curveChanged !== null}
        <p class="text-sm" style="color: {$colorStore.text}">{m.import.flowResultCurve({ curve: curveName(result.curveChanged) })}</p>
      {/if}
    </div>
  {/if}
</div>
