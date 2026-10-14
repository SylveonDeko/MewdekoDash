import type { DiscordUser } from "$lib/types/discord";

declare global {
  namespace App {

    interface Locals {
      user: User | null;
      /** The locale this request is rendered in, resolved in hooks.server.ts. */
      locale: string;
    }


    interface PageData {
      user: DiscordUser | null;
    }

    interface Error {
      message: string;
    }
  }
}

declare namespace svelteHTML {
  // Enhance all HTMLAttributes events
  interface HTMLAttributes<T> {
    'on:clickoutside'?: (event: CustomEvent<any> & { target: EventTarget & T }) => any;
  }
}

export {};