import { error, redirect } from "@sveltejs/kit";
import { m } from "$lib/i18n";
import { getAccess, type Access } from "./access";

/**
 * For manage pages that need a signed in user. Signed out visitors are sent to log in and come
 * back to the same address.
 *
 * @param locals The request's locals.
 * @param url The requested URL.
 */
export async function requireMember(locals: App.Locals, url: URL): Promise<Access> {
  const access = await getAccess(locals);
  if (!access.userId) {
    redirect(302, `/api/discord/login?redirect_to=${encodeURIComponent(url.pathname + url.search)}`);
  }
  return access;
}

/**
 * For manage pages that only editors and admins may open.
 *
 * @param locals The request's locals.
 * @param url The requested URL.
 */
export async function requireEditor(locals: App.Locals, url: URL): Promise<Access> {
  const access = await requireMember(locals, url);
  if (!access.canEdit) error(403, m.wikiManage.errorForbidden());
  return access;
}

/**
 * For manage pages that only admins may open.
 *
 * @param locals The request's locals.
 * @param url The requested URL.
 */
export async function requireAdmin(locals: App.Locals, url: URL): Promise<Access> {
  const access = await requireMember(locals, url);
  if (!access.canManageEditors) error(403, m.wikiManage.errorForbidden());
  return access;
}
