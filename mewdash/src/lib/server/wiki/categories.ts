import type pg from "pg";
import { query, withTransaction } from "$lib/server/db";
import type { CategoryRecord } from "$lib/wiki/records";
import type { CategoryFields } from "$lib/wiki/validation";
import { invalidateWikiCache } from "./cache";
import { isUniqueViolation, WikiError } from "./errors";

const step = 10;

/** Every category in display order, with how many live pages each holds. */
export async function listCategoryRecords(): Promise<CategoryRecord[]> {
  const result = await query<{ id: string; name: string; icon: string; sort_order: number; page_count: string }>(
    `select c.id, c.name, c.icon, c.sort_order,
            (select count(*) from dash_wiki_pages p where p.category = c.name and p.deleted_at is null) as page_count
       from dash_wiki_categories c
      order by c.sort_order, c.id`,
  );
  return result.rows.map((row) => ({ id: row.id, name: row.name, icon: row.icon, sortOrder: row.sort_order, pageCount: Number(row.page_count) }));
}

/** Throws unless a category with exactly this name exists. */
export async function assertCategoryExists(client: pg.PoolClient, name: string): Promise<void> {
  const found = await client.query("select 1 from dash_wiki_categories where name = $1", [name]);
  if (found.rowCount === 0) throw new WikiError("category_invalid", 400, "category");
}

/**
 * Adds a category at the end of the list.
 *
 * @param fields The name and icon.
 * @returns The new category id.
 */
export async function createCategory(fields: CategoryFields): Promise<string> {
  try {
    const result = await query<{ id: string }>(
      `insert into dash_wiki_categories (name, icon, sort_order)
       values ($1, $2, (select coalesce(max(sort_order), 0) + $3 from dash_wiki_categories)) returning id`,
      [fields.name, fields.icon, step],
    );
    invalidateWikiCache();
    return result.rows[0].id;
  } catch (error) {
    if (isUniqueViolation(error)) throw new WikiError("category_taken", 409, "name");
    throw error;
  }
}

/**
 * Changes a category's name and icon. Pages in the category follow a new name.
 *
 * @param id The category.
 * @param fields The new name and icon.
 */
export async function updateCategory(id: string, fields: CategoryFields): Promise<void> {
  try {
    await withTransaction(async (client) => {
      const found = await client.query<{ name: string }>("select name from dash_wiki_categories where id = $1 for update", [id]);
      const current = found.rows[0];
      if (!current) throw new WikiError("not_found", 404);
      await client.query("update dash_wiki_categories set name = $2, icon = $3 where id = $1", [id, fields.name, fields.icon]);
      if (current.name !== fields.name) {
        await client.query("update dash_wiki_pages set category = $2 where category = $1", [current.name, fields.name]);
      }
    });
    invalidateWikiCache();
  } catch (error) {
    if (isUniqueViolation(error)) throw new WikiError("category_taken", 409, "name");
    throw error;
  }
}

/** Removes a category that has no live pages. */
export async function deleteCategory(id: string): Promise<void> {
  await withTransaction(async (client) => {
    const found = await client.query<{ name: string }>("select name from dash_wiki_categories where id = $1 for update", [id]);
    const current = found.rows[0];
    if (!current) throw new WikiError("not_found", 404);
    const used = await client.query("select 1 from dash_wiki_pages where category = $1 and deleted_at is null limit 1", [current.name]);
    if ((used.rowCount ?? 0) > 0) throw new WikiError("category_not_empty", 409);
    await client.query("delete from dash_wiki_categories where id = $1", [id]);
  });
  invalidateWikiCache();
}

/**
 * Saves a new order for every category.
 *
 * @param ids Every category id, in the new order.
 */
export async function reorderCategories(ids: string[]): Promise<void> {
  await withTransaction(async (client) => {
    const rows = await client.query<{ id: string }>("select id from dash_wiki_categories order by sort_order, id for update");
    const known = new Set(rows.rows.map((row) => row.id));
    if (ids.length !== known.size || new Set(ids).size !== ids.length || !ids.every((id) => known.has(id))) {
      throw new WikiError("list_changed", 409);
    }
    for (let i = 0; i < ids.length; i++) {
      await client.query("update dash_wiki_categories set sort_order = $2 where id = $1", [ids[i], (i + 1) * step]);
    }
  });
  invalidateWikiCache();
}
