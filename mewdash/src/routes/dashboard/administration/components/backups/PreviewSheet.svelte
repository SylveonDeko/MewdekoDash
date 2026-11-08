<script lang="ts">
  import type { Snippet } from "svelte";
  import { m } from "$lib/i18n";
  import type { BackupPreview } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import Sheet from "$lib/components/ui/Sheet.svelte";

  interface Props {
    title: string;
    preview: BackupPreview;
    onclose: () => void;
    footer?: Snippet;
    children?: Snippet;
  }

  let { title, preview, onclose, footer, children }: Props = $props();

  const icons: Record<string, string> = {
    text: "fa-hashtag",
    announcement: "fa-bullhorn",
    voice: "fa-volume-high",
    stage: "fa-podcast",
    forum: "fa-comments"
  };

  const groups = $derived.by(() => {
    const categories = preview.channels.filter(channel => channel.type === "category");
    const children = preview.channels.filter(channel => channel.type !== "category");
    const loose = children.filter(channel => !channel.category);
    return [
      ...(loose.length ? [{ name: null as string | null, items: loose }] : []),
      ...categories.map(category => ({
        name: category.name as string | null,
        items: children.filter(channel => channel.category === category.name)
      }))
    ];
  });

  const counts = $derived([
    { label: m.common.roles(), value: preview.roles.length },
    { label: m.common.channels(), value: preview.channels.length },
    { label: m.serverTools.backupEmojis(), value: preview.emojiCount },
    { label: m.common.messages(), value: preview.messageCount }
  ]);

  function swatch(color: number): string {
    return color ? `#${color.toString(16).padStart(6, "0")}` : $colorStore.muted;
  }
</script>

<Sheet {title} {onclose} {footer} size="lg">
  {@render children?.()}

  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
    {#each counts as item (item.label)}
      <div class="rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
        <div class="text-lg font-semibold" style="color: {$colorStore.text}">{item.value}</div>
        <div class="text-xs truncate" style="color: {$colorStore.muted}">{item.label}</div>
      </div>
    {/each}
  </div>

  {#if preview.roles.length > 0}
    <div class="space-y-2">
      <h4 class="text-sm font-semibold" style="color: {$colorStore.text}">{m.common.roles()}</h4>
      <div class="flex flex-wrap gap-1.5">
        {#each preview.roles as role, index (index)}
          <span class="inline-flex items-center gap-1.5 max-w-full text-xs px-2 py-1 rounded-full" style="background: {$colorStore.primary}10; color: {$colorStore.text};">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: {swatch(role.color)};"></span>
            <span class="truncate">{role.name}</span>
          </span>
        {/each}
      </div>
    </div>
  {/if}

  {#if groups.length > 0}
    <div class="space-y-3">
      <h4 class="text-sm font-semibold" style="color: {$colorStore.text}">{m.common.channels()}</h4>
      {#each groups as group, index (index)}
        <div class="rounded-lg p-3 space-y-1" style="background: {$colorStore.primary}08;">
          {#if group.name}
            <div class="text-xs font-semibold uppercase tracking-wide truncate" style="color: {$colorStore.muted}">{group.name}</div>
          {/if}
          {#each group.items as channel, position (position)}
            <div class="flex items-center gap-2 text-sm min-w-0" style="color: {$colorStore.text}">
              <i class="fa-solid {icons[channel.type] ?? 'fa-hashtag'} w-4 text-center shrink-0" style="color: {$colorStore.muted}" aria-hidden="true"></i>
              <span class="truncate">{channel.name}</span>
            </div>
          {/each}
          {#if group.items.length === 0}
            <div class="text-sm" style="color: {$colorStore.muted}">{m.serverTools.previewEmptyCategory()}</div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</Sheet>
