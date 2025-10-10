// routes/forms/[formId]/+page.ts
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
  const data = await parent();
  return {
    user: data.user,
  };
};
