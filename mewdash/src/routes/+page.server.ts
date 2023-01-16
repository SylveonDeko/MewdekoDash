import {TopGGKey} from "$lib/server/secrets";
import type {PageServerLoad} from "./$types"

export const load: PageServerLoad = async (): Promise<{ server_count: number | null }> => {
    return fetch("https://top.gg/api/bots/752236274261426212/stats", {
        method: "get",
        headers: new Headers({
            'Authorization': TopGGKey
        })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            return {server_count: parseInt(data.server_count)};
        })
        .catch(() => {
            return {server_count: null};
        });
}