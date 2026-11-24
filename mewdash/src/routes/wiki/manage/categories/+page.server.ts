import { listCategoryRecords } from "$lib/server/wiki/categories";
import { requireEditor } from "$lib/server/wiki/guard";
import type { CategoryRecord } from "$lib/wiki/records";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireEditor(locals, url);
  if (!access.databaseAvailable) return { categories: [] as CategoryRecord[] };
  return { categories: await listCategoryRecords() };
};
