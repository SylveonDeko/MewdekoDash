<!--
@component
Language picker: a globe and the current language code, opening the platform's native select with
every language in its own name. Hidden while only the source locale exists. Switching re-renders
every message immediately and writes the `locale` cookie so the server renders the next request the
same way.
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
  <label
    class="relative z-30 flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-lg border shrink-0 cursor-pointer transition-all duration-200 hover:scale-[1.05] focus-within:ring-2"
    style="border-color: {$colorStore.primary}40; color: {$colorStore.text}; --tw-ring-color: {$colorStore.primary};"
    title={m.common.language()}
  >
    <i class="fa-solid fa-globe text-sm" style="color: {$colorStore.primary};" aria-hidden="true"></i>
    <span class="text-xs font-semibold tracking-wide">{current.split("-")[0].toUpperCase()}</span>
    <select
      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      value={current}
      disabled={busy}
      aria-label={m.common.language()}
      onchange={(e) => choose((e.currentTarget as HTMLSelectElement).value)}
    >
      {#each locales as locale (locale)}
        <option value={locale} lang={locale}>{localeDisplayName(locale)}</option>
      {/each}
    </select>
  </label>
{/if}
