<!-- routes/translate/manage/translators/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { invalidateAll } from "$app/navigation";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { translationErrorMessage } from "$lib/translate/client";
  import { translationLimits } from "$lib/translate/rules";
  import type { TranslatorRecord } from "$lib/translate/records";
  import { formatWhen, localeLabel, wikiCall } from "$lib/wiki/client";
  import { isUserId } from "$lib/wiki/validation";

  let { data } = $props();

  let userId = $state("");
  let locale = $state<string | null>(null);
  let name = $state("");
  let busy = $state(false);
  let error = $state<string | null>(null);

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const localeOptions = $derived(data.locales.map((code) => ({ id: code, name: localeLabel(code) })));
  const canAdd = $derived(isUserId(userId.trim()) && locale !== null && !busy);

  async function add(event: SubmitEvent) {
    event.preventDefault();
    if (!canAdd || locale === null) return;
    busy = true;
    error = null;
    const result = await wikiCall("POST", "/api/translations/translators", { userId: userId.trim(), locale, name });
    busy = false;
    if (!result.ok) {
      error = translationErrorMessage(result.error);
      return;
    }
    userId = "";
    name = "";
    await invalidateAll();
  }

  async function remove(translator: TranslatorRecord) {
    const ok = await requestConfirmation({
      title: m.wikiManage.editorRemoveTitle({ name: translator.displayName }),
      message: m.translate.translatorRemoveMessage(),
      confirmText: m.common.remove(),
      variant: "danger",
    });
    if (!ok) return;
    const result = await wikiCall("DELETE", `/api/translations/translators/${translator.userId}?locale=${encodeURIComponent(translator.locale)}`);
    if (!result.ok) {
      error = translationErrorMessage(result.error);
      return;
    }
    await invalidateAll();
  }
</script>

<div class="space-y-6">
  <form class="space-y-3" onsubmit={add}>
    <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.translate.translatorAddTitle()}</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label for="translator-id" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.userId()}</label>
        <input id="translator-id" type="text" inputmode="numeric" bind:value={userId} autocomplete="off"
               class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
      </div>
      <div>
        <span id="translator-language-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.language()}</span>
        <DiscordSelector type="custom" options={localeOptions} selected={locale} clearable={false}
                         placeholder={m.translate.languagePlaceholder()} ariaLabelledby="translator-language-label"
                         onchange={(d) => { locale = typeof d.selected === "string" ? d.selected : null; }} />
      </div>
      <div>
        <label for="translator-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.displayName()}</label>
        <input id="translator-name" type="text" bind:value={name} maxlength={translationLimits.nameMax} autocomplete="off"
               class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
      </div>
    </div>
    {#if error}
      <p class="text-sm text-red-400" role="alert">{error}</p>
    {/if}
    {#if canAdd}
      <button type="submit" class="px-5 rounded-lg min-h-[50px] font-semibold w-full sm:w-auto"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};">{m.common.add()}</button>
    {/if}
  </form>

  <section class="space-y-3">
    <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.translate.tabTranslators()}</h2>
    {#if data.translators.length === 0}
      <p style="color: {$colorStore.muted}">{m.translate.translatorsEmpty()}</p>
    {:else}
      <ul>
        {#each data.translators as translator (translator.userId + translator.locale)}
          <li class="py-3 flex flex-wrap items-center gap-x-3 gap-y-2" style="border-top: 1px solid {$colorStore.primary}20;">
            <div class="min-w-0 grow">
              <div class="font-semibold break-words" style="color: {$colorStore.text}">{translator.displayName}</div>
              <div class="text-xs break-all" style="color: {$colorStore.muted}">{m.common.idLabel({ id: translator.userId })}</div>
              <div class="text-xs" style="color: {$colorStore.muted}">{localeLabel(translator.locale)} {formatWhen(translator.addedAt)}</div>
            </div>
            <button type="button" class="w-11 h-11 rounded-lg" aria-label={m.common.ariaRemoveNamed({ name: translator.displayName })}
                    style="background: {$colorStore.accent}20; color: {$colorStore.text};"
                    onclick={() => remove(translator)}>
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>
