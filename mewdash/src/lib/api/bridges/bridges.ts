// lib/api/bridges/bridges.ts
import { apiRequest } from "../core";
import type { Bridge, BridgeCode, BridgeCodeRequest, BridgeLinkRequest, BridgeSettings, Pair, PairConnectResult, PairSettings } from "./models";

/**
 * Channel bridges API
 * Maps to Mewdeko.Controllers.BridgeController
 */
export const bridgesApi = {
  /** Lists the guild's bridged channels */
  list: (guildId: bigint) => apiRequest<Bridge[]>(`Bridge/${guildId}`),

  /** Creates a code that a Fluxer channel can link with */
  createCode: (guildId: bigint, request: BridgeCodeRequest) =>
    apiRequest<BridgeCode>(`Bridge/${guildId}/code`, "POST", request),

  /** Bridges a channel using a code made on Fluxer */
  link: (guildId: bigint, request: BridgeLinkRequest) =>
    apiRequest<Bridge>(`Bridge/${guildId}/link`, "POST", request),

  /** Pauses a bridge */
  pause: (guildId: bigint, bridgeId: string) =>
    apiRequest<Bridge>(`Bridge/${guildId}/${bridgeId}/pause`, "POST"),

  /** Resumes a bridge */
  resume: (guildId: bigint, bridgeId: string) =>
    apiRequest<Bridge>(`Bridge/${guildId}/${bridgeId}/resume`, "POST"),

  /** Sets whether messages from bots are relayed */
  setAllowBots: (guildId: bigint, bridgeId: string, allow: boolean) =>
    apiRequest<Bridge>(`Bridge/${guildId}/${bridgeId}/allow-bots`, "POST", { allow }),

  /** Replaces the relay rules of a bridge */
  updateSettings: (guildId: bigint, bridgeId: string, settings: BridgeSettings) =>
    apiRequest<Bridge>(`Bridge/${guildId}/${bridgeId}/settings`, "POST", settings),

  /** Removes a bridge */
  remove: (guildId: bigint, bridgeId: string) =>
    apiRequest<void>(`Bridge/${guildId}/${bridgeId}`, "DELETE"),

  /** Gets the communities this guild is paired with */
  getPairs: (guildId: bigint) => apiRequest<Pair[]>(`Bridge/${guildId}/pairs`),

  /** Makes a code that pairs a community on the other platform with this one */
  createPairCode: (guildId: bigint, userId: bigint) =>
    apiRequest<BridgeCode>(`Bridge/${guildId}/pairs/code`, "POST", { userId }),

  /** Pairs with the community that made a code */
  linkPair: (guildId: bigint, code: string, userId: bigint) =>
    apiRequest<Pair>(`Bridge/${guildId}/pairs/link`, "POST", { code, userId }),

  /** Replaces the approval mode and hidden channels of a pair */
  updatePairSettings: (guildId: bigint, pairId: string, settings: PairSettings) =>
    apiRequest<Pair>(`Bridge/${guildId}/pairs/${pairId}/settings`, "POST", settings),

  /** Bridges a channel here to a channel in the paired community */
  connectPair: (guildId: bigint, pairId: string, localChannelId: bigint, remoteChannelId: bigint, userId: bigint) =>
    apiRequest<PairConnectResult>(`Bridge/${guildId}/pairs/${pairId}/connect`, "POST", { localChannelId, remoteChannelId, userId }),

  /** Accepts a bridge the paired community proposed */
  acceptProposal: (guildId: bigint, pairId: string, proposalId: string, userId: bigint) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}/proposals/${proposalId}/accept`, "POST", { userId }),

  /** Declines a bridge the paired community proposed */
  declineProposal: (guildId: bigint, pairId: string, proposalId: string, userId: bigint) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}/proposals/${proposalId}/decline`, "POST", { userId }),

  /** Cancels a bridge this community proposed */
  cancelProposal: (guildId: bigint, pairId: string, proposalId: string) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}/proposals/${proposalId}`, "DELETE"),

  /** Unlinks a paired community, optionally keeping the bridges made through it */
  removePair: (guildId: bigint, pairId: string, keepBridges: boolean) =>
    apiRequest<void>(`Bridge/${guildId}/pairs/${pairId}?keepBridges=${keepBridges}`, "DELETE"),
};
