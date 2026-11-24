import { getAccess } from "$lib/server/wiki/access";
import { getWikiCategories, getWikiIndex } from "$lib/server/wiki";
import { groupByCategory } from "$lib/wiki/catalog";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const access = await getAccess(locals);
  const [all, categories] = await Promise.all([getWikiIndex(), getWikiCategories()]);
  return {
    all,
    groups: groupByCategory(all, categories),
    wikiAccess: {
      signedIn: access.userId !== null,
      canEdit: access.canEdit,
      canManageEditors: access.canManageEditors,
      databaseAvailable: access.databaseAvailable,
    },
  };
};
