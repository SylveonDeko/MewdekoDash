import { listBlocks } from "$lib/server/wiki/blocks";
import { requireAdmin } from "$lib/server/wiki/guard";
import { readSettings } from "$lib/server/wiki/settings";
import type { BlockedUserRecord } from "$lib/wiki/records";
import { defaultSettings } from "$lib/wiki/validation";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireAdmin(locals, url);
  if (!access.databaseAvailable) return { settings: defaultSettings, blocked: [] as BlockedUserRecord[] };
  const [settings, blocked] = await Promise.all([readSettings(), listBlocks()]);
  return { settings, blocked };
};
