import { logger } from "$lib/logger";
import type { DiscordUser } from "$lib/types/discord";
import { canEdit, canManageEditors, roleOf, type WikiRole } from "$lib/wiki/permissions";
import { wikiDatabaseAvailable } from "./index";
import { isWikiAdmin } from "./owners";
import { isEditor, refreshEditorName } from "./store";

/** What the server knows about the person making a request. */
export interface Access {
  userId: string | null;
  name: string;
  role: WikiRole;
  canEdit: boolean;
  canManageEditors: boolean;
  databaseAvailable: boolean;
}

const perRequest = new WeakMap<object, Promise<Access>>();

function displayNameOf(user: DiscordUser): string {
  return user.display_name || user.username || user.id.toString();
}

async function resolveAccess(user: DiscordUser | null): Promise<Access> {
  const databaseAvailable = await wikiDatabaseAvailable();
  if (!user) {
    return { userId: null, name: "", role: "anonymous", canEdit: false, canManageEditors: false, databaseAvailable };
  }

  const userId = user.id.toString();
  const name = displayNameOf(user);
  const admin = await isWikiAdmin(user);
  let editor = false;
  if (databaseAvailable) {
    try {
      editor = await isEditor(userId);
      if (editor) void refreshEditorName(userId, name).catch((error) => logger.warn("Editor name refresh failed:", error));
    } catch (error) {
      logger.error("Editor lookup failed:", error);
    }
  }

  const role = roleOf(true, admin, editor);
  return { userId, name, role, canEdit: canEdit(role), canManageEditors: canManageEditors(role), databaseAvailable };
}

/**
 * Works out who is making the request and what they may do. The answer comes only from the
 * server side session, the ownership check and the editors table, never from anything the
 * browser sent, and it is computed once per request.
 *
 * @param locals The request's locals.
 */
export function getAccess(locals: App.Locals): Promise<Access> {
  const key = locals as object;
  let pending = perRequest.get(key);
  if (!pending) {
    pending = resolveAccess((locals.user as DiscordUser | null) ?? null);
    perRequest.set(key, pending);
  }
  return pending;
}
