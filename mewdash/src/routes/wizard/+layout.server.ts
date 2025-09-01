import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  // Ensure user is authenticated for wizard access
  return {
    user: locals.user || null
  };
};