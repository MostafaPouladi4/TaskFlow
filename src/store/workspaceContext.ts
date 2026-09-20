import { createContext } from "react";
import type {
  ActivityEvent,
  AppNotification,
  Comment,
  ID,
  Project,
  Tag,
  Task,
  TaskDraft,
  TaskPatch,
  TaskStatus,
  TaskWithRelations,
  User,
} from "../../shared/types";
import type { WorkspaceIndex } from "../data";
import type { LoadStatus, WorkspaceState } from "./workspaceReducer";

/** Every write the UI can perform. All resolve to whether it succeeded. */
export interface WorkspaceActions {
  /** Discards the persisted copy and refetches from the source. */
  reload: () => void;
  /** Restores the workspace to its original fixture state. */
  resetWorkspace: () => Promise<void>;

  createTask: (draft: TaskDraft) => Promise<Task | null>;
  updateTask: (id: ID, patch: TaskPatch) => Promise<boolean>;
  deleteTask: (id: ID) => Promise<boolean>;
  setTaskStatus: (id: ID, status: TaskStatus) => Promise<boolean>;
  toggleTaskComplete: (id: ID) => Promise<boolean>;

  addChecklistItem: (taskId: ID, title: string) => Promise<boolean>;
  updateChecklistItem: (
    taskId: ID,
    itemId: ID,
    title: string,
  ) => Promise<boolean>;
  removeChecklistItem: (taskId: ID, itemId: ID) => Promise<boolean>;
  toggleChecklistItem: (taskId: ID, itemId: ID) => Promise<boolean>;

  addComment: (
    taskId: ID,
    body: string,
    parentId?: ID | null,
  ) => Promise<Comment | null>;
  updateComment: (commentId: ID, body: string) => Promise<boolean>;
  deleteComment: (commentId: ID) => Promise<boolean>;
  toggleReaction: (commentId: ID, emoji: string) => void;

  markNotificationRead: (id: ID) => void;
  markAllNotificationsRead: () => void;
}

export interface WorkspaceContextValue {
  status: LoadStatus;
  error: string | null;
  /** Denormalised tasks — relations already resolved. */
  tasks: TaskWithRelations[];
  users: User[];
  tags: Tag[];
  projects: Project[];
  comments: Comment[];
  activity: ActivityEvent[];
  notifications: AppNotification[];
  unreadCount: number;
  index: WorkspaceIndex;
  currentUser: User;
  actions: WorkspaceActions;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export type { WorkspaceState };
