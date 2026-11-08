import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
  redirect(308, `/dashboard/roles?tab=states${url.search ? "&" + url.search.slice(1) : ""}`);
};
