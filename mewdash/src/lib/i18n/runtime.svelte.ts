/**
 * Message runtime behind the generated accessors in ./generated/messages.ts.
 *
 * en-US text is compiled into the accessors themselves, so with no other locale loaded every call
 * returns English with placeholders filled in. Other locales plug in through {@link setLocale}
 * without touching call sites: a module/key that the active locale lacks falls back to en-US.
 *
 * In the browser the active locale is a Svelte state rune, so every `m.x.y()` read inside a
 * template, `$derived` or `$effect` re-evaluates the moment the locale changes. Text copied into
 * plain variables (stored error strings, spread copies of catalog objects) does not follow, which
 * is why the conventions keep text in accessors until render time.
 *
 * On the server the locale is per request. hooks.server.ts registers a resolver that reads the
 * request's locale; this module never shares one locale across requests.
 */
import { browser } from "$app/environment";

type ModuleCatalog = Record<string, string>;
export type Catalog = Record<string, ModuleCatalog>;

/** The source locale. Everything falls back to it. */
export const sourceLocale = "en-US";

/** Client state. Reading it inside a reactive context subscribes to locale changes. */
const client = $state<{ locale: string; catalog: Catalog | null }>({ locale: sourceLocale, catalog: null });

/** Server-side resolver, set once by hooks.server.ts. Returns the current request's locale and catalog. */
let serverResolver: (() => { locale: string; catalog: Catalog | null }) | null = null;

/** Registers the per-request locale source used during SSR. */
export function setServerLocaleResolver(resolver: typeof serverResolver): void {
  serverResolver = resolver;
}

function active(): { locale: string; catalog: Catalog | null } {
  if (browser) return client;
  return serverResolver?.() ?? { locale: sourceLocale, catalog: null };
}

/** The locale whose text is currently served. */
export function getLocale(): string {
  return active().locale;
}

/**
 * Catalog files for every locale folder, loaded on demand. en-US is never loaded here: its text
 * is compiled into the accessors.
 */
const catalogFiles = import.meta.glob<ModuleCatalog>("./*/*.json", { import: "default" });

/** Locales that have a catalog folder, including the source locale. */
export function availableLocales(): string[] {
  const set = new Set<string>([sourceLocale]);
  for (const path of Object.keys(catalogFiles)) set.add(path.split("/")[1]);
  return [...set].sort();
}

/** Loads every module catalog of a locale. Returns null for the source locale or an unknown one. */
export async function loadCatalog(locale: string): Promise<Catalog | null> {
  if (locale === sourceLocale) return null;
  const prefix = `./${locale}/`;
  const entries = Object.entries(catalogFiles).filter(([path]) => path.startsWith(prefix));
  if (entries.length === 0) return null;
  const catalog: Catalog = {};
  await Promise.all(
    entries.map(async ([path, load]) => {
      const moduleName = path.slice(prefix.length, -".json".length);
      catalog[moduleName] = await load();
    })
  );
  return catalog;
}

/**
 * Switches the served locale in the browser and re-renders everything that reads a message.
 * Unknown locales fall back to the source locale. Safe to call repeatedly.
 */
export async function setLocale(locale: string): Promise<void> {
  const catalog = await loadCatalog(locale);
  setCatalog(catalog ? locale : sourceLocale, catalog);
}

/** Installs an already loaded catalog as the active one (browser only; the server uses the resolver). */
export function setCatalog(locale: string, catalog: Catalog | null): void {
  client.locale = locale;
  client.catalog = locale === sourceLocale ? null : catalog;
}

/** Replaces `{name}` placeholders with the matching values. Unknown placeholders are left as is. */
export function format(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

/**
 * Resolves one message. Called only by the generated accessors.
 *
 * @param module The catalog file the key lives in, such as `music` or `_common`.
 * @param key The snake_case key.
 * @param fallback The en-US text compiled into the accessor.
 * @param params Placeholder values.
 */
export function t(module: string, key: string, fallback: string, params?: Record<string, string | number>): string {
  const { locale, catalog } = active();
  const entries = catalog?.[module];
  const text = (entries && pluralVariant(entries, locale, key, params)) ?? entries?.[key] ?? fallback;
  return format(text, params);
}

const pluralRules = new Map<string, Intl.PluralRules>();

/**
 * Components pick `<base>_one` or `<base>_other` the English way. Languages with more plural
 * forms (Polish: 2-4 vs 5+) add `<base>_few` / `<base>_many` / `<base>_two` / `<base>_zero`,
 * and this picks the right one from the `count` parameter using the locale's CLDR rules.
 */
function pluralVariant(
  entries: ModuleCatalog,
  locale: string,
  key: string,
  params?: Record<string, string | number>
): string | undefined {
  const count = params?.count;
  if (typeof count !== "number") return undefined;
  const match = /^(.*)_(one|other)$/.exec(key);
  if (!match) return undefined;
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  return entries[`${match[1]}_${rules.select(count)}`];
}
