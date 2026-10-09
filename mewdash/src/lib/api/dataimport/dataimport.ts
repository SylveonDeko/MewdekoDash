// lib/api/dataimport/dataimport.ts
import { apiRequest } from "../core";
import type {
  ImportHistoryEntry,
  ImportMergeMode,
  ImportPreview,
  ImportResult,
  ImportSettingsResult,
  ImportStartRequest,
  XpImportRequest,
} from "./models";

/**
 * Imports from other bots.
 * Maps to Mewdeko.Controllers.ImportController
 */
export const dataImportApi = {
  start: (guildId: bigint, request: ImportStartRequest) =>
    apiRequest<ImportPreview>(`import/${guildId}/start`, "POST", request),

  getJob: (guildId: bigint, jobId: string) =>
    apiRequest<ImportPreview>(`import/${guildId}/jobs/${jobId}`),

  applyXp: (guildId: bigint, jobId: string, request: XpImportRequest) =>
    apiRequest<ImportResult>(`import/${guildId}/jobs/${jobId}/xp`, "POST", request),

  applySettings: (guildId: bigint, jobId: string, sections: string[]) =>
    apiRequest<ImportSettingsResult>(`import/${guildId}/jobs/${jobId}/settings`, "POST", { sections }),

  applyCurrency: (guildId: bigint, jobId: string, mergeMode: ImportMergeMode) =>
    apiRequest<ImportResult>(`import/${guildId}/jobs/${jobId}/currency`, "POST", { mergeMode }),

  getHistory: (guildId: bigint) =>
    apiRequest<ImportHistoryEntry[]>(`import/${guildId}/history`),

  undo: (guildId: bigint, importId: number) =>
    apiRequest<ImportHistoryEntry>(`import/${guildId}/history/${importId}/undo`, "POST"),
};

/**
 * Gzips a file in the browser and base64 encodes it, so large exports fit through the dashboard's upload limit.
 */
export async function packImportFile(file: File): Promise<string> {
  const stream = file.stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}
