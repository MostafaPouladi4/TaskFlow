import { useMemo } from "react";
import { PROJECT_TONES, TAG_TONES } from "../constants/tones";
import type { PickerOption } from "../components/ui/picker";
import type {
  ActivityEvent,
  AppNotification,
  CommentThread,
  ID,
  ProjectWithProgress,
  TaskFilters,
  TaskSort,
  TaskStats,
  TaskWithRelations,
  TeamMember,
} from "../types";
import { buildCommentThreads } from "../utils/comments";
import type { Lookup } from "../utils/activityText";
import { filterAndSortTasks, sortTasks } from "../utils/filter";
import {
  computeProjectProgress,
  computeTaskStats,
  computeTeamStats,
  getOverdueTasks,
  getUpcomingTasks,
} from "../utils/statistics";
import { useWorkspace } from "./useWorkspace";

/**
 * Derived data, kept out of the store.
 *
 * These are plain `useMemo` selectors over the context rather than
 * subscriptions, because the workspace is small enough that recomputing is
 * cheaper than the bookkeeping a selector library would add.
 */

export function useTasks(): TaskWithRelations[] {
  return useWorkspace().tasks;
}

export function useTask(taskId: ID | undefined): TaskWithRelations | undefined {
  const { tasks } = useWorkspace();

  return useMemo(
    () => (taskId ? tasks.find((task) => task.id === taskId) : undefined),
    [tasks, taskId],
  );
}

export function useFilteredTasks(
  filters: TaskFilters,
  sort: TaskSort,
): TaskWithRelations[] {
  const { tasks } = useWorkspace();

  return useMemo(
    () => filterAndSortTasks(tasks, filters, sort),
    [tasks, filters, sort],
  );
}

export function useSortedTasks(sort: TaskSort): TaskWithRelations[] {
  const { tasks } = useWorkspace();

  return useMemo(() => sortTasks(tasks, sort), [tasks, sort]);
}

export function useTaskStats(): TaskStats {
  const { tasks } = useWorkspace();

  return useMemo(() => computeTaskStats(tasks), [tasks]);
}

export function useUpcomingTasks(limit = 5): TaskWithRelations[] {
  const { tasks } = useWorkspace();

  return useMemo(() => getUpcomingTasks(tasks, limit), [tasks, limit]);
}

export function useOverdueTasks(): TaskWithRelations[] {
  const { tasks } = useWorkspace();

  return useMemo(() => getOverdueTasks(tasks), [tasks]);
}

export function useTeamMembers(): TeamMember[] {
  const { users, tasks } = useWorkspace();

  return useMemo(() => computeTeamStats(users, tasks), [users, tasks]);
}

export function useProjectsWithProgress(): ProjectWithProgress[] {
  const { projects, tasks } = useWorkspace();

  return useMemo(
    () => computeProjectProgress(projects, tasks),
    [projects, tasks],
  );
}

/** Global history, newest first. */
export function useActivityFeed(limit?: number): ActivityEvent[] {
  const { activity } = useWorkspace();

  return useMemo(
    () => (limit === undefined ? activity : activity.slice(0, limit)),
    [activity, limit],
  );
}

/** History for a single task. */
export function useTaskActivity(taskId: ID | undefined): ActivityEvent[] {
  const { activity } = useWorkspace();

  return useMemo(
    () =>
      taskId ? activity.filter((event) => event.taskId === taskId) : [],
    [activity, taskId],
  );
}

/** A task's comments, assembled into a reply tree. */
export function useTaskCommentThreads(taskId: ID | undefined): CommentThread[] {
  const { comments } = useWorkspace();

  return useMemo(() => {
    if (!taskId) return [];
    return buildCommentThreads(
      comments.filter((comment) => comment.taskId === taskId),
    );
  }, [comments, taskId]);
}

export function useTaskCommentCount(taskId: ID): number {
  const { comments } = useWorkspace();

  return useMemo(
    () => comments.filter((comment) => comment.taskId === taskId).length,
    [comments, taskId],
  );
}

/* ── Notifications ─────────────────────────────────────────────────────── */

/**
 * The signed-in user's notifications, newest first.
 *
 * The store keeps every recipient's rows so one snapshot serves the whole
 * workspace; narrowing to the current user is the reader's job. Both the bell
 * and the notifications page need the same answer, so it lives here once.
 */
export function useInboxNotifications(): AppNotification[] {
  const { notifications, currentUser } = useWorkspace();

  return useMemo(
    () =>
      notifications
        .filter((notification) => notification.recipientId === currentUser.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notifications, currentUser.id],
  );
}

/* ── Picker options ────────────────────────────────────────────────────── */

export function useUserPickerOptions(): PickerOption[] {
  const { users } = useWorkspace();

  return useMemo(
    () =>
      users.map((user) => ({
        value: user.id,
        label: user.name,
        description: user.title,
        initials: user.avatar,
      })),
    [users],
  );
}

export function useTagPickerOptions(): PickerOption[] {
  const { tags } = useWorkspace();

  return useMemo(
    () =>
      tags.map((tag) => ({
        value: tag.id,
        label: tag.label,
        dotClassName: TAG_TONES[tag.tone].solid,
      })),
    [tags],
  );
}

export function useProjectPickerOptions(): PickerOption[] {
  const { projects } = useWorkspace();

  return useMemo(
    () =>
      projects.map((project) => ({
        value: project.id,
        label: project.name,
        description: project.description,
        dotClassName: PROJECT_TONES[project.tone].solid,
      })),
    [projects],
  );
}

/**
 * Resolvers for the prose builders in `utils/activityText` and
 * `utils/notificationText` — memoised so a timeline isn't re-rendered with a
 * fresh lookup object on every pass.
 */
export function useLookup(): Lookup {
  const { index } = useWorkspace();

  return useMemo(
    () => ({
      getUser: (id: ID) => index.users.get(id),
      getTask: (id: ID) => index.tasks.get(id),
      getTag: (id: ID) => index.tags.get(id),
      getProject: (id: ID) => index.projects.get(id),
    }),
    [index],
  );
}
