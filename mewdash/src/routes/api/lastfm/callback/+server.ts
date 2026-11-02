import { env } from "$env/dynamic/private";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { logger } from "$lib/logger";
import { defaultInstanceURL, resolveInstanceURLByPort } from "$lib/server/instances";
import { mintBackendToken } from "$lib/server/backendJwt";

const linked = async (url: URL, user: NonNullable<App.Locals["user"]>): Promise<boolean> => {
  const token = url.searchParams.get("token");
  if (!token) return false;

  const port = Number.parseInt(url.searchParams.get("port") ?? "", 10);
  const backend = Number.isInteger(port) ? await resolveInstanceURLByPort(port) : await defaultInstanceURL();
  if (!backend) return false;

  const headers: Record<string, string> = { "X-API-Key": env.MEWDEKO_API_KEY };
  const backendToken = mintBackendToken(user);
  if (backendToken) headers["Authorization"] = `Bearer ${backendToken}`;

  try {
    const response = await fetch(
      `${backend}/lastfm/link?token=${encodeURIComponent(token)}&userId=${user.id}`,
      { method: "POST", headers },
    );
    return response.ok;
  } catch (error) {
    logger.error("Linking a Last.fm account failed", error);
    return false;
  }
};

export const GET: RequestHandler = async ({ url, locals }) => {
  const user = locals.user;
  const ok = user ? await linked(url, user) : false;
  redirect(303, ok ? "/me?lastfm=success" : "/me?lastfm=failed");
};
