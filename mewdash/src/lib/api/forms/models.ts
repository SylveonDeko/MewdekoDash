// lib/api/forms/models.ts
import {
  conditionalOperatorLabel,
  conditionalTypeDescription,
  conditionalTypeLabel,
  formTypeDescription,
  formTypeLabel,
  permissionLabel,
  questionTypeDescription,
  questionTypeLabel,
  responseStatusLabel,
  roleActionDescription,
  roleActionLabel,
  roleLogicDescription,
  roleLogicLabel
} from "$lib/components/forms/formLabels";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "number"
  | "email"
  | "url"
  | "section_break";

export type ConditionalOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than";

export type ConditionalType =
  | "QuestionBased"
  | "DiscordRole"
  | "ServerTenure"
  | "BoostStatus"
  | "Permission"
  | "MultipleConditions";

export type RoleLogicType = "any" | "all" | "none";

export type ConditionLogicType = "AND" | "OR";

export type FormType = "Regular" | "BanAppeal" | "JoinApplication";

export type ResponseStatus =
  | "Pending"
  | "UnderReview"
  | "Approved"
  | "Rejected";

export type WorkflowAction =
  | "None"
  | "Unbanned"
  | "InviteSent"
  | "RolesPreassigned"
  | "RolesAssigned"
  | "RolesRemoved";

export type RoleActionType = "None" | "AddRoles" | "RemoveRoles";

export interface Form {
  id: number;
  guildId: bigint;
  name: string;
  description?: string;
  submitChannelId?: bigint;
  allowMultipleSubmissions: boolean;
  maxResponses?: number;
  requireCaptcha: boolean;
  isActive: boolean;
  isDraft: boolean;
  allowAnonymous: boolean;
  expiresAt?: string | null;
  requiredRoleId?: bigint;
  successMessage?: string;
  formType: number; // 0=Regular, 1=BanAppeal, 2=JoinApplication
  allowExternalUsers: boolean;
  autoApproveRoleIds?: string;
  inviteMaxUses?: number;
  inviteMaxAge?: number;
  notificationWebhookUrl?: string;
  requireApproval: boolean;
  approvalActionType: number; // 0=None, 1=AddRoles, 2=RemoveRoles
  approvalRoleIds?: string;
  rejectionActionType: number; // 0=None, 1=AddRoles, 2=RemoveRoles
  rejectionRoleIds?: string;

  /** When the form starts accepting responses. Null means as soon as it is published. */
  opensAt?: string | null;
  /** Channel the launch announcement is posted to once opensAt passes. */
  announceChannelId?: bigint | null;
  /** Role pinged by the launch announcement. */
  announceRoleId?: bigint | null;
  /** Body of the launch announcement. */
  announceMessage?: string | null;
  /** Stamped once the launch announcement has gone out. */
  announcedAt?: string | null;

  /** Role pinged when a response arrives in the submit channel. */
  notifyRoleId?: bigint | null;
  /** Comma separated roles granted the moment a response is submitted. */
  submitRoleIds?: string;
  /** Role held while a response awaits review, removed on decision. */
  pendingRoleId?: bigint | null;
  /** Role permitted to decide this form's responses from Discord. Null requires Manage Server. */
  reviewerRoleId?: bigint | null;

  /** Emote on this form's approve button. Null falls back to the guild default. */
  approveEmote?: string | null;
  /** Emote on this form's reject button. Null falls back to the guild default. */
  rejectEmote?: string | null;

  /** Minimum age of the submitter's Discord account, in days. */
  minAccountAgeDays?: number | null;
  /** Lets a rejected submitter try again without opening the form to unlimited submissions. */
  allowResubmitAfterRejection: boolean;

  /** Whether a single rejection ends a submitter's ability to appeal. */
  blockReappealAfterRejection: boolean;
  /** How many rejected appeals a submitter may accumulate before being locked out. */
  maxAppealAttempts?: number | null;
  /** Days a submitter must wait after a rejection before appealing again. */
  reappealCooldownDays?: number | null;
  /** Days after the ban before a first appeal may be filed. */
  appealDelayDays?: number | null;

