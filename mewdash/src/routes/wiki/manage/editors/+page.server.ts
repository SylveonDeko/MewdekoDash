import { requireAdmin } from "$lib/server/wiki/guard";
import { listEditors } from "$lib/server/wiki/store";
import type { EditorRecord } from "$lib/wiki/records";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireAdmin(locals, url);
  if (!access.databaseAvailable) return { editors: [] as EditorRecord[] };
  return { editors: await listEditors() };
};
