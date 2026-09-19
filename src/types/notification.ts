import type { ID, Nullable } from "./common";

export type NotificationType =
  | "mention"
  | "assignment"
  | "comment_reply"
  | "due_soon"
  | "task_completed"
  | "task_updated";

export interface NotificationMeta {
  /** Snapshot of the task title so the row renders without a lookup. */
  taskTitle?: string;
  /** Comment/checklist excerpt. */
  excerpt?: string;
}

export interface AppNotification {
  id: ID;
  type: NotificationType;
  /** Who the notification is *for* — the inbox is filtered on this. */
  recipientId: ID;
  /** Null for system-generated rows such as a deadline reminder. */
  actorId: Nullable<ID>;
  taskId: Nullable<ID>;
  meta: NotificationMeta;
  read: boolean;
  createdAt: string;
}

/**
 * The copy for each notification is derived from (type, meta) in
 * `utils/notificationText.ts` rather than stored, so wording stays in one
 * place and can't drift between mock data and runtime events.
 */
export type NotificationGroupKey = "today" | "yesterday" | "earlier";
