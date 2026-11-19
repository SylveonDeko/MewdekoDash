import { requireMember } from "$lib/server/wiki/guard";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const access = await requireMember(locals, url);
  return {
    manage: {
      canEdit: access.canEdit,
      canManageEditors: access.canManageEditors,
      databaseAvailable: access.databaseAvailable,
    },
  };
};
