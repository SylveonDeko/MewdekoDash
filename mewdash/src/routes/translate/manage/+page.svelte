<!-- routes/translate/manage/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import TranslationDiff from "$lib/components/translate/TranslationDiff.svelte";
  import { groupLabel, translationErrorMessage } from "$lib/translate/client";
  import { translationLimits } from "$lib/translate/rules";
  import { formatWhen, localeLabel, wikiCall } from "$lib/wiki/client";

  let { data } = $props();

  const allLocales = "*";

  let decliningId = $state<string | null>(null);
  let reason = $state("");
  let busyId = $state<string | null>(null);
  let errors = $state<Record<string, string>>({});

  const rows = $derived(data.queue?.rows ?? []);
  const totalPages = $derived(data.queue ? Math.max(1, Math.ceil(data.queue.total / translationLimits.pageSize)) : 1);
  const localeOptions = $derived([
    { id: allLocales, name: m.translate.allLanguages() },
    ...data.locales.map((locale) => ({ id: locale, name: localeLabel(locale) })),
  ]);

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function chip(active: boolean): string {
    return active
      ? `background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}40;`
      : `background: transparent; color: ${$colorStore.muted}; border: 1px solid ${$colorStore.primary}20;`;
  }

  function catalogLabel(catalog: string): string {
    return catalog === "bot" ? m.translate.catalogBot() : catalog === "dash" ? m.translate.catalogDash() : catalog;
  }

  function go(next: { catalog?: string | null; locale?: string | null; page?: number }, scroll = false) {
    const merged = { catalog: data.catalog, locale: data.locale, page: 1, ...next };
    const params = new URLSearchParams();
    if (merged.catalog) params.set("catalog", merged.catalog);
    if (merged.locale) params.set("locale", merged.locale);
    if (merged.page > 1) params.set("page", String(merged.page));
    const query = params.toString();
    void goto(query ? `?${query}` : page.url.pathname, { noScroll: !scroll, replaceState: true });
  }

  async function decide(id: string, action: "approve" | "decline") {
    busyId = id;
    errors = Object.fromEntries(Object.entries(errors).filter(([key]) => key !== id));
    const result = await wikiCall("POST", `/api/translations/suggestions/${id}`, action === "decline" ? { action, reason } : { action });
    busyId = null;
    if (!result.ok) {
      errors = { ...errors, [id]: translationErrorMessage(result.error) };
      return;
    }
    decliningId = null;
    reason = "";
    await invalidateAll();
  }
</script>

<div class="space-y-5">
  {#if data.catalogs.length > 1}
    <div class="flex flex-wrap gap-2" role="group" aria-label={m.translate.catalogAria()}>
      <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip(data.catalog === null)}
              aria-pressed={data.catalog === null} onclick={() => go({ catalog: null })}>{m.common.all()}</button>
      {#each data.catalogs as catalog (catalog)}
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip(data.catalog === catalog)}
                aria-pressed={data.catalog === catalog} onclick={() => go({ catalog })}>{catalogLabel(catalog)}</button>
      {/each}
    </div>
  {/if}

  {#if data.locales.length > 1}
    <div class="max-w-sm">
      <span id="queue-language-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.language()}</span>
      <DiscordSelector type="custom" options={localeOptions} selected={data.locale ?? allLocales} clearable={false}
                       ariaLabelledby="queue-language-label"
                       onchange={(d) => { if (typeof d.selected === "string") go({ locale: d.selected === allLocales ? null : d.selected }); }} />
    </div>
  {/if}

  {#if rows.length === 0}
    <p style="color: {$colorStore.muted}">{m.translate.queueEmpty()}</p>
  {:else}
    <ul>
      {#each rows as suggestion (suggestion.id)}
        <li class="py-4 space-y-2" style="border-top: 1px solid {$colorStore.primary}20;">
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs" style="color: {$colorStore.muted}">
            <code class="break-all">{suggestion.key}</code>
            {#if suggestion.group}
              <span>{groupLabel(suggestion.group)}</span>
            {/if}
            <span>{m.wikiManage.changeMeta({ language: localeLabel(suggestion.locale), name: suggestion.userName, when: formatWhen(suggestion.createdAt) })}</span>
          </div>

          <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{suggestion.currentSource ?? suggestion.sourceText}</p>
          {#if suggestion.currentSource !== null && suggestion.currentSource !== suggestion.sourceText}
            <p class="text-sm break-words" style="color: {$colorStore.muted}">{m.translate.sourceChanged()}</p>
          {/if}

          <div class="text-sm font-medium" style="color: {$colorStore.muted}">{m.translate.suggestedTranslation()}</div>
          {#if suggestion.currentText !== null}
            <TranslationDiff before={suggestion.currentText} after={suggestion.text} />
          {:else}
            <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{suggestion.text}</p>
          {/if}

          {#if decliningId === suggestion.id}
            <div>
              <label for="decline-reason-{suggestion.id}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.wikiManage.declineReason()}</label>
              <input id="decline-reason-{suggestion.id}" type="text" bind:value={reason} maxlength={translationLimits.reasonMax} autocomplete="off"
                     class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
            </div>
          {/if}
          {#if errors[suggestion.id]}
            <p class="text-sm text-red-400" role="alert">{errors[suggestion.id]}</p>
          {/if}

          {#if busyId !== suggestion.id}
            <div class="flex flex-wrap gap-2">
              {#if decliningId === suggestion.id}
                <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium"
                        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                        onclick={() => { decliningId = null; reason = ""; }}>{m.common.cancel()}</button>
                <button type="button" class="px-5 rounded-lg min-h-[50px] font-semibold"
                        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                        onclick={() => decide(suggestion.id, "decline")}>{m.wikiManage.suggestionDecline()}</button>
              {:else}
                <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium"
                        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                        onclick={() => { decliningId = suggestion.id; reason = ""; }}>{m.wikiManage.suggestionDecline()}</button>
                <button type="button" class="px-5 rounded-lg min-h-[50px] font-semibold"
                        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
                        onclick={() => decide(suggestion.id, "approve")}>{m.common.approve()}</button>
              {/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>

    {#if data.queue && totalPages > 1}
      <div class="flex flex-wrap items-center gap-3">
        {#if data.queue.page > 1}
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip(false)}
                  onclick={() => go({ page: data.queue!.page - 1 }, true)}>{m.common.previous()}</button>
        {/if}
        <span class="text-sm" style="color: {$colorStore.muted}">{m.common.pageOfTotal({ page: data.queue.page, total: totalPages })}</span>
        {#if data.queue.page < totalPages}
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip(false)}
                  onclick={() => go({ page: data.queue!.page + 1 }, true)}>{m.common.next()}</button>
        {/if}
      </div>
    {/if}
  {/if}
</div>
