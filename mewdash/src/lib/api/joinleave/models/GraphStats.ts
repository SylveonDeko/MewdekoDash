// lib/api/joinleave/models/GraphStats.ts

/**
 * Daily statistic data point
 */
export interface DailyStat {
  /** Date */
  date: string;

  /** Count for that day */
  count: number;
}

/**
 * Graph summary statistics
 */
export interface GraphSummary {
  /** Total count */
  total: number;

  /** Average count */
  average: number;

  /** Peak date */
  peakDate: string;

  /** Peak count */
  peakCount: number;
}

/**
 * Graph statistics response
 * Maps to Mewdeko.Controllers.Common.JoinLeave.GraphStatsResponse
 */
export interface GraphStatsResponse {
  /** Daily statistics data points */
  dailyStats: DailyStat[];

  /** Summary statistics */
  summary: GraphSummary;
}

/**
 * Graph with image data
 */
export interface GraphImageResponse {
  /** Base64 encoded image data */
  imageData: string;

  /** Embed data */
  embed: any;
}
