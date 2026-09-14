<!-- lib/components/wiki/WikiArticle.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import type { WikiArticle } from "$lib/wiki/types";

  interface Props {
    article: WikiArticle;
    /** Compact spacing for use inside a drawer or panel. */
    compact?: boolean;
  }

  let { article, compact = false }: Props = $props();

</script>

<article
  class="wiki-article {compact ? 'wiki-compact' : ''}"
  style="--wiki-primary: {$colorStore.primary};
         --wiki-secondary: {$colorStore.secondary};
         --wiki-accent: {$colorStore.accent};
         --wiki-text: {$colorStore.text};
         --wiki-muted: {$colorStore.muted};"
>
  {@html article.html}
</article>

<style>
  .wiki-article {
    color: var(--wiki-text);
    line-height: 1.7;
    font-size: 1rem;
    max-width: none;
    overflow-wrap: anywhere;
  }

  .wiki-compact {
    font-size: 0.95rem;
  }

  .wiki-article :global(h2) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 2.5rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid color-mix(in srgb, var(--wiki-primary) 25%, transparent);
    scroll-margin-top: 6rem;
    position: relative;
  }

  .wiki-compact :global(h2) {
    font-size: 1.25rem;
    margin-top: 1.75rem;
  }

  .wiki-article :global(h2:first-child) {
    margin-top: 0;
  }

  .wiki-article :global(h3) {
    font-size: 1.15rem;
    font-weight: 600;
    margin-top: 1.75rem;
    margin-bottom: 0.5rem;
    color: var(--wiki-primary);
    scroll-margin-top: 6rem;
    position: relative;
  }

  .wiki-article :global(.wiki-anchor) {
    position: absolute;
    left: -1.25rem;
    color: var(--wiki-muted);
    opacity: 0;
    text-decoration: none;
    font-weight: 400;
    transition: opacity 150ms ease;
  }

  .wiki-article :global(h2:hover .wiki-anchor),
  .wiki-article :global(h3:hover .wiki-anchor) {
    opacity: 0.7;
  }

  .wiki-article :global(p) {
    margin: 0.75rem 0;
  }

  .wiki-article :global(a) {
    color: var(--wiki-primary);
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--wiki-primary) 40%, transparent);
    text-underline-offset: 3px;
  }

  .wiki-article :global(a:hover) {
    text-decoration-color: var(--wiki-primary);
  }

  .wiki-article :global(strong) {
    color: var(--wiki-text);
    font-weight: 600;
  }

  .wiki-article :global(ul),
  .wiki-article :global(ol) {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  .wiki-article :global(ul) {
    list-style: disc;
  }

  .wiki-article :global(ol) {
    list-style: decimal;
  }

  .wiki-article :global(li) {
    margin: 0.35rem 0;
  }

  .wiki-article :global(li::marker) {
    color: var(--wiki-primary);
  }

  .wiki-article :global(code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.875em;
    padding: 0.15rem 0.4rem;
    border-radius: 0.375rem;
    background: color-mix(in srgb, var(--wiki-primary) 14%, transparent);
    color: var(--wiki-text);
    border: 1px solid color-mix(in srgb, var(--wiki-primary) 20%, transparent);
  }

  .wiki-article :global(pre) {
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 0.75rem;
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid color-mix(in srgb, var(--wiki-primary) 25%, transparent);
    overflow-x: auto;
  }

  .wiki-article :global(pre code) {
    padding: 0;
    border: 0;
    background: transparent;
    font-size: 0.85rem;
  }

  .wiki-article :global(blockquote) {
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    border-left: 3px solid var(--wiki-secondary);
    color: var(--wiki-muted);
    background: color-mix(in srgb, var(--wiki-secondary) 8%, transparent);
    border-radius: 0 0.5rem 0.5rem 0;
  }

  .wiki-article :global(hr) {
    border: 0;
    border-top: 1px solid color-mix(in srgb, var(--wiki-primary) 20%, transparent);
    margin: 2rem 0;
  }

  .wiki-article :global(.wiki-table) {
    margin: 1rem 0;
    overflow-x: auto;
    border: 1px solid color-mix(in srgb, var(--wiki-primary) 25%, transparent);
    border-radius: 0.75rem;
  }

  .wiki-article :global(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.925rem;
  }

  .wiki-article :global(thead) {
    background: color-mix(in srgb, var(--wiki-primary) 15%, transparent);
  }

  .wiki-article :global(th) {
    text-align: left;
    font-weight: 600;
    padding: 0.6rem 0.9rem;
    color: var(--wiki-text);
    white-space: nowrap;
  }

  .wiki-article :global(td) {
    padding: 0.6rem 0.9rem;
    border-top: 1px solid color-mix(in srgb, var(--wiki-primary) 15%, transparent);
    vertical-align: top;
  }

  .wiki-article :global(tbody tr:hover) {
    background: color-mix(in srgb, var(--wiki-primary) 6%, transparent);
  }

  .wiki-article :global(img) {
    max-width: 100%;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--wiki-primary) 25%, transparent);
  }

  .wiki-article :global(.wiki-callout) {
    margin: 1.25rem 0;
    padding: 0.85rem 1rem;
    border-radius: 0.75rem;
    border: 1px solid var(--callout, var(--wiki-primary));
    border-left-width: 4px;
    background: color-mix(in srgb, var(--callout, var(--wiki-primary)) 10%, transparent);
  }

  .wiki-article :global(.wiki-callout p) {
    margin: 0.25rem 0 0;
  }

  .wiki-article :global(.wiki-callout-label) {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--callout, var(--wiki-primary));
  }

  .wiki-article :global(.wiki-callout-tip) {
    --callout: #19f5aa;
  }

  .wiki-article :global(.wiki-callout-note) {
    --callout: #60a5fa;
  }

  .wiki-article :global(.wiki-callout-warning) {
    --callout: #f59e0b;
  }

  .wiki-article :global(.wiki-callout-permission) {
    --callout: #f472b6;
  }

  .wiki-article :global(.wiki-callout-example) {
    --callout: #a78bfa;
  }
</style>
