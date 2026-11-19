import { logger } from "$lib/logger";
import { getAccess, type Access } from "$lib/server/wiki/access";
import type { TranslationScope } from "$lib/translate/permissions";
import { translatorLocales } from "./store";

/** What the server knows about the person making a translation request. */
export interface TranslationAccess extends Access {
  isAdmin: boolean;
  scope: TranslationScope;
}

const perRequest = new WeakMap<object, Promise<TranslationAccess>>();

async function resolveAccess(locals: App.Locals): Promise<TranslationAccess> {
  const access = await getAccess(locals);
  const isAdmin = access.canManageEditors;
  let locales: string[] = [];
  if (access.userId && access.databaseAvailable) {
    try {
      locales = await translatorLocales(access.userId);
    } catch (error) {
      logger.error("Translator lookup failed:", error);
    }
  }
  return { ...access, isAdmin, scope: { admin: isAdmin, locales } };
}

/**
 * Works out who is making the request and which languages they may review. The answer comes only
 * from the server side session, the ownership check and the translators table, and it is computed
 * once per request.
 *
 * @param locals The request's locals.
 */
export function getTranslationAccess(locals: App.Locals): Promise<TranslationAccess> {
  const key = locals as object;
  let pending = perRequest.get(key);
  if (!pending) {
    pending = resolveAccess(locals);
    perRequest.set(key, pending);
  }
  return pending;
}
