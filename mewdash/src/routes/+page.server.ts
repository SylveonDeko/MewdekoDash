import {TopGGKey} from "$lib/server/secrets";
import type {PageServerLoad} from "./$types"
import type {DiscordUser} from "../lib/types/discord";
import Discord from "../lib/icon/Discord.svelte";

export const load: PageServerLoad = async (cookies, locals): Promise<{ server_count: number | null, user: DiscordUser | null }> => {
    let count: number | null;
    let gottenUser: DiscordUser | null;
    fetch("https://top.gg/api/bots/752236274261426212/stats", {
        method: "get",
        headers: new Headers({
            'Authorization': TopGGKey
        })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            count: parseInt(data.server_count);
        })
        .catch(() => {
            count: null;
        });

    if (locals.user)
        gottenUse: locals.User;

    return {server_count: count, user: gottenUser};
    

}