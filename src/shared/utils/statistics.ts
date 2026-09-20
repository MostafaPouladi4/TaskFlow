import { DUE_SOON_THRESHOLD_DAYS } from "../shared/constants/config";
import type {
  ChecklistItem,
  ID,
  Project,
  ProjectWithProgress,
  Task,
  TaskStats,
  TeamMember,
  TeamMemberStats,
  User,
} from "../../shared/types";
import { daysFromToday, todayIso } from "./date";

/** Progress over a checklist, 0–100. An empty checklist reads as 0. */
export function checklistProgress(items: ChecklistItem[]): number {
  if (items.length === 0) return 0;

  const done = items.filter((item) => item.done).length;
  return Math.round((done / items.length) * 100);
}

export function countDoneChecklist(items: ChecklistItem[]): number {
  return items.filter((item) => item.done).length;
}

export function isTaskOverdue(task: Pick<Task, "dueDate" | "status">): boolean {
  if (!task.dueDate || task.status === "done") return false;
  return daysFromToday(task.dueDate) < 0;
}

/**
 * Headline numbers for the dashboard. Pure and cheap, so it can be called on
 * every render without memoisation gymnastics.
 */
export function computeTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "done").length;

  const allChecklist = tasks.flatMap((task) => task.checklist);
  const checklistDone = allChecklist.filter((item) => item.done).length;

  return {
    total,
    done,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    inReview: tasks.filter((task) => task.status === "in_review").length,
    blocked: tasks.filter((task) => task.status === "blocked").length,
    todo: tasks.filter((task) => task.status === "todo").length,
    overdue: tasks.filter(isTaskOverdue).length,
    completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
    checklistProgress:
      allChecklist.length === 0
        ? 0
        : Math.round((checklistDone / allChecklist.length) * 100),
  };
}

export function computeProjectProgress(
  projects: Project[],
  tasks: Task[],
): ProjectWithProgress[] {
  return projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const doneTasks = projectTasks.filter((task) => task.status === "done").length;

    return {
      ...project,
      totalTasks: projectTasks.length,
      doneTasks,
      progress:
        projectTasks.length === 0
          ? 0
          : Math.round((doneTasks / projectTasks.length) * 100),
      overdueTasks: projectTasks.filter(isTaskOverdue).length,
    };
  });
}

export function computeMemberStats(tasks: Task[], userId: ID): TeamMemberStats {
  const assigned = tasks.filter(
    (task) => task.assigneeId === userId || task.memberIds.includes(userId),
  );

  const completed = assigned.filter((task) => task.status === "done").length;
  const active = assigned.filter((task) => task.status !== "done").length;

  return {
    activeTasks: active,
    completedTasks: completed,
    overdueTasks: assigned.filter(isTaskOverdue).length,
    completionRate:
      assigned.length === 0 ? 0 : Math.round((completed / assigned.length) * 100),
  };
}

export function computeTeamStats(users: User[], tasks: Task[]): TeamMember[] {
  return users.map((user) => ({
    ...user,
    stats: computeMemberStats(tasks, user.id),
  }));
}

/** Deadline-ordered, soonest first — feeds the dashboard's upcoming panel. */
export function getUpcomingTasks<T extends Task>(tasks: T[], limit: number): T[] {
  return tasks
    .filter(
      (task) =>
        task.status !== "done" &&
        task.dueDate !== null &&
        daysFromToday(task.dueDate) >= 0,
    )
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0, limit);
}

/** Non-done tasks whose deadline has passed, most overdue first. */
export function getOverdueTasks<T extends Task>(tasks: T[]): T[] {
  return tasks
    .filter(isTaskOverdue)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
}

export function getDueSoonTasks<T extends Task>(
  tasks: T[],
  withinDays = DUE_SOON_THRESHOLD_DAYS,
): T[] {
  return tasks.filter((task) => {
    if (task.status === "done" || !task.dueDate) return false;
    const days = daysFromToday(task.dueDate);
    return days >= 0 && days <= withinDays;
  });
}

/** Tasks touched today, used for the greeting's contextual sentence. */
export function countDueToday(tasks: Task[]): number {
  const today = todayIso();
  return tasks.filter((task) => task.dueDate === today && task.status !== "done")
    .length;
}

export function countCompletedToday(tasks: Task[]): number {
  const today = todayIso();
  return tasks.filter(
    (task) => task.completedAt !== null && task.completedAt.slice(0, 10) === today,
  ).length;
}

/**
 * Percentage of work each member is carrying, relative to the busiest member.
 * Used for the team page's workload bars.
 */
export function computeWorkload(tasks: Task[], users: User[]): Map<ID, number> {
  const counts = users.map((user) => ({
    id: user.id,
    count: tasks.filter(
      (task) => task.assigneeId === user.id && task.status !== "done",
    ).length,
  }));

  const max = Math.max(1, ...counts.map((entry) => entry.count));

  return new Map(
    counts.map((entry) => [entry.id, Math.round((entry.count / max) * 100)]),
  );
}
