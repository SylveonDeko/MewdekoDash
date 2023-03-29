import {deleteCookies} from "../discordAuth";
import type {PageServerLoad} from "./$types";

export const load: PageServerLoad = async ({cookies}) => {
    deleteCookies(cookies)
    return {}
}