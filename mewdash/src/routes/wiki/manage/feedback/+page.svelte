<!-- routes/wiki/manage/feedback/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { invalidateAll } from "$app/navigation";
  import { colorStore } from "$lib/stores/colorStore";
  import { formatWhen, localeLabel, wikiCall, wikiErrorMessage } from "$lib/wiki/client";

  let { data } = $props();

  let busyId = $state<string | null>(null);
  let error = $state<string | null>(null);

  function reasonLabel(reason: string): string {
    switch (reason) {
      case "unclear":
        return m.wikiManage.reasonUnclear();
      case "outdated":
        return m.wikiManage.reasonOutdated();
      case "missing":
        return m.wikiManage.reasonMissing();
      case "incorrect":
        return m.wikiManage.reasonIncorrect();
      default:
        return m.common.other();
    }
  }

  async function close(id: string, status: "resolved" | "dismissed") {
    busyId = id;
    error = null;
    const result = await wikiCall("POST", `/api/wiki/feedback/${id}`, { status });
    busyId = null;
    if (!result.ok) {
      error = wikiErrorMessage(result.error);
      return;
    }
    await invalidateAll();
  }

  function viewStyle(active: boolean): string {
    return active
      ? `background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}40;`
      : `background: transparent; color: ${$colorStore.muted}; border: 1px solid ${$colorStore.primary}20;`;
  }
</script>

<section class="rounded-2xl border p-4 sm:p-6 space-y-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
  <div class="flex flex-wrap gap-2" role="group" aria-label={m.wikiManage.sectionsAria()}>
    <a href="/wiki/manage/feedback" class="inline-flex items-center px-4 rounded-lg min-h-[44px] text-sm font-medium" style={viewStyle(!data.resolved)}
       aria-current={!data.resolved ? "page" : undefined}>{m.common.open()}</a>
    <a href="/wiki/manage/feedback?show=resolved" class="inline-flex items-center px-4 rounded-lg min-h-[44px] text-sm font-medium" style={viewStyle(data.resolved)}
       aria-current={data.resolved ? "page" : undefined}>{m.wikiManage.feedbackResolved()}</a>
  </div>

  {#if error}
    <p class="text-sm text-red-400" role="alert">{error}</p>
  {/if}

  {#if data.feedback.length === 0}
    <p style="color: {$colorStore.muted}">{m.wikiManage.feedbackEmpty()}</p>
  {:else}
    <ul class="space-y-2">
      {#each data.feedback as item (item.id)}
        <li class="rounded-xl border p-3 flex flex-wrap items-center gap-x-3 gap-y-2"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="min-w-0 grow">
            <a href="/wiki/{item.slug}" class="font-semibold break-words" style="color: {$colorStore.text}">{item.pageTitle}</a>
            <div class="text-xs" style="color: {$colorStore.muted}">
              {m.wikiManage.feedbackMeta({
                answer: item.helpful ? m.wikiManage.feedbackHelpful() : m.wikiManage.feedbackNotHelpful(),
                language: localeLabel(item.locale),
                when: formatWhen(item.createdAt),
              })}
            </div>
            {#if item.reason}
              <div class="text-sm mt-1" style="color: {$colorStore.muted}">{reasonLabel(item.reason)}</div>
            {/if}
            {#if item.note}
              <div class="text-sm mt-1 break-words" style="color: {$colorStore.text}">{item.note}</div>
            {/if}
          </div>
          <div class="flex gap-2">
            <a href="/wiki/manage/{item.pageId}?locale={item.locale}" class="inline-flex items-center px-4 rounded-lg min-h-[44px] text-sm font-medium"
               style="background: {$colorStore.primary}10; color: {$colorStore.text};">{m.common.edit()}</a>
            {#if item.status === "open"}
              <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
                      style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                      disabled={busyId === item.id} onclick={() => close(item.id, "resolved")}>{m.wikiManage.feedbackResolve()}</button>
              <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
                      style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                      disabled={busyId === item.id} onclick={() => close(item.id, "dismissed")}>{m.common.dismiss()}</button>
            {:else}
              <span class="inline-flex items-center text-sm" style="color: {$colorStore.muted}">
                {item.status === "dismissed" ? m.wikiManage.feedbackDismissed() : m.wikiManage.feedbackResolved()}
              </span>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>
