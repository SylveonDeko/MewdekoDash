import type {PageServerLoad} from "./$types"
import type {DiscordUser} from "../lib/types/discord";
import {TOPGG_KEY} from "$env/static/private";

export const load: PageServerLoad = async ({locals}): Promise<{ server_count: number | null, user: DiscordUser | null }> => {

    const count: number | null = await fetch("https://top.gg/api/bots/752236274261426212/stats", {
        method: "get",
        headers: new Headers({
            'Authorization': TOPGG_KEY
        })
    }).then(response =>
        response.json()
    ).then(data =>
        parseInt(data.server_count)
    ).catch(() => null);

    return {server_count: count, user: locals.user};
}