<script lang="ts">
  import { slide } from "svelte/transition";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { AuditAction, AuditLogEntry } from "$lib/api/auditlog/models";
  import { actionMeta, describeEndpoint, formatDate, summarizeChanges, type Tone } from "./auditModel";

  interface Props {
    entry: AuditLogEntry;
    section: string;
    expanded: boolean;
    ontoggle: () => void;
  }

  let { entry, section, expanded, ontoggle }: Props = $props();

  const meta = $derived(actionMeta()[entry.action as AuditAction]);
  const rows = $derived(summarizeChanges(entry.changes));
  const endpoint = $derived(describeEndpoint(entry));

  function tone(value: Tone): string {
    if (value === "accent") return $colorStore.accent;
    if (value === "secondary") return $colorStore.secondary;
    return $colorStore.primary;
  }
</script>

<div
  class="rounded-xl border p-3 min-w-0"
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <div class="flex flex-wrap items-center justify-between gap-2">
    <span
      class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium"
      style="background: {tone(meta.tone)}20; color: {$colorStore.text};"
    >
      <i class="fa-solid {meta.icon}" style="color: {tone(meta.tone)}" aria-hidden="true"></i>
      {meta.label}
    </span>
    <span class="text-xs" style="color: {$colorStore.muted}">{formatDate(entry.dateAdded)}</span>
  </div>

  <div class="mt-2 flex flex-col sm:flex-row sm:items-baseline sm:gap-3 min-w-0">
    <span class="text-sm font-medium truncate" style="color: {$colorStore.text}">
      {entry.userName || entry.userId.toString()}
    </span>
    <span class="text-sm truncate" style="color: {$colorStore.muted}">{section}</span>
  </div>
  {#if endpoint}
    <div class="mt-0.5 text-xs font-mono break-all" style="color: {$colorStore.muted}">
      {entry.httpMethod}
      {endpoint}
    </div>
  {/if}

  {#if rows.length > 0}
    <button
      type="button"
      class="mt-2 w-full sm:w-auto px-4 rounded-lg min-h-[44px] text-sm font-medium"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      aria-expanded={expanded}
      onclick={ontoggle}
    >
      {expanded ? m.auditlog.pageDetailsHideLong() : m.auditlog.pageDetailsShowLong()}
    </button>
    {#if expanded}
      <div
        class="mt-2 space-y-1.5 rounded-lg p-3"
        style="background: {$colorStore.primary}10;"
        transition:slide={{ duration: 150 }}
      >
        {#each rows as row, i (i)}
          <div class="flex flex-wrap items-baseline gap-x-2 min-w-0">
            <span class="text-xs font-semibold" style="color: {$colorStore.text}">{row.label}</span>
            {#if row.before !== undefined}
              <span class="text-xs break-all" style="color: {$colorStore.muted}">{row.before}</span>
              <i class="fa-solid fa-arrow-right text-[10px]" style="color: {$colorStore.muted}" aria-hidden="true"></i>
            {/if}
            <span class="text-xs break-all" style="color: {$colorStore.text}">{row.after}</span>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
