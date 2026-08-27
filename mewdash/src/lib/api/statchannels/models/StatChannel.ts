/**
 * Tuning for the chosen display style.
 */
export interface StatChannelStyleOptions {
  barWidth?: number;
  barFilled?: string;
  barEmpty?: string;
  decimals?: number;
  padWidth?: number;
  trueText?: string;
  falseText?: string;
}

export interface StatChannel {
  id: number;
  channelId: bigint;
  channelName: string;
  statType: number;
  typeName: string;
  template: string;
  roleId: bigint | null;
  roleName: string | null;
  countdownDate: string | null;
  goalTarget: number;
  displayStyle: number;
  styleName: string;
  styleOptions: string | null;
  updateMechanism: number;
  mechanismName: string;
  updateIntervalMinutes: number;
  targetId: bigint | null;
  targetName: string | null;
  lastUpdateAt: string | null;
  currentValue: string | null;
  dateAdded: string | null;
}

/**
 * Fields shared by every stat channel write request.
 */
export interface StatChannelRequestBase {
  template?: string;
  roleId?: bigint;
  countdownDate?: string;
  goalTarget?: number;
  displayStyle?: number;
  styleOptions?: StatChannelStyleOptions;
  updateMechanism?: number;
  updateIntervalMinutes?: number;
  targetId?: bigint;
  targetName?: string;
}

export interface AddStatChannelRequest extends StatChannelRequestBase {
  channelId: bigint;
  categoryId?: bigint;
  statType: number;
}

export interface UpdateStatChannelRequest extends StatChannelRequestBase {
  statType?: number;
}

export interface StatChannelPreviewRequest extends StatChannelRequestBase {
  statType: number;
}

/**
 * Extra configuration a stat type needs before it can resolve. Mirrors StatChannelRequirement on the bot.
 */
export enum StatChannelRequirement {
  None = 0,
  Role = 1,
  Date = 2,
  Goal = 3,
  CounterName = 4,
  CountingChannel = 5,
  MinecraftServer = 6,
}

/**
 * The shape of the value a stat type produces. Mirrors StatChannelValueKind on the bot.
 */
export enum StatChannelValueKind {
  Number = 0,
  Text = 1,
  Boolean = 2,
}

export interface StatTypeDefinition {
  type: number;
  name: string;
  category: string;
  description: string;
  defaultTemplate: string;
  placeholders: string[];
  valueKind: number;
  valueKindName: string;
  requirement: number;
  requirementName: string;
  example: string;
  recommendedStyle: number;
  realtime: boolean;
}

export interface DisplayStyleDefinition {
  style: number;
  name: string;
  example: string;
}

export interface MechanismDefinition {
  mechanism: number;
  name: string;
  minimumIntervalMinutes: number;
}

export interface StatChannelMetadata {
  commonPlaceholders: string[];
  statTypes: StatTypeDefinition[];
  displayStyles: DisplayStyleDefinition[];
  mechanisms: MechanismDefinition[];
}

export interface StatChannelSettings {
  defaultMechanism: number;
  defaultIntervalMinutes: number;
  defaultDisplayStyle: number;
}
