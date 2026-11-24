<!-- lib/components/translate/TranslationRow.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { draftProblem, groupLabel, translationErrorMessage } from "$lib/translate/client";
  import type { OverrideResult, RowDraft, StringRow } from "$lib/translate/records";
  import { cleanTranslation } from "$lib/translate/rules";
  import { formatWhen, wikiCall } from "$lib/wiki/client";

  interface Props {
    row: StringRow;
    catalog: string;
    locale: string;
    signedIn: boolean;
    canReview: boolean;
    /** Why the person cannot send a suggestion, or null when they can. */
    closedMessage: string | null;
    /** The text kept for this row while the page changed, if any. */
    draft: string | undefined;
    /** Why the last bulk save of this row failed. */
    error: string | null;
    onupdate: (row: StringRow) => void;
    onhistory: (key: string) => void;
    ondraft: (key: string, entry: RowDraft | null) => void;
  }

  let { row, catalog, locale, signedIn, canReview, closedMessage, draft: kept, error, onupdate, onhistory, ondraft }: Props = $props();

  let draft = $state("");
  let seeded: string | null = null;
  let busy = $state(false);
  let revertError = $state<string | null>(null);

  const canEdit = $derived(signedIn && (canReview || closedMessage === null));
  const startText = $derived(canReview ? (row.translation ?? "") : (row.mine?.text ?? row.translation ?? ""));
  const cleaned = $derived(cleanTranslation(draft) ?? "");
  const problem = $derived(draftProblem(catalog, row.source, draft));
  const dirty = $derived(cleaned !== startText.trim());
  const ready = $derived(dirty && cleaned.length > 0 && problem === null);

  $effect(() => {
    if (seeded !== startText) {
      seeded = startText;
      draft = kept ?? startText;
    }
  });

  $effect(() => {
    ondraft(row.key, canEdit && dirty ? { text: cleaned, ready } : null);
  });

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function suggestionsLabel(count: number): string {
    return count === 1 ? m.wikiManage.openSuggestionsOne() : m.wikiManage.openSuggestionsOther({ count });
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
    revertError = null;
    const query = new URLSearchParams({ catalog, key: row.key, locale });
    const result = await wikiCall<OverrideResult>("DELETE", `/api/translations/overrides?${query}`);
    busy = false;
    if (!result.ok || !result.data) {
      revertError = translationErrorMessage(result.error);
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

  {#if canEdit}
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
  {:else}
    {#if row.translation !== null && !row.untranslated}
      <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{row.translation}</p>
    {:else}
      <p style="color: {$colorStore.muted}">{m.translate.translationNone()}</p>
    {/if}
    {#if signedIn && closedMessage}
      <p class="text-sm" style="color: {$colorStore.muted}">{closedMessage}</p>
    {/if}
  {/if}

  {#if error}
    <p class="text-sm text-red-400" role="alert">{error}</p>
  {/if}
  {#if revertError}
    <p class="text-sm text-red-400" role="alert">{revertError}</p>
  {/if}
  {#if row.hasOverride && row.updatedByName && row.updatedAt}
    <p class="text-xs" style="color: {$colorStore.muted}">
      {m.translate.savedBy({ name: row.updatedByName })} {formatWhen(row.updatedAt)}
    </p>
  {/if}

  <div class="flex flex-wrap gap-2">
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
