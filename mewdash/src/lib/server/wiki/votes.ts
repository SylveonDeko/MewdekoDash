import { createHash } from "node:crypto";
import { query } from "$lib/server/db";
import { WikiError } from "./errors";

/** The voter key of a signed in member. */
export function userVoterKey(userId: string): string {
  return `u${userId}`;
}

/**
 * The voter key of a signed out reader: a hash of the random key their browser keeps, so the
 * stored value cannot be used as that key.
 *
 * @param browserKey The key the browser sent.
 */
export function browserVoterKey(browserKey: string): string {
  return `b${createHash("sha256").update(browserKey).digest("base64url").slice(0, 22)}`;
}

/** A voter's answer on a page in a language, or null when they have not voted. */
export async function getVote(pageId: string, locale: string, voterKey: string): Promise<boolean | null> {
  const result = await query<{ helpful: boolean }>(
    `select v.helpful from dash_wiki_votes v
       join dash_wiki_pages p on p.id = v.page_id and p.deleted_at is null and p.published
      where v.page_id = $1 and v.locale = $2 and v.voter_key = $3`,
    [pageId, locale, voterKey],
  );
  return result.rows[0]?.helpful ?? null;
}

/**
 * Stores a vote on a published page, or changes the voter's earlier one.
 *
 * @param pageId The page.
 * @param locale The language the reader saw.
 * @param helpful The answer.
 * @param voterKey Who votes, from {@link userVoterKey} or {@link browserVoterKey}.
 * @param userId The member's id when signed in.
 */
export async function setVote(pageId: string, locale: string, helpful: boolean, voterKey: string, userId: string | null): Promise<void> {
  const result = await query(
    `insert into dash_wiki_votes (page_id, locale, voter_key, helpful, user_id)
     select p.id, $2::text, $3::text, $4::boolean, $5::text from dash_wiki_pages p where p.id = $1 and p.deleted_at is null and p.published
     on conflict (page_id, locale, voter_key) do update set helpful = excluded.helpful, updated_at = now()`,
    [pageId, locale, voterKey, helpful, userId],
  );
  if (result.rowCount === 0) throw new WikiError("not_found", 404);
}
