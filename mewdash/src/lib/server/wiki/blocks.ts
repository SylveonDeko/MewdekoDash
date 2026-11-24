import { query } from "$lib/server/db";
import type { BlockedUserRecord } from "$lib/wiki/records";
import { WikiError } from "./errors";

/** Every user who may not send suggestions, newest first. */
export async function listBlocks(): Promise<BlockedUserRecord[]> {
  const result = await query<{ user_id: string; display_name: string; added_by: string; added_at: Date }>(
    "select user_id, display_name, added_by, added_at from dash_wiki_suggestion_blocks order by added_at desc, user_id",
  );
  return result.rows.map((row) => ({ userId: row.user_id, displayName: row.display_name, addedBy: row.added_by, addedAt: row.added_at.toISOString() }));
}

/** True when the user may not send suggestions. */
export async function isBlocked(userId: string): Promise<boolean> {
  const result = await query("select 1 from dash_wiki_suggestion_blocks where user_id = $1", [userId]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Stops a user from sending suggestions. Suggestions they already sent stay in the queue.
 *
 * @param userId The user.
 * @param displayName The name shown in the list.
 * @param addedBy The admin blocking them.
 */
export async function blockUser(userId: string, displayName: string, addedBy: string): Promise<void> {
  const result = await query(
    "insert into dash_wiki_suggestion_blocks (user_id, display_name, added_by) values ($1, $2, $3) on conflict (user_id) do nothing",
    [userId, displayName, addedBy],
  );
  if (result.rowCount === 0) throw new WikiError("already_blocked", 409, "userId");
}

/** Lets a user send suggestions again. */
export async function unblockUser(userId: string): Promise<void> {
  const result = await query("delete from dash_wiki_suggestion_blocks where user_id = $1", [userId]);
  if (result.rowCount === 0) throw new WikiError("not_found", 404);
}
