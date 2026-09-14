<!-- lib/components/analytics/tabs/AlertRulesTable.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import type { AlertRule } from "$lib/api/analytics/models";
  import { ago, n } from "../format";
  import Pill from "../Pill.svelte";
  import { describe, isMuted, lastFired, worstState } from "./alertText";

  interface Props {
    rules: AlertRule[];
    loading?: boolean;
    busy?: number | null;
    onEdit: (rule: AlertRule) => void;
    onToggle: (rule: AlertRule) => void;
    onTest: (rule: AlertRule) => void;
    onMute: (rule: AlertRule) => void;
    onDelete: (rule: AlertRule) => void;
  }

  let { rules, loading = false, busy = null, onEdit, onToggle, onTest, onMute, onDelete }: Props = $props();

  function stateTone(rule: AlertRule): "ok" | "warn" | "crit" | "muted" {
    if (!rule.enabled) return "muted";
    const s = worstState(rule);
    return s === "firing" ? "crit" : s === "pending" ? "warn" : "ok";
  }

  function severityTone(severity: string): "crit" | "warn" | "muted" {
    return severity === "critical" ? "crit" : severity === "warning" ? "warn" : "muted";
  }

  function firedText(rule: AlertRule): string {
    const t = lastFired(rule);
    return Number.isNaN(t) ? "—" : ago(new Date(t).toISOString());
  }

  const action = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}`);
</script>

<div class="overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr class="text-xs" style="color: {$colorStore.muted}">
        <th class="px-2 py-2 text-left font-medium">On</th>
        <th class="px-2 py-2 text-left font-medium">Name</th>
        <th class="px-2 py-2 text-left font-medium">Condition</th>
        <th class="px-2 py-2 text-left font-medium">Severity</th>
        <th class="px-2 py-2 text-left font-medium">State</th>
        <th class="px-2 py-2 text-right font-medium">Last fired</th>
        <th class="px-2 py-2 text-right font-medium">30d</th>
        <th class="px-2 py-2 text-right font-medium">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#if loading && rules.length === 0}
        <tr><td colspan="8" class="px-2 py-4"><div class="h-3 rounded animate-pulse" style="background: {$colorStore.primary}20"></div></td></tr>
      {:else if rules.length === 0}
        <tr><td colspan="8" class="px-2 py-4 text-xs text-center" style="color: {$colorStore.muted}">No rules yet</td></tr>
      {:else}
        {#each rules as rule (rule.id)}
          {@const firing = rule.states.filter((s) => s.state === "firing").map((s) => s.groupKey || "fleet")}
          <tr class="border-t" style="border-color: {$colorStore.primary}10; opacity: {rule.enabled ? 1 : 0.6}">
            <td class="px-2 py-1.5">
              <button
                type="button"
                class="min-h-[44px] min-w-[44px] rounded-lg"
                style="background: {rule.enabled ? $colorStore.primary + '30' : $colorStore.primary + '10'}; color: {$colorStore.text}"
                onclick={() => onToggle(rule)}
                disabled={busy === rule.id}
                aria-label={rule.enabled ? "Disable rule" : "Enable rule"}
                title={rule.enabled ? "enabled" : "disabled"}
              ><i class="fa-solid {rule.enabled ? 'fa-toggle-on' : 'fa-toggle-off'}"></i></button>
            </td>
            <td class="px-2 py-1.5 whitespace-nowrap">
              <span class="font-medium" style="color: {$colorStore.text}">{rule.name}</span>
              {#if isMuted(rule)}<Pill tone="muted" text="muted" icon="fa-bell-slash" />{/if}
              {#if rule.description}<span class="block text-[11px] truncate max-w-[16rem]" style="color: {$colorStore.muted}" title={rule.description}>{rule.description}</span>{/if}
            </td>
            <td class="px-2 py-1.5 font-mono text-xs" style="color: {$colorStore.text}">
              {describe(rule)}
              {#if rule.groupBy}<span style="color: {$colorStore.muted}"> per {rule.groupBy}</span>{/if}
            </td>
            <td class="px-2 py-1.5"><Pill tone={severityTone(rule.severity)} text={rule.severity} /></td>
            <td class="px-2 py-1.5 whitespace-nowrap">
              <Pill tone={stateTone(rule)} text={rule.enabled ? worstState(rule) : "off"} />
              {#if firing.length}<span class="block text-[10px] font-mono truncate max-w-[12rem]" style="color: {$colorStore.muted}" title={firing.join(", ")}>{firing.join(", ")}</span>{/if}
            </td>
            <td class="px-2 py-1.5 text-right text-xs whitespace-nowrap" style="color: {$colorStore.muted}">{firedText(rule)}</td>
            <td class="px-2 py-1.5 text-right tabular-nums" style="color: {$colorStore.text}">{n(rule.firedLast30Days)}</td>
            <td class="px-2 py-1.5">
              <div class="flex items-center justify-end gap-1">
                <button type="button" class="min-h-[44px] min-w-[44px] rounded-lg" style={action} onclick={() => onEdit(rule)} disabled={busy === rule.id} aria-label="Edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="min-h-[44px] min-w-[44px] rounded-lg" style={action} onclick={() => onTest(rule)} disabled={busy === rule.id} aria-label="Send test" title="Send test"><i class="fa-solid fa-paper-plane"></i></button>
                <button type="button" class="min-h-[44px] min-w-[44px] rounded-lg" style={action} onclick={() => onMute(rule)} disabled={busy === rule.id} aria-label={isMuted(rule) ? "Unmute" : "Mute 1h"} title={isMuted(rule) ? `muted until ${rule.mutedUntil}` : "Mute 1h"}><i class="fa-solid {isMuted(rule) ? 'fa-bell' : 'fa-bell-slash'}"></i></button>
                <button type="button" class="min-h-[44px] min-w-[44px] rounded-lg" style="background: #f8717115; color: #f87171" onclick={() => onDelete(rule)} disabled={busy === rule.id} aria-label="Delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
