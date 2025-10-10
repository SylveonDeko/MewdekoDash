// lib/api/forms/models.ts

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "number"
  | "email"
  | "url";

export type ConditionalOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than";

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
  | "RolesPreassigned";

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
  expiresAt?: string;
  requiredRoleId?: bigint;
  successMessage?: string;
  formType: number; // 0=Regular, 1=BanAppeal, 2=JoinApplication
  allowExternalUsers: boolean;
  autoApproveRoleIds?: string;
  inviteMaxUses?: number;
  inviteMaxAge?: number;
  notificationWebhookUrl?: string;
  createdBy: bigint;
  createdAt: string;
  updatedAt: string;
  responseCount?: number;
  pendingCount?: number;
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
  conditionalParentQuestionId?: number;
  conditionalOperator?: ConditionalOperator;
  conditionalExpectedValue?: string;
  createdAt: string;
  options?: FormQuestionOption[];
}

export interface FormQuestionOption {
  id: number;
  questionId: number;
  optionText: string;
  optionValue: string;
  displayOrder: number;
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
}

export interface FormAnswer {
  id: number;
  responseId: number;
  questionId: number;
  answerText?: string;
  answerValues?: string[];
  createdAt: string;
  question?: FormQuestion;
}

export interface FormSubmissionRequest {
  userId: bigint;
  username: string;
  turnstileToken?: string;
  answers: Record<number, string | string[]>;
  ipAddress?: string;
}

export interface FormSubmissionResponse {
  message: string;
  responseId: number;
  statusCheckToken: string;
  statusCheckUrl: string;
}

export interface PaginatedResponses {
  responses: FormResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FormResponseWorkflow {
  id: number;
  responseId: number;
  status: number; // 0=Pending, 1=UnderReview, 2=Approved, 3=Rejected
  reviewedBy?: bigint;
  reviewedAt?: string;
  reviewNotes?: string;
  actionTaken: number; // 0=None, 1=Unbanned, 2=InviteSent, 3=RolesPreassigned
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
  status: string;
  reviewedAt?: string;
  reviewNotes?: string;
  inviteCode?: string;
  inviteExpiresAt?: string;
  actionTaken: string;
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
];

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
