<!--
@component
Live Discord message preview that updates in real-time as user configures
Shows exactly what the message will look like in Discord
-->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";

  interface Props {
    content?: string;
    embeds?: any[];
    components?: any[];
    placeholders?: Record<string, string>;
    title?: string;
    sticky?: boolean;
  }

  let {
    content = "",
    embeds = [],
    components = [],
    placeholders = {},
    title = "Live Preview",
    sticky = false
  }: Props = $props();

  // Replace placeholders in content for preview
  function replacePlaceholders(text: string): string {
    if (!text) return text;
    let replaced = text;
    for (const [key, value] of Object.entries(placeholders)) {
      replaced = replaced.replaceAll(key, value);
    }
    return replaced;
  }

  // Process embeds with placeholder replacement
  let processedEmbeds = $derived(
    embeds.map(embed => ({
      ...embed,
      title: replacePlaceholders(embed.title || ""),
      description: replacePlaceholders(embed.description || ""),
      author: embed.author ? {
        ...embed.author,
        name: replacePlaceholders(embed.author.name || "")
      } : undefined,
      footer: embed.footer ? {
        ...embed.footer,
        text: replacePlaceholders(embed.footer.text || "")
      } : undefined,
      fields: embed.fields?.map((field: any) => ({
        ...field,
        name: replacePlaceholders(field.name || ""),
        value: replacePlaceholders(field.value || "")
      })) || []
    }))
  );

  let processedContent = $derived(replacePlaceholders(content));
</script>

<div
  class="live-preview rounded-xl border"
  class:sticky
  style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;"
>
  <!-- Preview Header -->
  <div class="px-4 py-3 border-b flex items-center gap-2"
       style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}08;">
    <i class="fa-solid fa-eye" style="color: {$colorStore.primary}; font-size: 16px;"></i>
    <h4 class="font-semibold text-sm" style="color: {$colorStore.text};">{title}</h4>
    <span class="ml-auto px-2 py-1 rounded-sm text-xs font-medium"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
      Live
    </span>
  </div>

  <!-- Discord Preview -->
  <div class="p-4">
    <PreviewCard
      {components}
      content={processedContent}
      embeds={processedEmbeds}
      emptyMessage="Your message will appear here as you configure it"
      showEmpty={true}
    />
  </div>

  <!-- Placeholder Legend (if placeholders exist) -->
  {#if Object.keys(placeholders).length > 0}
    <div class="px-4 pb-4">
      <details class="text-xs">
        <summary class="cursor-pointer font-medium mb-2" style="color: {$colorStore.muted};">
          Placeholder Values
        </summary>
        <div class="space-y-1 pl-4">
          {#each Object.entries(placeholders) as [key, value]}
            <div class="flex items-center gap-2">
              <code class="px-2 py-0.5 rounded-sm"
                    style="background: {$colorStore.primary}10; color: {$colorStore.primary};">
                {key}
              </code>
              <span style="color: {$colorStore.muted};">→</span>
              <span style="color: {$colorStore.text};">{value}</span>
            </div>
          {/each}
        </div>
      </details>
    </div>
  {/if}
</div>

<style>
    .sticky {
        position: sticky;
        top: 1rem;
    }

    @media (max-width: 768px) {
        .sticky {
            position: static;
        }
    }
</style>
