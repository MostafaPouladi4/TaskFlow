import type { ID, Nullable } from "./common";
import type { Tag } from "./tag";
import type { User } from "./user";
import type { Comment } from "./comment";
import type { Project } from "./project";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "in_review"
  | "blocked"
  | "done";

export type TaskPriority = "urgent" | "high" | "medium" | "low";

export interface ChecklistItem {
  id: ID;
  title: string;
  done: boolean;
}

/**
 * Normalised row: relations are stored as ids so a single task can be patched
 * without touching the users/tags/comments collections.
 */
export interface Task {
  id: ID;
  code: string;
  projectId: Nullable<ID>;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: Nullable<ID>;
  memberIds: ID[];
  mentionIds: ID[];
  startDate: Nullable<string>;
  dueDate: Nullable<string>;
  tagIds: ID[];
  checklist: ChecklistItem[];
  commentIds: ID[];
  createdById: ID;
  createdAt: string;
  updatedAt: string;
  completedAt: Nullable<string>;
}

/**
 * What the UI actually consumes. `resolveTask` denormalises a `Task` into
 * this, so components never do id lookups themselves.
 *
 * Generic over the comment type so callers that only need shallow comments
 * can supply their own shape.
 */
export interface TaskWithRelations<TComment = Comment> extends Task {
  assignee: Nullable<User>;
  members: User[];
  mentions: User[];
  tags: Tag[];
  comments: TComment[];
  project: Nullable<Project>;
}

/** The subset a form edits — server-owned fields are excluded by design. */
export interface TaskDraft {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: Nullable<ID>;
  memberIds: ID[];
  startDate: string;
  dueDate: string;
  tagIds: ID[];
  checklist: ChecklistItem[];
  projectId: Nullable<ID>;
}

/** Patch semantics: absent key = leave untouched, null = clear. */
export type TaskPatch = Partial<Omit<Task, "id" | "code" | "createdAt">>;

export interface TaskFilters {
  query: string;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  assigneeIds: ID[];
  tagIds: ID[];
  projectIds: ID[];
  dueFrom: Nullable<string>;
  dueTo: Nullable<string>;
}

export type TaskSortKey =
  | "dueDate"
  | "priority"
  | "createdAt"
  | "title"
  | "status";

export interface TaskSort {
  key: TaskSortKey;
  direction: "asc" | "desc";
}

export interface TaskStats {
  total: number;
  done: number;
  inProgress: number;
  overdue: number;
  todo: number;
  inReview: number;
  blocked: number;
  completionRate: number;
  checklistProgress: number;
}
