<!-- routes/wiki/manage/recent/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { formatWhen, localeLabel } from "$lib/wiki/client";

  let { data } = $props();
</script>

<section class="rounded-2xl border p-4 sm:p-6 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
  <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.wikiManage.tabRecent()}</h2>
  {#if data.changes.length === 0}
    <p style="color: {$colorStore.muted}">{m.wikiManage.recentEmpty()}</p>
  {:else}
    <ul class="space-y-2">
      {#each data.changes as change (change.id)}
        <li class="rounded-xl border p-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <a href="/wiki/manage/{change.pageId}?locale={change.locale}&tab=history" class="font-semibold break-words" style="color: {$colorStore.text}">
            {change.pageTitle}
          </a>
          <div class="text-xs mt-1" style="color: {$colorStore.muted}">
            {m.wikiManage.changeMeta({ language: localeLabel(change.locale), name: change.authorName, when: formatWhen(change.createdAt) })}
          </div>
          {#if change.note}
            <div class="text-sm mt-1 break-words" style="color: {$colorStore.muted}">{change.note}</div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>
