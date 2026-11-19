<!-- lib/components/translate/TranslationDiff.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { diffLines } from "$lib/wiki/diff";

  interface Props {
    before: string;
    after: string;
  }

  let { before, after }: Props = $props();

  const ops = $derived(diffLines(before, after));

  function rowStyle(kind: "same" | "add" | "del"): string {
    if (kind === "add") return `background: ${$colorStore.secondary}30; color: ${$colorStore.text};`;
    if (kind === "del") return `background: ${$colorStore.accent}30; color: ${$colorStore.text};`;
    return `color: ${$colorStore.muted};`;
  }

  function marker(kind: "same" | "add" | "del"): string {
    return kind === "add" ? "+" : kind === "del" ? "-" : " ";
  }
</script>

<div class="rounded-lg border overflow-hidden" style="border-color: {$colorStore.primary}20;">
  {#each ops as op, index (index)}
    <div class="flex text-sm leading-6" style={rowStyle(op.kind)}>
      <span class="w-6 shrink-0 text-center select-none" aria-hidden="true">{marker(op.kind)}</span>
      <span class="whitespace-pre-wrap break-words min-w-0 pr-3">{op.text || " "}</span>
    </div>
  {/each}
</div>
