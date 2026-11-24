import { requireEditor } from "$lib/server/wiki/guard";
import { getAnalytics } from "$lib/server/wiki/insights";
import type { AnalyticsOverview } from "$lib/wiki/records";
import type { PageServerLoad } from "./$types";

const empty: AnalyticsOverview = { days: 30, views: 0, helpful: 0, notHelpful: 0, reports: 0, daily: [], items: [], misses: [] };

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireEditor(locals, url);
  if (!access.databaseAvailable) return { analytics: empty };
  return { analytics: await getAnalytics(30) };
};
