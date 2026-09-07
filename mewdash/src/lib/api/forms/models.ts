// lib/api/forms/models.ts

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
    label: "Short Text",
    icon: "fa-text",
    description: "Single line text input",
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: "long_text",
    label: "Long Text",
    icon: "fa-align-left",
    description: "Multi-line text area",
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    icon: "fa-circle-dot",
    description: "Single selection from options",
    supportsOptions: true,
    supportsValidation: false,
  },
  {
    type: "checkboxes",
    label: "Checkboxes",
    icon: "fa-square-check",
    description: "Multiple selections",
    supportsOptions: true,
    supportsValidation: true,
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: "fa-caret-down",
    description: "Single selection from dropdown",
    supportsOptions: true,
    supportsValidation: false,
  },
  {
    type: "number",
    label: "Number",
    icon: "fa-hashtag",
    description: "Numeric input",
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: "email",
    label: "Email",
    icon: "fa-envelope",
    description: "Email address",
    supportsOptions: false,
    supportsValidation: false,
  },
  {
    type: "url",
    label: "URL",
    icon: "fa-link",
    description: "Website URL",
    supportsOptions: false,
    supportsValidation: false,
  },
  {
    type: "section_break",
    label: "Section Break",
    icon: "fa-grip-lines",
    description: "Splits the form into pages, answering nothing itself",
    supportsOptions: false,
    supportsValidation: false,
  },
];

/** Question types that take no answer and exist only to lay the form out. */
export function isPresentational(type: QuestionType | undefined): boolean {
  return type === "section_break";
}

/** One page of a form: the section break heading it, and the questions on it. */
export interface FormPage {
  /** The section break heading this page, or null for a first page that has none. */
  heading: FormQuestion | null;
  /** Index of that heading in the flat question list, or -1 when there is none. */
  headingIndex: number;
  /** The questions on this page, in order. */
  questions: FormQuestion[];
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
export function paginateQuestions(questions: FormQuestion[]): FormPage[] {
  const pages: FormPage[] = [];

  let current: FormPage = { heading: null, headingIndex: -1, questions: [], questionIndices: [] };

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
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Does not equal" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater than" },
  { value: "less_than", label: "Less than" },
];

export const ROLE_ACTION_TYPES: Array<{
  value: number;
  label: string;
  description: string;
}> = [
  { value: 0, label: "None", description: "No role action" },
  { value: 1, label: "Add Roles", description: "Add roles to user" },
  { value: 2, label: "Remove Roles", description: "Remove roles from user" },
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
    label: "Answer-Based",
    icon: "fa-question-circle",
    description: "Show based on previous answers",
    requiresDiscord: false,
  },
  {
    value: 1,
    type: "DiscordRole",
    label: "Role-Based",
    icon: "fa-crown",
    description: "Show based on user's roles",
    requiresDiscord: true,
  },
  {
    value: 2,
    type: "ServerTenure",
    label: "Server Tenure",
    icon: "fa-calendar-days",
    description: "Show based on time in server",
    requiresDiscord: true,
  },
  {
    value: 3,
    type: "BoostStatus",
    label: "Boost/Nitro",
    icon: "fa-gem",
    description: "Show based on boost/Nitro status",
    requiresDiscord: true,
  },
  {
    value: 4,
    type: "Permission",
    label: "Permission-Based",
    icon: "fa-shield-halved",
    description: "Show based on user permissions",
    requiresDiscord: true,
  },
  {
    value: 5,
    type: "MultipleConditions",
    label: "Multiple Conditions",
    icon: "fa-code-branch",
    description: "Combine multiple conditions with AND/OR",
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
    label: "Any Of",
    description: "User has at least one of these roles",
  },
  { value: "all", label: "All Of", description: "User has all of these roles" },
  {
    value: "none",
    label: "None Of",
    description: "User has none of these roles",
  },
];

export const COMMON_PERMISSIONS: Array<{
  value: number;
  label: string;
  flag: string;
}> = [
  { value: 0x0000000008, label: "Administrator", flag: "Administrator" },
  { value: 0x0000000010, label: "Manage Channels", flag: "ManageChannels" },
  { value: 0x0000000020, label: "Manage Guild", flag: "ManageGuild" },
  { value: 0x0000002000, label: "Manage Messages", flag: "ManageMessages" },
  { value: 0x0000004000, label: "Manage Nicknames", flag: "ManageNicknames" },
  { value: 0x0000010000, label: "Manage Roles", flag: "ManageRoles" },
  { value: 0x0000020000, label: "Manage Webhooks", flag: "ManageWebhooks" },
  { value: 0x0000000004, label: "Ban Members", flag: "BanMembers" },
  { value: 0x0000000002, label: "Kick Members", flag: "KickMembers" },
  { value: 0x0010000000, label: "Moderate Members", flag: "ModerateMembers" },
  { value: 0x0000000400, label: "View Audit Log", flag: "ViewAuditLog" },
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
    label: "Regular Form",
    icon: "fa-clipboard-list",
    description: "Standard form for guild members",
    requiresWorkflow: false,
    allowsExternalUsers: false,
  },
  {
    type: "BanAppeal",
    label: "Ban Appeal",
    icon: "fa-gavel",
    description: "Allow banned users to appeal",
    requiresWorkflow: true,
    allowsExternalUsers: true,
  },
  {
    type: "JoinApplication",
    label: "Join Application",
    icon: "fa-user-plus",
    description: "External users apply to join",
    requiresWorkflow: true,
    allowsExternalUsers: true,
  },
];

export const RESPONSE_STATUS_LABELS: Record<
  ResponseStatus,
  { label: string; color: string; icon: string }
> = {
  Pending: { label: "Pending Review", color: "#f59e0b", icon: "fa-clock" },
  UnderReview: { label: "Under Review", color: "#3b82f6", icon: "fa-search" },
  Approved: { label: "Approved", color: "#10B981", icon: "fa-check-circle" },
  Rejected: { label: "Rejected", color: "#ef4444", icon: "fa-times-circle" },
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
