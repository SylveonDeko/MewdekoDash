import { requireEditor } from "$lib/server/wiki/guard";
import { listFeedback } from "$lib/server/wiki/store";
import type { FeedbackRecord } from "$lib/wiki/records";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const access = await requireEditor(locals, url);
  const resolved = url.searchParams.get("show") === "resolved";
  if (!access.databaseAvailable) return { resolved, feedback: [] as FeedbackRecord[] };
  return { resolved, feedback: await listFeedback(resolved ? "resolved" : "open", 100) };
};
