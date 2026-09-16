// lib/api/liveboards/liveboards.ts
import { apiRequest } from "../core";
import type { LiveBoard, LiveBoardRequest, ServerReportRequest, ServerReportSettings } from "./models";

/**
 * Live boards and server reports API
 * Maps to Mewdeko.Controllers.LiveBoardsController
 */
export const liveBoardsApi = {
  /** Lists live boards */
  list: (guildId: bigint) => apiRequest<LiveBoard[]>(`LiveBoards/${guildId}`),

  /** Creates a live board and posts its first message */
  create: (guildId: bigint, request: LiveBoardRequest) =>
    apiRequest<LiveBoard>(`LiveBoards/${guildId}`, "POST", request),

  /** Deletes a live board and its message */
  remove: (guildId: bigint, id: number) => apiRequest<boolean>(`LiveBoards/${guildId}/${id}`, "DELETE"),

  /** Refreshes every live board now */
  refresh: (guildId: bigint) => apiRequest<number>(`LiveBoards/${guildId}/refresh`, "POST"),

  /** Gets report settings */
  getReport: (guildId: bigint) => apiRequest<ServerReportSettings>(`LiveBoards/${guildId}/report`),

  /** Updates report settings */
  updateReport: (guildId: bigint, request: ServerReportRequest) =>
    apiRequest<ServerReportSettings>(`LiveBoards/${guildId}/report`, "PUT", request),

  /** Posts a report to the configured channel now */
  sendReport: (guildId: bigint) => apiRequest<boolean>(`LiveBoards/${guildId}/report/send`, "POST"),
};
