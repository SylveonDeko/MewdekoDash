import { redirect, type RequestHandler } from "@sveltejs/kit";
import { deleteCookies } from '../discordAuth';

export const GET: RequestHandler = async ({ cookies, locals }) => {
  await deleteCookies(cookies);
  locals.user = null;

  throw redirect(303, '/');
};