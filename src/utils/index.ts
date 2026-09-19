export { cn } from "./cn";
export type { ClassValue } from "./cn";

export { createId, nextTaskNumber, seedTaskCounter } from "./id";

export {
  countLabel,
  formatNumber,
  formatPercent,
  getInitials,
  hashToIndex,
  padPersian,
  toLatinDigits,
  toPersianDigits,
  toPlainText,
  truncate,
} from "./text";

export {
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  JALALI_WEEKDAYS_SHORT,
  dateToIso,
  gregorianToJalali,
  isJalaliLeapYear,
  isoToDate,
  jalaliMonthLength,
  jalaliToGregorian,
  persianWeekdayIndex,
} from "./jalali";
export type { JalaliDate } from "./jalali";

export {
  addDays,
  daysFromToday,
  describeDueDate,
  formatJalaliFull,
  formatJalaliMonthYear,
  formatJalaliShort,
  formatJalaliWithWeekday,
  formatRelativeTime,
  formatTime,
  isDueSoon,
  isOverdue,
  isPast,
  isToday,
  relativeDayBucket,
  startOfToday,
  todayIso,
} from "./date";
export type { DueInfo, DueTone } from "./date";

export {
  extractMentionIds,
  filterMentionCandidates,
  findActiveMention,
  insertMention,
  serializeMention,
  stripMentions,
  tokenizeBody,
} from "./mention";
export type { BodyToken, InsertMentionResult } from "./mention";

export { matchesQuery, normalize, scoreFields, scoreMatch } from "./search";

export {
  DEFAULT_SORT,
  EMPTY_FILTERS,
  applyQuickPreset,
  applyTaskFilters,
  compareTasks,
  countActiveFilters,
  filterAndSortTasks,
  groupByStatus,
  hasActiveFilters,
  sortByPriority,
  sortTasks,
  toggleValue,
} from "./filter";
export type { QuickPreset } from "./filter";

export {
  checklistProgress,
  computeMemberStats,
  computeProjectProgress,
  computeTaskStats,
  computeTeamStats,
  computeWorkload,
  countCompletedToday,
  countDoneChecklist,
  countDueToday,
  getDueSoonTasks,
  getOverdueTasks,
  getUpcomingTasks,
  isTaskOverdue,
} from "./statistics";

export { describeActivity, describeActor } from "./activityText";
export type { ActivityDescription, ActivitySegment, Lookup } from "./activityText";

export {
  NOTIFICATION_KIND_LABELS,
  describeNotification,
  notificationTask,
} from "./notificationText";
export type { NotificationContent, NotificationSegment } from "./notificationText";

export {
  clamp,
  groupBy,
  indexBy,
  isEmpty,
  moveItem,
  range,
  resolveAll,
  sortBy,
  sum,
  uniqueBy,
} from "./collection";
