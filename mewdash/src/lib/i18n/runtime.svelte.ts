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
import { resolveTemplate } from "./lookup";

type ModuleCatalog = Record<string, string>;
export type Catalog = Record<string, ModuleCatalog>;

/** The source locale. Everything falls back to it. */
export const sourceLocale = "en-US";

type Active = { locale: string; catalog: Catalog | null; overlay: Catalog | null };

/** Client state. Reading it inside a reactive context subscribes to locale changes. */
const client = $state<Active>({ locale: sourceLocale, catalog: null, overlay: null });

/** Server-side resolver, set once by hooks.server.ts. Returns the current request's locale, catalog and overlay. */
let serverResolver: (() => Active) | null = null;

/** Registers the per-request locale source used during SSR. */
export function setServerLocaleResolver(resolver: typeof serverResolver): void {
  serverResolver = resolver;
}

function active(): Active {
  if (browser) return client;
  return serverResolver?.() ?? { locale: sourceLocale, catalog: null, overlay: null };
}

/** The approved translations laid over the built-in text for the active language, if any. */
export function getOverlay(): Catalog | null {
  return active().overlay;
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
export async function setLocale(locale: string, overlay?: Catalog | null): Promise<void> {
  const [catalog, approved] = await Promise.all([loadCatalog(locale), overlay === undefined ? fetchOverlay(locale) : overlay]);
  setCatalog(catalog ? locale : sourceLocale, catalog, approved);
}

/** Installs an already loaded catalog as the active one (browser only; the server uses the resolver). */
export function setCatalog(locale: string, catalog: Catalog | null, overlay: Catalog | null = null): void {
  client.locale = locale;
  client.catalog = locale === sourceLocale ? null : catalog;
  client.overlay = locale === sourceLocale ? null : overlay;
}

/**
 * Asks the dashboard for the approved translations of a language. Any failure, a slow answer
 * included, returns null and the built-in text is used.
 */
async function fetchOverlay(locale: string): Promise<Catalog | null> {
  if (locale === sourceLocale) return null;
  try {
    const response = await fetch(`/api/translations/overlay?locale=${encodeURIComponent(locale)}`, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) return null;
    const body = (await response.json()) as { entries?: unknown };
    return body.entries && typeof body.entries === "object" ? (body.entries as Catalog) : null;
  } catch {
    return null;
  }
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
  const text = resolveTemplate(
    () => {
      const { locale, catalog, overlay } = active();
      return { locale, builtin: catalog?.[module], overlay: overlay?.[module] };
    },
    key,
    fallback,
    params
  );
  return format(text, params);
}
