// lib/api/designs/designs.ts
import { apiRequest } from "../core";
import type {
  Design,
  DesignGuild,
  DesignImage,
  DesignRequest,
  DesignTarget,
  MemberDesignList,
  MemberDesignModeration,
  MemberDesignSettings,
  MemberDesignSettingsRequest,
  MemberDesignStatus,
  MemberDesigns,
  OwnDesigns,
  SaveOwnDesignRequest,
} from "./models";

/**
 * Card designs API
 * Maps to Mewdeko.Controllers.DesignsController and the designs routes of Mewdeko.Controllers.MeController
 */
export const designsApi = {
  /**
   * Lists a community's designs
   * @param guildId The guild ID
   * @param target Only designs for this card
   */
  list: (guildId: bigint, target?: DesignTarget) =>
    apiRequest<Design[]>(`Designs/${guildId}${target === undefined ? "" : `?target=${target}`}`),

  /**
   * Creates a design
   * @param guildId The guild ID
   * @param request The design
   */
  create: (guildId: bigint, request: DesignRequest) =>
    apiRequest<Design>(`Designs/${guildId}`, "POST", request),

  /**
   * Changes a design; the card can't change
   * @param guildId The guild ID
   * @param id The design ID
   * @param request The new settings
   */
  update: (guildId: bigint, id: number, request: DesignRequest) =>
    apiRequest<Design>(`Designs/${guildId}/${id}`, "PUT", request),

  /**
   * Deletes a design along with who owns it
   * @param guildId The guild ID
   * @param id The design ID
   */
  remove: (guildId: bigint, id: number) =>
    apiRequest<void>(`Designs/${guildId}/${id}`, "DELETE"),

  /**
   * Makes a design the community default for its card
   * @param guildId The guild ID
   * @param id The design ID
   */
  setDefault: (guildId: bigint, id: number) =>
    apiRequest<Design>(`Designs/${guildId}/${id}/default`, "POST"),

  /**
   * Clears the community default of a design's card
   * @param guildId The guild ID
   * @param id The design ID, which must be the current default
   */
  clearDefault: (guildId: bigint, id: number) =>
    apiRequest<Design>(`Designs/${guildId}/${id}/default`, "DELETE"),

  /**
   * Lists the communities where a member can use designs
   * @param guildId Any guild the member is in
   * @param userId The member
   */
  getMyGuilds: (guildId: bigint | string, userId: bigint | string) =>
    apiRequest<DesignGuild[]>(`me/${guildId}/${userId}/designs/guilds`),

  /**
   * Gets what a member can use in one community
   * @param guildId The guild ID
   * @param userId The member
   */
  getMyDesigns: (guildId: bigint | string, userId: bigint | string) =>
    apiRequest<MemberDesigns>(`me/${guildId}/${userId}/designs`),

  /**
   * Equips a design the member owns or that is free
   * @param guildId The guild ID
   * @param userId The member
   * @param designId The design
   * @returns The member's designs after the change
   */
  equip: (guildId: bigint | string, userId: bigint | string, designId: number) =>
    apiRequest<MemberDesigns>(`Designs/${guildId}/member/${userId}/equip`, "POST", { designId }),

  /**
   * Unequips a member's design for one card
   * @param guildId The guild ID
   * @param userId The member
   * @param target The card
   * @returns The member's designs after the change
   */
  unequip: (guildId: bigint | string, userId: bigint | string, target: DesignTarget) =>
    apiRequest<MemberDesigns>(`Designs/${guildId}/member/${userId}/unequip`, "POST", { target }),

  /**
   * Gets a community's rules for member designs
   * @param guildId The guild ID
   */
  getMemberSettings: (guildId: bigint) =>
    apiRequest<MemberDesignSettings>(`Designs/${guildId}/member-settings`),

  /**
   * Changes a community's rules for member designs
   * @param guildId The guild ID
   * @param request The fields to change
   */
  updateMemberSettings: (guildId: bigint, request: MemberDesignSettingsRequest) =>
    apiRequest<MemberDesignSettings>(`Designs/${guildId}/member-settings`, "PUT", request),

  /**
   * Lists the designs members made
   * @param guildId The guild ID
   * @param status Only designs with this status
   * @param target Only designs for this card
   */
  listMemberDesigns: (guildId: bigint, status?: MemberDesignStatus, target?: DesignTarget) => {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (target !== undefined) query.set("target", target.toString());
    const text = query.toString();
    return apiRequest<MemberDesignList>(`Designs/${guildId}/member-designs${text ? `?${text}` : ""}`);
  },

  /**
   * Reads a member design's uploaded background, including one waiting for review
   * @param guildId The guild ID
   * @param id The design ID
   */
  getMemberDesignImage: (guildId: bigint, id: number) =>
    apiRequest<DesignImage>(`Designs/${guildId}/member-designs/${id}/image`),

  /**
   * Approves a member design's upload
   * @param guildId The guild ID
   * @param id The design ID
   */
  approveMemberDesign: (guildId: bigint, id: number) =>
    apiRequest<void>(`Designs/${guildId}/member-designs/${id}/approve`, "POST"),

  /**
   * Turns a member design's upload down and tells the member
   * @param guildId The guild ID
   * @param id The design ID
   * @param reason Shown to the member, up to 300 characters
   */
  rejectMemberDesign: (guildId: bigint, id: number, reason?: string) =>
    apiRequest<MemberDesignModeration>(`Designs/${guildId}/member-designs/${id}/reject`, "POST", { reason }),

  /**
   * Removes a member design and tells the member
   * @param guildId The guild ID
   * @param id The design ID
   * @param reason Shown to the member, up to 300 characters
   */
  removeMemberDesign: (guildId: bigint, id: number, reason?: string) =>
    apiRequest<MemberDesignModeration>(`Designs/${guildId}/member-designs/${id}/remove`, "POST", { reason }),

  /**
   * Gets what a member can do about making their own designs
   * @param guildId The guild ID
   * @param userId The member
   */
  getOwn: (guildId: bigint | string, userId: bigint | string) =>
    apiRequest<OwnDesigns>(`me/${guildId}/${userId}/designs/own`),

  /**
   * Creates or replaces the member's own design for one card
   * @param guildId The guild ID
   * @param userId The member
   * @param target The card
   * @param request The design and any upload change
   * @returns The member's own designs after the save
   */
  saveOwn: (guildId: bigint | string, userId: bigint | string, target: DesignTarget, request: SaveOwnDesignRequest) =>
    apiRequest<OwnDesigns>(`me/${guildId}/${userId}/designs/own/${target}`, "PUT", request),

  /**
   * Reads the member's own uploaded background, including one waiting for review
   * @param guildId The guild ID
   * @param userId The member
   * @param target The card
   */
  getOwnImage: (guildId: bigint | string, userId: bigint | string, target: DesignTarget) =>
    apiRequest<DesignImage>(`me/${guildId}/${userId}/designs/own/${target}/image`),
};
