import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
  const data = await parent();
  
  if (!data.user) {
    throw redirect(302, '/api/discord/login');
  }

  return {
    user: data.user
  };
};