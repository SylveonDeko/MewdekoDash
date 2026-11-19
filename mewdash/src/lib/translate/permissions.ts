/** What a signed in person may review: everything for an admin, else the languages they translate. */
export interface TranslationScope {
  admin: boolean;
  locales: readonly string[];
}

/** Any signed in person can suggest a translation. */
export function canSuggestTranslation(signedIn: boolean): boolean {
  return signedIn;
}

/** Admins review every language. Translators review the languages they were given. */
export function canReviewLocale(scope: TranslationScope, locale: string): boolean {
  return scope.admin || scope.locales.includes(locale);
}

/** True when the person can review at least one language. */
export function isReviewer(scope: TranslationScope): boolean {
  return scope.admin || scope.locales.length > 0;
}

/**
 * The languages a person may review out of the languages that exist.
 *
 * @param scope The person's scope.
 * @param all Every language of the catalog.
 */
export function reviewableLocales(scope: TranslationScope, all: readonly string[]): string[] {
  return scope.admin ? [...all] : all.filter((locale) => scope.locales.includes(locale));
}

/** Only admins add and remove translators. */
export function canManageTranslators(admin: boolean): boolean {
  return admin;
}

/**
 * Whether a history entry may be shown to a viewer. Approved text is public. Open, declined and
 * replaced suggestions are shown to their author and to reviewers of that language.
 *
 * @param scope The viewer's scope.
 * @param viewerId The viewer's user id, if signed in.
 * @param entry The entry's status, language and author.
 */
export function canViewHistoryEntry(
  scope: TranslationScope,
  viewerId: string | null,
  entry: { status: string; locale: string; userId: string },
): boolean {
  if (entry.status === "approved") return true;
  if (canReviewLocale(scope, entry.locale)) return true;
  return viewerId !== null && viewerId === entry.userId;
}
