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
  expiresAt?: string;
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
  premiumType?: number; // 0=None, 1=NitroClassic, 2=Nitro, 3=NitroBasic
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
  actionTaken: number; // 0=None, 1=Unbanned, 2=InviteSent, 3=RolesPreassigned, 4=RolesAssigned, 5=RolesRemoved
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
