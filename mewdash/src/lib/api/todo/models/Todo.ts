// lib/api/todo/models/Todo.ts

export interface TodoList {
  id: number;
  guildId: bigint;
  userId: bigint;
  name: string;
  description: string | null;
  isServerList: boolean;
  dateAdded: string | null;
}

export interface TodoItem {
  id: number;
  listId: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  priority: number;
  dueDate: string | null;
  completedAt: string | null;
  createdBy: bigint;
  dateAdded: string | null;
}

export interface CreateTodoListRequest {
  userId: bigint;
  name: string;
  description?: string | null;
  isServerList: boolean;
}

export interface AddTodoItemRequest {
  userId: bigint;
  title: string;
  description?: string | null;
  priority?: number;
  dueDate?: string | null;
}

export interface UpdateTodoItemRequest {
  /** The acting user, checked against the list's edit permissions. */
  userId: bigint;
  title?: string;
  description?: string | null;
  priority?: number;
  /** Due date as an ISO string, or null to leave it unchanged. */
  dueDate?: string | null;
  isCompleted?: boolean;
}

export interface SetDueDateRequest {
  userId: bigint;
  dueDate: string | null;
}

export interface TagRequest {
  userId: bigint;
  tag: string;
}

export interface GrantPermissionRequest {
  targetUserId: bigint;
  requestingUserId: bigint;
  canEdit: boolean;
  canDelete: boolean;
}

export interface TodoListPermission {
  listId: number;
  userId: bigint;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canComplete: boolean;
  canDelete: boolean;
  canManageList: boolean;
}
