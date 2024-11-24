import type { DiscordUser } from "./lib/types/discord";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: DiscordUser | null;
    }

    interface HTMLAttributes<T> {
      // If you want to use on:clickoutside
      "on:clickoutside"?: (event: CustomEvent<any>) => void;
    }

    // interface PageData {}
    // interface Platform {}
  }
}

export {};
