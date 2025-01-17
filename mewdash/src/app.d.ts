import type { DiscordUser } from '$lib/types/discord';
import type { DiscordGuild } from "$lib/types/discordGuild.ts";

declare global {
  namespace App {
    interface Locals {
      user: DiscordUser | null;
      guilds: DiscordGuild[] | null;
    }

    interface PageData {
      user: DiscordUser | null;
      guilds: DiscordGuild[] | null;
    }

    interface Error {
      message: string;
    }
  }
}

export {};