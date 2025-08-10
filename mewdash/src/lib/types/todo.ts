export interface TodoList {
  id: number;
  name: string;
  description?: string;
  isServerList: boolean;
  isPublic: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: bigint;
  guildId: bigint;
}

export interface TodoItem {
  id: number;
  todoListId: number;
  title: string;
  description?: string;
  priority: number;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: bigint;
  createdAt: string;
  createdBy: bigint;
  tags?: string[];
  reminderTime?: string;
  position: number;
}

export interface TodoListPermission {
  todoListId: number;
  userId: bigint;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canComplete: boolean;
  canDelete: boolean;
  canManageList: boolean;
  grantedBy: bigint;
  grantedAt: string;
}

// Request/Response types for API calls
export interface CreateTodoListRequest {
  name: string;
  description?: string;
  userId: bigint;
  isServerList: boolean;
}

export interface AddTodoItemRequest {
  title: string;
  description?: string;
  userId: bigint;
  priority: number;
  dueDate?: string;
}

export interface UpdateTodoItemRequest {
  title?: string;
  description?: string;
  userId: bigint;
}

export interface SetDueDateRequest {
  dueDate?: string;
  userId: bigint;
}

export interface TagRequest {
  tag: string;
  userId: bigint;
}

export interface GrantPermissionRequest {
  targetUserId: bigint;
  requestingUserId: bigint;
  canView: boolean;
  canEdit: boolean;
  canManage: boolean;
}

// UI-specific types
export interface TodoFilterOptions {
  priority?: number;
  tags?: string[];
  completed?: boolean;
  search?: string;
  sortBy?: 'priority' | 'dueDate' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface TodoStats {
  totalItems: number;
  completedItems: number;
  pendingItems: number;
  overdueItems: number;
  completionRate: number;
}

// Priority levels
export enum TodoPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

// Permission levels for UI
export interface UserPermissions {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canComplete: boolean;
  canDelete: boolean;
  canManage: boolean;
}