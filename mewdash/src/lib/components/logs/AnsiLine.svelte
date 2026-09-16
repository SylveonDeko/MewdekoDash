<!-- lib/components/logs/AnsiLine.svelte -->
<script lang="ts">
  import { parseAnsi, type AnsiSpan } from "./ansi";

  interface Props {
    /** The raw line, escape sequences included. */
    text: string;
  }

  let { text }: Props = $props();

  let spans = $derived(parseAnsi(text));

  function styleFor(span: AnsiSpan): string {
    const parts: string[] = [];
    if (span.color) parts.push(`color: ${span.color}`);
    if (span.background) parts.push(`background: ${span.background}`);
    if (span.bold) parts.push("font-weight: 700");
    if (span.dim) parts.push("opacity: 0.6");
    if (span.italic) parts.push("font-style: italic");
    if (span.underline) parts.push("text-decoration: underline");
    return parts.join("; ");
  }
</script>

{#each spans as span}<span style={styleFor(span)}>{span.text}</span>{/each}
