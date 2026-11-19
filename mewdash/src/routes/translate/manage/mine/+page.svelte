<!-- routes/translate/manage/mine/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { colorStore } from "$lib/stores/colorStore";
  import { groupLabel } from "$lib/translate/client";
  import type { TranslationStatus } from "$lib/translate/records";
  import { translationLimits } from "$lib/translate/rules";
  import { formatWhen, localeLabel } from "$lib/wiki/client";

  let { data } = $props();

  const rows = $derived(data.suggestions?.rows ?? []);
  const totalPages = $derived(data.suggestions ? Math.max(1, Math.ceil(data.suggestions.total / translationLimits.pageSize)) : 1);

  function statusLabel(status: TranslationStatus): string {
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

  function chip(): string {
    return `background: transparent; color: ${$colorStore.muted}; border: 1px solid ${$colorStore.primary}20;`;
  }

  function go(target: number) {
    void goto(target > 1 ? `${page.url.pathname}?page=${target}` : page.url.pathname, { replaceState: true });
  }
</script>

<section class="space-y-3">
  <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.wikiManage.mineLink()}</h2>
  {#if rows.length === 0}
    <p style="color: {$colorStore.muted}">{m.translate.mineEmpty()}</p>
  {:else}
    <ul>
      {#each rows as suggestion (suggestion.id)}
        <li class="py-3 space-y-1" style="border-top: 1px solid {$colorStore.primary}20;">
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs" style="color: {$colorStore.muted}">
            <code class="break-all">{suggestion.key}</code>
            {#if suggestion.group}
              <span>{groupLabel(suggestion.group)}</span>
            {/if}
          </div>
          <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{suggestion.text}</p>
          <div class="text-xs" style="color: {$colorStore.muted}">
            {m.wikiManage.mineMeta({ status: statusLabel(suggestion.status), language: localeLabel(suggestion.locale), when: formatWhen(suggestion.createdAt) })}
          </div>
          {#if suggestion.status === "declined" && suggestion.declineReason}
            <div class="text-sm break-words" style="color: {$colorStore.muted}">{suggestion.declineReason}</div>
          {/if}
        </li>
      {/each}
    </ul>

    {#if data.suggestions && totalPages > 1}
      <div class="flex flex-wrap items-center gap-3">
        {#if data.suggestions.page > 1}
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip()}
                  onclick={() => go(data.suggestions!.page - 1)}>{m.common.previous()}</button>
        {/if}
        <span class="text-sm" style="color: {$colorStore.muted}">{m.common.pageOfTotal({ page: data.suggestions.page, total: totalPages })}</span>
        {#if data.suggestions.page < totalPages}
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip()}
                  onclick={() => go(data.suggestions!.page + 1)}>{m.common.next()}</button>
        {/if}
      </div>
    {/if}
  {/if}
</section>
