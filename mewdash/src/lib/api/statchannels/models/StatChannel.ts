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
  currentValue: string | null;
  dateAdded: string | null;
}

export interface AddStatChannelRequest {
  channelId: bigint;
  categoryId?: bigint;
  statType: number;
  template?: string;
  roleId?: bigint;
  countdownDate?: string;
  goalTarget?: number;
}

export interface UpdateStatChannelRequest {
  template: string;
}
