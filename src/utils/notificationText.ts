import type { AppNotification, ID, Task, User } from "../types";
import type { Lookup } from "./activityText";

/**
 * A notification sentence split into runs so the actor and the task title can
 * be emphasised independently. Building segments (rather than one string)
 * keeps the phrasing in a single place while letting the UI style the parts.
 */
export type NotificationSegment =
  | { kind: "actor"; value: string; userId: ID }
  | { kind: "text"; value: string }
  | { kind: "task"; value: string; taskId: ID | null };

export interface NotificationContent {
  segments: NotificationSegment[];
  /** Flattened sentence — used for `aria-label` and screen readers. */
  plain: string;
}

const text = (value: string): NotificationSegment => ({ kind: "text", value });

function build(segments: NotificationSegment[]): NotificationContent {
  return {
    segments,
    plain: segments.map((segment) => segment.value).join(""),
  };
}

function taskSegment(
  taskId: ID | null,
  title: string | undefined,
): NotificationSegment {
  return { kind: "task", value: title ?? "این وظیفه", taskId };
}

function actorSegment(actor: User | undefined, actorId: ID): NotificationSegment {
  return { kind: "actor", value: actor?.name ?? "کاربر", userId: actorId };
}

/**
 * Persian copy for a notification, derived from its type + meta. Wording lives
 * here rather than in the stored record, so a copy change doesn't require
 * rewriting persisted data.
 */
export function describeNotification(
  notification: AppNotification,
  lookup: Lookup,
): NotificationContent {
  const { type, meta, actorId, taskId } = notification;
  const taskTitle = meta.taskTitle;
  const actor = actorId ? lookup.getUser(actorId) : undefined;

  switch (type) {
    case "mention":
      return build([
        actorId ? actorSegment(actor, actorId) : text("یک کاربر"),
        text(" شما را در «"),
        taskSegment(taskId, taskTitle),
        text("» منشن کرد"),
      ]);

    case "assignment":
      return build([
        actorId ? actorSegment(actor, actorId) : text("یک کاربر"),
        text(" وظیفه «"),
        taskSegment(taskId, taskTitle),
        text("» را به شما اختصاص داد"),
      ]);

    case "comment_reply":
      return build([
        actorId ? actorSegment(actor, actorId) : text("یک کاربر"),
        text(" به نظر شما در «"),
        taskSegment(taskId, taskTitle),
        text("» پاسخ داد"),
      ]);

    case "due_soon":
      return build([
        text("مهلت وظیفه «"),
        taskSegment(taskId, taskTitle),
        text("» نزدیک است"),
      ]);

    case "task_completed":
      return build([
        actorId ? actorSegment(actor, actorId) : text("یک کاربر"),
        text(" وظیفه «"),
        taskSegment(taskId, taskTitle),
        text("» را تکمیل کرد"),
      ]);

    case "task_updated":
      return build([
        actorId ? actorSegment(actor, actorId) : text("یک کاربر"),
        text(" وظیفه «"),
        taskSegment(taskId, taskTitle),
        text("» را که در آن دخیل هستید تغییر داد"),
      ]);

    default: {
      const exhaustive: never = type;
      return build([text(String(exhaustive))]);
    }
  }
}

/** Short label for the notification's type chip. */
export const NOTIFICATION_KIND_LABELS = {
  mention: "منشن",
  assignment: "واگذاری",
  comment_reply: "پاسخ",
  due_soon: "یادآوری",
  task_completed: "تکمیل",
  task_updated: "به‌روزرسانی",
} as const satisfies Record<AppNotification["type"], string>;

export function notificationTask(
  notification: AppNotification,
  getTask: (id: ID) => Task | undefined,
): Task | undefined {
  return notification.taskId ? getTask(notification.taskId) : undefined;
}
