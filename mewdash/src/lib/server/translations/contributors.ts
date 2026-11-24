import { query } from "$lib/server/db";
import { isUniqueViolation, WikiError } from "$lib/server/wiki/errors";
import type { ContributorPage, ContributorRecord } from "$lib/translate/records";
import { translationLimits } from "$lib/translate/rules";
import { poolRun, type Run } from "./run";

interface ContributorDbRow {
  user_id: string;
  name: string;
  suggested: string;
  approved: string;
  declined: string;
  open: string;
  direct: string;
  last_at: Date;
  blocked: boolean;
}

/**
 * The people who sent or saved translations, most recently active first, 50 at a time. Suggested,
 * approved and declined count only what the person sent as a suggestion. Direct counts what they
 * saved themselves, imported or restored.
 *
 * @param locale A language to count, or null for all of them.
 * @param page The page, starting at 1.
 */
export async function listContributors(locale: string | null, page: number): Promise<ContributorPage> {
  const at = Math.max(1, Math.floor(page));
  const total = await query<{ n: string }>(
    "select count(distinct user_id) as n from dash_tr_suggestions where ($1::text is null or locale = $1)",
    [locale],
  );
  const rows = await query<ContributorDbRow>(
    `select x.user_id,
            (array_agg(x.user_name order by x.id desc))[1] as name,
            count(*) filter (where x.origin = 'suggestion') as suggested,
            count(*) filter (where x.origin = 'suggestion' and x.status = 'approved') as approved,
            count(*) filter (where x.origin = 'suggestion' and x.status = 'declined') as declined,
            count(*) filter (where x.status = 'open') as open,
            count(*) filter (where x.origin <> 'suggestion') as direct,
            max(x.created_at) as last_at,
            exists (select 1 from dash_tr_blocks b where b.user_id = x.user_id) as blocked
       from dash_tr_suggestions x
      where ($1::text is null or x.locale = $1)
      group by x.user_id
      order by last_at desc, x.user_id
      limit $2 offset $3`,
    [locale, translationLimits.pageSize, (at - 1) * translationLimits.pageSize],
  );
  return {
    rows: rows.rows.map((row): ContributorRecord => {
      const approved = Number(row.approved);
      const declined = Number(row.declined);
      return {
        userId: row.user_id,
        name: row.name,
        suggested: Number(row.suggested),
        approved,
        declined,
        open: Number(row.open),
        direct: Number(row.direct),
        approvalPercent: approved + declined === 0 ? null : Math.round((approved * 100) / (approved + declined)),
        lastAt: row.last_at.toISOString(),
        blocked: row.blocked,
      };
    }),
    total: Number(total.rows[0].n),
    page: at,
    pageSize: translationLimits.pageSize,
  };
}

/**
 * Whether a person may not send suggestions.
 *
 * @param userId The person.
 * @param run Where to run the query.
 */
export async function isBlocked(userId: string, run: Run = poolRun): Promise<boolean> {
  const found = await run("select 1 from dash_tr_blocks where user_id = $1", [userId]);
  return (found.rowCount ?? 0) > 0;
}

/**
 * Stops a person from sending suggestions. Their open suggestions stay for review.
 *
 * @param userId The person.
 * @param name The name to show for them.
 * @param addedBy The admin blocking them.
 */
export async function blockUser(userId: string, name: string, addedBy: string): Promise<void> {
  try {
    await query("insert into dash_tr_blocks (user_id, display_name, added_by) values ($1, $2, $3)", [userId, name, addedBy]);
  } catch (error) {
    if (isUniqueViolation(error)) throw new WikiError("conflict", 409);
    throw error;
  }
}

/**
 * Lets a person send suggestions again.
 *
 * @param userId The person.
 */
export async function unblockUser(userId: string): Promise<void> {
  const result = await query("delete from dash_tr_blocks where user_id = $1", [userId]);
  if (result.rowCount === 0) throw new WikiError("not_found", 404);
}
