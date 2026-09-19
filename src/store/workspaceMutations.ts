import type {
  ActivityEvent,
  AppNotification,
  Comment,
  ID,
  Task,
} from "../types";
import { extractMentionIds } from "../utils/mention";
import { uniqueBy } from "../utils/collection";

/**
 * Pure builders that turn a user intent into the side records it implies —
 * history entries and notifications.
 *
 * They take `now` and `newId` as arguments rather than reading the clock or
 * generating ids themselves, which keeps them deterministic and trivially
 * testable. The store is responsible for supplying both.
 */
export interface MutationSideEffects {
  activity: ActivityEvent[];
  notifications: AppNotification[];
}

export type IdFactory = (prefix: string) => ID;

const EMPTY: MutationSideEffects = { activity: [], notifications: [] };

function activity(
  taskId: ID,
  actorId: ID,
  type: ActivityEvent["type"],
  createdAt: string,
  meta: ActivityEvent["meta"],
  newId: IdFactory,
): ActivityEvent {
  return { id: newId("act"), taskId, actorId, type, meta, createdAt };
}

function notification(
  recipientId: ID,
  type: AppNotification["type"],
  params: {
    actorId: ID | null;
    taskId: ID;
    taskTitle: string;
    excerpt?: string;
    createdAt: string;
    newId: IdFactory;
  },
): AppNotification {
  return {
    id: params.newId("ntf"),
    type,
    recipientId,
    actorId: params.actorId,
    taskId: params.taskId,
    meta: { taskTitle: params.taskTitle, excerpt: params.excerpt },
    read: false,
    createdAt: params.createdAt,
  };
}

/** Everyone with a stake in a task: the assignee plus related members. */
function involvedUserIds(task: Task): ID[] {
  const ids = [task.assigneeId, ...task.memberIds].filter(
    (id): id is ID => id !== null,
  );

  return uniqueBy(ids, (id) => id);
}

/** Notifies everyone involved except the person who made the change. */
function notifyInvolved(
  task: Task,
  actorId: ID,
  type: AppNotification["type"],
  createdAt: string,
  newId: IdFactory,
  excerpt?: string,
): AppNotification[] {
  return involvedUserIds(task)
    .filter((id) => id !== actorId)
    .map((recipientId) =>
      notification(recipientId, type, {
        actorId,
        taskId: task.id,
        taskTitle: task.title,
        excerpt,
        createdAt,
        newId,
      }),
    );
}

/** A newly created task: one history entry, plus assignment/mention pings. */
export function onTaskCreated(
  task: Task,
  actorId: ID,
  now: string,
  newId: IdFactory,
): MutationSideEffects {
  const notifications: AppNotification[] = [];

  if (task.assigneeId && task.assigneeId !== actorId) {
    notifications.push(
      notification(task.assigneeId, "assignment", {
        actorId,
        taskId: task.id,
        taskTitle: task.title,
        createdAt: now,
        newId,
      }),
    );
  }

  for (const mentionId of task.mentionIds) {
    if (mentionId === actorId) continue;

    notifications.push(
      notification(mentionId, "mention", {
        actorId,
        taskId: task.id,
        taskTitle: task.title,
        createdAt: now,
        newId,
      }),
    );
  }

  return {
    activity: [activity(task.id, actorId, "task_created", now, {}, newId)],
    notifications,
  };
}

/**
 * Diffs a patch against the previous task and emits only the history entries
 * the change actually warrants — so editing a title doesn't log a status
 * change.
 */
export function onTaskPatched(
  before: Task,
  after: Task,
  actorId: ID,
  now: string,
  newId: IdFactory,
): MutationSideEffects {
  const events: ActivityEvent[] = [];
  const notifications: AppNotification[] = [];

  if (before.status !== after.status) {
    events.push(
      activity(
        after.id,
        actorId,
        "status_changed",
        now,
        { from: before.status, to: after.status },
        newId,
      ),
    );

    notifications.push(
      ...notifyInvolved(
        after,
        actorId,
        after.status === "done" ? "task_completed" : "task_updated",
        now,
        newId,
      ),
    );
  }

  if (before.priority !== after.priority) {
    events.push(
      activity(
        after.id,
        actorId,
        "priority_changed",
        now,
        { from: before.priority, to: after.priority },
        newId,
      ),
    );
  }

  if (before.assigneeId !== after.assigneeId) {
    events.push(
      activity(
        after.id,
        actorId,
        "assignee_changed",
        now,
        { from: before.assigneeId ?? undefined, to: after.assigneeId ?? undefined },
        newId,
      ),
    );

    if (after.assigneeId && after.assigneeId !== actorId) {
      notifications.push(
        notification(after.assigneeId, "assignment", {
          actorId,
          taskId: after.id,
          taskTitle: after.title,
          createdAt: now,
          newId,
        }),
      );
    }
  }

  if (before.dueDate !== after.dueDate) {
    events.push(
      activity(
        after.id,
        actorId,
        "due_date_changed",
        now,
        { from: before.dueDate ?? undefined, to: after.dueDate ?? undefined },
        newId,
      ),
    );
  }

  if (before.checklist.length !== after.checklist.length) {
    events.push(activity(after.id, actorId, "checklist_updated", now, {}, newId));
  }

  // A title/description-only edit still deserves a timeline entry.
  if (events.length === 0 && before.updatedAt !== after.updatedAt) {
    events.push(activity(after.id, actorId, "task_updated", now, {}, newId));
  }

  return { activity: events, notifications };
}

/** Newly mentioned users get a `mention` ping; a reply pings the parent author. */
export function onCommentCreated(
  comment: Comment,
  task: Task,
  parent: Comment | undefined,
  actorId: ID,
  now: string,
  newId: IdFactory,
): MutationSideEffects {
  const events: ActivityEvent[] = [
    activity(
      task.id,
      actorId,
      "comment_added",
      now,
      { text: comment.body.slice(0, 80) },
      newId,
    ),
  ];

  const notifications: AppNotification[] = [];
  const mentioned = extractMentionIds(comment.body);

  for (const mentionId of mentioned) {
    events.push(
      activity(
        task.id,
        actorId,
        "user_mentioned",
        now,
        { targetUserId: mentionId },
        newId,
      ),
    );

    if (mentionId === actorId) continue;

    notifications.push(
      notification(mentionId, "mention", {
        actorId,
        taskId: task.id,
        taskTitle: task.title,
        excerpt: comment.body.slice(0, 80),
        createdAt: now,
        newId,
      }),
    );
  }

  if (parent && parent.authorId !== actorId && !mentioned.includes(parent.authorId)) {
    notifications.push(
      notification(parent.authorId, "comment_reply", {
        actorId,
        taskId: task.id,
        taskTitle: task.title,
        excerpt: comment.body.slice(0, 80),
        createdAt: now,
        newId,
      }),
    );
  }

  return { activity: events, notifications };
}

export { EMPTY as NO_SIDE_EFFECTS, involvedUserIds };
