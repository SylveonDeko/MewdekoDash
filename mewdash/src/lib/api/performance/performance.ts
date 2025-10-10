// lib/api/performance/performance.ts
import { apiRequest } from "../core";
import type {
  MethodPerformance,
  EventMetrics,
  ModuleMetrics,
  PerformanceOverview,
} from "./models";

/**
 * Performance monitoring API (Owner only)
 * Maps to Mewdeko.Controllers.PerformanceController
 */
export const performanceApi = {
  /**
   * Gets performance data for tracked methods
   * @param userId The Discord user ID (must be bot owner)
   * @returns Method performance data
   */
  getPerformanceData: (userId: bigint) =>
    apiRequest<MethodPerformance[]>(`Performance/methods?userId=${userId}`),

  /**
   * Gets event metrics
   * @param userId The Discord user ID (must be bot owner)
   * @returns Event metrics data
   */
  getEventMetrics: (userId: bigint) =>
    apiRequest<EventMetrics[]>(`Performance/events?userId=${userId}`),

  /**
   * Gets module metrics
   * @param userId The Discord user ID (must be bot owner)
   * @returns Module metrics data
   */
  getModuleMetrics: (userId: bigint) =>
    apiRequest<ModuleMetrics[]>(`Performance/modules?userId=${userId}`),

  /**
   * Gets comprehensive performance overview
   * @param userId The Discord user ID (must be bot owner)
   * @returns Performance overview
   */
  getPerformanceOverview: (userId: bigint) =>
    apiRequest<PerformanceOverview>(`Performance/overview?userId=${userId}`),

  /**
   * Gets metrics for a specific event type
   * @param eventType The event type to get metrics for
   * @param userId The Discord user ID (must be bot owner)
   * @returns Event metrics
   */
  getEventMetric: (eventType: string, userId: bigint) =>
    apiRequest<EventMetrics>(
      `Performance/events/${eventType}?userId=${userId}`,
    ),

  /**
   * Gets metrics for a specific module
   * @param moduleName The module name to get metrics for
   * @param userId The Discord user ID (must be bot owner)
   * @returns Module metrics
   */
  getModuleMetric: (moduleName: string, userId: bigint) =>
    apiRequest<ModuleMetrics>(
      `Performance/modules/${moduleName}?userId=${userId}`,
    ),

  /**
   * Clears all performance monitoring data
   * @param userId The Discord user ID (must be bot owner)
   */
  clearPerformanceData: (userId: bigint) =>
    apiRequest<{ message: string }>(
      `Performance/clear?userId=${userId}`,
      "POST",
    ),
};
