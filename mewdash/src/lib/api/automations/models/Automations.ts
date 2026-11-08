// lib/api/automations/models/Automations.ts

/**
 * A condition or action: its type plus that type's fields, side by side.
 */
export interface AutomationNode {
  type: string;
  [field: string]: unknown;
}

export interface AutomationButton {
  customId: string;
  label: string;
  style: string;
  emoji?: string | null;
}

export interface Automation {
  id: number;
  name: string;
  enabled: boolean;
  trigger: string;
  conditions: AutomationNode[];
  actions: AutomationNode[];
  cooldownSeconds: number;
  cooldownScope: string;
  retryOnFailure: boolean;
  ignoreBots: boolean;
  allowMassMentions: boolean;
  creatorId: bigint;
  dateAdded: string;
  dateModified: string;
}

export interface AutomationRequest {
  name: string;
  enabled: boolean;
  trigger: string;
  conditions: AutomationNode[];
  actions: AutomationNode[];
  cooldownSeconds: number;
  cooldownScope: string;
  retryOnFailure: boolean;
  ignoreBots: boolean;
  allowMassMentions: boolean;
  userId?: bigint;
}

export interface AutomationRun {
  id: number;
  automationId: number;
  success: boolean;
  isTest: boolean;
  failedActionIndex: number | null;
  failedActionType: string | null;
  reason: string | null;
  userId: bigint;
  channelId: bigint;
  durationMs: number;
  ranAt: string;
}

export interface AutomationTestRequest {
  userId: bigint;
  channelId?: bigint;
}

export interface AutomationTestResult {
  success: boolean;
  failedActionIndex: number | null;
  failedActionType: string | null;
  reason: string | null;
}

export interface AutomationTemplateParameter {
  name: string;
  kind: string;
  description: string;
  required: boolean;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  parameters: AutomationTemplateParameter[];
}

export interface AutomationTemplateRequest {
  creatorId?: bigint;
  channelId?: bigint;
  roleId?: bigint;
  userId?: bigint;
}

export interface AutomationTemplateResult {
  created: Automation[];
  setupError: string | null;
}

export interface AutomationError {
  path: string;
  message: string;
}

export type AutomationFieldKind =
  | "Text"
  | "LongText"
  | "EmbedJson"
  | "Integer"
  | "Boolean"
  | "Channel"
  | "Role"
  | "User"
  | "Emoji"
  | "ChannelList"
  | "RoleList"
  | "UserList"
  | "EmojiList"
  | "Choice"
  | "ChoiceList"
  | "Buttons";

export interface AutomationFieldSpec {
  name: string;
  kind: AutomationFieldKind;
  description: string;
  required: boolean;
  min: number | null;
  max: number | null;
  options: string[] | null;
  default: unknown;
}

export interface AutomationTriggerSpec {
  type: string;
  name: string;
  description: string;
  provides: string[];
}

export interface AutomationNodeSpec {
  type: string;
  name: string;
  description: string;
  requires: string[];
  triggers: string[];
  fields: AutomationFieldSpec[];
}

export interface AutomationPlaceholder {
  name: string;
  description: string;
}

export interface AutomationSchema {
  triggers: AutomationTriggerSpec[];
  conditions: AutomationNodeSpec[];
  actions: AutomationNodeSpec[];
  cooldownScopes: string[];
  placeholders: AutomationPlaceholder[];
  limits: Record<string, number>;
}
