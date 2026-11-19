<!-- routes/wiki/manage/mine/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { formatWhen, localeLabel } from "$lib/wiki/client";
  import type { SuggestionRecord } from "$lib/wiki/records";

  let { data } = $props();

  function statusLabel(status: SuggestionRecord["status"]): string {
    switch (status) {
      case "open":
        return m.common.open();
      case "approved":
        return m.common.approved();
      case "declined":
        return m.wikiManage.statusDeclined();
      default:
        return m.wikiManage.statusReplaced();
    }
  }
</script>

<section class="rounded-2xl border p-4 sm:p-6 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
  <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.wikiManage.mineLink()}</h2>
  {#if data.suggestions.length === 0}
    <p style="color: {$colorStore.muted}">{m.wikiManage.mineEmpty()}</p>
  {:else}
    <ul class="space-y-2">
      {#each data.suggestions as suggestion (suggestion.id)}
        <li class="rounded-xl border p-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <a href="/wiki/{suggestion.slug}" class="font-semibold break-words" style="color: {$colorStore.text}">{suggestion.pageTitle}</a>
          <div class="text-xs mt-1" style="color: {$colorStore.muted}">
            {m.wikiManage.mineMeta({ status: statusLabel(suggestion.status), language: localeLabel(suggestion.locale), when: formatWhen(suggestion.createdAt) })}
          </div>
          {#if suggestion.status === "declined" && suggestion.declineReason}
            <div class="text-sm mt-1 break-words" style="color: {$colorStore.muted}">{suggestion.declineReason}</div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>
