// lib/api/linkfix/linkfix.ts
import { apiRequest } from "../core";
import type { LinkFixSettings, LinkFixUpdateRequest } from "./models";

/**
 * Link fixing API
 * Maps to Mewdeko.Controllers.LinkFixController
 */
export const linkFixApi = {
  /** Gets whether link fixing is on and each site's host and state */
  get: (guildId: bigint) => apiRequest<LinkFixSettings>(`LinkFix/${guildId}`),

  /** Changes link fixing settings and returns the new state */
  update: (guildId: bigint, request: LinkFixUpdateRequest) =>
    apiRequest<LinkFixSettings>(`LinkFix/${guildId}`, "POST", request),
};
