import { redirect, type RequestHandler } from "@sveltejs/kit";
import { deleteCookies } from '../discordAuth';

export const GET: RequestHandler = async ({ cookies, locals }) => {
  deleteCookies(cookies);
  locals.user = null;

  throw redirect(303, '/');
};