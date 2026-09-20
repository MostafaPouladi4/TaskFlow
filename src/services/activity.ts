import type { ActivityEvent, Comment, Task } from "../../shared/types";
import { createId } from "../shared/utils/id";
import { extractMentionIds } from "../shared/utils/mention";

/**
 * The history feed is derived from the task and comment fixtures rather than
 * hand-written, so every timeline is guaranteed to agree with the record it
 * describes. Output is sorted newest-first.
 */
export function buildActivity(
  tasks: Task[],
  comments: Comment[],
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const task of tasks) {
    events.push({
      id: createId("act"),
      taskId: task.id,
      actorId: task.createdById,
      type: "task_created",
      meta: { text: task.title },
      createdAt: task.createdAt,
    });

    if (task.assigneeId) {
      events.push({
        id: createId("act"),
        taskId: task.id,
        actorId: task.createdById,
        type: "assignee_changed",
        meta: { to: task.assigneeId },
        createdAt: task.createdAt,
      });
    }

    // A completed task must have passed through the workflow first.
    if (task.status === "done" && task.completedAt) {
      events.push({
        id: createId("act"),
        taskId: task.id,
        actorId: task.assigneeId ?? task.createdById,
        type: "status_changed",
        meta: { from: "in_progress", to: "done" },
        createdAt: task.completedAt,
      });
    } else if (task.status !== "todo") {
      events.push({
        id: createId("act"),
        taskId: task.id,
        actorId: task.assigneeId ?? task.createdById,
        type: "status_changed",
        meta: { from: "todo", to: task.status },
        createdAt: task.updatedAt,
      });
    }
  }

  for (const comment of comments) {
    events.push({
      id: createId("act"),
      taskId: comment.taskId,
      actorId: comment.authorId,
      type: "comment_added",
      meta: { text: comment.body.slice(0, 60) },
      createdAt: comment.createdAt,
    });

    for (const userId of extractMentionIds(comment.body)) {
      events.push({
        id: createId("act"),
        taskId: comment.taskId,
        actorId: comment.authorId,
        type: "user_mentioned",
        meta: { targetUserId: userId },
        createdAt: comment.createdAt,
      });
    }

    if (comment.edited && comment.updatedAt) {
      events.push({
        id: createId("act"),
        taskId: comment.taskId,
        actorId: comment.authorId,
        type: "task_updated",
        meta: { text: "ویرایش کامنت" },
        createdAt: comment.updatedAt,
      });
    }
  }

  return events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
