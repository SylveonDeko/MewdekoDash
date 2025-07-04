import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  // Always allow access - let client-side handle authentication with user store
  return {
    user: locals.user || null
  };
};