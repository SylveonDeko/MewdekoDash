type ModuleCatalog = Record<string, string>;
type Params = Record<string, string | number>;

const pluralRules = new Map<string, Intl.PluralRules>();

function stringAt(entries: ModuleCatalog | undefined, key: string): string | undefined {
  const value = entries?.[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Components pick `<base>_one` or `<base>_other` the English way. Languages with more plural
 * forms (Polish: 2-4 vs 5+) add `<base>_few` / `<base>_many` / `<base>_two` / `<base>_zero`,
 * and this picks the right one from the `count` parameter using the locale's CLDR rules.
 */
export function pluralVariant(entries: ModuleCatalog | undefined, locale: string, key: string, params?: Params): string | undefined {
  const count = params?.count;
  if (!entries || typeof count !== "number") return undefined;
  const match = /^(.*)_(one|other)$/.exec(key);
  if (!match) return undefined;
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  return stringAt(entries, `${match[1]}_${rules.select(count)}`);
}

/**
 * Reads the active language's entries and chooses the template, and falls back to the en-US text
 * on any failure while reading or choosing, so a broken overlay can never break a page.
 *
 * @param read Returns the language and the entries of the message's module.
 * @param key The snake_case key.
 * @param fallback The en-US text.
 * @param params Placeholder values.
 */
export function resolveTemplate(
  read: () => { locale: string; builtin?: ModuleCatalog; overlay?: ModuleCatalog },
  key: string,
  fallback: string,
  params?: Params,
): string {
  try {
    const { locale, builtin, overlay } = read();
    return pickTemplate(locale, builtin, overlay, key, fallback, params);
  } catch {
    return fallback;
  }
}

/**
 * Chooses the template for one message. An approved translation from the overlay wins over the
 * built-in catalog of the language, which wins over the en-US text compiled into the accessor.
 *
 * @param locale The language being served.
 * @param builtin The built-in catalog entries of the message's module for that language.
 * @param overlay The overlay entries of the same module, if any.
 * @param key The snake_case key.
 * @param fallback The en-US text.
 * @param params Placeholder values.
 */
export function pickTemplate(
  locale: string,
  builtin: ModuleCatalog | undefined,
  overlay: ModuleCatalog | undefined,
  key: string,
  fallback: string,
  params?: Params,
): string {
  return (
    pluralVariant(overlay, locale, key, params) ??
    stringAt(overlay, key) ??
    pluralVariant(builtin, locale, key, params) ??
    stringAt(builtin, key) ??
    fallback
  );
}
