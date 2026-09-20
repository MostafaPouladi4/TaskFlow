import type { AppNotification } from "../../shared/types";

const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 86_400_000).toISOString();

/**
 * The fixture inbox. `recipientId` is added when the workspace is assembled,
 * since every seeded row belongs to the signed-in user.
 */
export type NotificationSeed = Omit<AppNotification, "recipientId">;

export const NOTIFICATIONS: NotificationSeed[] = [
  {
    id: "n-1",
    type: "mention",
    actorId: "u-2",
    taskId: "t-3",
    meta: {
      taskTitle: "پیاده‌سازی صفحه داشبورد",
      excerpt: "اگر ساختار داده نهایی شده، بگو تا نوع‌ها را همراستا کنم.",
    },
    read: false,
    createdAt: minutesAgo(24),
  },
  {
    id: "n-2",
    type: "assignment",
    actorId: "u-5",
    taskId: "t-3",
    meta: { taskTitle: "پیاده‌سازی صفحه داشبورد" },
    read: false,
    createdAt: hoursAgo(2),
  },
  {
    id: "n-3",
    type: "comment_reply",
    actorId: "u-4",
    taskId: "t-4",
    meta: {
      taskTitle: "اتصال API فهرست وظایف",
      excerpt: "قالب خطا `{ success: false, message, data: null }` است.",
    },
    read: false,
    createdAt: hoursAgo(5),
  },
  {
    id: "n-4",
    type: "due_soon",
    actorId: null,
    taskId: "t-6",
    meta: { taskTitle: "رفع باگ نمایش تاریخ در سافاری" },
    read: false,
    createdAt: hoursAgo(7),
  },
  {
    id: "n-5",
    type: "task_completed",
    actorId: "u-4",
    taskId: "t-25",
    meta: { taskTitle: "رفع خطای ورود با ایمیل سازمانی" },
    read: true,
    createdAt: hoursAgo(28),
  },
  {
    id: "n-6",
    type: "mention",
    actorId: "u-3",
    taskId: "t-3",
    meta: {
      taskTitle: "پیاده‌سازی صفحه داشبورد",
      excerpt: "پیشنهاد می‌کنم بخش «انجام شده» با سبز ملایم نمایش داده بشه.",
    },
    read: true,
    createdAt: hoursAgo(30),
  },
  {
    id: "n-7",
    type: "task_updated",
    actorId: "u-6",
    taskId: "t-5",
    meta: { taskTitle: "بازبینی دسترس‌پذیری صفحه‌ها" },
    read: true,
    createdAt: daysAgo(2),
  },
  {
    id: "n-8",
    type: "assignment",
    actorId: "u-5",
    taskId: "t-23",
    meta: { taskTitle: "بازبینی هفتگی بک‌لاگ" },
    read: true,
    createdAt: daysAgo(2),
  },
  {
    id: "n-9",
    type: "comment_reply",
    actorId: "u-6",
    taskId: "t-6",
    meta: {
      taskTitle: "رفع باگ نمایش تاریخ در سافاری",
      excerpt: "روی سافاری ۱۷ و iOS بازتولید شد.",
    },
    read: true,
    createdAt: daysAgo(3),
  },
  {
    id: "n-10",
    type: "task_completed",
    actorId: "u-7",
    taskId: "t-14",
    meta: { taskTitle: "راه‌اندازی خط لوله استقرار خودکار" },
    read: true,
    createdAt: daysAgo(5),
  },
];
