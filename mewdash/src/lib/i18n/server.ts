/**
 * Per-request locale for server rendering. hooks.server.ts wraps each request in
 * {@link runWithLocale}; the message runtime reads the current request's locale through the
 * resolver registered here, so concurrent requests in different languages never bleed into each
 * other.
 */
import { AsyncLocalStorage } from "node:async_hooks";
import type { Cookies } from "@sveltejs/kit";
import { availableLocales, loadCatalog, setServerLocaleResolver, sourceLocale, type Catalog } from "./runtime.svelte";

/** The cookie the language switcher writes. */
export const LOCALE_COOKIE = "locale";

const storage = new AsyncLocalStorage<{ locale: string; catalog: Catalog | null }>();
const loaded = new Map<string, Promise<Catalog | null>>();

setServerLocaleResolver(() => storage.getStore() ?? { locale: sourceLocale, catalog: null });

/** Picks the request locale: the cookie first, then Accept-Language, then the source locale. */
export function resolveLocale(cookies: Cookies, acceptLanguage: string | null): string {
  const known = availableLocales();
  const fromCookie = cookies.get(LOCALE_COOKIE);
  if (fromCookie && known.includes(fromCookie)) return fromCookie;
  for (const part of (acceptLanguage ?? "").split(",")) {
    const tag = part.split(";")[0].trim();
    if (!tag) continue;
    const exact = known.find((l) => l.toLowerCase() === tag.toLowerCase());
    if (exact) return exact;
    const lang = tag.split("-")[0].toLowerCase();
    const byLanguage = known.find((l) => l.toLowerCase().startsWith(lang + "-") || l.toLowerCase() === lang);
    if (byLanguage) return byLanguage;
  }
  return sourceLocale;
}

/** Runs `fn` with `locale` active for every message lookup inside it. Catalogs are cached per locale. */
export async function runWithLocale<T>(locale: string, fn: () => Promise<T>): Promise<T> {
  let pending = loaded.get(locale);
  if (!pending) {
    pending = loadCatalog(locale);
    loaded.set(locale, pending);
  }
  const catalog = await pending;
  return storage.run({ locale: catalog ? locale : sourceLocale, catalog }, fn);
}
