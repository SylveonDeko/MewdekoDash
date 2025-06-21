// src/lib/logger.ts
import { browser } from "$app/environment";

export class Logger {
  private static instance: Logger;
  private debugMode: boolean = false;

  private constructor() {
    // Only check hostname in browser environment
    if (browser) {
      this.debugMode = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  public debug(...args: unknown[]): void {
    if (this.debugMode) {
      const timestamp = this.getTimestamp();
      console.debug(`[${timestamp}] [DEBUG]`, ...args);
    }
  }

  public info(...args: unknown[]): void {
    const timestamp = this.getTimestamp();
    console.info(`[${timestamp}] [INFO]`, ...args);
  }

  public warn(...args: unknown[]): void {
    const timestamp = this.getTimestamp();
    console.warn(`[${timestamp}] [WARN]`, ...args);
  }

  public error(...args: unknown[]): void {
    const timestamp = this.getTimestamp();
    console.error(`[${timestamp}] [ERROR]`, ...args);
  }
}

// Export a default logger instance
export const logger = Logger.getInstance();