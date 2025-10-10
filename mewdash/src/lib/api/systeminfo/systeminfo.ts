// lib/api/systeminfo/systeminfo.ts
import { apiRequest } from "../core";
import type { SystemInfo } from "./models";

/**
 * System information API (Owner only)
 * Maps to Mewdeko.Controllers.SystemInfoController
 */
export const systemInfoApi = {
  /**
   * Gets system information including CPU, memory, and uptime
   * @param userId The Discord user ID (must be bot owner)
   * @returns System resource information
   */
  getSystemInfo: (userId: bigint) =>
    apiRequest<SystemInfo>(`SystemInfo?userId=${userId}`),
};
