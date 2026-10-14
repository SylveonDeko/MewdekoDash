<!-- lib/components/analytics/tabs/AlertsTab.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import Notification from "$lib/components/ui/Notification.svelte";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { AlertEvent, AlertRule, FiringAlert, MetricDescriptor, Page } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick } from "$lib/stores/analyticsFilters";
  import { metricRegistry } from "../registry";
  import { ago, compact, stamp, utcParse } from "../format";
  import { severityColor } from "../palette";
  import AnalyticsTable, { type Column } from "../AnalyticsTable.svelte";
  import Card from "../Card.svelte";
  import Pill from "../Pill.svelte";
  import AlertRuleEditor from "./AlertRuleEditor.svelte";
  import AlertRulesTable from "./AlertRulesTable.svelte";
  import { isMuted, severityLabel, stateLabel, toInput } from "./alertText";

  let rules = $state<AlertRule[]>([]);
  let rulesLoading = $state(true);
  let firing = $state<FiringAlert[]>([]);
  let events = $state<Page<AlertEvent>>({ items: [], page: 1, pageSize: 25, total: 0 });
  let eventsLoading = $state(true);
  let eventPage = $state(1);
  let eventRule = $state<number | null>(null);
  let metrics = $state<MetricDescriptor[]>([]);
  let editorOpen = $state(false);
  let editing = $state<AlertRule | null>(null);
  let busy = $state<number | null>(null);
  let digestBusy = $state(false);
  let toast = $state("");
  let toastType = $state<"success" | "error">("success");
  let seq = 0;
  let eventSeq = 0;

  const stateName = (s: string) => (s === "resolved" ? m.analytics.tabAlertsStateResolved() : s === "firing" || s === "pending" || s === "ok" ? stateLabel(s) : s);

  const eventColumns: Column<AlertEvent>[] = $derived([
    { key: "at", label: m.analytics.tableColWhenUtc(), muted: true, format: (r) => stamp(r.at), sortValue: (r) => utcParse(r.at) },
    { key: "ruleName", label: m.analytics.tabAlertsColRule() },
    { key: "severity", label: m.analytics.tabAlertsColSeverity(), format: (r) => severityLabel(r.severity), tone: (r) => (r.severity === "critical" ? "crit" : r.severity === "warning" ? "warn" : "muted") },
    { key: "groupKey", label: m.common.group(), mono: true, format: (r) => r.groupKey || m.analytics.tabAlertsFleet() },
    { key: "toState", label: m.analytics.tabAlertsColTransition(), format: (r) => m.analytics.tabAlertsTransition({ from: stateName(r.fromState), to: stateName(r.toState) }), tone: (r) => (r.toState === "firing" ? "crit" : r.toState === "pending" ? "warn" : r.toState === "resolved" || r.toState === "ok" ? "ok" : "muted") },
    { key: "value", label: m.common.value(), num: true, format: (r) => m.analytics.tabAlertsValueVs({ value: compact(r.value), threshold: compact(r.threshold) }) },
    { key: "notified", label: m.analytics.tabAlertsColNotified(), format: (r) => (r.notified ? m.common.yes() : m.common.no()), tone: (r) => (r.notified ? "ok" : "muted") },
  ]);

  function say(message: string, type: "success" | "error" = "success") {
    toast = "";
    toastType = type;
    queueMicrotask(() => (toast = message));
  }

  function fail(err: unknown, fallback: string) {
    logger.warn(fallback, err);
    say(err instanceof Error && err.message ? err.message : fallback, "error");
  }

  async function load() {
    const my = ++seq;
    rulesLoading = true;
    const [r, f, reg] = await Promise.allSettled([analyticsApi.alertRules(), analyticsApi.firingAlerts(), metricRegistry()]);
    if (my !== seq) return;
    rules = r.status === "fulfilled" ? r.value ?? [] : [];
    firing = f.status === "fulfilled" ? f.value ?? [] : [];
    metrics = reg.status === "fulfilled" ? reg.value ?? [] : [];
    for (const x of [r, f]) if (x.status === "rejected") logger.warn("Alerts tab query failed", x.reason);
    rulesLoading = false;
  }

  async function loadEvents() {
    const my = ++eventSeq;
    eventsLoading = true;
    try {
      const result = await analyticsApi.alertEvents({ page: eventPage, pageSize: 25, ruleId: eventRule ?? undefined });
      if (my !== eventSeq) return;
      events = result ?? { items: [], page: eventPage, pageSize: 25, total: 0 };
    } catch (err) {
      if (my !== eventSeq) return;
      logger.warn("Alert events failed", err);
      events = { items: [], page: eventPage, pageSize: 25, total: 0 };
    } finally {
      if (my === eventSeq) eventsLoading = false;
    }
  }

  function replace(saved: AlertRule) {
    rules = rules.some((r) => r.id === saved.id) ? rules.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...rules];
  }

  function edit(rule: AlertRule | null) {
    editing = rule;
    editorOpen = true;
  }

  async function toggle(rule: AlertRule) {
    busy = rule.id;
    try {
      replace(await analyticsApi.updateAlertRule(rule.id, { ...toInput(rule), enabled: !rule.enabled }));
      say(rule.enabled ? m.analytics.tabAlertsToastDisabled({ name: rule.name }) : m.analytics.tabAlertsToastEnabled({ name: rule.name }));
    } catch (err) {
      fail(err, m.analytics.tabAlertsErrUpdate());
    } finally {
      busy = null;
    }
  }

  async function test(rule: AlertRule) {
    busy = rule.id;
    try {
      const result = await analyticsApi.testAlertRule(rule.id);
      say(result?.success ? m.analytics.tabAlertsToastTestSent({ name: rule.name }) : m.analytics.tabAlertsToastTestRejected({ name: rule.name }), result?.success ? "success" : "error");
    } catch (err) {
      fail(err, m.analytics.tabAlertsErrTest());
    } finally {
      busy = null;
    }
  }

  async function mute(rule: AlertRule) {
    busy = rule.id;
    const minutes = isMuted(rule) ? 0 : 60;
    try {
      const result = await analyticsApi.muteAlertRule(rule.id, minutes);
      replace({ ...rule, mutedUntil: result?.mutedUntil ?? null });
      say(minutes ? m.analytics.tabAlertsToastMuted({ name: rule.name }) : m.analytics.tabAlertsToastUnmuted({ name: rule.name }));
    } catch (err) {
      fail(err, m.analytics.tabAlertsErrMute());
    } finally {
      busy = null;
    }
  }

  async function remove(rule: AlertRule) {
    if (!(await requestConfirmation({ title: m.analytics.tabAlertsConfirmDeleteTitle(), message: m.analytics.tabAlertsConfirmDeleteMessage({ name: rule.name }), confirmText: m.common.delete() }))) return;
    busy = rule.id;
    try {
      await analyticsApi.deleteAlertRule(rule.id);
      rules = rules.filter((r) => r.id !== rule.id);
      say(m.analytics.tabAlertsToastDeleted({ name: rule.name }));
    } catch (err) {
      fail(err, m.analytics.tabAlertsErrDelete());
    } finally {
      busy = null;
    }
  }

  async function digest() {
    digestBusy = true;
    try {
      const result = await analyticsApi.sendAlertDigest();
      say(result?.success ? m.analytics.tabAlertsToastDigestSent() : m.analytics.tabAlertsToastDigestNotSent(), result?.success ? "success" : "error");
    } catch (err) {
      fail(err, m.analytics.tabAlertsErrDigest());
    } finally {
      digestBusy = false;
    }
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick];
    void load();
  });

  $effect(() => {
    void [$analyticsRefreshTick, eventPage, eventRule];
    void loadEvents();
  });

  $effect(() => {
    void eventRule;
    eventPage = 1;
  });
