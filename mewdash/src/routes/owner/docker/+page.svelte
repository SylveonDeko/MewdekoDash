<!-- routes/owner/docker/+page.svelte -->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { goto } from "$app/navigation";
  import { slide } from "svelte/transition";
  import { dockerApi, ownershipApi } from "$lib/api/index.ts";
  import { ApiError } from "$lib/api/core";
  import {
    DockerAvailability,
    DockerJobStatus,
    type DockerComposeOperation,
    type DockerComposeProject,
    type DockerContainerAction,
    type DockerContainerInfo,
    type DockerContainerStats,
    type DockerJob,
    type DockerLogLine,
    type DockerOverview,
  } from "$lib/api/docker/models";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { loadingStore } from "$lib/stores/loadingStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import SectionHeader from "$lib/components/stats/SectionHeader.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import WindowPicker from "$lib/components/stats/WindowPicker.svelte";
  import Pill from "$lib/components/analytics/Pill.svelte";
  import type { PillTone } from "$lib/components/analytics/palette";
  import AnsiLine from "$lib/components/logs/AnsiLine.svelte";
  import { stripAnsi } from "$lib/components/logs/ansi";
  import { formatAgo, formatBytes, formatNumber } from "$lib/components/stats/format";

  let { data } = $props();

  /** A log line as the viewer holds it, with the plain text worked out once on arrival. */
  interface ViewLine {
    id: number;
    raw: string;
    plain: string;
    isError: boolean;
    timestamp: string;
  }

  /** A project card: the compose project (or the standalone bucket) and the containers under it. */
  interface ProjectGroup {
    key: string;
    project: DockerComposeProject | null;
    containers: DockerContainerInfo[];
  }

  const OVERVIEW_REFRESH_MS = 10000;
  const LOG_POLL_MS = 2000;
  const JOB_POLL_MS = 1500;
  const STATS_CONCURRENCY = 4;
  const MAX_BUFFER = 5000;
  const STANDALONE = "__standalone";

  const lineOptions = [
    { value: 100, label: "100" },
    { value: 300, label: "300" },
    { value: 500, label: "500" },
    { value: 1000, label: "1k" },
    { value: 2000, label: "2k" },
  ];

  let allowed = $state(false);

  let overview = $state<DockerOverview | null>(null);
  let overviewLoading = $state(true);
  let overviewError = $state<string | null>(null);
  let expanded = $state<Record<string, boolean>>({});
  let stats = $state<Record<string, DockerContainerStats>>({});
  let statsLoading = false;
  let busyContainers = $state<Record<string, DockerContainerAction>>({});
  let actionNotice = $state<{ text: string; ok: boolean } | null>(null);

  let jobs = $state<DockerJob[]>([]);
  let activeJob = $state<DockerJob | null>(null);
  let jobPanel = $state<HTMLDivElement | null>(null);
  let startingJob = $state<string | null>(null);

  let selectedId = $state<string | null>(null);
  let lineCount = $state(300);
  let follow = $state(true);
  let wrap = $state(false);
  let search = $state("");
  let showStdout = $state(true);
  let showStderr = $state(true);
  let lines = $state<ViewLine[]>([]);
  let cursor = $state<string | null>(null);
  let logLoading = $state(false);
  let logError = $state<string | null>(null);
  let lastUpdated = $state<Date | null>(null);
  let polling = false;
  let nextId = 0;
  let panel = $state<HTMLDivElement | null>(null);
  let atBottom = $state(true);
  let pendingNew = $state(0);
  let copied = $state(false);

  let available = $derived(overview?.availability === DockerAvailability.Available);
  let selected = $derived(overview?.containers.find((c) => c.id === selectedId) ?? null);

  let groups = $derived.by<ProjectGroup[]>(() => {
    if (!overview) return [];
    const byProject = new Map<string, ProjectGroup>();
    for (const project of overview.projects) {
      byProject.set(project.name, { key: project.name, project, containers: [] });
    }
    const standalone: ProjectGroup = { key: STANDALONE, project: null, containers: [] };
    for (const container of overview.containers) {
      const group = container.composeProject ? byProject.get(container.composeProject) : null;
      (group ?? standalone).containers.push(container);
    }
    const result = [...byProject.values()];
    if (standalone.containers.length > 0) result.push(standalone);
    return result;
  });

  let visibleLines = $derived.by(() => {
    const needle = search.trim().toLowerCase();
    return lines.filter((line) => {
      if (line.isError ? !showStderr : !showStdout) return false;
      return needle === "" || line.plain.toLowerCase().includes(needle);
    });
  });

  let hiddenCount = $derived(lines.length - visibleLines.length);
  let errorCount = $derived(lines.filter((l) => l.isError).length);

  function stateTone(container: DockerContainerInfo): PillTone {
    if (container.state === "running") {
      return container.health === "unhealthy" ? "warn" : "ok";
    }
    if (container.state === "restarting" || container.state === "created" || container.state === "paused") return "warn";
    return "crit";
  }

  function stateLabel(container: DockerContainerInfo): string {
    if (container.state === "running" && container.health) return container.health;
    return container.state;
  }

  function jobTone(job: DockerJob): PillTone {
    return job.status === DockerJobStatus.Succeeded ? "ok" : job.status === DockerJobStatus.Failed ? "crit" : "warn";
  }

  function jobLabel(job: DockerJob): string {
    return job.status === DockerJobStatus.Succeeded ? "succeeded" : job.status === DockerJobStatus.Failed ? "failed" : "running";
  }

  function shortId(id: string): string {
    return id.slice(0, 12);
  }

  function describeError(err: unknown, fallback: string): string {
    if (err instanceof ApiError && err.status === 403) return "Only bot owners can manage Docker";
    return err instanceof Error && err.message ? err.message : fallback;
  }

  function toViewLines(raw: DockerLogLine[]): ViewLine[] {
    return raw.map((line) => ({
      id: nextId++,
      raw: line.text,
      plain: stripAnsi(line.text),
      isError: line.isError,
      timestamp: line.timestamp,
    }));
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

  async function loadOverview(initial = false) {
    try {
      if (initial) overviewLoading = true;
      overviewError = null;
      const result = await dockerApi.getOverview();
      overview = result;

      if (initial) {
        const own = result.containers.find((c) => c.isSelf);
        if (own?.composeProject) expanded = { ...expanded, [own.composeProject]: true };
        else if (result.projects.length === 0) expanded = { ...expanded, [STANDALONE]: true };
      }

      if (selectedId && !result.containers.some((c) => c.id === selectedId)) {
        selectedId = null;
        lines = [];
        cursor = null;
      }

      void refreshStats();
    } catch (err) {
      logger.error("Failed to load the Docker overview:", err);
      overviewError = describeError(err, "Failed to reach the bot for the Docker overview");
    } finally {
      overviewLoading = false;
    }
  }

  /**
   * Samples only the running containers in expanded groups, a few at a time, since each sample
   * costs the daemon a second of observation and a host can have dozens of containers.
   */
  async function refreshStats() {
    if (statsLoading || !overview) return;
    statsLoading = true;
    try {
      const targets = groups
        .filter((g) => expanded[g.key])
        .flatMap((g) => g.containers)
        .filter((c) => c.state === "running");

      const queue = [...targets];
      const workers = Array.from({ length: Math.min(STATS_CONCURRENCY, queue.length) }, async () => {
        while (queue.length > 0) {
          const container = queue.shift();
          if (!container) return;
          try {
            const sample = await dockerApi.getStats(container.id);
            stats = { ...stats, [container.id]: sample };
          } catch (err) {
            logger.debug("Stats sample failed for", container.name, err);
          }
        }
      });
      await Promise.all(workers);
    } finally {
      statsLoading = false;
    }
  }

  function toggleGroup(key: string) {
    expanded = { ...expanded, [key]: !expanded[key] };
    if (expanded[key]) void refreshStats();
  }

  async function runAction(container: DockerContainerInfo, action: DockerContainerAction) {
    if (busyContainers[container.id]) return;

    if (action !== "start") {
      const verb = action === "stop" ? "Stop" : "Restart";
      const selfWarning = container.isSelf
        ? ` This is the container the selected bot instance runs in, so the dashboard will lose contact with it${action === "stop" ? " until it is started again from elsewhere" : " until it comes back"}.`
        : "";
      const confirmed = await requestConfirmation({
        title: `${verb} ${container.name}?`,
        message: `${verb} the ${container.name} container${container.composeProject ? ` in ${container.composeProject}` : ""}.${selfWarning}`,
        confirmText: verb,
        variant: container.isSelf ? "danger" : "warning",
      });
      if (!confirmed) return;
    }

    busyContainers = { ...busyContainers, [container.id]: action };
    try {
      const result = await dockerApi.runAction(container.id, action);
      actionNotice = { text: `${container.name}: ${result.message ?? `${action} accepted`}`, ok: result.success };
    } catch (err) {
      logger.error(`Docker ${action} failed:`, err);
      actionNotice = { text: `${container.name}: ${describeError(err, `${action} failed`)}`, ok: false };
    } finally {
      const { [container.id]: _, ...rest } = busyContainers;
      busyContainers = rest;
      await loadOverview();
    }
  }

  async function startCompose(project: DockerComposeProject, operation: DockerComposeOperation) {
    if (startingJob) return;

    const descriptions: Record<DockerComposeOperation, string> = {
      pull: `Pull the latest images for ${project.name}. Nothing restarts until you run Up.`,
      up: `Bring ${project.name} up. Containers whose image or config changed are recreated; the rest are left alone.`,
      update: `Pull the latest images for ${project.name}, then bring it up so changed containers are recreated.`,
      build: `Rebuild ${project.name} from its Dockerfiles with fresh base images, then bring it up.`,
    };
    const confirmed = await requestConfirmation({
      title: `Compose ${operation} on ${project.name}?`,
      message: descriptions[operation],
      confirmText: `Run ${operation}`,
      variant: operation === "pull" ? "info" : "warning",
    });
    if (!confirmed) return;

    startingJob = project.name;
    try {
      const job = await dockerApi.startComposeJob(project.name, operation);
      activeJob = job;
      jobs = [job, ...jobs.filter((j) => j.id !== job.id)];
    } catch (err) {
      logger.error("Failed to start compose job:", err);
      actionNotice = { text: `${project.name}: ${describeError(err, `Could not start ${operation}`)}`, ok: false };
    } finally {
      startingJob = null;
    }
  }

  async function pollJob() {
    if (!activeJob || activeJob.status !== DockerJobStatus.Running) return;
    try {
      const latest = await dockerApi.getJob(activeJob.id);
      activeJob = latest;
      jobs = jobs.map((j) => (j.id === latest.id ? latest : j));
      await tick();
      if (jobPanel) jobPanel.scrollTop = jobPanel.scrollHeight;
      if (latest.status !== DockerJobStatus.Running) await loadOverview();
    } catch (err) {
      logger.debug("Job poll failed:", err);
    }
  }

  async function loadJobs() {
    try {
      jobs = await dockerApi.listJobs();
      const running = jobs.find((j) => j.status === DockerJobStatus.Running);
      if (running && !activeJob) activeJob = running;
    } catch (err) {
      logger.debug("Failed to list compose jobs:", err);
    }
  }

  async function loadTail() {
    if (!selected) return;
    const id = selected.id;
    try {
      logLoading = true;
      logError = null;
      const result = await dockerApi.getLogs(id, lineCount);
      if (id !== selectedId) return;
      lines = toViewLines(result.lines);
      cursor = result.cursor ?? null;
      lastUpdated = new Date();
      await scrollToBottom();
    } catch (err) {
      logger.error("Failed to load container log:", err);
      logError = describeError(err, "Failed to read the log");
      lines = [];
      cursor = null;
    } finally {
      logLoading = false;
    }
  }

  async function poll() {
    if (polling || !follow || !selected) return;
    polling = true;
    const id = selected.id;
    try {
      const result = cursor ? await dockerApi.getLogsSince(id, cursor) : await dockerApi.getLogs(id, lineCount);
      if (id !== selectedId) return;

      if (result.cursor) cursor = result.cursor;
      if (result.lines.length === 0) return;

      const appended = toViewLines(result.lines);
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
      logger.error("Failed to poll container log:", err);
      logError = describeError(err, "Lost contact with the log; retrying");
    } finally {
      polling = false;
    }
  }

  async function selectContainer(container: DockerContainerInfo) {
    if (container.id === selectedId) return;
    selectedId = container.id;
    lines = [];
    cursor = null;
    pendingNew = 0;
    await tick();
    await loadTail();
    document.getElementById("container-log")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function changeLineCount(next: number) {
    lineCount = next;
    loadTail();
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
    const timer = setInterval(poll, LOG_POLL_MS);
    return () => clearInterval(timer);
  });

  $effect(() => {
    if (!allowed) return;
    const timer = setInterval(() => loadOverview(), OVERVIEW_REFRESH_MS);
    return () => clearInterval(timer);
  });

  $effect(() => {
    if (!allowed || !activeJob || activeJob.status !== DockerJobStatus.Running) return;
    const timer = setInterval(pollJob, JOB_POLL_MS);
    return () => clearInterval(timer);
  });

  $effect(() => {
    if (!actionNotice) return;
    const timer = setTimeout(() => (actionNotice = null), 6000);
    return () => clearTimeout(timer);
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
    selectedId = null;
    lines = [];
    cursor = null;
    stats = {};
    expanded = {};
    activeJob = null;
    jobs = [];
    loadOverview(true);
    loadJobs();
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
    await Promise.all([loadOverview(true), loadJobs()]);
  });
</script>

<DashboardPageLayout
  category="Analytics"
  guildName="Bot Owner Tools"
  icon="fa-box"
  subtitle="Containers and compose projects on the selected instance's host"
  title="Docker"
  basePath="/owner/docker"
>
  {#if allowed}
    <section class="mb-6">
      <SectionHeader icon="fa-box" title="Daemon" subtitle={overview?.endpoint ?? "Looking for a Docker socket on the host"}>
        {#snippet actions()}
          <button
            type="button"
            class="px-3 min-h-[36px] rounded-lg text-sm font-medium flex items-center gap-2"
            style="background: {$colorStore.primary}15; color: {$colorStore.text};"
            onclick={() => loadOverview()}
          >
            <i class="fa-solid fa-rotate" aria-hidden="true"></i>
            Refresh
          </button>
        {/snippet}
      </SectionHeader>

      <AsyncState loading={overviewLoading} error={overviewError}>
        {#if overview && !available}
          <div class="rounded-xl p-4 text-sm flex items-start gap-3" style="background: #fdac4115; color: #fdac41;" role="alert">
            <i class="fa-solid fa-triangle-exclamation mt-0.5" aria-hidden="true"></i>
            <div>
              <div class="font-semibold">
                {overview.availability === DockerAvailability.NotConfigured ? "Docker is not configured on this host" : "The Docker daemon could not be reached"}
              </div>
              <div class="mt-1" style="color: {$colorStore.text};">{overview.message}</div>
            </div>
          </div>
        {:else if overview}
          <div class="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {#each [
              { label: "Engine", value: overview.serverVersion ?? "-", hint: [overview.operatingSystem, overview.architecture].filter(Boolean).join(" · ") },
              { label: "Running", value: formatNumber(overview.running), hint: `${formatNumber(overview.containers.length)} containers` },
              { label: "Stopped", value: formatNumber(overview.stopped), hint: overview.stopped > 0 ? "not running" : "all up" },
              { label: "Images", value: formatNumber(overview.images), hint: overview.composeAvailable ? "compose available" : "compose unavailable" },
            ] as tile (tile.label)}
              <div class="rounded-xl border p-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                <div class="text-xs uppercase tracking-wider" style="color: {$colorStore.muted};">{tile.label}</div>
                <div class="text-2xl font-bold mt-1 truncate" style="color: {$colorStore.text};">{tile.value}</div>
                <div class="text-xs mt-0.5 truncate" style="color: {$colorStore.muted};">{tile.hint}</div>
              </div>
            {/each}
          </div>
        {/if}
      </AsyncState>
    </section>

    {#if actionNotice}
      <div
        class="rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-3"
        style="background: {actionNotice.ok ? '#4ade8015' : '#f8717115'}; color: {actionNotice.ok ? '#4ade80' : '#f87171'};"
        role="status"
        transition:slide={{ duration: 200 }}
      >
        <i class="fa-solid {actionNotice.ok ? 'fa-check' : 'fa-circle-exclamation'}" aria-hidden="true"></i>
        <span class="flex-1">{actionNotice.text}</span>
        <button type="button" class="min-h-[32px] px-2" aria-label="Dismiss" onclick={() => (actionNotice = null)}>
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    {/if}

    {#if available && overview}
      <section class="mb-6">
        <SectionHeader icon="fa-server" title="Containers" subtitle="Grouped by compose project. Expand a project to sample its resource use." />

        <div class="space-y-3">
          {#each groups as group (group.key)}
            {@const open = !!expanded[group.key]}
            {@const running = group.containers.filter((c) => c.state === "running").length}
            <div class="rounded-xl border overflow-hidden" style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}05;">
              <div class="flex flex-wrap items-center gap-2 px-4 py-3">
                <button
                  type="button"
                  class="flex items-center gap-3 min-w-0 flex-1 text-left min-h-[44px]"
                  aria-expanded={open}
                  onclick={() => toggleGroup(group.key)}
                >
                  <i class="fa-solid fa-chevron-right text-xs transition-transform duration-200 shrink-0"
                     style="color: {$colorStore.muted}; transform: rotate({open ? '90deg' : '0deg'});"
                     aria-hidden="true"></i>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="font-semibold truncate" style="color: {$colorStore.text};">
                        {group.project ? group.project.name : "Standalone containers"}
                      </span>
                      <Pill tone={running === group.containers.length ? "ok" : running === 0 ? "crit" : "warn"} text="{running}/{group.containers.length} up" />
                      {#if group.containers.some((c) => c.isSelf)}
                        <Pill tone="ok" text="this bot" icon="fa-star" />
                      {/if}
                    </div>
                    {#if group.project?.workingDir}
                      <div class="text-xs font-mono truncate" style="color: {$colorStore.muted};">{group.project.workingDir}</div>
                    {/if}
                  </div>
                </button>

                {#if group.project && overview.composeAvailable}
                  <div class="flex flex-wrap items-center gap-1.5">
                    {#if group.project.operable}
                      {#each [
                        { op: "pull", icon: "fa-cloud-arrow-down", label: "Pull" },
                        { op: "up", icon: "fa-arrow-up", label: "Up" },
                        { op: "update", icon: "fa-arrows-rotate", label: "Update" },
                        { op: "build", icon: "fa-hammer", label: "Build" },
                      ] as button (button.op)}
                        <button
                          type="button"
                          class="px-2.5 min-h-[36px] rounded-lg text-xs font-medium flex items-center gap-1.5"
                          style="background: {$colorStore.secondary}20; color: {$colorStore.text};"
                          disabled={startingJob !== null || activeJob?.status === DockerJobStatus.Running}
                          title="docker compose {button.op}"
                          onclick={() => startCompose(group.project!, button.op as DockerComposeOperation)}
                        >
                          <i class="fa-solid {button.icon}" aria-hidden="true"></i>
                          {button.label}
                        </button>
                      {/each}
                    {:else}
                      <span class="text-xs px-2" style="color: {$colorStore.muted};" title="The compose files are not visible from the bot's filesystem">
                        <i class="fa-solid fa-eye-slash mr-1" aria-hidden="true"></i>compose files not visible
                      </span>
                    {/if}
                  </div>
                {/if}
              </div>

              {#if open}
                <div class="border-t" style="border-color: {$colorStore.primary}15;" transition:slide={{ duration: 200 }}>
                  {#each group.containers as container (container.id)}
                    {@const sample = stats[container.id]}
                    {@const busy = busyContainers[container.id]}
                    {@const isSelected = container.id === selectedId}
                    <div
                      class="flex flex-wrap items-center gap-3 px-4 py-3 border-b last:border-b-0"
                      style="border-color: {$colorStore.primary}10; background: {isSelected ? `${$colorStore.primary}12` : 'transparent'};"
                    >
                      <div class="flex-1 min-w-[200px]">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="font-medium" style="color: {$colorStore.text};">{container.name}</span>
                          <Pill tone={stateTone(container)} text={stateLabel(container)} />
                          {#if container.isSelf}
                            <Pill tone="ok" text="this bot" icon="fa-star" />
                          {/if}
                        </div>
                        <div class="text-xs mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5" style="color: {$colorStore.muted};">
                          <span class="font-mono">{shortId(container.id)}</span>
                          <span class="truncate max-w-[280px]" title={container.image}>{container.image}</span>
                          <span>{container.status}</span>
                          {#if container.ports.length > 0}
                            <span class="font-mono">{container.ports.join(", ")}</span>
                          {/if}
                        </div>
                      </div>

                      <div class="text-xs min-w-[140px]" style="color: {$colorStore.text};">
                        {#if container.state === "running"}
                          {#if sample}
                            <div>{sample.cpuPercent.toFixed(1)}% cpu</div>
                            <div style="color: {$colorStore.muted};">
                              {formatBytes(sample.memoryBytes)}{#if sample.memoryLimitBytes > 0} / {formatBytes(sample.memoryLimitBytes)}{/if}
                            </div>
                            <div style="color: {$colorStore.muted};">{formatNumber(sample.pids)} pids · rx {formatBytes(sample.networkRxBytes)}</div>
                          {:else}
                            <span style="color: {$colorStore.muted};">sampling...</span>
                          {/if}
                        {:else}
                          <span style="color: {$colorStore.muted};">created {formatAgo(container.createdAt)}</span>
                        {/if}
                      </div>

                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          class="px-2.5 min-h-[36px] rounded-lg text-xs font-medium flex items-center gap-1.5"
                          style="background: {isSelected ? $colorStore.primary : `${$colorStore.primary}15`}; color: {isSelected ? '#fff' : $colorStore.text};"
                          aria-pressed={isSelected}
                          onclick={() => selectContainer(container)}
                        >
                          <i class="fa-solid fa-rectangle-list" aria-hidden="true"></i>
                          Logs
                        </button>
                        {#if container.state === "running"}
                          <button
                            type="button"
                            class="px-2.5 min-h-[36px] rounded-lg text-xs font-medium flex items-center gap-1.5"
                            style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                            disabled={!!busy}
                            onclick={() => runAction(container, "restart")}
                          >
                            <i class="fa-solid {busy === 'restart' ? 'fa-spinner fa-spin' : 'fa-rotate-right'}" aria-hidden="true"></i>
                            Restart
                          </button>
                          <button
                            type="button"
                            class="px-2.5 min-h-[36px] rounded-lg text-xs font-medium flex items-center gap-1.5"
                            style="background: #f8717120; color: #f87171;"
                            disabled={!!busy}
                            onclick={() => runAction(container, "stop")}
                          >
                            <i class="fa-solid {busy === 'stop' ? 'fa-spinner fa-spin' : 'fa-stop'}" aria-hidden="true"></i>
                            Stop
                          </button>
                        {:else}
                          <button
                            type="button"
                            class="px-2.5 min-h-[36px] rounded-lg text-xs font-medium flex items-center gap-1.5"
                            style="background: #4ade8020; color: #4ade80;"
                            disabled={!!busy}
                            onclick={() => runAction(container, "start")}
                          >
                            <i class="fa-solid {busy === 'start' ? 'fa-spinner fa-spin' : 'fa-play'}" aria-hidden="true"></i>
                            Start
                          </button>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {:else}
            <div class="rounded-xl p-6 text-center text-sm" style="background: {$colorStore.primary}08; color: {$colorStore.muted};">
              The daemon has no containers
            </div>
          {/each}
        </div>
      </section>

      {#if activeJob || jobs.length > 0}
        <section class="mb-6">
          <SectionHeader icon="fa-clipboard-check" title="Compose jobs" subtitle="Pull, up and build runs started from here, with their output">
            {#snippet actions()}
              {#if jobs.length > 1}
                <div class="flex flex-wrap gap-1.5">
                  {#each jobs.slice(0, 6) as job (job.id)}
                    <button
                      type="button"
                      class="px-2.5 min-h-[32px] rounded-full text-xs font-medium flex items-center gap-1.5"
                      style="background: {activeJob?.id === job.id ? $colorStore.primary : `${$colorStore.primary}15`}; color: {activeJob?.id === job.id ? '#fff' : $colorStore.text};"
                      onclick={() => (activeJob = job)}
                    >
                      {job.project} {job.operation}
                    </button>
                  {/each}
                </div>
              {/if}
            {/snippet}
          </SectionHeader>

          {#if activeJob}
            <div class="rounded-xl border overflow-hidden" style="border-color: {$colorStore.primary}30; background: #0b0e17;">
              <div
                class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs border-b"
                style="border-color: {$colorStore.primary}20; color: {$colorStore.muted}; background: {$colorStore.primary}08;"
              >
                <div class="flex items-center gap-2 flex-wrap">
                  <span style="color: {$colorStore.text};">{activeJob.project}</span>
                  <span>{activeJob.operation}</span>
                  <Pill tone={jobTone(activeJob)} text={jobLabel(activeJob)} />
                  {#if activeJob.exitCode !== undefined && activeJob.exitCode !== null}
                    <span>exit {activeJob.exitCode}</span>
                  {/if}
                </div>
                <span>started {formatAgo(activeJob.startedAt)}</span>
              </div>
              <div bind:this={jobPanel} class="job-panel overflow-auto font-mono text-[12px] leading-[1.55] p-3" role="log" aria-live="off">
                {#if activeJob.output.length === 0}
                  <span style="color: {$colorStore.muted};">Waiting for output...</span>
                {:else}
                  {#each activeJob.output as line, index (index)}
                    <div><AnsiLine text={line} /></div>
                  {/each}
                {/if}
              </div>
            </div>
          {/if}
        </section>
      {/if}

      {#if selected}
        <section id="container-log">
          <SectionHeader icon="fa-rectangle-code" title={selected.name} subtitle="{selected.image} · {shortId(selected.id)}">
            {#snippet actions()}
              <WindowPicker value={lineCount} options={lineOptions} ariaLabel="Lines to load" onchange={changeLineCount} />
            {/snippet}
          </SectionHeader>

          <div class="flex flex-wrap items-center gap-2 mb-3">
            <label class="relative flex-1 min-w-[200px]">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs" style="color: {$colorStore.muted}" aria-hidden="true"></i>
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
          </div>

          <div class="flex flex-wrap items-center gap-2 mb-3" role="group" aria-label="Stream filters">
            <button
              type="button"
              class="px-2.5 min-h-[32px] rounded-full text-xs font-mono font-semibold flex items-center gap-1.5"
              style="background: #4ade80{showStdout ? '25' : '10'}; color: #4ade80; opacity: {showStdout ? 1 : 0.45}; text-decoration: {showStdout ? 'none' : 'line-through'};"
              aria-pressed={showStdout}
              onclick={() => (showStdout = !showStdout)}
            >
              stdout <span style="opacity: 0.8">{formatNumber(lines.length - errorCount)}</span>
            </button>
            <button
              type="button"
              class="px-2.5 min-h-[32px] rounded-full text-xs font-mono font-semibold flex items-center gap-1.5"
              style="background: #f87171{showStderr ? '25' : '10'}; color: #f87171; opacity: {showStderr ? 1 : 0.45}; text-decoration: {showStderr ? 'none' : 'line-through'};"
              aria-pressed={showStderr}
              onclick={() => (showStderr = !showStderr)}
            >
              stderr <span style="opacity: 0.8">{formatNumber(errorCount)}</span>
            </button>
          </div>

          <div class="rounded-xl border overflow-hidden" style="border-color: {$colorStore.primary}30; background: #0b0e17;">
            <div
              class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs border-b"
              style="border-color: {$colorStore.primary}20; color: {$colorStore.muted}; background: {$colorStore.primary}08;"
            >
              <span>
                {formatNumber(visibleLines.length)} lines{#if hiddenCount > 0}, {formatNumber(hiddenCount)} hidden by filters{/if}
              </span>
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
                aria-label="Container log output"
              >
                {#if logLoading && lines.length === 0}
                  <div class="flex justify-center items-center min-h-[200px]">
                    <div class="w-8 h-8 border-4 rounded-full animate-spin"
                         style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
                         aria-label="Loading"></div>
                  </div>
                {:else if visibleLines.length === 0}
                  <div class="px-4 py-12 text-center text-sm" style="color: {$colorStore.muted}">
                    {lines.length === 0 ? "The log is empty" : "No lines match the current filters"}
                  </div>
                {:else}
                  {#each visibleLines as line (line.id)}
                    <div class="log-row" style="border-left-color: {line.isError ? '#f87171' : 'transparent'};">
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

  .job-panel {
    max-height: 360px;
    color: #d1d5db;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
