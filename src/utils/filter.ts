import { PRIORITY_META, STATUS_META } from "../constants/taskMeta";
import type {
  ID,
  TaskFilters,
  TaskPriority,
  TaskSort,
  TaskStatus,
  TaskWithRelations,
} from "../types";
import { daysFromToday, todayIso } from "./date";
import { scoreFields } from "./search";

export const EMPTY_FILTERS: TaskFilters = {
  query: "",
  statuses: [],
  priorities: [],
  assigneeIds: [],
  tagIds: [],
  projectIds: [],
  dueFrom: null,
  dueTo: null,
};

export const DEFAULT_SORT: TaskSort = { key: "dueDate", direction: "asc" };

/**
 * A fresh, empty filter set.
 *
 * Prefer this over spreading `EMPTY_FILTERS`: the arrays are shallow-copied, so
 * every caller gets collections it can hand to a state setter without two
 * screens ending up sharing one array.
 */
export function createEmptyFilters(): TaskFilters {
  return {
    ...EMPTY_FILTERS,
    statuses: [],
    priorities: [],
    assigneeIds: [],
    tagIds: [],
    projectIds: [],
  };
}

/** Drives the "۳ فیلتر فعال" badge and the reset button's disabled state. */
export function countActiveFilters(filters: TaskFilters): number {
  return (
    (filters.query.trim() ? 1 : 0) +
    filters.statuses.length +
    filters.priorities.length +
    filters.assigneeIds.length +
    filters.tagIds.length +
    filters.projectIds.length +
    (filters.dueFrom ? 1 : 0) +
    (filters.dueTo ? 1 : 0)
  );
}

export function hasActiveFilters(filters: TaskFilters): boolean {
  return countActiveFilters(filters) > 0;
}

/**
 * Named `matchesTaskQuery` rather than `matchesQuery` so it can't be confused
 * with the raw string matcher in `utils/search`.
 */
function matchesTaskQuery(task: TaskWithRelations, query: string): boolean {
  if (!query.trim()) return true;

  return (
    scoreFields(
      [
        task.title,
        task.description,
        task.code,
        task.assignee?.name ?? "",
        ...task.members.map((member) => member.name),
        ...task.mentions.map((user) => user.name),
        ...task.tags.map((tag) => tag.label),
        task.project?.name ?? "",
      ],
      query,
    ) > 0
  );
}

export function applyTaskFilters(
  tasks: TaskWithRelations[],
  filters: TaskFilters,
): TaskWithRelations[] {
  const { statuses, priorities, assigneeIds, tagIds, projectIds } = filters;

  return tasks.filter((task) => {
    if (!matchesTaskQuery(task, filters.query)) return false;

    if (statuses.length > 0 && !statuses.includes(task.status)) return false;

    if (priorities.length > 0 && !priorities.includes(task.priority)) return false;

    if (assigneeIds.length > 0) {
      const involved = [task.assigneeId, ...task.memberIds].filter(Boolean) as ID[];
      if (!involved.some((id) => assigneeIds.includes(id))) return false;
    }

    if (tagIds.length > 0 && !task.tagIds.some((id) => tagIds.includes(id))) {
      return false;
    }

    if (projectIds.length > 0) {
      if (!task.projectId || !projectIds.includes(task.projectId)) return false;
    }

    if (filters.dueFrom && (!task.dueDate || task.dueDate < filters.dueFrom)) {
      return false;
    }

    if (filters.dueTo && (!task.dueDate || task.dueDate > filters.dueTo)) return false;

    return true;
  });
}

/** Deadline ordering: tasks with no deadline always sink to the bottom. */
function compareDueDate(a: TaskWithRelations, b: TaskWithRelations): number {
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return a.dueDate.localeCompare(b.dueDate);
}

export function compareTasks(
  a: TaskWithRelations,
  b: TaskWithRelations,
  sort: TaskSort,
): number {
  let result = 0;

  switch (sort.key) {
    case "dueDate":
      result = compareDueDate(a, b);
      break;
    case "priority":
      result = PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight;
      break;
    case "status":
      result = STATUS_META[b.status].order - STATUS_META[a.status].order;
      break;
    case "title":
      result = a.title.localeCompare(b.title, "fa");
      break;
    case "createdAt":
      result = a.createdAt.localeCompare(b.createdAt);
      break;
  }

  if (result === 0) {
    // Stable tiebreak so equal-ranked rows never reshuffle between renders.
    result = a.code.localeCompare(b.code);
  }

  return sort.direction === "asc" ? result : -result;
}

export function sortTasks(
  tasks: TaskWithRelations[],
  sort: TaskSort,
): TaskWithRelations[] {
  return [...tasks].sort((a, b) => compareTasks(a, b, sort));
}

export function filterAndSortTasks(
  tasks: TaskWithRelations[],
  filters: TaskFilters,
  sort: TaskSort,
): TaskWithRelations[] {
  return sortTasks(applyTaskFilters(tasks, filters), sort);
}

export type QuickPreset = "all" | "overdue" | "today" | "week" | "mine";

/** One-tap filters that sit above the full filter panel. */
export function applyQuickPreset(
  tasks: TaskWithRelations[],
  preset: QuickPreset,
  currentUserId: ID,
): TaskWithRelations[] {
  const today = todayIso();

  switch (preset) {
    case "all":
      return tasks;
    case "overdue":
      return tasks.filter(
        (task) =>
          task.status !== "done" && task.dueDate !== null && task.dueDate < today,
      );
    case "today":
      return tasks.filter((task) => task.dueDate === today);
    case "week":
      return tasks.filter(
        (task) =>
          task.dueDate !== null &&
          daysFromToday(task.dueDate) >= 0 &&
          daysFromToday(task.dueDate) <= 7,
      );
    case "mine":
      return tasks.filter(
        (task) =>
          task.assigneeId === currentUserId ||
          task.memberIds.includes(currentUserId),
      );
  }
}

/**
 * One rendered section of the task list.
 *
 * `status` is `null` for the ungrouped case, so the list can render either
 * shape through a single code path.
 */
export interface TaskStatusGroup {
  status: TaskStatus | null;
  tasks: TaskWithRelations[];
}

export function groupByStatus(
  tasks: TaskWithRelations[],
): TaskStatusGroup[] {
  const order: TaskStatus[] = [
    "todo",
    "in_progress",
    "in_review",
    "blocked",
    "done",
  ];

  return order
    .map((status) => ({
      status,
      tasks: tasks.filter((task) => task.status === status),
    }))
    .filter((group) => group.tasks.length > 0);
}

/** Toggles a value in a filter array — the shared multi-select behaviour. */
export function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function sortByPriority(tasks: TaskWithRelations[]): TaskWithRelations[] {
  return [...tasks].sort(
    (a, b) => PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight,
  );
}

export type { TaskPriority };
