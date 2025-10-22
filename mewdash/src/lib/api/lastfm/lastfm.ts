import { apiRequest } from "../core";
import type {
  LastFmAlbum,
  LastFmArtist,
  LastFmStatus,
  LastFmTrack,
  LastFmUserInfo,
} from "./models";

export const lastfmApi = {
  async getAuthUrl(
    guildId: bigint,
    userId: bigint,
  ): Promise<{ authUrl: string }> {
    return apiRequest(`lastfm/auth-url?userId=${userId}`, "GET");
  },

  async getStatus(guildId: bigint, userId: bigint): Promise<LastFmStatus> {
    return apiRequest(`lastfm/status?userId=${userId}`, "GET");
  },

  async unlink(
    guildId: bigint,
    userId: bigint,
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`lastfm/unlink?userId=${userId}`, "DELETE");
  },

  async toggleScrobbling(
    guildId: bigint,
    userId: bigint,
    enabled: boolean,
  ): Promise<{ success: boolean; scrobblingEnabled: boolean }> {
    return apiRequest(
      `lastfm/toggle?userId=${userId}&enabled=${enabled}`,
      "POST",
    );
  },

  async getUserInfo(guildId: bigint, userId: bigint): Promise<LastFmUserInfo> {
    return apiRequest(`lastfm/user-info?userId=${userId}`, "GET");
  },

  async getRecentTracks(
    guildId: bigint,
    userId: bigint,
    count: number = 10,
  ): Promise<LastFmTrack[]> {
    return apiRequest(
      `lastfm/recent-tracks?userId=${userId}&count=${count}`,
      "GET",
    );
  },

  async getTopArtists(
    guildId: bigint,
    userId: bigint,
    period: string = "overall",
    count: number = 10,
  ): Promise<LastFmArtist[]> {
    return apiRequest(
      `lastfm/top-artists?userId=${userId}&period=${period}&count=${count}`,
      "GET",
    );
  },

  async getTopAlbums(
    guildId: bigint,
    userId: bigint,
    period: string = "overall",
    count: number = 10,
  ): Promise<LastFmAlbum[]> {
    return apiRequest(
      `lastfm/top-albums?userId=${userId}&period=${period}&count=${count}`,
      "GET",
    );
  },
};
