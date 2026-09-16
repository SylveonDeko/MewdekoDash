// lib/api/pm2/pm2.ts
import { get } from "svelte/store";
import { apiRequest } from "../core";
import { currentInstance } from "$lib/stores/instanceStore";
import type { Pm2LogChunk, Pm2ProcessList, Pm2StreamName } from "./models";

/**
 * pm2 process table and log files on the bot's host. Owner only: the bot checks the
 * dashboard JWT, so a non-owner gets a 403 from every call here.
 * Maps to Mewdeko.Controllers.Pm2Controller
 */
export const pm2Api = {
  /** Lists the processes pm2 manages on the selected instance's host. */
  getProcesses: () => apiRequest<Pm2ProcessList>("Pm2/processes"),

  /** Reads the last `lines` complete lines of a process's log. */
  getTail: (pmId: number, stream: Pm2StreamName, lines: number) =>
    apiRequest<Pm2LogChunk>(`Pm2/logs/${pmId}?stream=${stream}&lines=${lines}`),

  /** Reads what was appended after `offset`, or a fresh tail if the file was rotated. */
  getUpdates: (pmId: number, stream: Pm2StreamName, offset: number, lines: number) =>
    apiRequest<Pm2LogChunk>(`Pm2/logs/${pmId}/updates?stream=${stream}&offset=${offset}&lines=${lines}`),

  /**
   * Builds the same-origin URL that streams the whole log file to the browser. It goes
   * through `/api/pm2/download` rather than the JSON proxy so a large file is piped
   * straight to disk instead of being buffered and wrapped as JSON.
   */
  downloadUrl: (pmId: number, stream: Pm2StreamName): string => {
    const params = new URLSearchParams({ pmId: pmId.toString(), stream });
    const instance = get(currentInstance);
    if (instance) params.set("port", instance.port.toString());
    return `/api/pm2/download?${params.toString()}`;
  },
};
