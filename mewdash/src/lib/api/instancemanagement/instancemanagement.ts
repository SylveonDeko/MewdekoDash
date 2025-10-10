// lib/api/instancemanagement/instancemanagement.ts
import { apiRequest } from "../core";
import type { BotInstance } from "./models";

/**
 * Instance management API
 * Maps to Mewdeko.Controllers.InstanceManagementController
 */
export const instanceManagementApi = {
  /**
   * Gets all active bot instances
   * @returns List of active bot instances
   */
  getBotInstances: () => apiRequest<BotInstance[]>("InstanceManagement"),

  /**
   * Adds a new bot instance
   * @param port The port number the instance is running on
   * @returns Status of the added instance
   */
  addInstance: (port: number) =>
    apiRequest<string>(`InstanceManagement/${port}`, "POST"),

  /**
   * Removes a bot instance
   * @param port The port number of the instance to remove
   */
  removeInstance: (port: number) =>
    apiRequest<void>(`InstanceManagement/${port}`, "DELETE"),
};
