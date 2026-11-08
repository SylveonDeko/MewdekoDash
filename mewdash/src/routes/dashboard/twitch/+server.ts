import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
  const target = new URLSearchParams(url.searchParams);
  target.set("tab", "twitch");
  redirect(307, `/dashboard/alerts?${target}`);
};
