import { requireEditor } from "$lib/server/wiki/guard";
import { listCategories, listManagePages } from "$lib/server/wiki/store";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireEditor(locals, url);
  if (!access.databaseAvailable) return { pages: [], categories: [] as string[] };
  const [pages, categories] = await Promise.all([listManagePages(), listCategories()]);
  return { pages, categories };
};
