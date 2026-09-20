import type {
  ActivityEvent,
  AppNotification,
  Comment,
  ID,
  Project,
  Tag,
  Task,
  TaskWithRelations,
  User,
} from "../../shared/types";
import { CURRENT_USER_ID } from "../shared/constants/config";
import { groupBy, indexBy, resolveAll } from "../shared/utils/collection";
import { buildActivity } from "./activity";
import { COMMENTS } from "./comments";
import { NOTIFICATIONS, type NotificationSeed } from "./notifications";
import { PROJECTS } from "./projects";
import { TAGS } from "./tags";
import { TASKS } from "./tasks";
import { USERS } from "./users";

export interface WorkspaceSnapshot {
  users: User[];
  tags: Tag[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  activity: ActivityEvent[];
  notifications: AppNotification[];
}

/**
 * `commentIds` is filled in here rather than in the task fixtures, so a task
 * can never reference a comment that doesn't exist.
 */
const commentsByTask = groupBy(COMMENTS, (comment) => comment.taskId);

const TASKS_WITH_COMMENTS: Task[] = TASKS.map((task) => ({
  ...task,
  commentIds: (commentsByTask[task.id] ?? []).map((comment) => comment.id),
}));

export const ACTIVITY: ActivityEvent[] = buildActivity(TASKS_WITH_COMMENTS, COMMENTS);

/** Seeds carry no recipient; every fixture row belongs to the signed-in user. */
const NOTIFICATIONS_FOR_USER: AppNotification[] = (
  NOTIFICATIONS satisfies NotificationSeed[]
).map((notification) => ({ ...notification, recipientId: CURRENT_USER_ID }));

export const INITIAL_WORKSPACE: WorkspaceSnapshot = {
  users: USERS,
  tags: TAGS,
  projects: PROJECTS,
  tasks: TASKS_WITH_COMMENTS,
  comments: COMMENTS,
  activity: ACTIVITY,
  notifications: NOTIFICATIONS_FOR_USER,
};

/** Everything a resolver needs, so lookups stay O(1) instead of O(n). */
export interface WorkspaceIndex {
  users: Map<ID, User>;
  tags: Map<ID, Tag>;
  projects: Map<ID, Project>;
  tasks: Map<ID, Task>;
  comments: Map<ID, Comment>;
}

export function buildIndex(snapshot: WorkspaceSnapshot): WorkspaceIndex {
  return {
    users: indexBy(snapshot.users, (user) => user.id),
    tags: indexBy(snapshot.tags, (tag) => tag.id),
    projects: indexBy(snapshot.projects, (project) => project.id),
    tasks: indexBy(snapshot.tasks, (task) => task.id),
    comments: indexBy(snapshot.comments, (comment) => comment.id),
  };
}

/**
 * Denormalises a normalised `Task` into the shape components consume.
 * Generic over the comment type so callers can substitute their own.
 */
export function resolveTask<TComment = Comment>(
  task: Task,
  index: WorkspaceIndex,
  resolveComments: (ids: ID[], index: WorkspaceIndex) => TComment[] = (ids, idx) =>
    resolveAll(ids, idx.comments) as TComment[],
): TaskWithRelations<TComment> {
  return {
    ...task,
    assignee: task.assigneeId ? (index.users.get(task.assigneeId) ?? null) : null,
    members: resolveAll(task.memberIds, index.users),
    mentions: resolveAll(task.mentionIds, index.users),
    tags: resolveAll(task.tagIds, index.tags),
    comments: resolveComments(task.commentIds, index),
    project: task.projectId ? (index.projects.get(task.projectId) ?? null) : null,
  };
}

export function resolveTasks(
  tasks: Task[],
  index: WorkspaceIndex,
): TaskWithRelations[] {
  return tasks.map((task) => resolveTask(task, index));
}

/** The lookup object the text-rendering utilities expect. */
export function createLookup(index: WorkspaceIndex) {
  return {
    getUser: (id: ID) => index.users.get(id),
    getTask: (id: ID) => index.tasks.get(id),
    getTag: (id: ID) => index.tags.get(id),
    getProject: (id: ID) => index.projects.get(id),
  };
}

export {
  USERS,
  TAGS,
  PROJECTS,
  TASKS_WITH_COMMENTS as TASKS,
  COMMENTS,
  NOTIFICATIONS_FOR_USER as NOTIFICATIONS,
};
