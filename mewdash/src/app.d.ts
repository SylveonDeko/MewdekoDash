import type {DiscordUser} from "./lib/types/discord";

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user: DiscordUser | null
        }

        // interface PageData {}
        // interface Platform {}
    }
}

export {};