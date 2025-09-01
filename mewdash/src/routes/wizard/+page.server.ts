import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
  // Ensure user is authenticated
  if (!locals.user) {
    throw redirect(302, '/api/discord/login');
  }

  // Get guild ID from URL parameters
  const guildId = url.searchParams.get('guild');
  const wizardType = url.searchParams.get('type') || 'first-time';

  if (!guildId) {
    throw error(400, 'Guild ID is required for wizard');
  }

  // Return basic data - let client-side handle API calls
  return {
    user: locals.user,
    wizardType: wizardType as 'first-time' | 'quick-setup',
    guildId: guildId // Keep as string, convert to BigInt client-side
  };
};