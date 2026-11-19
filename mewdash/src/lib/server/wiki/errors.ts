import type { WikiErrorCode } from "$lib/wiki/validation";

/** A failure the caller can act on. Endpoints turn it into a JSON error with the same status. */
export class WikiError extends Error {
  readonly code: WikiErrorCode;
  readonly status: number;
  readonly field?: string;

  constructor(code: WikiErrorCode, status = 400, field?: string) {
    super(code);
    this.code = code;
    this.status = status;
    this.field = field;
  }
}

/** True when a PostgreSQL error is a unique constraint violation. */
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}
