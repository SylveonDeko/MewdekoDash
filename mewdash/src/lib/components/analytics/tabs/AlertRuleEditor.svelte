<!-- lib/components/analytics/tabs/AlertRuleEditor.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import Portal from "$lib/components/ui/Portal.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { AlertBand, AlertRule, AlertRuleInput, AnalyticsAgg, MetricDescriptor } from "$lib/api/analytics/models";
  import { duration } from "../format";
  import AnalyticsChart from "../AnalyticsChart.svelte";
  import {
    AGGREGATIONS,
    COMPARATORS,
    COMPARATOR_SYMBOL,
    COOLDOWNS,
    FOR_SECONDS,
    REPEATS,
    WINDOWS,
    clockToMinutes,
    emptyInput,
    minutesToClock,
    toInput,
  } from "./alertText";

  interface Props {
    open?: boolean;
    rule: AlertRule | null;
    metrics: MetricDescriptor[];
    onSaved: (rule: AlertRule) => void;
  }

  let { open = $bindable(false), rule, metrics, onSaved }: Props = $props();

  let draft = $state<AlertRuleInput>(emptyInput());
  let filterRows = $state<{ key: string; value: string }[]>([]);
  let quietStart = $state("");
  let quietEnd = $state("");
  let saving = $state(false);
  let error = $state("");

  let labels = $derived(Object.keys(metrics.find((m) => m.metric === draft.metric)?.labels ?? {}));
  let filters = $derived(Object.fromEntries(filterRows.filter((r) => r.key && r.value).map((r) => [r.key, r.value])));
  let baseline = $derived(draft.comparator === "pct_change" || draft.comparator === "deviates");
  let absolute = $derived(!baseline && draft.comparator !== "nodata");
  let previewBands = $derived<AlertBand[]>(
    absolute && draft.metric
      ? [{ id: 0, name: draft.name || "draft", threshold: Number(draft.threshold) || 0, thresholdHigh: draft.comparator === "outside" ? draft.thresholdHigh : null, comparator: COMPARATOR_SYMBOL[draft.comparator] ?? draft.comparator, severity: draft.severity }]
      : [],
  );

  const field = $derived(
    `background: ${$colorStore.primary}08; color: ${$colorStore.text}; border-color: ${$colorStore.primary}20;`,
  );

  function reset() {
    draft = rule ? toInput(rule) : { ...emptyInput(), metric: metrics[0]?.metric ?? "" };
    filterRows = Object.entries(draft.filters).map(([key, value]) => ({ key, value }));
    quietStart = minutesToClock(draft.quietStartMinute);
    quietEnd = minutesToClock(draft.quietEndMinute);
    error = "";
  }

  function num(value: unknown): number | null {
    const v = typeof value === "string" ? (value.trim() === "" ? NaN : Number(value)) : Number(value);
    return Number.isFinite(v) ? v : null;
  }

  function close() {
    open = false;
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }

  async function save() {
    const body: AlertRuleInput = {
      ...draft,
      name: draft.name.trim(),
      description: draft.description?.trim() || null,
      filters,
      groupBy: draft.groupBy || null,
      threshold: num(draft.threshold) ?? 0,
      thresholdHigh: draft.comparator === "outside" ? num(draft.thresholdHigh) : null,
      baselineDays: baseline ? (num(draft.baselineDays) ?? 7) : null,
      direction: baseline ? draft.direction || "both" : null,
      repeatSeconds: num(draft.repeatSeconds) || null,
      webhookUrl: draft.webhookUrl.trim(),
      mentionRoleId: draft.mentionRoleId?.trim() || null,
      threadId: draft.threadId?.trim() || null,
      quietStartMinute: quietStart ? clockToMinutes(quietStart) : null,
      quietEndMinute: quietEnd ? clockToMinutes(quietEnd) : null,
      minSamples: num(draft.minSamples),
    };
    if (!body.name) return void (error = "Name required");
    if (!body.metric) return void (error = "Metric required");
    if (!body.webhookUrl) return void (error = "Webhook required");
    saving = true;
    error = "";
    try {
      const saved = rule ? await analyticsApi.updateAlertRule(rule.id, body) : await analyticsApi.createAlertRule(body);
      onSaved(saved);
      close();
    } catch (err) {
      logger.warn("Alert rule save failed", err);
      error = err instanceof Error ? err.message : "Save failed";
    } finally {
      saving = false;
    }
  }

  $effect(() => {
    if (open) {
      void rule;
      reset();
    }
  });

  $effect(() => {
    if (!open || typeof window === "undefined") return;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
</script>

{#if open}
  <Portal>
    <div
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto backdrop-blur-md p-4 sm:p-8"
      style="background: {$colorStore.background}aa"
      onclick={(e) => { if (e.target === e.currentTarget) close(); }}
      role="presentation"
    >
      <div
        class="w-full max-w-5xl rounded-2xl border shadow-2xl"
        style="background: {$colorStore.background}; border-color: {$colorStore.primary}30;"
        in:fly={{ y: 20, duration: 200 }}
        out:fly={{ y: -20, duration: 150 }}
        role="dialog"
        aria-modal="true"
        aria-label={rule ? `Edit ${rule.name}` : "New rule"}
      >
        <div class="flex items-center justify-between gap-3 p-4 border-b" style="border-color: {$colorStore.primary}20;">
          <h3 class="text-base font-semibold truncate" style="color: {$colorStore.text}">{rule ? `Edit · ${rule.name}` : "New rule"}</h3>
          <button type="button" class="min-h-[44px] min-w-[44px] rounded-lg hover:opacity-70" style="background: {$colorStore.primary}10; color: {$colorStore.muted}" onclick={close} aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs" style="color: {$colorStore.muted}">
          <div class="space-y-3">
            <label class="block">Name
              <input type="text" class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={draft.name} />
            </label>
            <label class="block">Description
              <input type="text" class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} value={draft.description ?? ""} oninput={(e) => (draft.description = e.currentTarget.value)} />
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label class="block">Severity
                <select class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={draft.severity}>
                  <option value="info">info</option>
                  <option value="warning">warning</option>
                  <option value="critical">critical</option>
                </select>
              </label>
              <label class="flex items-end gap-2 min-h-[44px] pb-3">
                <input type="checkbox" bind:checked={draft.enabled} style="accent-color: {$colorStore.primary}" /> enabled
              </label>
            </div>
            <label class="block">Metric
              <select class="mt-1 w-full min-h-[44px] rounded-lg border px-2 font-mono" style={field} bind:value={draft.metric} onchange={() => { draft.groupBy = null; filterRows = []; }}>
                {#if draft.metric && !metrics.some((m) => m.metric === draft.metric)}<option value={draft.metric}>{draft.metric}</option>{/if}
                {#each metrics as m (m.metric)}<option value={m.metric}>{m.metric} · {m.kind}</option>{/each}
              </select>
            </label>
            <div>
              <div class="flex items-center justify-between">
                <span>Filters</span>
                <button type="button" class="min-h-[32px] px-2 rounded" style="background: {$colorStore.primary}10; color: {$colorStore.text}" onclick={() => (filterRows = [...filterRows, { key: labels[0] ?? "", value: "" }])}><i class="fa-solid fa-plus mr-1"></i>add</button>
              </div>
              {#each filterRows as row, i (i)}
                <div class="flex items-center gap-1 mt-1">
                  <select class="min-h-[44px] w-32 rounded-lg border px-2 font-mono" style={field} bind:value={row.key}>
                    {#if row.key && !labels.includes(row.key)}<option value={row.key}>{row.key}</option>{/if}
                    {#each labels as l}<option value={l}>{l}</option>{/each}
                  </select>
                  <span>=</span>
                  <input type="text" class="flex-1 min-h-[44px] rounded-lg border px-2 font-mono" style={field} bind:value={row.value} list="an-values-{i}" />
                  <datalist id="an-values-{i}">
                    {#each metrics.find((m) => m.metric === draft.metric)?.labels[row.key] ?? [] as v}<option value={v}></option>{/each}
                  </datalist>
                  <button type="button" class="min-h-[44px] min-w-[44px] rounded-lg" style="background: {$colorStore.primary}10; color: {$colorStore.muted}" onclick={() => (filterRows = filterRows.filter((_, j) => j !== i))} aria-label="Remove filter"><i class="fa-solid fa-xmark"></i></button>
                </div>
              {/each}
            </div>
            <div class="grid grid-cols-3 gap-2">
              <label class="block">Group by
                <select class="mt-1 w-full min-h-[44px] rounded-lg border px-2 font-mono" style={field} value={draft.groupBy ?? ""} onchange={(e) => (draft.groupBy = e.currentTarget.value || null)}>
                  <option value="">none</option>
                  {#each labels as l}<option value={l}>{l}</option>{/each}
                </select>
              </label>
              <label class="block">Agg
                <select class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={draft.aggregation}>
                  {#each AGGREGATIONS as a}<option value={a}>{a}</option>{/each}
                </select>
              </label>
              <label class="block">Window
                <select class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={draft.windowSeconds}>
                  {#each WINDOWS as w}<option value={w}>{duration(w)}</option>{/each}
                </select>
              </label>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <label class="block">Comparator
                <select class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={draft.comparator}>
                  {#each COMPARATORS as c}<option value={c}>{c}</option>{/each}
                </select>
              </label>
              {#if draft.comparator !== "nodata"}
                <label class="block">{baseline ? "Threshold %" : "Threshold"}
                  <input type="number" step="any" class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={draft.threshold} />
                </label>
              {/if}
              {#if draft.comparator === "outside"}
                <label class="block">High
                  <input type="number" step="any" class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={draft.thresholdHigh} />
                </label>
              {/if}
            </div>
            {#if baseline}
              <div class="grid grid-cols-2 gap-2">
                <label class="block">Baseline
                  <select class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} value={String(draft.baselineDays ?? 7)} onchange={(e) => (draft.baselineDays = Number(e.currentTarget.value))}>
                    <option value="1">yesterday</option>
                    <option value="7">last week</option>
                  </select>
                </label>
                <label class="block">Direction
                  <select class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} value={draft.direction ?? "both"} onchange={(e) => (draft.direction = e.currentTarget.value)}>
                    <option value="both">both</option>
                    <option value="up">up</option>
                    <option value="down">down</option>
                  </select>
                </label>
              </div>
            {/if}
            <div class="grid grid-cols-3 gap-2">
              <label class="block">For
                <select class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={draft.forSeconds}>
                  {#each FOR_SECONDS as s}<option value={s}>{s ? duration(s) : "immediately"}</option>{/each}
                </select>
              </label>
              <label class="block">Cooldown
                <select class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={draft.cooldownSeconds}>
                  {#each COOLDOWNS as s}<option value={s}>{s ? duration(s) : "none"}</option>{/each}
                </select>
              </label>
              <label class="block">Repeat
                <select class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} value={String(draft.repeatSeconds ?? 0)} onchange={(e) => (draft.repeatSeconds = Number(e.currentTarget.value) || null)}>
                  {#each REPEATS as s}<option value={String(s)}>{s ? duration(s) : "once"}</option>{/each}
                </select>
              </label>
            </div>
            <label class="block">Min samples
              <input type="number" min="0" step="1" class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={draft.minSamples} placeholder="none" />
            </label>
          </div>

          <div class="space-y-3">
            <div>
              <p class="mb-1">Preview · {absolute ? "dashed = draft threshold" : "no fixed line for this comparator"}</p>
              {#if draft.metric}
                {#key draft.metric}
                  <AnalyticsChart metric={draft.metric} agg={draft.aggregation as AnalyticsAgg} groupBy={draft.groupBy ?? undefined} max={8} filters={[]} fixed={filters} bands extraBands={previewBands} noCompare height={200} />
                {/key}
              {:else}
                <p class="py-6 text-center">Pick a metric</p>
              {/if}
            </div>
            <label class="block">Webhook URL
              <input type="url" class="mt-1 w-full min-h-[44px] rounded-lg border px-2 font-mono" style={field} bind:value={draft.webhookUrl} placeholder="https://discord.com/api/webhooks/…" />
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label class="block">Mention role id
                <input type="text" inputmode="numeric" class="mt-1 w-full min-h-[44px] rounded-lg border px-2 font-mono" style={field} value={draft.mentionRoleId ?? ""} oninput={(e) => (draft.mentionRoleId = e.currentTarget.value)} />
              </label>
              <label class="block">Thread id
                <input type="text" inputmode="numeric" class="mt-1 w-full min-h-[44px] rounded-lg border px-2 font-mono" style={field} value={draft.threadId ?? ""} oninput={(e) => (draft.threadId = e.currentTarget.value)} />
              </label>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <label class="block">Quiet from (UTC)
                <input type="time" class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={quietStart} />
              </label>
              <label class="block">Quiet to (UTC)
                <input type="time" class="mt-1 w-full min-h-[44px] rounded-lg border px-2" style={field} bind:value={quietEnd} />
              </label>
            </div>
            <label class="flex items-center gap-2 min-h-[44px]">
              <input type="checkbox" bind:checked={draft.notifyOnResolve} style="accent-color: {$colorStore.primary}" /> notify on resolve
            </label>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 p-4 border-t" style="border-color: {$colorStore.primary}20;">
          {#if error}<span class="text-xs mr-auto" style="color: #f87171">{error}</span>{/if}
          <button type="button" class="min-h-[44px] px-4 rounded-lg text-sm" style="background: {$colorStore.primary}10; color: {$colorStore.muted}" onclick={close}>Cancel</button>
          <button type="button" class="min-h-[44px] px-4 rounded-lg text-sm font-medium disabled:opacity-50" style="background: {$colorStore.primary}30; color: {$colorStore.text}" onclick={save} disabled={saving}>
            {saving ? "Saving…" : rule ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  </Portal>
{/if}
