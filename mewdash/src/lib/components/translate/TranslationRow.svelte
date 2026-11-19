<!-- lib/components/translate/TranslationRow.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { draftProblem, groupLabel, translationErrorMessage } from "$lib/translate/client";
  import type { OverrideResult, StringRow } from "$lib/translate/records";
  import { cleanTranslation } from "$lib/translate/rules";
  import { formatWhen, wikiCall } from "$lib/wiki/client";

  interface Props {
    row: StringRow;
    catalog: string;
    locale: string;
    signedIn: boolean;
    canReview: boolean;
    onupdate: (row: StringRow) => void;
    onhistory: (key: string) => void;
  }

  let { row, catalog, locale, signedIn, canReview, onupdate, onhistory }: Props = $props();

  let draft = $state("");
  let seeded: string | null = null;
  let busy = $state(false);
  let message = $state<string | null>(null);
  let error = $state<string | null>(null);

  const startText = $derived(canReview ? (row.translation ?? "") : (row.mine?.text ?? row.translation ?? ""));
  const cleaned = $derived(cleanTranslation(draft) ?? "");
  const problem = $derived(draftProblem(catalog, row.source, draft));
  const dirty = $derived(cleaned !== startText.trim());
  const canSend = $derived(dirty && cleaned.length > 0 && problem === null && !busy);

  $effect(() => {
    if (seeded !== startText) {
      seeded = startText;
      draft = startText;
    }
  });

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function suggestionsLabel(count: number): string {
    return count === 1 ? m.wikiManage.openSuggestionsOne() : m.wikiManage.openSuggestionsOther({ count });
  }

  async function send() {
    if (!canSend) return;
    busy = true;
    message = null;
    error = null;
    const body = { catalog, key: row.key, locale, text: cleaned };
    if (canReview) {
      const result = await wikiCall<OverrideResult>("PUT", "/api/translations/overrides", body);
      busy = false;
      if (!result.ok) {
        error = translationErrorMessage(result.error);
        return;
      }
      message = m.wikiManage.saved();
      onupdate({ ...row, translation: cleaned, hasOverride: true, untranslated: false, outdated: false, previousSource: null, updatedByName: null, updatedAt: null });
      return;
    }
    const result = await wikiCall<{ id: string }>("POST", "/api/translations/suggestions", body);
    busy = false;
    if (!result.ok || !result.data) {
      error = translationErrorMessage(result.error);
      return;
    }
    message = m.translate.suggestSent();
    onupdate({ ...row, mine: { id: result.data.id, text: cleaned }, openSuggestions: row.mine ? row.openSuggestions : row.openSuggestions + 1 });
  }

  async function revert() {
    const ok = await requestConfirmation({
      title: m.translate.revertTitle(),
      message: m.translate.revertMessage(),
      confirmText: m.translate.revert(),
      variant: "danger",
    });
    if (!ok) return;
    busy = true;
    message = null;
    error = null;
    const query = new URLSearchParams({ catalog, key: row.key, locale });
    const result = await wikiCall<OverrideResult>("DELETE", `/api/translations/overrides?${query}`);
    busy = false;
    if (!result.ok || !result.data) {
      error = translationErrorMessage(result.error);
      return;
    }
    const builtIn = result.data.text;
    onupdate({
      ...row,
      translation: builtIn,
      hasOverride: false,
      untranslated: builtIn === null || builtIn === row.source,
      outdated: false,
      previousSource: null,
      updatedByName: null,
      updatedAt: null,
    });
  }
</script>

<li class="py-4 space-y-2" style="border-top: 1px solid {$colorStore.primary}20;">
  <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs" style="color: {$colorStore.muted}">
    <code class="break-all">{row.key}</code>
    {#if row.group}
      <span>{groupLabel(row.group)}</span>
    {/if}
    {#if row.untranslated}
      <span class="font-medium" style="color: {$colorStore.accent}">{m.translate.untranslated()}</span>
    {/if}
    {#if row.outdated}
      <span class="font-medium" style="color: {$colorStore.accent}">{m.translate.outdated()}</span>
    {/if}
    {#if row.openSuggestions > 0}
      <span>{suggestionsLabel(row.openSuggestions)}</span>
    {/if}
  </div>

  <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{row.source}</p>

  {#if row.outdated && row.previousSource}
    <p class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.muted}">
      <span class="font-medium">{m.translate.previousSource()}</span>
      {row.previousSource}
    </p>
  {/if}

  {#if signedIn}
    <textarea
      bind:value={draft}
      rows="2"
      autocomplete="off"
      aria-label={m.translate.fieldAria({ key: row.key })}
      class="w-full p-3 rounded-lg border min-h-[50px]"
      style={field}
    ></textarea>
    {#if problem}
      <p class="text-sm text-red-400" role="alert">{problem}</p>
    {/if}
    {#if row.mine}
      <p class="text-sm" style="color: {$colorStore.muted}">{dirty ? m.wikiManage.suggestReplacing() : m.translate.waitingForReview()}</p>
    {/if}
  {:else if row.translation !== null && !row.untranslated}
    <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{row.translation}</p>
  {:else}
    <p style="color: {$colorStore.muted}">{m.translate.translationNone()}</p>
  {/if}

  {#if error}
    <p class="text-sm text-red-400" role="alert">{error}</p>
  {/if}
  {#if message}
    <p class="text-sm" style="color: {$colorStore.muted}" role="status">{message}</p>
  {/if}
  {#if row.hasOverride && row.updatedByName && row.updatedAt}
    <p class="text-xs" style="color: {$colorStore.muted}">
      {m.translate.savedBy({ name: row.updatedByName })} {formatWhen(row.updatedAt)}
    </p>
  {/if}

  <div class="flex flex-wrap gap-2">
    {#if signedIn && canSend}
      <button type="button" class="px-5 rounded-lg min-h-[44px] font-semibold"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              onclick={send}>{canReview ? m.common.save() : m.translate.suggest()}</button>
    {/if}
    {#if canReview && row.hasOverride && !busy}
      <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              onclick={revert}>{m.translate.revert()}</button>
    {/if}
    <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium"
            style="background: transparent; color: {$colorStore.muted}; border: 1px solid {$colorStore.primary}20;"
            onclick={() => onhistory(row.key)}>{m.common.history()}</button>
  </div>
</li>
