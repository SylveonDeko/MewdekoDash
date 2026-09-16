// lib/api/pm2/models.ts

/** Where the bot got its process list from, mirrored from Pm2ListSource. */
export const Pm2ListSource = {
  None: 0,
  Daemon: 1,
  LogDirectory: 2,
} as const;
export type Pm2ListSource = (typeof Pm2ListSource)[keyof typeof Pm2ListSource];

/** Which of a process's two log files a chunk came from, mirrored from Pm2LogStream. */
export const Pm2LogStream = {
  Out: 0,
  Error: 1,
} as const;
export type Pm2LogStream = (typeof Pm2LogStream)[keyof typeof Pm2LogStream];

/** The query string spelling of a stream. */
export type Pm2StreamName = "out" | "error";

/** One process pm2 manages on the bot's host. */
export interface Pm2ProcessInfo {
  /** pm2's id, negative for entries reconstructed from the log directory. */
  pmId: number;
  name: string;
  /** online, stopped, errored, launching, or unknown. */
  status: string;
  pid?: number;
  /** Percent of one core in use when the list was fetched. */
  cpu?: number;
  memoryBytes?: number;
  restarts: number;
  /** ISO timestamp of when the current incarnation started. */
  startedAt?: string;
  execMode?: string;
  script?: string;
  outLogPath?: string;
  errorLogPath?: string;
  outLogBytes?: number;
  errorLogBytes?: number;
  /** Whether this is the bot instance answering the request. */
  isSelf: boolean;
}

/** The process list along with how it was obtained. */
export interface Pm2ProcessList {
  source: Pm2ListSource;
  message?: string;
  processes: Pm2ProcessInfo[];
}

/** A run of complete log lines plus the byte offsets needed to continue from it. */
export interface Pm2LogChunk {
  stream: Pm2LogStream;
  path: string;
  fileSize: number;
  /** Byte offset of the first returned line. */
  start: number;
  /** Byte offset just past the last returned line; pass it back to receive only what was appended since. */
  end: number;
  /** Oldest first, terminators stripped, ANSI colour codes left in place. */
  lines: string[];
  /** More data existed than the byte cap allowed, so earlier lines were skipped. */
  truncated: boolean;
  /** The file shrank since the caller's offset, so this is a fresh tail rather than a continuation. */
  rotated: boolean;
}
