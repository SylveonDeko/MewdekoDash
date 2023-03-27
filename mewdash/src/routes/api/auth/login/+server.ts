import type { RequestHandler } from '@sveltejs/kit';
import {redirect} from "@sveltejs/kit";
import {ClientId, RedirectUri} from "../../../../lib/server/secrets";


export async function GET(request)  {
  throw redirect(302, `https://discord.com/oauth2/authorize?client_id=${ClientId}&redirect_uri=${RedirectUri}&response_type=code&scope=identify guilds`)
};
