// lib/api/todo/models/Todo.ts

export interface TodoList {
  id: number;
  guildId: bigint;
  ownerId: bigint;
  name: string;
  description: string | null;
  isServerList: boolean;
  isPublic: boolean;
  color: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TodoItem {
  id: number;
  todoListId: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  priority: number;
  dueDate: string | null;
  createdAt: string | null;
  completedAt: string | null;
  createdBy: bigint;
  completedBy: bigint | null;
  tags: string[] | null;
  position: number;
}

export interface TodoListAccess {
  isOwner: boolean;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canComplete: boolean;
  canDelete: boolean;
  canManage: boolean;
}

export interface CreateTodoListRequest {
  userId: bigint;
  name: string;
  description?: string | null;
  isServerList: boolean;
}

export interface UpdateTodoListRequest {
  userId: bigint;
  name?: string | null;
  /** Empty or null clears the description. */
  description?: string | null;
  color?: string | null;
  isPublic?: boolean | null;
}

export interface AddTodoItemRequest {
  userId: bigint;
  title: string;
  description?: string | null;
  priority?: number;
  dueDate?: string | null;
  tags?: string[];
}

export interface UpdateTodoItemRequest {
  /** The acting user, checked against the list's edit permissions. */
  userId: bigint;
  title?: string;
  description?: string | null;
  priority?: number;
}

export interface SetDueDateRequest {
  userId: bigint;
  /** Null clears the due date. */
  dueDate: string | null;
}

export interface ReorderTodoItemRequest {
  userId: bigint;
  /** 1-based. */
  position: number;
}

export interface TagRequest {
  userId: bigint;
  tag: string;
}

export interface GrantPermissionRequest {
  targetUserId: bigint;
  requestingUserId: bigint;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canComplete: boolean;
  canDelete: boolean;
  canManage: boolean;
}

export interface TodoListPermission {
  id: number;
  todoListId: number;
  userId: bigint;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canComplete: boolean;
  canDelete: boolean;
  canManageList: boolean;
  grantedBy: bigint;
  grantedAt: string | null;
}
