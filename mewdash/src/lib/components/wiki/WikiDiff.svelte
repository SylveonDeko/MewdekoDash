<!-- lib/components/wiki/WikiDiff.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { collapseDiff, diffStats, type FieldDiff } from "$lib/wiki/diff";

  interface Props {
    diffs: FieldDiff[];
  }

  let { diffs }: Props = $props();

  function fieldLabel(field: FieldDiff["field"]): string {
    switch (field) {
      case "title":
        return m.common.title();
      case "summary":
        return m.wikiManage.fieldSummary();
      case "tags":
        return m.wikiManage.fieldTags();
      default:
        return m.wikiManage.fieldBody();
    }
  }

  function rowStyle(kind: "same" | "add" | "del"): string {
    if (kind === "add") return `background: ${$colorStore.secondary}30; color: ${$colorStore.text};`;
    if (kind === "del") return `background: ${$colorStore.accent}30; color: ${$colorStore.text};`;
    return `color: ${$colorStore.muted};`;
  }

  function marker(kind: "same" | "add" | "del"): string {
    return kind === "add" ? "+" : kind === "del" ? "-" : " ";
  }
</script>

{#if diffs.length === 0}
  <p class="text-sm" style="color: {$colorStore.muted}">{m.wikiManage.diffNoChanges()}</p>
{:else}
  <div class="space-y-4">
    {#each diffs as diff (diff.field)}
      {@const stats = diffStats(diff.ops)}
      <section class="space-y-2">
        <div class="flex flex-wrap items-baseline gap-x-3">
          <h4 class="text-sm font-semibold" style="color: {$colorStore.text}">{fieldLabel(diff.field)}</h4>
          <span class="text-xs" style="color: {$colorStore.muted}">{m.wikiManage.diffStats({ added: stats.added, deleted: stats.deleted })}</span>
        </div>
        <div class="rounded-lg border overflow-x-auto" style="border-color: {$colorStore.primary}20;">
          {#each collapseDiff(diff.ops) as chunk, chunkIndex (chunkIndex)}
            {#if chunkIndex > 0}
              <div class="px-3 py-1 text-xs" style="background: {$colorStore.primary}10; color: {$colorStore.muted};" aria-hidden="true">...</div>
            {/if}
            {#each chunk as op, lineIndex (lineIndex)}
              <div class="flex font-mono text-sm leading-6 min-w-max" style={rowStyle(op.kind)}>
                <span class="w-6 shrink-0 text-center select-none" aria-hidden="true">{marker(op.kind)}</span>
                <span class="whitespace-pre pr-3">{op.text || " "}</span>
              </div>
            {/each}
          {/each}
        </div>
      </section>
    {/each}
  </div>
{/if}
