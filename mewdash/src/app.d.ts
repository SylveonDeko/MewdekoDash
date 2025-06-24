import type { DiscordUser } from "$lib/types/discord";

declare global {
  namespace App {

    interface PageData {
      user: DiscordUser | null;
    }

    interface Error {
      message: string;
    }
  }
}

export {};