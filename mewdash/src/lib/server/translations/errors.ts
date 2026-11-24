/** Failures only the translation tool has. The ones the wiki shares are WikiError. */
export type TranslationErrorCode =
  | "blocked"
  | "suggestions_closed"
  | "import_invalid"
  | "import_too_large"
  | "import_too_many"
  | "import_target_mismatch"
  | "bulk_empty"
  | "bulk_too_many"
  | "history_not_restorable";

/** A failure the caller can act on. The endpoint wrapper turns it into a JSON error with the same status. */
export class TranslationError extends Error {
  readonly code: TranslationErrorCode;
  readonly status: number;
  readonly field?: string;

  constructor(code: TranslationErrorCode, status = 400, field?: string) {
    super(code);
    this.code = code;
    this.status = status;
    this.field = field;
  }
}
