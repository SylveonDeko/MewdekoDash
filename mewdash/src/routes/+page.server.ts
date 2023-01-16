import {TopGGKey} from "$lib/server/secrets";

export async function load(): Promise<{ servercount: number | null }> {
    return fetch("https://top.gg/api/bots/752236274261426212/stats", {
      method: "get",
      headers: new Headers({
        'Authorization':  TopGGKey
      })})
      .then(response => {
        return response.json();
      })
      .then(data => {
        return { servercount: parseInt(data.server_count) };
      })
      .catch(() =>{
        return { servercount: null };
      });
}