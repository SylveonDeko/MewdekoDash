// lib/api/todo/todo.ts
import { apiRequest } from "../core";
import type {
  TodoList,
  TodoItem,
  TodoListAccess,
  CreateTodoListRequest,
  UpdateTodoListRequest,
  AddTodoItemRequest,
  UpdateTodoItemRequest,
  SetDueDateRequest,
  ReorderTodoItemRequest,
  TagRequest,
  GrantPermissionRequest,
  TodoListPermission,
} from "./models";

/**
 * Todo lists API
 * Maps to Mewdeko.Controllers.TodoController
 */
export const todoApi = {
  getTodoLists: (guildId: bigint, userId: bigint) =>
    apiRequest<TodoList[]>(`todo/${guildId}/lists/${userId}`),

  getTodoList: (guildId: bigint, listId: number, userId: bigint) =>
    apiRequest<TodoList>(`todo/${guildId}/lists/${listId}/${userId}`),

  getListAccess: (guildId: bigint, listId: number, userId: bigint) =>
    apiRequest<TodoListAccess>(`todo/${guildId}/lists/${listId}/access/${userId}`),

  createTodoList: (guildId: bigint, request: CreateTodoListRequest) =>
    apiRequest<TodoList>(`todo/${guildId}/lists`, "POST", request),

  updateTodoList: (guildId: bigint, listId: number, request: UpdateTodoListRequest) =>
    apiRequest<void>(`todo/${guildId}/lists/${listId}`, "PUT", request),

  deleteTodoList: (guildId: bigint, listId: number, userId: bigint) =>
    apiRequest<void>(`todo/${guildId}/lists/${listId}/${userId}`, "DELETE"),

  getTodoItems: (
    guildId: bigint,
    listId: number,
    userId: bigint,
    includeCompleted: boolean = false,
  ) =>
    apiRequest<TodoItem[]>(
      `todo/${guildId}/lists/${listId}/items/${userId}?includeCompleted=${includeCompleted}`,
    ),

  addTodoItem: (guildId: bigint, listId: number, request: AddTodoItemRequest) =>
    apiRequest<TodoItem>(`todo/${guildId}/lists/${listId}/items`, "POST", request),

  updateTodoItem: (guildId: bigint, itemId: number, request: UpdateTodoItemRequest) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}`, "PUT", request),

  completeTodoItem: (guildId: bigint, itemId: number, userId: bigint) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/complete/${userId}`, "PUT"),

  uncompleteTodoItem: (guildId: bigint, itemId: number, userId: bigint) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/uncomplete/${userId}`, "PUT"),

  reorderTodoItem: (guildId: bigint, itemId: number, request: ReorderTodoItemRequest) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/reorder`, "PUT", request),

  deleteTodoItem: (guildId: bigint, itemId: number, userId: bigint) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/${userId}`, "DELETE"),

  setTodoItemDueDate: (guildId: bigint, itemId: number, request: SetDueDateRequest) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/duedate`, "PUT", request),

  addTodoItemTag: (guildId: bigint, itemId: number, request: TagRequest) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/tags`, "POST", request),

  removeTodoItemTag: (guildId: bigint, itemId: number, request: TagRequest) =>
    apiRequest<void>(`todo/${guildId}/items/${itemId}/tags`, "DELETE", request),

  getTodoListPermissions: (guildId: bigint, listId: number, userId: bigint) =>
    apiRequest<TodoListPermission[]>(
      `todo/${guildId}/lists/${listId}/permissions/${userId}`,
    ),

  grantTodoListPermissions: (
    guildId: bigint,
    listId: number,
    request: GrantPermissionRequest,
  ) => apiRequest<void>(`todo/${guildId}/lists/${listId}/permissions`, "POST", request),

  revokeTodoListPermissions: (
    guildId: bigint,
    listId: number,
    targetUserId: bigint,
    requestingUserId: bigint,
  ) =>
    apiRequest<void>(
      `todo/${guildId}/lists/${listId}/permissions/${targetUserId}/${requestingUserId}`,
      "DELETE",
    ),
};
