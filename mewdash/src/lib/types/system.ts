// System information types
export interface SystemInfo {
  cpuUsage: number;
  memoryUsageMb: number;
  totalMemoryMb: number;
  uptime: string;
  processStartTime: string;
  threadCount: number;
  gcCollections: number;
  gcMemoryAllocated: number;
  botVersion: string;
  dotnetVersion: string;
  osVersion: string;
  topMethods: Array<{
    name: string;
    avgTime: number;
    callCount: number;
    totalTime: number;
  }>;
}

export interface SystemMetrics {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  threadCount: number;
  requestsPerSecond: number;
  responseTime: number;
  errorCount: number;
}

export interface PerformanceData {
  methodName: string;
  callCount: number;
  totalTime: number;
  avgExecutionTime: number;
  lastExecuted: string;
  minTime: number;
  maxTime: number;
  errorCount: number;
  errorRate: number;
}

export interface EventMetrics {
  eventType: string;
  totalProcessed: number;
  totalErrors: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  errorRate: number;
  lastProcessed: string;
  recentErrors: Array<{
    message: string;
    timestamp: string;
    stackTrace?: string;
  }>;
}

export interface ModuleMetrics {
  moduleName: string;
  eventsProcessed: number;
  errors: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  errorRate: number;
  commandsExecuted: number;
  commandErrors: number;
  lastActivity: string;
}

export interface DatabaseMetrics {
  connectionCount: number;
  activeConnections: number;
  queryCount: number;
  avgQueryTime: number;
  slowQueries: Array<{
    query: string;
    executionTime: number;
    timestamp: string;
  }>;
  cacheHitRate: number;
  cacheSize: number;
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  cpu: 'healthy' | 'warning' | 'critical';
  memory: 'healthy' | 'warning' | 'critical';
  database: 'healthy' | 'warning' | 'critical';
  network: 'healthy' | 'warning' | 'critical';
  issues: Array<{
    severity: 'warning' | 'critical';
    component: string;
    message: string;
    timestamp: string;
  }>;
}