  /** Comma separated roles added on approval, applied alongside the removals. */
  approvalAddRoleIds?: string;
  /** Comma separated roles removed on approval. */
  approvalRemoveRoleIds?: string;
  /** Comma separated roles added on rejection. */
  rejectionAddRoleIds?: string;
  /** Comma separated roles removed on rejection. */
  rejectionRemoveRoleIds?: string;

  createdBy: bigint;
  createdAt: string;
  updatedAt: string;
  responseCount?: number;
  pendingCount?: number;
  /** How many questions the form asks, shown on its card. */
  questionCount?: number;
}

export interface FormQuestion {
  id: number;
  formId: number;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  displayOrder: number;
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;

  // Legacy question-based conditionals
  conditionalParentQuestionId?: number;
  conditionalOperator?: ConditionalOperator;
  conditionalExpectedValue?: string;

  // Advanced conditional logic
  conditionalType: number; // 0=QuestionBased, 1=DiscordRole, 2=ServerTenure, 3=BoostStatus, 4=Permission, 5=MultipleConditions

  // Discord role-based conditionals
  conditionalRoleIds?: string;
  conditionalRoleLogic?: RoleLogicType;

  // Server tenure conditionals
  conditionalDaysInServer?: number;
  conditionalAccountAgeDays?: number;

  // Boost/Premium conditionals
  conditionalRequiresBoost?: boolean;
  conditionalRequiresNitro?: boolean;

  // Permission-based conditionals
  conditionalPermissionFlags?: number;

  // Conditional required
  requiredWhenParentQuestionId?: number;
  requiredWhenOperator?: ConditionalOperator;
  requiredWhenValue?: string;

  // Answer piping
  enableAnswerPiping: boolean;

  /** Image shown above the question, used to illustrate what is being asked. */
  imageUrl?: string | null;

  createdAt: string;
  options?: FormQuestionOption[];
  conditions?: FormQuestionCondition[];
}

export interface FormQuestionOption {
  id: number;
  questionId: number;
  optionText: string;
  optionValue: string;
  displayOrder: number;
}

export interface FormQuestionCondition {
  id: number;
  questionId: number;
  conditionGroup: number;
  conditionType: number; // 0=Question, 1=Role, 2=Tenure, 3=Boost, 4=Permission
  targetQuestionId?: number;
  targetRoleIds?: string;
  operator?: ConditionalOperator;
  expectedValue?: string;
  daysThreshold?: number;
  requiresBoost?: boolean;
  requiresNitro?: boolean;
  permissionFlags?: number;
  logicType: ConditionLogicType;
  createdAt: string;
}

export interface FormResponse {
  id: number;
  formId: number;
  userId: bigint;
  username?: string;
  submittedAt: string;
  ipAddress?: string;
  messageId?: bigint;
  answers?: FormAnswer[];

  /** When the submitter last changed their answers, or null when they never have. */
  editedAt?: string | null;
  /** The form version this response was submitted against. */
  formVersionId?: number | null;
}

export interface FormAnswer {
  id: number;
  responseId: number;
  questionId: number;
  answerText?: string;
  answerValues?: string[];

  /** The question as it was worded when the answer was given, so old responses stay readable. */
  questionText?: string | null;
  /** The kind of input the question presented at the time. */
  questionType?: QuestionType | null;
  /** The answer rendered for reading, with option values resolved to their labels. */
  answerDisplay?: string | null;
  /** The form version this answer was given against. */
  formVersionId?: number | null;

  createdAt: string;
  question?: FormQuestion;
}

/** A whole form as sent to the save endpoint. */
export interface FormSaveRequest {
  form: Partial<Form>;
  questions: FormQuestionSaveRequest[];
  /** Who is saving, recorded against the version this creates. */
  userId?: bigint;
}

/** One question within a whole-form save, with everything hanging off it. */
export interface FormQuestionSaveRequest {
  /**
   * The question. An id of 0 creates a new one; anything else updates in place, which keeps
   * conditions, answer piping and stored responses pointing at the right question.
   */
  question: Partial<FormQuestion>;
  options: Partial<FormQuestionOption>[];
  conditions: Partial<FormQuestionCondition>[];
}

