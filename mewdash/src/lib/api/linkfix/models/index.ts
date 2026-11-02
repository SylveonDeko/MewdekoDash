/** One site's link fixing state, as the bot returns it */
export interface LinkFixPlatform {
  name: string;
  displayName: string;
  defaultHost: string;
  host: string;
  enabled: boolean;
}

/** A guild's link fixing settings */
export interface LinkFixSettings {
  enabled: boolean;
  platforms: LinkFixPlatform[];
}

/** Changes to send; fields left out stay as they are, and an empty host goes back to the default */
export interface LinkFixUpdateRequest {
  enabled?: boolean;
  platforms?: Array<{ name: string; enabled?: boolean; host?: string | null }>;
}
