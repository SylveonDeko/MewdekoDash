// lib/api/performance/models/PerformanceMetrics.ts

/**
 * Method performance data
 */
export interface MethodPerformance {
  /** Method name */
  methodName: string;

  /** Call count */
  callCount: number;

  /** Total execution time in milliseconds */
  totalTime: number;

  /** Average execution time */
  avgExecutionTime: number;

  /** Last execution timestamp */
  lastExecuted: string;
}

/**
 * Event performance metrics
 */
export interface EventMetrics {
  /** Event type */
  eventType: string;

  /** Total events processed */
  totalProcessed: number;

  /** Total errors */
  totalErrors: number;

  /** Total execution time */
  totalExecutionTime: number;

  /** Average execution time */
  averageExecutionTime: number;

  /** Error rate */
  errorRate: number;
}

/**
 * Module performance metrics
 */
export interface ModuleMetrics {
  /** Module name */
  moduleName: string;

  /** Events processed */
  eventsProcessed: number;

  /** Total errors */
  errors: number;

  /** Total execution time */
  totalExecutionTime: number;

  /** Average execution time */
  averageExecutionTime: number;

  /** Error rate */
  errorRate: number;
}

/**
 * Performance overview
 */
export interface PerformanceOverview {
  summary: {
    totalEvents: number;
    totalEventErrors: number;
    totalModules: number;
    activeEventTypes: number;
  };
  topMethods: Array<{
    methodName: string;
    callCount: number;
    avgExecutionTime: number;
  }>;
  topEvents: Array<{
    eventType: string;
    totalProcessed: number;
    averageExecutionTime: number;
    errorRate: number;
  }>;
  topModules: Array<{
    moduleName: string;
    eventsProcessed: number;
    averageExecutionTime: number;
    errorRate: number;
  }>;
}
