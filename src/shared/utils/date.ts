import { GENERIC_LABELS, TASK_DETAIL_LABELS } from "../shared/constants/labels";
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  dateToIso,
  gregorianToJalali,
  isoToDate,
  persianWeekdayIndex,
} from "./jalali";
import { toPersianDigits } from "./text";

const relativeFormatter = new Intl.RelativeTimeFormat("fa", {
  numeric: "auto",
});

const MS_PER_DAY = 86_400_000;

/** Midnight today, in local time. The reference point for every comparison. */
export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function todayIso(): string {
  return dateToIso(startOfToday());
}

/** Whole days from today to `iso`; negative when the date has passed. */
export function daysFromToday(iso: string): number {
  return Math.round(
    (isoToDate(iso).getTime() - startOfToday().getTime()) / MS_PER_DAY,
  );
}

export function isToday(iso: string): boolean {
  return daysFromToday(iso) === 0;
}

export function isPast(iso: string): boolean {
  return daysFromToday(iso) < 0;
}

export function addDays(iso: string, days: number): string {
  const date = isoToDate(iso);
  date.setDate(date.getDate() + days);
  return dateToIso(date);
}

/** `۲۸ شهریور` — the default compact date shown in lists. */
export function formatJalaliShort(iso: string): string {
  const { jm, jd } = gregorianToJalali(isoToDate(iso));
  return `${toPersianDigits(jd)} ${JALALI_MONTHS[jm - 1]}`;
}

/** `۲۸ شهریور ۱۴۰۴` */
export function formatJalaliFull(iso: string): string {
  const { jy, jm, jd } = gregorianToJalali(isoToDate(iso));
  return `${toPersianDigits(jd)} ${JALALI_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
}

/** `چهارشنبه ۲۸ شهریور ۱۴۰۴` */
export function formatJalaliWithWeekday(iso: string): string {
  const date = isoToDate(iso);
  const weekday = JALALI_WEEKDAYS[persianWeekdayIndex(date)];
  return `${weekday} ${formatJalaliFull(iso)}`;
}

/** `شهریور ۱۴۰۴` — the month picker's header. */
export function formatJalaliMonthYear(jy: number, jm: number): string {
  return `${JALALI_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
}

/** `۱۴:۳۰` */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return toPersianDigits(`${hh}:${mm}`);
}

/**
 * `۳ ساعت پیش` / `دیروز`. Uses the platform's Persian relative formatter, so
 * wording matches what Persian speakers expect without a phrase table.
 */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = then - Date.now();
  const absMs = Math.abs(diffMs);

  if (absMs < 45_000) return GENERIC_LABELS.justNow;

  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, "minute");

  const hours = Math.round(diffMs / 3_600_000);
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, "hour");

  const days = Math.round(diffMs / MS_PER_DAY);
  if (Math.abs(days) < 30) return relativeFormatter.format(days, "day");

  const months = Math.round(diffMs / (MS_PER_DAY * 30));
  if (Math.abs(months) < 12) return relativeFormatter.format(months, "month");

  return relativeFormatter.format(Math.round(diffMs / (MS_PER_DAY * 365)), "year");
}

export type DueTone = "overdue" | "urgent" | "soon" | "normal" | "none";

export interface DueInfo {
  /** Ready-to-render Persian label. */
  label: string;
  tone: DueTone;
  overdue: boolean;
}

/**
 * Turns a due date into both the copy and the colour tone, so every surface
 * that shows a deadline agrees on what "urgent" means. The wording comes from
 * `TASK_DETAIL_LABELS`, which stays the one place a deadline phrase is written.
 */
export function describeDueDate(iso: string | null): DueInfo {
  if (!iso) {
    return { label: GENERIC_LABELS.noDueDate, tone: "none", overdue: false };
  }

  const days = daysFromToday(iso);

  if (days < 0) {
    return {
      label: TASK_DETAIL_LABELS.overdueBy(toPersianDigits(Math.abs(days))),
      tone: "overdue",
      overdue: true,
    };
  }

  if (days === 0) {
    return { label: TASK_DETAIL_LABELS.dueToday, tone: "urgent", overdue: false };
  }

  if (days === 1) {
    return {
      label: TASK_DETAIL_LABELS.dueTomorrow,
      tone: "urgent",
      overdue: false,
    };
  }

  if (days <= 3) {
    return {
      label: TASK_DETAIL_LABELS.remaining(toPersianDigits(days)),
      tone: "soon",
      overdue: false,
    };
  }

  return { label: formatJalaliShort(iso), tone: "normal", overdue: false };
}

/** A done task is never overdue, however old its deadline is. */
export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  return daysFromToday(dueDate) < 0;
}

export function isDueSoon(dueDate: string | null, withinDays: number): boolean {
  if (!dueDate) return false;
  const days = daysFromToday(dueDate);
  return days >= 0 && days <= withinDays;
}

/** Groups a timestamp into the buckets the notification list renders. */
export function relativeDayBucket(iso: string): "today" | "yesterday" | "earlier" {
  const date = new Date(iso);
  const today = startOfToday();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((today.getTime() - target.getTime()) / MS_PER_DAY);

  if (diff <= 0) return "today";
  if (diff === 1) return "yesterday";
  return "earlier";
}
