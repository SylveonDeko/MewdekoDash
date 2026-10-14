<!--
@component
Dashboard language picker. Hidden while only the source locale exists. Switching re-renders every
message on the page immediately and writes the `locale` cookie so the server renders the next
request the same way.
-->
<script lang="ts">
  import { availableLocales, getLocale, m, setLocale } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { localeDisplayName } from "$lib/i18n/localeNames";

  const locales = availableLocales();
  let current = $derived(getLocale());
  let busy = $state(false);

  async function choose(locale: string) {
    if (locale === current || busy) return;
    busy = true;
    try {
      await setLocale(locale);
      document.cookie = `locale=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = locale;
    } finally {
      busy = false;
    }
  }
</script>

{#if locales.length > 1}
  <label class="w-full flex items-center gap-3 px-3 py-2 max-lg:py-2.5 rounded-xl" style="color: {$colorStore.text};">
    <i class="fa-solid fa-language text-sm shrink-0" style="color: {$colorStore.primary}; width: 20px; text-align: center;" aria-hidden="true"></i>
    <span class="text-sm flex-1 text-left">{m.common.language()}</span>
    <select
      class="text-sm rounded-lg px-2 py-1 border bg-transparent min-h-[32px]"
      style="color: {$colorStore.text}; border-color: {$colorStore.primary}30;"
      value={current}
      disabled={busy}
      aria-label={m.common.language()}
      onchange={(e) => choose((e.currentTarget as HTMLSelectElement).value)}
    >
      {#each locales as locale}
        <option value={locale}>{localeDisplayName(locale)}</option>
      {/each}
    </select>
  </label>
{/if}
