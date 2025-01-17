import { redirect, type RequestHandler } from "@sveltejs/kit";
import { deleteCookies } from '../discordAuth';

export const load: RequestHandler = async ({ cookies }) => {
  deleteCookies(cookies);
  throw redirect(302, '/');
};