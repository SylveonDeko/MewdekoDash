/**
 * The name of a locale in that locale ("Deutsch", "Français"), from the platform's own data, so a
 * language picker reads right without a catalog entry per language.
 */
export function localeDisplayName(locale: string): string {
  try {
    const name = new Intl.DisplayNames([locale], { type: "language" }).of(locale);
    if (name) return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    // unknown tag; fall through
  }
  return locale;
}