export interface FormSubmissionRequest {
  userId: bigint;
  username: string;
  turnstileToken?: string;
  answers: Record<number, string | string[]>;
  ipAddress?: string;
  premiumType?: number; // 0=None, 1=NitroClassic, 2=Nitro, 3=NitroBasic
}

export interface FormSubmissionResponse {
  message: string;
  responseId: number;
  statusCheckToken: string;
  statusCheckUrl: string;
}

export interface PaginatedResponses {
  responses: QueuedResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** How many responses sit in each review state, ignoring the current filter. */
  statusCounts: Partial<Record<ResponseStatus, number>>;
}

/** One response as it appears in the review queue, with its review state and answers attached. */
export interface QueuedResponse {
  response: FormResponse;
  workflow: FormResponseWorkflow | null;
  answers: FormAnswer[];
  /** How many times the submitter has edited it. */
  revisionCount: number;
}

export interface FormResponseWorkflow {
  id: number;
  responseId: number;
  status: number; // 0=Pending, 1=UnderReview, 2=Approved, 3=Rejected
  reviewedBy?: bigint;
  reviewedAt?: string;
  reviewNotes?: string;
  actionTaken: number; // 0=None, 1=Unbanned, 2=InviteSent, 3=RolesPreassigned, 4=RolesAssigned, 5=RolesRemoved

  /**
   * Whether the decision could not be delivered to the submitter by direct message, so a reviewer
   * can see that the person was never told.
   */
  dmFailed?: boolean;

  inviteCode?: string;
  inviteExpiresAt?: string;
  statusCheckToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseWithWorkflow {
  response: FormResponse;
  workflow: FormResponseWorkflow;
}

export interface EligibilityCheckRequest {
  userId: bigint;
}

export interface EligibilityCheckResponse {
  isEligible: boolean;
  reason?: string;
  /**
   * When a temporary refusal lifts, so the page can count down to it rather than leaving the
   * reader to guess. Null when the refusal is permanent.
   */
  retryAt?: string | null;
}

/**
 * The emotes on the approve and reject buttons. A form may override either; null at both levels
 * falls back to a plain tick and cross.
 */
export interface FormReviewEmotes {
  approveEmote?: string | null;
  rejectEmote?: string | null;
}

/** A form's saved history, and the cap on how much of it is kept. */
export interface FormVersionList {
  /** How many versions are retained before the oldest are dropped. */
  versionsKept: number;
  versions: FormVersion[];
}

/** A saved snapshot of a form, taken every time it is saved. */
export interface FormVersion {
  id: number;
  versionNumber: number;
  questionCount: number;
  createdBy?: bigint | null;
  createdAt: string;
}

/** One difference between a saved version of a form and the version before it. */
export interface FormVersionChange {
  kind: "Added" | "Changed" | "Removed";
  section: string;
  label: string;
  before?: string | null;
  after?: string | null;
}

/** A submitter's partly filled copy of a form. */
export interface FormDraft {
  hasDraft: boolean;
  answers?: Record<string, string | string[]>;
  page?: number;
  updatedAt?: string;
}

/** One of a person's submissions, as it appears on the page listing everything they have sent. */
export interface UserSubmission {
  responseId: number;
  formId: number;
  formName: string;
  guildId: bigint;
  guildName?: string | null;
  guildIconUrl?: string | null;
  status: ResponseStatus;
  submittedAt: string;
  editedAt?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  statusToken?: string | null;
  canEdit: boolean;
}

/** An earlier version of a response's answers, kept when the submitter edits it. */
export interface FormResponseRevision {
  id: number;
  editedBy?: bigint | null;
  createdAt: string;
  answers: Array<{
    questionId: number;
    questionText?: string | null;
    questionType?: QuestionType | null;
    answerText?: string | null;
    answerValues?: string[] | null;
    answerDisplay?: string | null;
  }>;
}

/** Per-question validation errors returned when a submission is refused. */
export interface FormValidationErrorResponse {
  message: string;
  errors: Record<string, string>;
}

export interface ApprovalRequest {
  reviewerId: bigint;
  notes?: string;
}

export interface ApprovalResponse {
  message: string;
  inviteCode?: string;
}

export interface RejectionRequest {
  reviewerId: bigint;
  notes: string;
}

export interface ResponseStatusResponse {
  status: ResponseStatus;
  reviewedAt?: string;
  reviewNotes?: string;
  inviteCode?: string;
  inviteExpiresAt?: string;
  actionTaken: string;

