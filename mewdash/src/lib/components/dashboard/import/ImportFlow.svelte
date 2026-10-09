<!-- lib/components/dashboard/import/ImportFlow.svelte -->
<script lang="ts">
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
    name: string;
    icon: string;
    input: "none" | "file" | "key";
    brings: string;
    how: string;
    link?: { label: string; href: string };
  }

  const sources: SourceInfo[] = [
    {
      id: ImportSource.Mee6,
      name: "MEE6",
      icon: "fa-crown",
      input: "none",
      brings: "XP, levels and level roles",
      how: "Make the leaderboard public in MEE6's dashboard (Leveling, Leaderboard), then read it here. Nothing else is needed."
    },
    {
      id: ImportSource.Mee6Settings,
      name: "MEE6 settings",
      icon: "fa-sliders",
      input: "file",
      brings: "Welcome messages, level settings, custom commands, reaction roles, filters, Twitch alerts and the shop",
      how: "On a computer, open your server on MEE6's dashboard and run the export below, either from your bookmarks bar or pasted into the browser console. It downloads a file with your settings, which you upload here."
    },
    {
      id: ImportSource.Lurkr,
      name: "Lurkr",
      icon: "fa-chart-simple",
      input: "file",
      brings: "XP and levels",
      how: "Export your levels from Lurkr and upload the JSON file it gives you."
    },
    {
      id: ImportSource.Polaris,
      name: "Polaris",
      icon: "fa-star",
      input: "file",
      brings: "XP, plus level roles and your curve with the Everything export",
      how: "On Polaris' website, open your server and download your XP. Any format works. Pick Everything to bring level roles too."
    },
    {
      id: ImportSource.Arcane,
      name: "Arcane",
      icon: "fa-wand-magic-sparkles",
      input: "file",
      brings: "Levels",
      how: "Arcane has no export. Open your server's leaderboard on arcane.bot, scroll until every member is loaded, run the export script in the browser console and upload the JSON it saves.",
      link: { label: "Export script", href: "https://gist.github.com/SomeAspy/2b27a6d66b97db6bd1b62afac5343285" }
    },
    {
      id: ImportSource.Amari,
      name: "Amari",
      icon: "fa-trophy",
      input: "key",
      brings: "XP and levels",
      how: "Apply for an Amari API key. Amari sends it to you in a DM, usually within a day. Paste it below.",
      link: { label: "Get a key", href: "https://amaribot.com/developer" }
    },
    {
      id: ImportSource.Tatsu,
      name: "Tatsu",
      icon: "fa-sparkles",
      input: "key",
      brings: "XP",
      how: "Run t!apikey create in any channel. Tatsu sends you a key in a DM. Paste it below."
    },
    {
      id: ImportSource.UnbelievaBoat,
      name: "UnbelievaBoat",
      icon: "fa-money-bill",
      input: "key",
      brings: "Cash and bank balances",
      how: "Create an application on UnbelievaBoat's site, authorize it on this server from the application's page, then paste its token below.",
      link: { label: "Applications", href: "https://unbelievaboat.com/applications" }
    },
    {
      id: ImportSource.File,
      name: "Other file",
      icon: "fa-file",
      input: "file",
      brings: "XP, levels or balances",
      how: "Any JSON or CSV with a user ID for each member and an XP, level, cash or bank value."
    }
  ];

  const mergeOptions = [
    { id: ImportMergeMode.Replace.toString(), name: "Replace what members have" },
    { id: ImportMergeMode.KeepHigher.toString(), name: "Keep whichever is higher" },
    { id: ImportMergeMode.Add.toString(), name: "Add on top" }
  ];

  const curveNames: Record<number, string> = {
    0: "Default",
    1: "Linear",
    2: "Quadratic",
    3: "Exponential",
    4: "Custom",
    5: "Legacy",
    6: "MEE6",
    7: "Lurkr",
    8: "Amari"
  };

  const errorText: Record<string, string> = {
    SourceFailed: "The other bot did not answer properly. Try again in a few minutes.",
    LeaderboardPrivate: "This server's MEE6 leaderboard is private. Make it public in MEE6's dashboard, then try again.",
    NotFound: "The other bot has no data for this server.",
    BadKey: "That key was rejected. Check it was copied in full.",
    KeyRequired: "Paste a key first.",
    FileRequired: "Choose a file first.",
    RateLimited: "The other bot is limiting requests right now. Try again in a few minutes.",
    UnreadableFile: "That file could not be read. Use a JSON or CSV export with a user ID and an XP or level for each member.",
    Empty: "No members were found in that data.",
    GlobalCurrency: "This bot shares one balance across every server, so balances cannot be imported into one server.",
    Busy: "Another import is already running on this server.",
    JobMissing: "That import expired. Read the data again.",
    NotReady: "That import is not ready yet.",
    WrongKind: "That data does not match. XP sources need XP or levels, and UnbelievaBoat needs balances.",
    WrongServer: "That file was exported from a different server. Run the export on this server's MEE6 dashboard."
  };

  const sectionNames: Record<string, string> = {
    welcome: "Welcome and goodbye",
    levels: "Levels",
    birthdays: "Birthdays",
    commands: "Custom commands",
    reactionRoles: "Reaction roles",
    automod: "Auto-moderation",
    twitch: "Twitch alerts",
    economy: "Economy"
  };

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
    return errorText[code] ?? "Something went wrong. Try again in a moment.";
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
        error = errorText[preview.error ?? ""] ?? errorText.SourceFailed;
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
      Moving from another bot? Bring your members' XP, levels, level roles and balances with you. You see everything
      before it is written, and an import can be undone for 24 hours.
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
        <span class="text-sm font-medium" style="color: {$colorStore.text}">{option.name}</span>
      </button>
    {/each}
  </div>

  {#if source}
    <div class="rounded-xl p-4 space-y-4" style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;"
         in:fly={{ y: 10, duration: 200 }}>
      <div>
        <p class="text-sm font-medium" style="color: {$colorStore.text}">Brings over: {source.brings}</p>
        <p class="text-sm mt-1" style="color: {$colorStore.muted}">
          {source.how}
          {#if source.link}
            <a class="underline ml-1" href={source.link.href} rel="noopener noreferrer" target="_blank"
               style="color: {$colorStore.primary}">{source.link.label}</a>
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
            title="Drag this onto your bookmarks bar, or right-click it and bookmark the link"
          >
            <i class="fa-solid fa-bookmark" aria-hidden="true"></i>
            Export from MEE6
          </a>
          <button
            type="button"
            class="px-4 rounded-lg min-h-[44px] text-sm font-medium flex items-center gap-2"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            onclick={copySnippet}
          >
            <i class="fa-solid {copied ? 'fa-check' : 'fa-copy'}" aria-hidden="true"></i>
            {copied ? "Copied" : "Copy console script"}
          </button>
        </div>
        <p class="text-xs" style="color: {$colorStore.muted}">
          Drag Export from MEE6 onto your bookmarks bar, or right-click it and bookmark the link (Firefox and Vivaldi offer
          this, Chrome and Edge need the drag). Then click the bookmark while your server is open on mee6.xyz. You can
          also copy the script and paste it into the console there (Ctrl+Shift+J, or Cmd+Option+J on a Mac). Your MEE6
          login stays in your browser and is not part of the file.
        </p>
      {/if}

      {#if source.input === "key"}
        <input
          type="password"
          autocomplete="off"
          class="w-full px-3 rounded-lg border min-h-[44px]"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          placeholder="Paste the key"
          aria-label="{source.name} key"
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
            {file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)` : "Drop the file here or choose one"}
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
          {reading ? "Reading" : preview ? "Read again" : "Read data"}
        </button>
        {#if reading && preview}
          <span class="text-sm" style="color: {$colorStore.muted}">{count(preview.progress)} members so far</span>
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
        Pick what to bring over. Names already in use and deleted channels or roles are skipped. Reaction roles keep
        working on MEE6's messages, while button menus are posted again by Mewdeko.
      </p>
      {#each preview.sections ?? [] as section (section.key)}
        <div class="space-y-2">
          <ToggleRow
            checked={chosenSections.includes(section.key)}
            colors={$colorStore}
            title={sectionNames[section.key] ?? section.key}
            subtitle={`${section.count} ${section.count === 1 ? "item" : "items"}`}
            onchange={(value) => toggleSection(section.key, value)}
          />
          <ul class="pl-4 space-y-1">
            {#each section.details.slice(0, 12) as line, i (i)}
              <li class="text-xs" style="color: {$colorStore.muted}">{line}</li>
            {/each}
            {#if section.details.length > 12}
              <li class="text-xs" style="color: {$colorStore.muted}">and {section.details.length - 12} more</li>
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
          {writing ? "Importing" : "Import settings"}
        </button>
        <span class="text-xs" style="color: {$colorStore.muted}">You can undo this for 24 hours.</span>
      </div>
    </div>
  {/if}

  {#if settingsResult}
    <div class="p-4 rounded-xl space-y-1" role="status" in:fly={{ y: 10, duration: 200 }}
         style="background: #10b98115; border: 1px solid #10b98130;">
      {#each settingsResult.sections as section (section.section)}
        <p class="text-sm" style="color: {section.failed ? '#ef4444' : $colorStore.text}">
          {sectionNames[section.section] ?? section.section}:
          {section.failed ? "could not be written" : `${section.written} written${section.skipped ? `, ${section.skipped} skipped` : ""}`}
        </p>
      {/each}
    </div>
  {/if}

  {#if preview && !isSettings && preview.status !== ImportJobStatus.Fetching && !result}
    <div class="rounded-xl p-4 space-y-5" style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;"
         in:fly={{ y: 10, duration: 200 }}>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}10;">
          <p class="text-xs" style="color: {$colorStore.muted}">Members found</p>
          <p class="text-xl font-bold" style="color: {$colorStore.text}">{count(preview.memberCount)}</p>
        </div>
        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}10;">
          <p class="text-xs" style="color: {$colorStore.muted}">{isCurrency ? "Already have a balance" : "Already have XP"}</p>
          <p class="text-xl font-bold" style="color: {$colorStore.text}">{count(preview.existingCount)}</p>
        </div>
        {#if !isCurrency}
          <div class="p-3 rounded-lg" style="background: {$colorStore.primary}10;">
            <p class="text-xs" style="color: {$colorStore.muted}">Level roles</p>
            <p class="text-xl font-bold" style="color: {$colorStore.text}">{readyRewards}</p>
          </div>
        {/if}
      </div>

      {#if preview.top.length}
        <div>
          <p class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Top members</p>
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
                    {count(member.cash)} cash, {count(member.bank)} bank
                  {:else}
                    {member.level !== undefined && member.level !== null ? `Level ${member.level}, ` : ""}{count(member.xp)} XP
                  {/if}
                </span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if !isCurrency && preview.roleRewards.length}
        <div>
          <p class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Level roles</p>
          <div class="flex flex-wrap gap-2">
            {#each preview.roleRewards as reward (reward.level)}
              <span class="px-3 py-1.5 rounded-lg text-sm"
                    style="background: {reward.exists ? $colorStore.primary + '15' : '#ef444415'}; color: {reward.exists ? $colorStore.text : '#ef4444'};">
                Level {reward.level}: {reward.exists ? reward.roleName : "deleted role, skipped"}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <div class="space-y-3">
        <div>
          <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            {isCurrency ? "Balances members already have" : "XP members already have"}
          </span>
          <DiscordSelector type="custom" options={mergeOptions} bind:selected={mergeMode} searchable={false} />
        </div>

        {#if !isCurrency}
          {#if preview.nativeCurve !== undefined && preview.nativeCurve !== null}
            <ToggleRow
              checked={useSourceCurve}
              colors={$colorStore}
              title="Use the {curveNames[preview.nativeCurve]} curve"
              subtitle={useSourceCurve
                ? `Every member keeps the exact same level and XP. This server switches from the ${curveNames[preview.currentCurve]} curve.`
                : `Members keep their levels and progress on the ${curveNames[preview.currentCurve]} curve. Their XP numbers change.`}
              onchange={(value) => { useSourceCurve = value; }}
            />
          {/if}

          {#if readyRewards > 0}
            <ToggleRow
              checked={importRoleRewards}
              colors={$colorStore}
              title="Import level roles"
              subtitle="Sets the same role for each level here. Existing roles on those levels are replaced."
              onchange={(value) => { importRoleRewards = value; }}
            />
          {/if}

          <ToggleRow
            checked={syncRoles}
            colors={$colorStore}
            title="Hand out level roles afterwards"
            subtitle="Gives every imported member the roles for their level. Takes a while on big servers."
            onchange={(value) => { syncRoles = value; }}
          />

          <div>
            <label for="import-min-level" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              Skip members below level
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
          {writing ? "Importing" : `Import ${count(preview.memberCount)} members`}
        </button>
        <span class="text-xs" style="color: {$colorStore.muted}">You can undo this for 24 hours.</span>
      </div>
    </div>
  {/if}

  {#if result}
    <div class="p-4 rounded-xl space-y-1" role="status" in:fly={{ y: 10, duration: 200 }}
         style="background: #10b98115; border: 1px solid #10b98130;">
      <p class="text-sm font-medium" style="color: #10b981">
        Imported {isCurrency ? "balances" : "XP"} for {count(result.members)} members.
      </p>
      {#if result.skipped > 0}
        <p class="text-sm" style="color: {$colorStore.text}">Skipped {count(result.skipped)} members.</p>
      {/if}
      {#if result.roleRewards > 0}
        <p class="text-sm" style="color: {$colorStore.text}">Set {result.roleRewards} level roles.</p>
      {/if}
      {#if result.curveChanged !== undefined && result.curveChanged !== null}
        <p class="text-sm" style="color: {$colorStore.text}">The XP curve is now {curveNames[result.curveChanged]}.</p>
      {/if}
    </div>
  {/if}
</div>
