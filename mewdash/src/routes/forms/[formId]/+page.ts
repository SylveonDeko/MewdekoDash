// routes/forms/[formId]/+page.ts
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent, data }) => ({
  user: (await parent()).user,
  preview: data.preview,
});
