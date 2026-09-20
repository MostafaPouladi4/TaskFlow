import type { TaskPriority, TaskStatus } from "../../shared/types";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "./labels";

/**
 * Presentation metadata for the status enum. Tone classes live here (not in
 * components) so a status looks identical everywhere it appears. The copy
 * itself is pulled from `labels`, which stays the one place a string is
 * written down.
 */
export interface StatusMeta {
  value: TaskStatus;
  label: string;
  /** Badge surface: text + background + border, valid in both themes. */
  badge: string;
  /** Solid dot / bar colour. */
  dot: string;
  /** Order used when grouping a board or sorting by workflow stage. */
  order: number;
}

export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  todo: {
    value: "todo",
    label: TASK_STATUS_LABELS.todo,
    badge:
      "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300",
    dot: "bg-slate-400",
    order: 0,
  },
  in_progress: {
    value: "in_progress",
    label: TASK_STATUS_LABELS.in_progress,
    badge: "bg-brand-500/10 text-brand-700 border-brand-500/25 dark:text-brand-300",
    dot: "bg-brand-500",
    order: 1,
  },
  in_review: {
    value: "in_review",
    label: TASK_STATUS_LABELS.in_review,
    badge:
      "bg-violet-500/10 text-violet-700 border-violet-500/25 dark:text-violet-300",
    dot: "bg-violet-500",
    order: 2,
  },
  blocked: {
    value: "blocked",
    label: TASK_STATUS_LABELS.blocked,
    badge: "bg-rose-500/10 text-rose-700 border-rose-500/25 dark:text-rose-300",
    dot: "bg-rose-500",
    order: 3,
  },
  done: {
    value: "done",
    label: TASK_STATUS_LABELS.done,
    badge:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300",
    dot: "bg-emerald-500",
    order: 4,
  },
};

export const STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "blocked",
  "done",
];

export interface PriorityMeta {
  value: TaskPriority;
  label: string;
  badge: string;
  dot: string;
  /** Higher = more urgent. Used as the sort weight. */
  weight: number;
  /** Short glyph shown in dense rows. */
  glyph: string;
}

export const PRIORITY_META: Record<TaskPriority, PriorityMeta> = {
  urgent: {
    value: "urgent",
    label: TASK_PRIORITY_LABELS.urgent,
    badge: "bg-rose-500/10 text-rose-700 border-rose-500/25 dark:text-rose-300",
    dot: "bg-rose-500",
    weight: 3,
    glyph: "!!",
  },
  high: {
    value: "high",
    label: TASK_PRIORITY_LABELS.high,
    badge:
      "bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300",
    dot: "bg-amber-500",
    weight: 2,
    glyph: "!",
  },
  medium: {
    value: "medium",
    label: TASK_PRIORITY_LABELS.medium,
    badge: "bg-brand-500/10 text-brand-700 border-brand-500/25 dark:text-brand-300",
    dot: "bg-brand-500",
    weight: 1,
    glyph: "=",
  },
  low: {
    value: "low",
    label: TASK_PRIORITY_LABELS.low,
    badge:
      "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300",
    dot: "bg-slate-400",
    weight: 0,
    glyph: "↓",
  },
};

export const PRIORITY_ORDER: TaskPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
];
