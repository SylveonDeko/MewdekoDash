// lib/api/auditlog/models/AuditLog.ts

/**
 * The kind of dashboard activity recorded in an audit log entry.
 */
export enum AuditAction {
  View = 0,
  Create = 1,
  Update = 2,
  Delete = 3,
  Access = 4,
}

/**
 * A single dashboard audit log entry: who did something, what, and when.
 */
export interface AuditLogEntry {
  /** The entry's unique id. */
  id: number;

  /** The Discord user id that performed the action. */
  userId: bigint;

  /** The Discord username at the time of the action. */
  userName: string;

  /** The kind of activity recorded. */
  action: AuditAction;

  /** The dashboard section the action belonged to (for example "moderation"). */
  section: string;

  /** The bot API endpoint that was hit. */
  endpoint: string;

  /** The HTTP method of the request. */
  httpMethod: string;

  /** The before/after change document for mutations, or null for views. */
  changes: AuditChangeSet | null;

  /** The client user agent, when recorded. */
  userAgent: string | null;

  /** When the action occurred (UTC ISO string). */
  dateAdded: string;
}

/**
 * The parsed `changes` document. Either a field-level before/after diff or a
 * bare request body under `after`.
 */
export interface AuditChangeSet {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changed?: string[];
}

/**
 * A page of audit log entries plus the total count for pagination.
 */
export interface AuditLogPage {
  items: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Optional filters for an audit log query.
 */
export interface AuditLogQuery {
  userId?: bigint;
  action?: AuditAction;
  section?: string;
  after?: string;
  before?: string;
  page?: number;
  pageSize?: number;
}
