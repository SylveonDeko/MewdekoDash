<!-- routes/translate/manage/contributors/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { groupLabel, translationErrorMessage } from "$lib/translate/client";
  import type { ContributorRecord, SuggestionPage, TranslationStatus } from "$lib/translate/records";
  import { translationLimits } from "$lib/translate/rules";
  import { formatWhen, localeLabel, wikiCall } from "$lib/wiki/client";

  let { data } = $props();

  const allLocales = "*";

  let openUser = $state<string | null>(null);
  let suggestions = $state<SuggestionPage | null>(null);
  let busy = $state(false);
  let error = $state<string | null>(null);

  const rows = $derived(data.contributors?.rows ?? []);
  const totalPages = $derived(data.contributors ? Math.max(1, Math.ceil(data.contributors.total / translationLimits.pageSize)) : 1);
  const localeOptions = $derived([
    { id: allLocales, name: m.translate.allLanguages() },
    ...data.locales.map((locale) => ({ id: locale, name: localeLabel(locale) })),
  ]);

  function chip(): string {
    return `background: transparent; color: ${$colorStore.muted}; border: 1px solid ${$colorStore.primary}20;`;
  }

  function go(next: { locale?: string | null; page?: number }) {
    const merged = { locale: data.locale, page: 1, ...next };
    const params = new URLSearchParams();
    if (merged.locale) params.set("locale", merged.locale);
    if (merged.page > 1) params.set("page", String(merged.page));
    const query = params.toString();
    void goto(query ? `?${query}` : page.url.pathname, { replaceState: true });
  }

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

  async function toggle(person: ContributorRecord) {
    if (openUser === person.userId) {
      openUser = null;
      return;
    }
    openUser = person.userId;
    suggestions = null;
    const result = await wikiCall<SuggestionPage>("GET", `/api/translations/contributors/${person.userId}/suggestions`);
    if (result.ok && result.data) suggestions = result.data;
    else {
      openUser = null;
      error = translationErrorMessage(result.error);
    }
  }

  async function setBlocked(person: ContributorRecord, blocked: boolean) {
    if (blocked) {
      const ok = await requestConfirmation({
        title: m.translate.contributorBlockTitle({ name: person.name }),
        message: m.translate.contributorBlockMessage(),
        confirmText: m.common.block(),
        variant: "danger",
      });
      if (!ok) return;
    }
    busy = true;
    error = null;
    const result = blocked
      ? await wikiCall("POST", "/api/translations/blocks", { userId: person.userId })
      : await wikiCall("DELETE", `/api/translations/blocks/${person.userId}`);
    busy = false;
    if (!result.ok && result.error !== "conflict" && result.error !== "not_found") {
      error = translationErrorMessage(result.error);
      return;
    }
    await invalidateAll();
  }
</script>

<div class="space-y-5">
  {#if data.locales.length > 1}
    <div class="max-w-sm">
      <span id="contributors-language-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.language()}</span>
      <DiscordSelector type="custom" options={localeOptions} selected={data.locale ?? allLocales} clearable={false}
                       ariaLabelledby="contributors-language-label"
                       onchange={(d) => { if (typeof d.selected === "string") go({ locale: d.selected === allLocales ? null : d.selected }); }} />
    </div>
  {/if}

  {#if error}
    <p class="text-sm text-red-400" role="alert">{error}</p>
  {/if}

  {#if rows.length === 0}
    <p style="color: {$colorStore.muted}">{m.translate.contributorsEmpty()}</p>
  {:else}
    <ul>
      {#each rows as person (person.userId)}
        <li class="py-4 space-y-2" style="border-top: 1px solid {$colorStore.primary}20;">
          <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div class="min-w-0">
              <div class="font-semibold break-words" style="color: {$colorStore.text}">
                {person.name}
                {#if person.blocked}
                  <span class="ml-2 text-xs font-medium" style="color: {$colorStore.accent}">{m.translate.contributorBlocked()}</span>
                {/if}
              </div>
              <div class="text-xs break-all" style="color: {$colorStore.muted}">{m.common.idLabel({ id: person.userId })}</div>
              <div class="text-xs" style="color: {$colorStore.muted}">{formatWhen(person.lastAt)}</div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip()}
                      aria-expanded={openUser === person.userId} onclick={() => toggle(person)}>
                {openUser === person.userId ? m.common.hide() : m.translate.contributorShow()}
              </button>
              <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" disabled={busy}
                      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                      onclick={() => setBlocked(person, !person.blocked)}>
                {person.blocked ? m.common.unblock() : m.common.block()}
              </button>
            </div>
          </div>
          <p class="text-sm" style="color: {$colorStore.text}">
            {m.translate.contributorCounts({ suggested: person.suggested, approved: person.approved, declined: person.declined, open: person.open })}
          </p>
          <p class="text-xs" style="color: {$colorStore.muted}">
            {person.approvalPercent === null ? m.translate.contributorUndecided() : m.translate.contributorRate({ percent: person.approvalPercent })}
            {#if person.direct > 0}{m.translate.contributorDirect({ count: person.direct })}{/if}
          </p>

          {#if openUser === person.userId}
            {#if suggestions === null}
              <p style="color: {$colorStore.muted}">{m.common.loading()}</p>
            {:else if suggestions.rows.length === 0}
              <p style="color: {$colorStore.muted}">{m.wikiManage.suggestionsEmpty()}</p>
            {:else}
              <ul>
                {#each suggestions.rows as item (item.id)}
                  <li class="py-3 space-y-1" style="border-top: 1px solid {$colorStore.primary}20;">
                    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs" style="color: {$colorStore.muted}">
                      <code class="break-all">{item.key}</code>
                      {#if item.group}<span>{groupLabel(item.group)}</span>{/if}
                    </div>
                    <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{item.text}</p>
                    <div class="text-xs" style="color: {$colorStore.muted}">
                      {m.wikiManage.mineMeta({ status: statusLabel(item.status), language: localeLabel(item.locale), when: formatWhen(item.createdAt) })}
                    </div>
                  </li>
                {/each}
              </ul>
            {/if}
          {/if}
        </li>
      {/each}
    </ul>

    {#if data.contributors && totalPages > 1}
      <div class="flex flex-wrap items-center gap-3">
        {#if data.contributors.page > 1}
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip()}
                  onclick={() => go({ page: data.contributors!.page - 1 })}>{m.common.previous()}</button>
        {/if}
        <span class="text-sm" style="color: {$colorStore.muted}">{m.common.pageOfTotal({ page: data.contributors.page, total: totalPages })}</span>
        {#if data.contributors.page < totalPages}
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={chip()}
                  onclick={() => go({ page: data.contributors!.page + 1 })}>{m.common.next()}</button>
        {/if}
      </div>
    {/if}
  {/if}
</div>
