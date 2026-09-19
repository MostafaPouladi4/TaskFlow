import type {
  ActivityEvent,
  AppNotification,
  Comment,
  ID,
  Task,
} from "../types";
import type { WorkspaceSnapshot } from "../data";
import type { MutationSideEffects } from "./workspaceMutations";

export type LoadStatus = "idle" | "loading" | "success" | "error";

export interface WorkspaceState extends WorkspaceSnapshot {
  status: LoadStatus;
  error: string | null;
}

export const INITIAL_WORKSPACE_STATE: WorkspaceState = {
  status: "idle",
  error: null,
  users: [],
  tags: [],
  projects: [],
  tasks: [],
  comments: [],
  activity: [],
  notifications: [],
};

export type WorkspaceAction =
  | { type: "load:start" }
  | { type: "load:success"; payload: WorkspaceSnapshot }
  | { type: "load:error"; payload: string }
  /** Snapshot restore, used to roll back a failed optimistic write. */
  | { type: "workspace:restore"; payload: WorkspaceState }
  | { type: "task:add"; payload: { task: Task } & MutationSideEffects }
  | {
      type: "task:patch";
      payload: { id: ID; patch: Partial<Task> } & MutationSideEffects;
    }
  | { type: "task:remove"; payload: { id: ID } }
  | { type: "comment:add"; payload: { comment: Comment } & MutationSideEffects }
  | { type: "comment:patch"; payload: { id: ID; patch: Partial<Comment> } }
  | { type: "comment:remove"; payload: { id: ID; taskId: ID } }
  | {
      type: "comment:react";
      payload: { commentId: ID; emoji: string; userId: ID };
    }
  | { type: "notification:read"; payload: { id: ID } }
  | { type: "notification:readAll"; payload: { recipientId: ID } }
  | { type: "notification:add"; payload: { notifications: AppNotification[] } };

/** Prepends newest-first and caps growth, matching how the feed is read. */
function mergeActivity(
  current: ActivityEvent[],
  incoming: ActivityEvent[],
): ActivityEvent[] {
  if (incoming.length === 0) return current;
  return [...incoming, ...current].slice(0, 400);
}

function mergeNotifications(
  current: AppNotification[],
  incoming: AppNotification[],
): AppNotification[] {
  if (incoming.length === 0) return current;
  return [...incoming, ...current].slice(0, 200);
}

/**
 * Reducer for the whole workspace.
 *
 * It is deliberately pure: every id, timestamp and derived record is computed
 * by the caller and arrives in the action payload. That makes a mutation
 * reproducible, and means a failed write can be undone by restoring a
 * snapshot rather than by inverting each operation.
 */
export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case "load:start":
      return { ...state, status: "loading", error: null };

    case "load:success":
      return { ...action.payload, status: "success", error: null };

    case "load:error":
      return { ...state, status: "error", error: action.payload };

    case "workspace:restore":
      return action.payload;

    case "task:add":
      return {
        ...state,
        tasks: [action.payload.task, ...state.tasks],
        activity: mergeActivity(state.activity, action.payload.activity),
        notifications: mergeNotifications(
          state.notifications,
          action.payload.notifications,
        ),
      };

    case "task:patch": {
      const { id, patch, activity, notifications } = action.payload;

      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...patch } : task,
        ),
        activity: mergeActivity(state.activity, activity),
        notifications: mergeNotifications(state.notifications, notifications),
      };
    }

    case "task:remove": {
      const { id } = action.payload;

      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== id),
        comments: state.comments.filter((comment) => comment.taskId !== id),
        notifications: state.notifications.filter(
          (notification) => notification.taskId !== id,
        ),
      };
    }

    case "comment:add": {
      const { comment, activity, notifications } = action.payload;

      return {
        ...state,
        comments: [...state.comments, comment],
        tasks: state.tasks.map((task) =>
          task.id === comment.taskId
            ? {
                ...task,
                commentIds: [...task.commentIds, comment.id],
                updatedAt: comment.createdAt,
              }
            : task,
        ),
        activity: mergeActivity(state.activity, activity),
        notifications: mergeNotifications(state.notifications, notifications),
      };
    }

    case "comment:patch":
      return {
        ...state,
        comments: state.comments.map((comment) =>
          comment.id === action.payload.id
            ? { ...comment, ...action.payload.patch }
            : comment,
        ),
      };

    case "comment:remove": {
      const { id, taskId } = action.payload;

      // Deleting a parent removes its replies too, so no orphan survives.
      const removedIds = new Set<ID>([
        id,
        ...state.comments
          .filter((comment) => comment.parentId === id)
          .map((comment) => comment.id),
      ]);

      return {
        ...state,
        comments: state.comments.filter((comment) => !removedIds.has(comment.id)),
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                commentIds: task.commentIds.filter(
                  (commentId) => !removedIds.has(commentId),
                ),
              }
            : task,
        ),
      };
    }

    case "comment:react": {
      const { commentId, emoji, userId } = action.payload;

      return {
        ...state,
        comments: state.comments.map((comment) => {
          if (comment.id !== commentId) return comment;

          const existing = comment.reactions.find(
            (reaction) => reaction.emoji === emoji,
          );

          if (!existing) {
            return {
              ...comment,
              reactions: [...comment.reactions, { emoji, userIds: [userId] }],
            };
          }

          const hasReacted = existing.userIds.includes(userId);
          const nextUserIds = hasReacted
            ? existing.userIds.filter((id) => id !== userId)
            : [...existing.userIds, userId];

          return {
            ...comment,
            reactions: comment.reactions
              .map((reaction) =>
                reaction.emoji === emoji
                  ? { ...reaction, userIds: nextUserIds }
                  : reaction,
              )
              .filter((reaction) => reaction.userIds.length > 0),
          };
        }),
      };
    }

    case "notification:read":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload.id
            ? { ...notification, read: true }
            : notification,
        ),
      };

    case "notification:readAll":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.recipientId === action.payload.recipientId
            ? { ...notification, read: true }
            : notification,
        ),
      };

    case "notification:add":
      return {
        ...state,
        notifications: mergeNotifications(
          state.notifications,
          action.payload.notifications,
        ),
      };

    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

/** Slices captured for rollback — everything a failed write could touch. */
export function snapshotForRollback(state: WorkspaceState): WorkspaceState {
  return {
    ...state,
    tasks: [...state.tasks],
    comments: [...state.comments],
    activity: [...state.activity],
    notifications: [...state.notifications],
  };
}
