<!-- routes/dashboard/process-logs/+page.svelte -->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { goto } from "$app/navigation";
  import { ownershipApi, pm2Api } from "$lib/api/index.ts";
  import { ApiError } from "$lib/api/core";
  import {
    Pm2ListSource,
    Pm2LogStream,
    type Pm2LogChunk,
    type Pm2ProcessInfo,
    type Pm2ProcessList,
    type Pm2StreamName,
  } from "$lib/api/pm2/models";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { loadingStore } from "$lib/stores/loadingStore";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import SectionHeader from "$lib/components/stats/SectionHeader.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import WindowPicker from "$lib/components/stats/WindowPicker.svelte";
  import Pill from "$lib/components/analytics/Pill.svelte";
  import type { PillTone } from "$lib/components/analytics/palette";
  import AnsiLine from "$lib/components/logs/AnsiLine.svelte";
  import { detectLevel, LOG_LEVELS, stripAnsi, type LogLevel } from "$lib/components/logs/ansi";
  import { formatBytes, formatDuration, formatNumber } from "$lib/components/stats/format";

  let { data } = $props();

  /** A log line as the viewer holds it, with the plain text and level worked out once on arrival. */
  interface ViewLine {
    id: number;
    raw: string;
    plain: string;
    /** The level printed on the line itself, or null for continuation lines such as stack traces. */
    level: LogLevel | null;
    /** The level the line belongs to, inherited from the last tagged line for continuation lines. */
    effectiveLevel: LogLevel | null;
  }

  const POLL_MS = 2000;
  const PROCESS_REFRESH_MS = 15000;
  const MAX_BUFFER = 5000;

  const streamOptions = [
    { value: Pm2LogStream.Out, label: "stdout" },
    { value: Pm2LogStream.Error, label: "stderr" },
  ];

  const lineOptions = [
    { value: 100, label: "100" },
    { value: 300, label: "300" },
    { value: 500, label: "500" },
    { value: 1000, label: "1k" },
    { value: 2000, label: "2k" },
  ];

  const levelColors: Record<LogLevel, string> = {
    VRB: "#6b7280",
    DBG: "#60a5fa",
    INF: "#4ade80",
    WRN: "#fdac41",
    ERR: "#f87171",
    FTL: "#f0abfc",
  };

  const levelNames: Record<LogLevel, string> = {
    VRB: "Verbose",
    DBG: "Debug",
    INF: "Info",
    WRN: "Warning",
    ERR: "Error",
    FTL: "Fatal",
  };

  let allowed = $state(false);

  let processList = $state<Pm2ProcessList | null>(null);
  let processesLoading = $state(true);
  let processesError = $state<string | null>(null);
  let selectedPmId = $state<number | null>(null);

  let stream = $state<number>(Pm2LogStream.Out);
  let lineCount = $state(300);
  let follow = $state(true);
  let wrap = $state(false);
  let search = $state("");
  let hiddenLevels = $state<LogLevel[]>([]);

  let lines = $state<ViewLine[]>([]);
  let chunk = $state<Pm2LogChunk | null>(null);
  let logLoading = $state(false);
  let logError = $state<string | null>(null);
  let lastUpdated = $state<Date | null>(null);
  let polling = false;
  let nextId = 0;

  let panel = $state<HTMLDivElement | null>(null);
  let atBottom = $state(true);
  let pendingNew = $state(0);
  let copied = $state(false);

  let selected = $derived(processList?.processes.find((p) => p.pmId === selectedPmId) ?? null);
  let streamName = $derived<Pm2StreamName>(stream === Pm2LogStream.Error ? "error" : "out");
  let selectedLogBytes = $derived(
    selected ? (stream === Pm2LogStream.Error ? selected.errorLogBytes : selected.outLogBytes) : undefined,
  );

  let levelCounts = $derived.by(() => {
    const counts: Record<LogLevel, number> = { VRB: 0, DBG: 0, INF: 0, WRN: 0, ERR: 0, FTL: 0 };
    for (const line of lines) {
      if (line.level) counts[line.level]++;
    }
    return counts;
  });

  let visibleLines = $derived.by(() => {
    const needle = search.trim().toLowerCase();
    return lines.filter((line) => {
      if (line.effectiveLevel && hiddenLevels.includes(line.effectiveLevel)) return false;
      return needle === "" || line.plain.toLowerCase().includes(needle);
    });
  });

  let hiddenCount = $derived(lines.length - visibleLines.length);
  let downloadUrl = $derived(selected ? pm2Api.downloadUrl(selected.pmId, streamName) : null);

  function statusTone(status: string): PillTone {
    switch (status) {
      case "online":
        return "ok";
      case "launching":
      case "stopping":
      case "waiting restart":
        return "warn";
      case "errored":
      case "stopped":
        return "crit";
      default:
        return "muted";
    }
  }

  function uptime(process: Pm2ProcessInfo): string {
    if (!process.startedAt || process.status !== "online") return "-";
    const started = new Date(process.startedAt).getTime();
    if (Number.isNaN(started)) return "-";
    return formatDuration((Date.now() - started) / 1000);
  }

  function describeError(err: unknown, fallback: string): string {
    if (err instanceof ApiError && err.status === 403) return "Only bot owners can read process logs";
    return err instanceof Error && err.message ? err.message : fallback;
  }

  /** Converts raw lines into view lines, carrying levels forward onto continuation lines. */
  function toViewLines(raw: string[], previousLevel: LogLevel | null): ViewLine[] {
    let carried = previousLevel;
    return raw.map((text) => {
      const plain = stripAnsi(text);
      const level = detectLevel(plain);
      if (level) carried = level;
      return { id: nextId++, raw: text, plain, level, effectiveLevel: carried };
    });
  }

  function updateScrollState() {
    if (!panel) return;
    atBottom = panel.scrollHeight - panel.scrollTop - panel.clientHeight < 40;
    if (atBottom) pendingNew = 0;
  }

  async function scrollToBottom() {
    await tick();
    if (!panel) return;
    panel.scrollTop = panel.scrollHeight;
    atBottom = true;
    pendingNew = 0;
  }

  async function loadProcesses(initial = false) {
    try {
      if (initial) processesLoading = true;
      processesError = null;
      const list = await pm2Api.getProcesses();
      processList = list;

      if (selectedPmId !== null && !list.processes.some((p) => p.pmId === selectedPmId)) {
        selectedPmId = null;
      }
      if (selectedPmId === null && list.processes.length > 0) {
        const preferred = list.processes.find((p) => p.isSelf) ?? list.processes[0];
        await selectProcess(preferred.pmId);
      }
    } catch (err) {
      logger.error("Failed to load pm2 processes:", err);
      processesError = describeError(err, "Failed to load the process list");
    } finally {
      processesLoading = false;
    }
  }

  async function loadTail() {
    if (!selected) return;
    const pmId = selected.pmId;
    const name = streamName;
    try {
      logLoading = true;
      logError = null;
      const result = await pm2Api.getTail(pmId, name, lineCount);
      if (pmId !== selectedPmId || name !== streamName) return;
      lines = toViewLines(result.lines, null);
      chunk = result;
      lastUpdated = new Date();
      await scrollToBottom();
    } catch (err) {
      logger.error("Failed to load pm2 log tail:", err);
      logError = describeError(err, "Failed to read the log");
      lines = [];
      chunk = null;
    } finally {
      logLoading = false;
    }
  }

  /** Fetches whatever was appended since the last chunk and tacks it onto the buffer. */
  async function poll() {
    if (polling || !follow || !selected || !chunk) return;
    polling = true;
    const pmId = selected.pmId;
    const name = streamName;
    try {
      const result = await pm2Api.getUpdates(pmId, name, chunk.end, lineCount);
      if (pmId !== selectedPmId || name !== streamName) return;

      if (result.rotated) {
        lines = toViewLines(result.lines, null);
        chunk = result;
        lastUpdated = new Date();
        await scrollToBottom();
        return;
      }

      chunk = { ...chunk, end: result.end, fileSize: result.fileSize, truncated: chunk.truncated || result.truncated };
      if (result.lines.length === 0) return;

      const previous = lines.length > 0 ? lines[lines.length - 1].effectiveLevel : null;
      const appended = toViewLines(result.lines, previous);
      const merged = [...lines, ...appended];
      lines = merged.length > MAX_BUFFER ? merged.slice(merged.length - MAX_BUFFER) : merged;
      lastUpdated = new Date();

      if (atBottom) {
        await scrollToBottom();
      } else {
        pendingNew += appended.length;
      }
      logError = null;
    } catch (err) {
      logger.error("Failed to poll pm2 log:", err);
      logError = describeError(err, "Lost contact with the log; retrying");
    } finally {
      polling = false;
    }
  }

  async function selectProcess(pmId: number) {
    if (pmId === selectedPmId) return;
    selectedPmId = pmId;
    lines = [];
    chunk = null;
    pendingNew = 0;
    await tick();
    await loadTail();
  }

  function changeStream(next: number) {
    stream = next;
    lines = [];
    chunk = null;
    pendingNew = 0;
    loadTail();
  }

  function changeLineCount(next: number) {
    lineCount = next;
    loadTail();
  }

  function toggleLevel(level: LogLevel) {
    hiddenLevels = hiddenLevels.includes(level)
      ? hiddenLevels.filter((l) => l !== level)
      : [...hiddenLevels, level];
  }

  function showAllLevels() {
    hiddenLevels = [];
  }

  async function copyVisible() {
    try {
      await navigator.clipboard.writeText(visibleLines.map((line) => line.plain).join("\n"));
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch (err) {
      logger.error("Failed to copy log lines:", err);
      logError = "The browser refused clipboard access";
    }
  }

  $effect(() => {
    if (!allowed || !follow || !selected) return;
    const timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  });

  $effect(() => {
    if (!allowed) return;
    const timer = setInterval(() => loadProcesses(), PROCESS_REFRESH_MS);
    return () => clearInterval(timer);
  });

  let instanceKey = $derived($currentInstance?.port ?? null);
  let seenInstanceKey: number | null = null;

  $effect(() => {
    const key = instanceKey;
    if (!allowed) return;
    if (seenInstanceKey === null) {
      seenInstanceKey = key;
      return;
    }
    if (key === seenInstanceKey) return;
    seenInstanceKey = key;
    selectedPmId = null;
    lines = [];
    chunk = null;
    loadProcesses(true);
  });

  onMount(async () => {
    const isOwner = await loadingStore.wrap(
      "owner-check",
      async () => {
        try {
          return await ownershipApi.isOwner(BigInt(data.user.id));
        } catch (err) {
          logger.error("Owner check failed:", err);
          return false;
        }
      },
      "critical",
      "Checking permissions...",
    );

    if (!isOwner) {
      goto("/dashboard");
      return;
    }

    allowed = true;
    await loadProcesses(true);
  });
</script>

<DashboardPageLayout
  category="Analytics"
  guildName="Bot Owner Tools"
  icon="fa-rectangle-code"
  subtitle="Read and follow the pm2 logs of every process on the bot's host"
  title="Process Logs"
>
  {#if allowed}
    <section class="mb-6">
      <SectionHeader icon="fa-server" title="Processes" subtitle="What pm2 is running on the selected instance's host">
        {#snippet actions()}
          <button
            type="button"
            class="px-3 min-h-[36px] rounded-lg text-sm font-medium flex items-center gap-2"
            style="background: {$colorStore.primary}15; color: {$colorStore.text};"
            onclick={() => loadProcesses()}
          >
            <i class="fa-solid fa-rotate" aria-hidden="true"></i>
            Refresh
          </button>
        {/snippet}
      </SectionHeader>

      <AsyncState
        loading={processesLoading}
        error={processesError}
        empty={!processList || processList.processes.length === 0}
        emptyMessage={processList?.message ?? "pm2 has no processes registered"}
        emptyIcon="fa-server"
      >
        {#if processList && processList.source === Pm2ListSource.LogDirectory}
          <div class="rounded-xl p-3 mb-3 text-sm" style="background: #fdac4115; color: #fdac41;">
            <i class="fa-solid fa-triangle-exclamation mr-2" aria-hidden="true"></i>
            {processList.message}
          </div>
        {/if}

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {#each processList?.processes ?? [] as process (process.pmId)}
            {@const isSelected = process.pmId === selectedPmId}
            <button
              type="button"
              class="text-left rounded-xl border p-4 transition-colors min-h-[44px]"
              style="background: {isSelected ? `${$colorStore.primary}18` : `${$colorStore.primary}08`};
                     border-color: {isSelected ? $colorStore.primary : `${$colorStore.primary}20`};"
              aria-pressed={isSelected}
              onclick={() => selectProcess(process.pmId)}
            >
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-semibold truncate" style="color: {$colorStore.text}">{process.name}</span>
                  {#if process.isSelf}
                    <Pill tone="ok" text="this bot" icon="fa-star" />
                  {/if}
                </div>
                <Pill tone={statusTone(process.status)} text={process.status} />
              </div>
              <dl class="grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
                <dt style="color: {$colorStore.muted}">pm2 id</dt>
                <dd class="col-span-2 font-mono" style="color: {$colorStore.text}">
                  {process.pmId >= 0 ? process.pmId : "-"}{#if process.pid}<span style="color: {$colorStore.muted}"> pid {process.pid}</span>{/if}
                </dd>
                <dt style="color: {$colorStore.muted}">Uptime</dt>
                <dd class="col-span-2" style="color: {$colorStore.text}">
                  {uptime(process)}{#if process.restarts > 0}<span style="color: {$colorStore.muted}"> ({formatNumber(process.restarts)} restarts)</span>{/if}
                </dd>
                <dt style="color: {$colorStore.muted}">Usage</dt>
                <dd class="col-span-2" style="color: {$colorStore.text}">
                  {process.cpu !== undefined ? `${process.cpu.toFixed(1)}% cpu` : "-"}
                  {#if process.memoryBytes !== undefined}<span style="color: {$colorStore.muted}"> / </span>{formatBytes(process.memoryBytes)}{/if}
                </dd>
                <dt style="color: {$colorStore.muted}">Logs</dt>
                <dd class="col-span-2" style="color: {$colorStore.text}">
                  out {formatBytes(process.outLogBytes)}<span style="color: {$colorStore.muted}"> / </span>err {formatBytes(process.errorLogBytes)}
                </dd>
              </dl>
            </button>
          {/each}
        </div>
      </AsyncState>
    </section>

    {#if selected}
      <section>
        <SectionHeader
          icon="fa-rectangle-code"
          title={selected.name}
          subtitle={chunk?.path ?? (stream === Pm2LogStream.Error ? selected.errorLogPath : selected.outLogPath) ?? "No log file yet"}
        >
          {#snippet actions()}
            <WindowPicker value={stream} options={streamOptions} ariaLabel="Log stream" onchange={changeStream} />
            <WindowPicker value={lineCount} options={lineOptions} ariaLabel="Lines to load" onchange={changeLineCount} />
          {/snippet}
        </SectionHeader>

        <div class="flex flex-wrap items-center gap-2 mb-3">
          <label class="relative flex-1 min-w-[200px]">
            <i
              class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs"
              style="color: {$colorStore.muted}"
              aria-hidden="true"
            ></i>
            <input
              type="search"
              bind:value={search}
              placeholder="Filter lines"
              aria-label="Filter lines"
              class="w-full rounded-lg pl-8 pr-3 min-h-[40px] text-sm outline-none"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
            />
          </label>

          <button
            type="button"
            class="px-3 min-h-[40px] rounded-lg text-sm font-medium flex items-center gap-2"
            style="background: {follow ? $colorStore.primary : `${$colorStore.primary}15`}; color: {follow ? '#fff' : $colorStore.text};"
            aria-pressed={follow}
            onclick={() => (follow = !follow)}
          >
            <i class="fa-solid {follow ? 'fa-pause' : 'fa-play'}" aria-hidden="true"></i>
            {follow ? "Following" : "Follow"}
          </button>

          <button
            type="button"
            class="px-3 min-h-[40px] rounded-lg text-sm font-medium flex items-center gap-2"
            style="background: {wrap ? $colorStore.primary : `${$colorStore.primary}15`}; color: {wrap ? '#fff' : $colorStore.text};"
            aria-pressed={wrap}
            onclick={() => (wrap = !wrap)}
          >
            <i class="fa-solid fa-text-width" aria-hidden="true"></i>
            Wrap
          </button>

          <button
            type="button"
            class="px-3 min-h-[40px] rounded-lg text-sm font-medium flex items-center gap-2"
            style="background: {$colorStore.primary}15; color: {$colorStore.text};"
            disabled={visibleLines.length === 0}
            onclick={copyVisible}
          >
            <i class="fa-solid {copied ? 'fa-check' : 'fa-copy'}" aria-hidden="true"></i>
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            type="button"
            class="px-3 min-h-[40px] rounded-lg text-sm font-medium flex items-center gap-2"
            style="background: {$colorStore.primary}15; color: {$colorStore.text};"
            onclick={loadTail}
          >
            <i class="fa-solid fa-rotate" aria-hidden="true"></i>
            Reload
          </button>

          {#if downloadUrl}
            <a
              href={downloadUrl}
              download
              class="px-3 min-h-[40px] rounded-lg text-sm font-medium flex items-center gap-2"
              style="background: {$colorStore.secondary}20; color: {$colorStore.text};"
            >
              <i class="fa-solid fa-download" aria-hidden="true"></i>
              Download {formatBytes(selectedLogBytes)}
            </a>
          {/if}
        </div>

        <div class="flex flex-wrap items-center gap-2 mb-3" role="group" aria-label="Level filters">
          {#each LOG_LEVELS as level}
            {@const hidden = hiddenLevels.includes(level)}
            <button
              type="button"
              class="px-2.5 min-h-[32px] rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 transition-opacity"
              style="background: {levelColors[level]}{hidden ? '10' : '25'}; color: {levelColors[level]}; opacity: {hidden ? 0.45 : 1};
                     text-decoration: {hidden ? 'line-through' : 'none'};"
              aria-pressed={!hidden}
              title="{levelNames[level]}: click to {hidden ? 'show' : 'hide'}"
              onclick={() => toggleLevel(level)}
            >
              {level}
              <span style="opacity: 0.8">{formatNumber(levelCounts[level])}</span>
            </button>
          {/each}
          {#if hiddenLevels.length > 0}
            <button
              type="button"
              class="px-2.5 min-h-[32px] rounded-full text-xs font-medium"
              style="background: {$colorStore.primary}15; color: {$colorStore.text};"
              onclick={showAllLevels}
            >
              Show all
            </button>
          {/if}
        </div>

        <div
          class="rounded-xl border overflow-hidden"
          style="border-color: {$colorStore.primary}30; background: #0b0e17;"
        >
          <div
            class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs border-b"
            style="border-color: {$colorStore.primary}20; color: {$colorStore.muted}; background: {$colorStore.primary}08;"
          >
            <div class="flex flex-wrap items-center gap-3">
              <span>
                {formatNumber(visibleLines.length)} lines{#if hiddenCount > 0}, {formatNumber(hiddenCount)} hidden by filters{/if}
              </span>
              {#if chunk}
                <span>{formatBytes(chunk.fileSize)} on disk</span>
                {#if chunk.truncated}
                  <span style="color: #fdac41">older lines skipped past the 1 MB read limit</span>
                {/if}
                {#if chunk.rotated}
                  <span style="color: #fdac41">file was rotated, showing the new tail</span>
                {/if}
              {/if}
            </div>
            <div class="flex items-center gap-3">
              {#if follow}
                <span class="flex items-center gap-1.5">
                  <span class="inline-block w-2 h-2 rounded-full animate-pulse" style="background: #4ade80;"></span>
                  live
                </span>
              {/if}
              {#if lastUpdated}
                <span>updated {lastUpdated.toLocaleTimeString()}</span>
              {/if}
            </div>
          </div>

          {#if logError}
            <div class="px-3 py-2 text-sm" style="background: #f8717115; color: #f87171;" role="alert">
              <i class="fa-solid fa-circle-exclamation mr-2" aria-hidden="true"></i>{logError}
            </div>
          {/if}

          <div class="relative">
            <div
              bind:this={panel}
              class="log-panel overflow-auto font-mono text-[12px] leading-[1.55]"
              class:wrap
              onscroll={updateScrollState}
              role="log"
              aria-live="off"
              aria-label="Log output"
            >
              {#if logLoading && lines.length === 0}
                <div class="flex justify-center items-center min-h-[200px]">
                  <div
                    class="w-8 h-8 border-4 rounded-full animate-spin"
                    style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
                    aria-label="Loading"
                  ></div>
                </div>
              {:else if visibleLines.length === 0}
                <div class="px-4 py-12 text-center text-sm" style="color: {$colorStore.muted}">
                  {lines.length === 0 ? "The log is empty" : "No lines match the current filters"}
                </div>
              {:else}
                {#each visibleLines as line (line.id)}
                  <div
                    class="log-row"
                    style="border-left-color: {line.effectiveLevel ? levelColors[line.effectiveLevel] : 'transparent'};
                           opacity: {line.level ? 1 : 0.85};"
                  >
                    <AnsiLine text={line.raw} />
                  </div>
                {/each}
              {/if}
            </div>

            {#if !atBottom && lines.length > 0}
              <button
                type="button"
                class="absolute bottom-3 right-4 px-3 min-h-[36px] rounded-full text-xs font-medium shadow-lg flex items-center gap-2"
                style="background: {$colorStore.primary}; color: #fff;"
                onclick={scrollToBottom}
              >
                <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
                {pendingNew > 0 ? `${formatNumber(pendingNew)} new` : "Bottom"}
              </button>
            {/if}
          </div>
        </div>
      </section>
    {/if}
  {/if}
</DashboardPageLayout>

<style>
  .log-panel {
    height: clamp(320px, calc(100vh - 460px), 900px);
    color: #d1d5db;
    white-space: pre;
    tab-size: 4;
  }

  .log-panel.wrap {
    white-space: pre-wrap;
    word-break: break-all;
  }

  .log-row {
    padding: 0 12px 0 10px;
    border-left: 3px solid transparent;
  }

  .log-row:hover {
    background: rgba(255, 255, 255, 0.04);
  }
</style>
