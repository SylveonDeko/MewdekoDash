<!-- lib/components/analytics/tabs/AlertsTab.svelte -->
<script lang="ts">
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
  import { isMuted, toInput } from "./alertText";

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

  const eventColumns: Column<AlertEvent>[] = [
    { key: "at", label: "When (UTC)", muted: true, format: (r) => stamp(r.at), sortValue: (r) => utcParse(r.at) },
    { key: "ruleName", label: "Rule" },
    { key: "severity", label: "Severity", tone: (r) => (r.severity === "critical" ? "crit" : r.severity === "warning" ? "warn" : "muted") },
    { key: "groupKey", label: "Group", mono: true, format: (r) => r.groupKey || "fleet" },
    { key: "toState", label: "Transition", format: (r) => `${r.fromState} → ${r.toState}`, tone: (r) => (r.toState === "firing" ? "crit" : r.toState === "pending" ? "warn" : r.toState === "resolved" || r.toState === "ok" ? "ok" : "muted") },
    { key: "value", label: "Value", num: true, format: (r) => `${compact(r.value)} vs ${compact(r.threshold)}` },
    { key: "notified", label: "Notified", format: (r) => (r.notified ? "yes" : "no"), tone: (r) => (r.notified ? "ok" : "muted") },
  ];

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
    const [r, f, m] = await Promise.allSettled([analyticsApi.alertRules(), analyticsApi.firingAlerts(), metricRegistry()]);
    if (my !== seq) return;
    rules = r.status === "fulfilled" ? r.value ?? [] : [];
    firing = f.status === "fulfilled" ? f.value ?? [] : [];
    metrics = m.status === "fulfilled" ? m.value ?? [] : [];
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
      say(`${rule.name} ${rule.enabled ? "disabled" : "enabled"}`);
    } catch (err) {
      fail(err, "Rule update failed");
    } finally {
      busy = null;
    }
  }

  async function test(rule: AlertRule) {
    busy = rule.id;
    try {
      const result = await analyticsApi.testAlertRule(rule.id);
      say(result?.success ? `Test sent for ${rule.name}` : `Discord rejected the test for ${rule.name}`, result?.success ? "success" : "error");
    } catch (err) {
      fail(err, "Test failed");
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
      say(minutes ? `${rule.name} muted for 1h` : `${rule.name} unmuted`);
    } catch (err) {
      fail(err, "Mute failed");
    } finally {
      busy = null;
    }
  }

  async function remove(rule: AlertRule) {
    if (!(await requestConfirmation({ title: "Delete rule", message: `Delete "${rule.name}" and its state history?`, confirmText: "Delete" }))) return;
    busy = rule.id;
    try {
      await analyticsApi.deleteAlertRule(rule.id);
      rules = rules.filter((r) => r.id !== rule.id);
      say(`${rule.name} deleted`);
    } catch (err) {
      fail(err, "Delete failed");
    } finally {
      busy = null;
    }
  }

  async function digest() {
    digestBusy = true;
    try {
      const result = await analyticsApi.sendAlertDigest();
      say(result?.success ? "Digest sent" : "Digest not sent", result?.success ? "success" : "error");
    } catch (err) {
      fail(err, "Digest failed");
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
    <button type="button" class="min-h-[44px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.primary}30; color: {$colorStore.text}" onclick={() => edit(null)}><i class="fa-solid fa-plus mr-2"></i>New rule</button>
    <button type="button" class="min-h-[44px] px-3 rounded-lg text-sm disabled:opacity-50" style="background: {$colorStore.primary}10; color: {$colorStore.text}" onclick={digest} disabled={digestBusy}><i class="fa-solid fa-envelope mr-2"></i>{digestBusy ? "Sending…" : "Send digest now"}</button>
    <span class="text-xs ml-auto" style="color: {$colorStore.muted}">{rules.length} rules · {rules.filter((r) => r.enabled).length} enabled</span>
  </div>

  <Card title="Firing">
    {#if firing.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}"><i class="fa-solid fa-check mr-2" style="color: #4ade80"></i>Nothing firing</p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {#each firing as a (`${a.ruleId}|${a.groupKey}`)}
          <div class="rounded-lg border p-2.5" style="border-color: {severityColor(a.severity)}40; background: {severityColor(a.severity)}12">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium truncate" style="color: {$colorStore.text}">{a.ruleName}</span>
              <Pill tone={a.severity === "critical" ? "crit" : a.severity === "warning" ? "warn" : "muted"} text={a.severity} />
            </div>
            <p class="text-xs mt-1 font-mono" style="color: {$colorStore.muted}">
              {a.metric} · {a.groupKey || "fleet"} · {compact(a.lastValue)} vs {compact(a.threshold)} · {ago(a.since)}
            </p>
          </div>
        {/each}
      </div>
    {/if}
  </Card>

  <Card title="Rules">
    <AlertRulesTable {rules} loading={rulesLoading} {busy} onEdit={edit} onToggle={toggle} onTest={test} onMute={mute} onDelete={remove} />
  </Card>

  <Card title="Events" note="newest first">
    {#snippet actions()}
      <select class="min-h-[44px] rounded-lg border px-2 text-xs" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.primary}20;" value={eventRule ?? ""} onchange={(e) => (eventRule = e.currentTarget.value ? Number(e.currentTarget.value) : null)} aria-label="Rule">
        <option value="">all rules</option>
        {#each rules as r (r.id)}<option value={r.id}>{r.name}</option>{/each}
      </select>
    {/snippet}
    <AnalyticsTable columns={eventColumns} rows={events.items} loading={eventsLoading} empty="No transitions yet" sortKey="at" page={events.page} pageSize={25} total={events.total} onPage={(p) => (eventPage = p)} />
  </Card>
</div>

<AlertRuleEditor bind:open={editorOpen} rule={editing} {metrics} onSaved={(r) => { replace(r); say(`${r.name} saved`); }} />

{#if toast}
  <Notification message={toast} type={toastType} onDismiss={() => (toast = "")} />
{/if}