  /** Whether the decision could not be delivered to the submitter by direct message. */
  dmFailed?: boolean;

  responseId?: number;
  formId?: number;
  formName?: string | null;
  /** The form's public share code, so the submitter can be pointed back at the form itself. */
  shareCode?: string | null;

  /** The server the response was sent to, so a bare status link still has context. */
  guildId?: bigint | null;
  guildName?: string | null;
  guildIconUrl?: string | null;
  submittedAt?: string;
  editedAt?: string | null;

  /** Whether the submitter may still correct their answers. */
  canEdit?: boolean;
  /** Why they may not, when they may not. */
  editReason?: string | null;
}

export interface QuestionTypeMetadata {
  type: QuestionType;
  label: string;
  icon: string;
  description: string;
  supportsOptions: boolean;
  supportsValidation: boolean;
}

export const QUESTION_TYPES: QuestionTypeMetadata[] = [
  {
    type: "short_text",
    get label() { return questionTypeLabel("short_text"); },
    icon: "fa-text",
    get description() { return questionTypeDescription("short_text"); },
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: "long_text",
    get label() { return questionTypeLabel("long_text"); },
    icon: "fa-align-left",
    get description() { return questionTypeDescription("long_text"); },
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: "multiple_choice",
    get label() { return questionTypeLabel("multiple_choice"); },
    icon: "fa-circle-dot",
    get description() { return questionTypeDescription("multiple_choice"); },
    supportsOptions: true,
    supportsValidation: false,
  },
  {
    type: "checkboxes",
    get label() { return questionTypeLabel("checkboxes"); },
    icon: "fa-square-check",
    get description() { return questionTypeDescription("checkboxes"); },
    supportsOptions: true,
    supportsValidation: true,
  },
  {
    type: "dropdown",
    get label() { return questionTypeLabel("dropdown"); },
    icon: "fa-caret-down",
    get description() { return questionTypeDescription("dropdown"); },
    supportsOptions: true,
    supportsValidation: false,
  },
  {
    type: "number",
    get label() { return questionTypeLabel("number"); },
    icon: "fa-hashtag",
    get description() { return questionTypeDescription("number"); },
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: "email",
    get label() { return questionTypeLabel("email"); },
    icon: "fa-envelope",
    get description() { return questionTypeDescription("email"); },
    supportsOptions: false,
    supportsValidation: false,
  },
  {
    type: "url",
    get label() { return questionTypeLabel("url"); },
    icon: "fa-link",
    get description() { return questionTypeDescription("url"); },
    supportsOptions: false,
    supportsValidation: false,
  },
  {
    type: "section_break",
    get label() { return questionTypeLabel("section_break"); },
    icon: "fa-grip-lines",
    get description() { return questionTypeDescription("section_break"); },
    supportsOptions: false,
    supportsValidation: false,
  },
];

/** Question types that take no answer and exist only to lay the form out. */
export function isPresentational(type: QuestionType | undefined): boolean {
  return type === "section_break";
}

/** The least a value needs to be placed on a page. */
export interface PageableQuestion {
  questionType?: QuestionType;
  questionText?: string;
  placeholder?: string;
  displayOrder?: number;
}

/**
 * One page of a form: the section break heading it, and the questions on it.
 *
 * Generic over the question type because the create builder works with partially filled questions
 * that have no identifier yet, while the edit builder works with saved ones.
 */
export interface FormPage<T extends PageableQuestion = FormQuestion> {
  /** The section break heading this page, or null for a first page that has none. */
  heading: T | null;
  /** Index of that heading in the flat question list, or -1 when there is none. */
  headingIndex: number;
  /** The questions on this page, in order. */
  questions: T[];
  /** Indices of those questions in the flat question list. */
  questionIndices: number[];
}

/**
 * Splits questions into the pages a submitter fills in one at a time.
 *
 * A page is stored as the section break that heads it followed by its questions, which is the flat
 * list the API and the stored form both use. This is the one place that shape is interpreted, so
 * the builder and the public form cannot disagree about where a page begins. The break itself is
 * never returned among the questions, because it asks nothing.
 */
export function paginateQuestions<T extends PageableQuestion>(questions: T[]): FormPage<T>[] {
  const pages: FormPage<T>[] = [];

  let current: FormPage<T> = { heading: null, headingIndex: -1, questions: [], questionIndices: [] };

  questions.forEach((question, index) => {
    if (question.questionType === "section_break") {
      // A break at the very top heads the first page rather than creating an empty one above it.
      if (current.questions.length > 0 || current.heading) pages.push(current);
      current = { heading: question, headingIndex: index, questions: [], questionIndices: [] };
      return;
    }

    current.questions.push(question);
    current.questionIndices.push(index);
  });

  pages.push(current);

  return pages;
}

export const CONDITIONAL_OPERATORS: Array<{
  value: ConditionalOperator;
  label: string;
}> = [
  { value: "equals", get label() { return conditionalOperatorLabel("equals"); } },
  { value: "not_equals", get label() { return conditionalOperatorLabel("not_equals"); } },
  { value: "contains", get label() { return conditionalOperatorLabel("contains"); } },
  { value: "greater_than", get label() { return conditionalOperatorLabel("greater_than"); } },
  { value: "less_than", get label() { return conditionalOperatorLabel("less_than"); } },
];

export const ROLE_ACTION_TYPES: Array<{
  value: number;
  label: string;
  description: string;
}> = [
  { value: 0, get label() { return roleActionLabel("0"); }, get description() { return roleActionDescription("0"); } },
  { value: 1, get label() { return roleActionLabel("1"); }, get description() { return roleActionDescription("1"); } },
  { value: 2, get label() { return roleActionLabel("2"); }, get description() { return roleActionDescription("2"); } },
];

export const CONDITIONAL_TYPES: Array<{
  value: number;
  type: ConditionalType;
  label: string;
  icon: string;
  description: string;
  requiresDiscord: boolean;
}> = [
  {
    value: 0,
    type: "QuestionBased",
    get label() { return conditionalTypeLabel("0"); },
    icon: "fa-question-circle",
    get description() { return conditionalTypeDescription("0"); },
    requiresDiscord: false,
  },
  {
    value: 1,
    type: "DiscordRole",
    get label() { return conditionalTypeLabel("1"); },
    icon: "fa-crown",
    get description() { return conditionalTypeDescription("1"); },
    requiresDiscord: true,
  },
  {
    value: 2,
    type: "ServerTenure",
    get label() { return conditionalTypeLabel("2"); },
    icon: "fa-calendar-days",
    get description() { return conditionalTypeDescription("2"); },
    requiresDiscord: true,
  },
  {
    value: 3,
    type: "BoostStatus",
    get label() { return conditionalTypeLabel("3"); },
    icon: "fa-gem",
    get description() { return conditionalTypeDescription("3"); },
    requiresDiscord: true,
  },
  {
    value: 4,
    type: "Permission",
    get label() { return conditionalTypeLabel("4"); },
    icon: "fa-shield-halved",
    get description() { return conditionalTypeDescription("4"); },
    requiresDiscord: true,
  },
  {
    value: 5,
    type: "MultipleConditions",
    get label() { return conditionalTypeLabel("5"); },
    icon: "fa-code-branch",
    get description() { return conditionalTypeDescription("5"); },
    requiresDiscord: false,
  },
];

export const ROLE_LOGIC_TYPES: Array<{
  value: RoleLogicType;
  label: string;
  description: string;
}> = [
  {
    value: "any",
    get label() { return roleLogicLabel("any"); },
    get description() { return roleLogicDescription("any"); },
  },
  { value: "all", get label() { return roleLogicLabel("all"); }, get description() { return roleLogicDescription("all"); } },
  {
    value: "none",
    get label() { return roleLogicLabel("none"); },
    get description() { return roleLogicDescription("none"); },
  },
];

export const COMMON_PERMISSIONS: Array<{
  value: number;
  label: string;
  flag: string;
}> = [
  { value: 0x0000000008, get label() { return permissionLabel("Administrator"); }, flag: "Administrator" },
  { value: 0x0000000010, get label() { return permissionLabel("ManageChannels"); }, flag: "ManageChannels" },
  { value: 0x0000000020, get label() { return permissionLabel("ManageGuild"); }, flag: "ManageGuild" },
  { value: 0x0000002000, get label() { return permissionLabel("ManageMessages"); }, flag: "ManageMessages" },
  { value: 0x0000004000, get label() { return permissionLabel("ManageNicknames"); }, flag: "ManageNicknames" },
  { value: 0x0000010000, get label() { return permissionLabel("ManageRoles"); }, flag: "ManageRoles" },
  { value: 0x0000020000, get label() { return permissionLabel("ManageWebhooks"); }, flag: "ManageWebhooks" },
  { value: 0x0000000004, get label() { return permissionLabel("BanMembers"); }, flag: "BanMembers" },
  { value: 0x0000000002, get label() { return permissionLabel("KickMembers"); }, flag: "KickMembers" },
  { value: 0x0010000000, get label() { return permissionLabel("ModerateMembers"); }, flag: "ModerateMembers" },
  { value: 0x0000000400, get label() { return permissionLabel("ViewAuditLog"); }, flag: "ViewAuditLog" },
];

export interface FormTypeMetadata {
  type: FormType;
  label: string;
  icon: string;
  description: string;
  requiresWorkflow: boolean;
  allowsExternalUsers: boolean;
}

export const FORM_TYPES: FormTypeMetadata[] = [
  {
    type: "Regular",
    get label() { return formTypeLabel("Regular"); },
    icon: "fa-clipboard-list",
    get description() { return formTypeDescription("Regular"); },
    requiresWorkflow: false,
    allowsExternalUsers: false,
  },
  {
    type: "BanAppeal",
    get label() { return formTypeLabel("BanAppeal"); },
    icon: "fa-gavel",
    get description() { return formTypeDescription("BanAppeal"); },
    requiresWorkflow: true,
    allowsExternalUsers: true,
  },
  {
    type: "JoinApplication",
    get label() { return formTypeLabel("JoinApplication"); },
    icon: "fa-user-plus",
    get description() { return formTypeDescription("JoinApplication"); },
    requiresWorkflow: true,
    allowsExternalUsers: true,
  },
];

export const RESPONSE_STATUS_LABELS: Record<
  ResponseStatus,
  { label: string; color: string; icon: string }
> = {
  Pending: { get label() { return responseStatusLabel("Pending"); }, color: "#f59e0b", icon: "fa-clock" },
  UnderReview: { get label() { return responseStatusLabel("UnderReview"); }, color: "#3b82f6", icon: "fa-search" },
  Approved: { get label() { return responseStatusLabel("Approved"); }, color: "#10B981", icon: "fa-check-circle" },
  Rejected: { get label() { return responseStatusLabel("Rejected"); }, color: "#ef4444", icon: "fa-times-circle" },
};

// Helper to convert FormType to integer for backend
export function formTypeToInt(formType: FormType): number {
  switch (formType) {
    case "Regular":
      return 0;
    case "BanAppeal":
      return 1;
    case "JoinApplication":
      return 2;
    default:
      return 0;
  }
}

// Helper to convert integer to FormType
export function intToFormType(value: number): FormType {
  switch (value) {
    case 1:
      return "BanAppeal";
    case 2:
      return "JoinApplication";
    default:
      return "Regular";
  }
}

// Helper to convert integer to ResponseStatus
export function intToResponseStatus(value: number): ResponseStatus {
  switch (value) {
    case 0:
      return "Pending";
    case 1:
      return "UnderReview";
    case 2:
      return "Approved";
    case 3:
      return "Rejected";
    default:
      return "Pending";
  }
}