</script>

<div class="space-y-4">
  <div class="flex flex-wrap items-center gap-2">
    <button type="button" class="min-h-[44px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.primary}30; color: {$colorStore.text}" onclick={() => edit(null)}><i class="fa-solid fa-plus mr-2"></i>{m.analytics.tabAlertsNewRule()}</button>
    <button type="button" class="min-h-[44px] px-3 rounded-lg text-sm disabled:opacity-50" style="background: {$colorStore.primary}10; color: {$colorStore.text}" onclick={digest} disabled={digestBusy}><i class="fa-solid fa-envelope mr-2"></i>{digestBusy ? m.common.sending() : m.analytics.tabAlertsSendDigest()}</button>
    <span class="text-xs ml-auto" style="color: {$colorStore.muted}">{m.analytics.tabAlertsRulesSummary({ rules: rules.length, enabled: rules.filter((r) => r.enabled).length })}</span>
  </div>

  <Card title={m.analytics.tabAlertsCardFiring()}>
    {#if firing.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}"><i class="fa-solid fa-check mr-2" style="color: #4ade80"></i>{m.analytics.tabAlertsNothingFiring()}</p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {#each firing as a (`${a.ruleId}|${a.groupKey}`)}
          <div class="rounded-lg border p-2.5" style="border-color: {severityColor(a.severity)}40; background: {severityColor(a.severity)}12">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium truncate" style="color: {$colorStore.text}">{a.ruleName}</span>
              <Pill tone={a.severity === "critical" ? "crit" : a.severity === "warning" ? "warn" : "muted"} text={severityLabel(a.severity)} />
            </div>
            <p class="text-xs mt-1 font-mono" style="color: {$colorStore.muted}">
              {a.metric} · {a.groupKey || m.analytics.tabAlertsFleet()} · {compact(a.lastValue)} vs {compact(a.threshold)} · {ago(a.since)}
            </p>
          </div>
        {/each}
      </div>
    {/if}
  </Card>

  <Card title={m.common.rules()}>
    <AlertRulesTable {rules} loading={rulesLoading} {busy} onEdit={edit} onToggle={toggle} onTest={test} onMute={mute} onDelete={remove} />
  </Card>

  <Card title={m.common.events()} note={m.analytics.tabAlertsNewestFirst()}>
    {#snippet actions()}
      <select class="min-h-[44px] rounded-lg border px-2 text-xs" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.primary}20;" value={eventRule ?? ""} onchange={(e) => (eventRule = e.currentTarget.value ? Number(e.currentTarget.value) : null)} aria-label={m.analytics.tabAlertsColRule()}>
        <option value="">{m.analytics.tabAlertsAllRules()}</option>
        {#each rules as r (r.id)}<option value={r.id}>{r.name}</option>{/each}
      </select>
    {/snippet}
    <AnalyticsTable columns={eventColumns} rows={events.items} loading={eventsLoading} empty={m.analytics.tabAlertsNoTransitions()} sortKey="at" page={events.page} pageSize={25} total={events.total} onPage={(p) => (eventPage = p)} />
  </Card>
</div>

<AlertRuleEditor bind:open={editorOpen} rule={editing} {metrics} onSaved={(r) => { replace(r); say(m.analytics.tabAlertsToastSaved({ name: r.name })); }} />

{#if toast}
  <Notification message={toast} type={toastType} onDismiss={() => (toast = "")} />
{/if}
