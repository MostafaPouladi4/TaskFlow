import type { ID, Nullable } from "./common";

export type ActivityType =
  | "task_created"
  | "task_updated"
  | "status_changed"
  | "priority_changed"
  | "assignee_changed"
  | "due_date_changed"
  | "comment_added"
  | "user_mentioned"
  | "checklist_updated"
  | "attachment_added";

export interface ActivityMeta {
  /** Status/priority/project ids before and after a change. */
  from?: string;
  to?: string;
  /** Free text — comment excerpt or checklist item title. */
  text?: string;
  targetUserId?: ID;
}

export interface ActivityEvent {
  id: ID;
  taskId: Nullable<ID>;
  actorId: ID;
  type: ActivityType;
  meta: ActivityMeta;
  createdAt: string;
}
