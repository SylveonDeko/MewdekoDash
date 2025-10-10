// lib/api/systeminfo/models/SystemInfo.ts

/**
 * System information response
 */
export interface SystemInfo {
  /** CPU usage percentage */
  cpuUsage: number;

  /** Memory usage in MB */
  memoryUsageMb: number;

  /** Total system memory in MB */
  totalMemoryMb: number;

  /** Uptime as formatted string */
  uptime: string;

  /** Process start time */
  processStartTime: string;

  /** Thread count */
  threadCount: number;

  /** Top CPU-intensive methods */
  topMethods: Array<{
    name: string;
    avgTime: number;
  }>;
}
