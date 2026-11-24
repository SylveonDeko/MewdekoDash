<!-- routes/translate/manage/settings/+page.svelte -->
<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import { translationErrorMessage } from "$lib/translate/client";
  import type { TranslationSettings } from "$lib/translate/records";
  import { translationLimits } from "$lib/translate/rules";
  import { wikiCall } from "$lib/wiki/client";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";

  let { data } = $props();

  const autoSave = createAutoSave();

  let suggestionsOpen = $state(untrack(() => data.settings.suggestionsOpen));
  let openMax = $state(untrack(() => data.settings.openSuggestionsMax));
  let error = $state<string | null>(null);

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const maxValid = $derived(Number.isInteger(openMax) && openMax >= 1 && openMax <= translationLimits.openSuggestionsCap);

  async function save(body: Partial<TranslationSettings>) {
    const result = await wikiCall("PUT", "/api/translations/settings", body);
    if (!result.ok) {
      error = translationErrorMessage(result.error);
      throw new Error(result.error ?? "save_failed");
    }
    error = null;
  }

  function toggle(checked: boolean) {
    const before = suggestionsOpen;
    suggestionsOpen = checked;
    void autoSave.now("suggestionsOpen", async () => {
      try {
        await save({ suggestionsOpen: checked });
      } catch (failure) {
        suggestionsOpen = before;
        throw failure;
      }
    });
  }

  function changeMax() {
    if (!maxValid) return;
    const value = openMax;
    autoSave.schedule("openMax", () => save({ openSuggestionsMax: value }));
  }
</script>

<section class="space-y-4">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.common.settings()}</h2>
    <SaveStatus {autoSave} />
  </div>

  <SettingToggle id="translate-suggestions-open" label={m.translate.settingsSuggestionsOpen()} hint={m.translate.settingsSuggestionsOpenHint()}
                 checked={suggestionsOpen} onchange={toggle} />

  {#if suggestionsOpen}
    <div class="max-w-xs">
      <label for="translate-open-max" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.translate.settingsOpenMax()}</label>
      <input id="translate-open-max" type="number" inputmode="numeric" min="1" max={translationLimits.openSuggestionsCap} bind:value={openMax}
             oninput={changeMax} onblur={() => autoSave.flush("openMax")} aria-invalid={!maxValid}
             class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
    </div>
  {/if}

  {#if error}
    <p class="text-sm text-red-400" role="alert">{error}</p>
  {/if}
</section>
