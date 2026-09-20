import { GREETING_LABELS } from "../shared/constants/labels";
import type { TaskStats } from "../../shared/types";
import { toPersianDigits } from "./text";

export type DayPart = "morning" | "afternoon" | "evening" | "night";

/** Hour boundaries are local time — this is a greeting, not a timestamp. */
const DAY_PART_BOUNDS: { part: DayPart; from: number }[] = [
  { part: "night", from: 0 },
  { part: "morning", from: 5 },
  { part: "afternoon", from: 12 },
  { part: "evening", from: 17 },
  { part: "night", from: 21 },
];

export function dayPart(date: Date = new Date()): DayPart {
  const hour = date.getHours();

  let current: DayPart = "night";
  for (const bound of DAY_PART_BOUNDS) {
    if (hour >= bound.from) current = bound.part;
  }

  return current;
}

export function salutation(date: Date = new Date()): string {
  return GREETING_LABELS[dayPart(date)];
}

/** "مصطفی کریمی" → "مصطفی" — a greeting addresses people by first name. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/**
 * The sentence under the greeting.
 *
 * Ordered by what the user should do next rather than by how impressive the
 * number is: something late matters more than something merely in flight, and
 * a finished task is only worth mentioning once the urgent part is said.
 */
export function greetingContext(
  stats: TaskStats,
  dueToday: number,
  completedToday: number,
): string {
  const primary =
    stats.overdue > 0
      ? GREETING_LABELS.overdue(toPersianDigits(stats.overdue))
      : dueToday > 0
        ? GREETING_LABELS.dueToday(toPersianDigits(dueToday))
        : stats.inProgress > 0
          ? GREETING_LABELS.inProgress(toPersianDigits(stats.inProgress))
          : GREETING_LABELS.allClear;

  return completedToday > 0
    ? `${primary} ${GREETING_LABELS.completedToday(toPersianDigits(completedToday))}`
    : primary;
}
