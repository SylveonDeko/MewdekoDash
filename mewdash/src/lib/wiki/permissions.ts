export type WikiRole = "anonymous" | "member" | "editor" | "admin";

/**
 * Works out a role from facts the server established. Nothing here reads client input.
 *
 * @param signedIn Whether the request carries a valid session.
 * @param isAdmin Whether the user is a bot owner.
 * @param isEditor Whether the user is on the editors list.
 */
export function roleOf(signedIn: boolean, isAdmin: boolean, isEditor: boolean): WikiRole {
  if (!signedIn) return "anonymous";
  if (isAdmin) return "admin";
  if (isEditor) return "editor";
  return "member";
}

/** Editors and admins can change articles, review suggestions and resolve feedback. */
export function canEdit(role: WikiRole): boolean {
  return role === "editor" || role === "admin";
}

/** Only admins add and remove editors. */
export function canManageEditors(role: WikiRole): boolean {
  return role === "admin";
}

/** Any signed in user can suggest an edit or leave feedback. */
export function canSuggest(role: WikiRole): boolean {
  return role !== "anonymous";
}

/**
 * Whether a user may see a suggestion: its author and every editor.
 *
 * @param role The viewer's role.
 * @param viewerId The viewer's user id, if signed in.
 * @param authorId The id of the user who made the suggestion.
 */
export function canViewSuggestion(role: WikiRole, viewerId: string | null, authorId: string): boolean {
  if (canEdit(role)) return true;
  return viewerId !== null && viewerId === authorId;
}

/** How long an ownership answer is used without asking the bot again. */
export const ownerFreshMs = 5 * 60 * 1000;

/** How long the last ownership answer is trusted while the bot cannot be reached. */
export const ownerStaleMs = 7 * 24 * 60 * 60 * 1000;

export interface OwnerCacheEntry {
  value: boolean;
  at: number;
}

/**
 * Parses `DASH_ADMIN_IDS`.
 *
 * @param raw The comma separated list, if set.
 * @returns The valid user ids. Anything else in the list is ignored.
 */
export function parseAdminIds(raw: string | undefined): Set<string> {
  const ids = new Set<string>();
  for (const part of (raw ?? "").split(",")) {
    const id = part.trim();
    if (/^\d{15,22}$/.test(id)) ids.add(id);
  }
  return ids;
}

export type OwnerPlan = { step: "env" } | { step: "cached"; value: boolean } | { step: "ask-bot" };

/**
 * Decides where an ownership answer comes from before the bot is asked.
 *
 * @param userId The user being checked.
 * @param envIds Ids from `DASH_ADMIN_IDS`.
 * @param cached The cached answer, if any.
 * @param now The current time in milliseconds.
 */
export function planOwnerLookup(userId: string, envIds: ReadonlySet<string>, cached: OwnerCacheEntry | null, now: number): OwnerPlan {
  if (envIds.has(userId)) return { step: "env" };
  if (cached && now - cached.at >= 0 && now - cached.at < ownerFreshMs) return { step: "cached", value: cached.value };
  return { step: "ask-bot" };
}

/**
 * Settles an ownership answer after the bot was asked.
 *
 * @param botAnswer The bot's answer, or null when it could not be reached or gave no usable answer.
 * @param cached The cached answer, if any.
 * @param now The current time in milliseconds.
 * @returns The answer to use, and whether it is new and should be cached. A cached answer older
 * than seven days is not trusted, and a user with no usable answer is not an admin.
 */
export function settleOwnerAnswer(botAnswer: boolean | null, cached: OwnerCacheEntry | null, now: number): { value: boolean; store: boolean } {
  if (botAnswer !== null) return { value: botAnswer, store: true };
  if (cached && now - cached.at >= 0 && now - cached.at <= ownerStaleMs) return { value: cached.value, store: false };
  return { value: false, store: false };
}
