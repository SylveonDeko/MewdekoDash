import { error } from "@sveltejs/kit";
import { m } from "$lib/i18n";
import { requireMember } from "$lib/server/wiki/guard";
import { isReviewer } from "$lib/translate/permissions";
import { getTranslationAccess, type TranslationAccess } from "./access";

/**
 * For translation pages that need a signed in person. Signed out visitors are sent to log in and
 * come back to the same address.
 *
 * @param locals The request's locals.
 * @param url The requested URL.
 */
export async function requireTranslationMember(locals: App.Locals, url: URL): Promise<TranslationAccess> {
  await requireMember(locals, url);
  return getTranslationAccess(locals);
}

/**
 * For pages that only admins and translators may open.
 *
 * @param locals The request's locals.
 * @param url The requested URL.
 */
export async function requireTranslationReviewer(locals: App.Locals, url: URL): Promise<TranslationAccess> {
  const access = await requireTranslationMember(locals, url);
  if (!isReviewer(access.scope)) error(403, m.wikiManage.errorForbidden());
  return access;
}

/**
 * For pages that only admins may open.
 *
 * @param locals The request's locals.
 * @param url The requested URL.
 */
export async function requireTranslationAdmin(locals: App.Locals, url: URL): Promise<TranslationAccess> {
  const access = await requireTranslationMember(locals, url);
  if (!access.isAdmin) error(403, m.wikiManage.errorForbidden());
  return access;
}
