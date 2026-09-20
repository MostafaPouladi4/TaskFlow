import type { ChecklistItem, ID, Task, TaskPriority, TaskStatus } from "../../shared/types";
import { createId } from "../shared/utils/id";

/**
 * Tasks are declared as compact seeds and expanded by `buildTasks`, which
 * keeps the fixture readable while still producing fully-formed `Task`
 * records. Dates are expressed as day-offsets from today so the set always
 * contains a realistic mix of overdue, due-today and future work.
 */
interface TaskSeed {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: ID | null;
  projectId: ID | null;
  /** Days from today; negative is in the past. */
  start: number;
  /** `null` means the task has no deadline. */
  due: number | null;
  tagIds: string[];
  memberIds?: string[];
  mentionIds?: string[];
  checklist?: [title: string, done: boolean][];
  createdDaysAgo: number;
  completedDaysAgo?: number;
}

const dayOffset = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

/** ISO timestamp `days` ago, pinned to a plausible working hour. */
const daysAgo = (days: number, hour = 10, minute = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const SEEDS: TaskSeed[] = [
  // ── بازطراحی پنل کاربری ────────────────────────────────────────────────
  {
    id: "t-1",
    title: "طراحی رابط کاربری صفحه ورود",
    description:
      "طراحی کامل صفحه ورود شامل فرم ایمیل و رمز عبور، ورود با حساب گوگل و حالت بازیابی رمز عبور. طراحی باید با پوسته روشن و تاریک هماهنگ باشد.",
    status: "done",
    priority: "high",
    assigneeId: "u-3",
    projectId: "p-1",
    start: -38,
    due: -31,
    tagIds: ["t-3"],
    memberIds: ["u-1", "u-5"],
    checklist: [
      ["طراحی اولیه در فیگما", true],
      ["بازخورد مدیر محصول", true],
      ["آماده‌سازی فایل‌های نهایی", true],
    ],
    createdDaysAgo: 38,
    completedDaysAgo: 30,
  },
  {
    id: "t-2",
    title: "ساخت کامپوننت‌های پایه فرم",
    description:
      "پیاده‌سازی کامپوننت‌های ورودی، انتخابگر، چک‌باکس و دکمه با پشتیبانی کامل از حالت‌های خطا و غیرفعال.",
    status: "done",
    priority: "high",
    assigneeId: "u-1",
    projectId: "p-1",
    start: -30,
    due: -22,
    tagIds: ["t-1"],
    memberIds: ["u-2"],
    checklist: [
      ["کامپوننت ورودی متن", true],
      ["کامپوننت انتخابگر", true],
      ["حالت‌های خطا و اعتبارسنجی", true],
    ],
    createdDaysAgo: 30,
    completedDaysAgo: 21,
  },
  {
    id: "t-3",
    title: "پیاده‌سازی صفحه داشبورد",
    description:
      "ساخت صفحه داشبورد اصلی شامل کارت‌های آماری، نمودار پیشرفت، فعالیت‌های اخیر و فهرست مهلت‌های نزدیک.",
    status: "in_progress",
    priority: "urgent",
    assigneeId: "u-1",
    projectId: "p-1",
    start: -9,
    due: 2,
    tagIds: ["t-1"],
    memberIds: ["u-2", "u-3"],
    mentionIds: ["u-2", "u-5"],
    checklist: [
      ["چیدمان کلی و شبکه", true],
      ["کارت‌های آماری", true],
      ["نمودار پیشرفت", false],
      ["فعالیت‌های اخیر", false],
      ["اتصال به داده‌های واقعی", false],
    ],
    createdDaysAgo: 9,
  },
  {
    id: "t-4",
    title: "اتصال API فهرست وظایف",
    description:
      "اتصال صفحه فهرست وظایف به نقاط پایانی سرور، شامل صفحه‌بندی، مرتب‌سازی و مدیریت خطا.",
    status: "in_progress",
    priority: "high",
    assigneeId: "u-2",
    projectId: "p-1",
    start: -12,
    due: -2,
    tagIds: ["t-1", "t-4"],
    memberIds: ["u-4"],
    mentionIds: ["u-4"],
    checklist: [
      ["تعریف نوع داده‌ها", true],
      ["درخواست دریافت فهرست", true],
      ["صفحه‌بندی", false],
      ["مدیریت خطا", false],
    ],
    createdDaysAgo: 12,
  },
  {
    id: "t-5",
    title: "بازبینی دسترس‌پذیری صفحه‌ها",
    description:
      "بررسی همه صفحه‌ها از نظر ناوبری با صفحه‌کلید، برچسب‌های ARIA و نسبت کنتراست رنگ‌ها.",
    status: "in_review",
    priority: "medium",
    assigneeId: "u-6",
    projectId: "p-1",
    start: -6,
    due: 1,
    tagIds: ["t-1"],
    memberIds: ["u-1"],
    checklist: [
      ["ناوبری با صفحه‌کلید", true],
      ["برچسب‌های ARIA", true],
      ["کنتراست رنگ‌ها", false],
    ],
    createdDaysAgo: 6,
  },
  {
    id: "t-6",
    title: "رفع باگ نمایش تاریخ در سافاری",
    description:
      "تاریخ‌های شمسی در مرورگر سافاری با فرمت اشتباه نمایش داده می‌شوند. نیاز به بازنویسی منطق قالب‌بندی تاریخ.",
    status: "todo",
    priority: "urgent",
    assigneeId: "u-2",
    projectId: "p-1",
    start: -2,
    due: 0,
    tagIds: ["t-5"],
    memberIds: ["u-1"],
    mentionIds: ["u-1"],
    createdDaysAgo: 3,
  },
  {
    id: "t-7",
    title: "بهینه‌سازی بارگذاری اولیه صفحه",
    description:
      "کاهش حجم بسته جاوااسکریپت و تقسیم کد بر اساس مسیرها برای بهبود شاخص‌های عملکرد.",
    status: "in_progress",
    priority: "medium",
    assigneeId: "u-1",
    projectId: "p-1",
    start: -4,
    due: 6,
    tagIds: ["t-6", "t-1"],
    checklist: [
      ["تحلیل بسته فعلی", true],
      ["تقسیم کد مسیرها", false],
      ["بارگذاری تنبل تصاویر", false],
    ],
    createdDaysAgo: 5,
  },
  {
    id: "t-8",
    title: "نوشتن مستندات کامپوننت‌ها",
    description:
      "تهیه مستندات فارسی برای همه کامپوننت‌های پایه شامل نمونه استفاده و توضیح خصیصه‌ها.",
    status: "todo",
    priority: "low",
    assigneeId: "u-5",
    projectId: "p-1",
    start: -1,
    due: 14,
    tagIds: ["t-7"],
    createdDaysAgo: 2,
  },

  // ── اپلیکیشن موبایل ────────────────────────────────────────────────────
  {
    id: "t-9",
    title: "طراحی جریان ثبت‌نام موبایل",
    description:
      "طراحی گام‌به‌گام فرایند ثبت‌نام با در نظر گرفتن ورود شماره موبایل و تأیید پیامکی.",
    status: "done",
    priority: "high",
    assigneeId: "u-3",
    projectId: "p-2",
    start: -18,
    due: -11,
    tagIds: ["t-3"],
    memberIds: ["u-5"],
    checklist: [
      ["طراحی گام‌ها", true],
      ["حالت‌های خطا", true],
      ["تأیید نهایی", true],
    ],
    createdDaysAgo: 18,
    completedDaysAgo: 10,
  },
  {
    id: "t-10",
    title: "پیاده‌سازی ناوبری پایین صفحه",
    description:
      "ساخت نوار ناوبری پایین صفحه برای موبایل با پشتیبانی از حرکات کشیدن و نشانگر صفحه فعال.",
    status: "in_progress",
    priority: "high",
    assigneeId: "u-1",
    projectId: "p-2",
    start: -7,
    due: 4,
    tagIds: ["t-1"],
    memberIds: ["u-3"],
    checklist: [
      ["ساختار نوار ناوبری", true],
      ["انتقال بین صفحه‌ها", false],
      ["پشتیبانی از حرکات لمسی", false],
    ],
    createdDaysAgo: 7,
  },
  {
    id: "t-11",
    title: "ذخیره‌سازی آفلاین با IndexedDB",
    description:
      "پیاده‌سازی لایه ذخیره‌سازی محلی برای دسترسی به وظایف در حالت بدون اینترنت و همگام‌سازی خودکار.",
    status: "todo",
    priority: "medium",
    assigneeId: "u-4",
    projectId: "p-2",
    start: -3,
    due: 9,
    tagIds: ["t-2"],
    memberIds: ["u-1"],
    createdDaysAgo: 4,
  },
  {
    id: "t-12",
    title: "تست عملکرد روی دستگاه‌های میان‌رده",
    description:
      "سنجش سرعت اجرا و مصرف حافظه روی دستگاه‌های اندروید میان‌رده. منتظر دسترسی به دستگاه‌های آزمایشگاه.",
    status: "blocked",
    priority: "medium",
    assigneeId: "u-6",
    projectId: "p-2",
    start: -10,
    due: 3,
    tagIds: ["t-6"],
    memberIds: ["u-7"],
    checklist: [
      ["تهیه دستگاه‌های آزمایش", false],
      ["اجرای سناریوهای تست", false],
      ["گزارش نتایج", false],
    ],
    createdDaysAgo: 10,
  },
  {
    id: "t-13",
    title: "طراحی آیکون‌های اختصاصی",
    description: "طراحی مجموعه آیکون اختصاصی تسک‌فلو با وزن خطی یکسان.",
    status: "in_review",
    priority: "low",
    assigneeId: "u-3",
    projectId: "p-2",
    start: -14,
    due: 11,
    tagIds: ["t-3"],
    createdDaysAgo: 14,
  },

  // ── زیرساخت و مقیاس‌پذیری ──────────────────────────────────────────────
  {
    id: "t-14",
    title: "راه‌اندازی خط لوله استقرار خودکار",
    description:
      "پیکربندی خط لوله یکپارچه‌سازی و استقرار پیوسته شامل اجرای تست‌ها و انتشار خودکار نسخه‌ها.",
    status: "done",
    priority: "urgent",
    assigneeId: "u-7",
    projectId: "p-3",
    start: -55,
    due: -40,
    tagIds: ["t-8"],
    memberIds: ["u-4"],
    checklist: [
      ["پیکربندی اجرای تست‌ها", true],
      ["انتشار خودکار", true],
      ["اعلان‌های شکست build", true],
    ],
    createdDaysAgo: 55,
    completedDaysAgo: 39,
  },
  {
    id: "t-15",
    title: "مهاجرت پایگاه داده به کلاستر جدید",
    description:
      "انتقال داده‌ها به کلاستر جدید با کمترین زمان از کار افتادگی و بازبینی کامل یکپارچگی داده‌ها.",
    status: "in_progress",
    priority: "urgent",
    assigneeId: "u-8",
    projectId: "p-3",
    start: -12,
    due: -1,
    tagIds: ["t-8", "t-2"],
    memberIds: ["u-4", "u-7"],
    mentionIds: ["u-7"],
    checklist: [
      ["تهیه نسخه پشتیبان", true],
      ["اجرای مهاجرت روی محیط آزمایشی", true],
      ["مهاجرت نهایی", false],
      ["بازبینی یکپارچگی", false],
    ],
    createdDaysAgo: 12,
  },
  {
    id: "t-16",
    title: "پیاده‌سازی کش توزیع‌شده",
    description:
      "افزودن لایه کش توزیع‌شده برای کاهش بار پایگاه داده در نقاط پایانی پرترافیک.",
    status: "todo",
    priority: "high",
    assigneeId: "u-4",
    projectId: "p-3",
    start: -2,
    due: 8,
    tagIds: ["t-6", "t-2"],
    createdDaysAgo: 3,
  },
  {
    id: "t-17",
    title: "مانیتورینگ و هشدارهای سرور",
    description:
      "راه‌اندازی سامانه پایش منابع سرور و تعریف هشدارهای خودکار برای مصرف غیرعادی.",
    status: "in_progress",
    priority: "medium",
    assigneeId: "u-7",
    projectId: "p-3",
    start: -8,
    due: 5,
    tagIds: ["t-8"],
    checklist: [
      ["نصب سامانه پایش", true],
      ["تعریف شاخص‌های کلیدی", false],
      ["تنظیم هشدارها", false],
    ],
    createdDaysAgo: 8,
  },
  {
    id: "t-18",
    title: "مستندسازی معماری خرد‌خدمات",
    description:
      "تهیه مستندات معماری شامل نمودار سرویس‌ها، قراردادهای ارتباطی و جریان داده.",
    status: "todo",
    priority: "low",
    assigneeId: "u-8",
    projectId: "p-3",
    start: -1,
    due: null,
    tagIds: ["t-7", "t-8"],
    createdDaysAgo: 2,
  },
  {
    id: "t-19",
    title: "بازبینی امنیت نقاط پایانی",
    description:
      "بررسی نقاط پایانی از نظر احراز هویت، سطح دسترسی و مقاومت در برابر حملات تزریق.",
    status: "in_review",
    priority: "urgent",
    assigneeId: "u-4",
    projectId: "p-3",
    start: -9,
    due: 2,
    tagIds: ["t-2"],
    memberIds: ["u-7", "u-8"],
    checklist: [
      ["بررسی احراز هویت", true],
      ["بررسی سطح دسترسی", true],
      ["آزمون تزریق", false],
      ["گزارش نهایی", false],
    ],
    createdDaysAgo: 9,
  },

  // ── داشبورد هوش تجاری ──────────────────────────────────────────────────
  {
    id: "t-20",
    title: "تعریف شاخص‌های کلیدی عملکرد",
    description:
      "تعیین شاخص‌های اصلی برای سنجش بهره‌وری تیم و پیشرفت پروژه‌ها همراه با فرمول محاسبه هر شاخص.",
    status: "todo",
    priority: "medium",
    assigneeId: "u-5",
    projectId: "p-4",
    start: 2,
    due: 12,
    tagIds: ["t-7"],
    memberIds: ["u-6"],
    createdDaysAgo: 3,
  },
  {
    id: "t-21",
    title: "طراحی مدل داده گزارش‌ها",
    description:
      "طراحی ساختار داده مورد نیاز برای تولید گزارش‌های تحلیلی با در نظر گرفتن سرعت پرس‌وجو.",
    status: "todo",
    priority: "medium",
    assigneeId: "u-8",
    projectId: "p-4",
    start: 1,
    due: 18,
    tagIds: ["t-2"],
    createdDaysAgo: 3,
  },
  {
    id: "t-22",
    title: "نمونه‌سازی نمودارهای تحلیلی",
    description:
      "ساخت نمونه اولیه نمودارهای خطی و میله‌ای برای نمایش روند پیشرفت پروژه‌ها.",
    status: "in_progress",
    priority: "low",
    assigneeId: "u-6",
    projectId: "p-4",
    start: -3,
    due: 7,
    tagIds: ["t-3"],
    memberIds: ["u-5"],
    createdDaysAgo: 4,
  },

  // ── وظایف عمومی ────────────────────────────────────────────────────────
  {
    id: "t-23",
    title: "بازبینی هفتگی بک‌لاگ",
    description:
      "مرور وظایف باقی‌مانده، به‌روزرسانی اولویت‌ها و حذف موارد منقضی‌شده از بک‌لاگ.",
    status: "todo",
    priority: "medium",
    assigneeId: "u-5",
    projectId: null,
    start: 0,
    due: 3,
    tagIds: [],
    memberIds: ["u-1", "u-2", "u-3"],
    createdDaysAgo: 2,
  },
  {
    id: "t-24",
    title: "پاسخ به بازخورد کاربران",
    description:
      "بررسی بازخوردهای ثبت‌شده در هفته گذشته و دسته‌بندی آن‌ها برای ورود به چرخه توسعه.",
    status: "in_progress",
    priority: "high",
    assigneeId: "u-5",
    projectId: null,
    start: -3,
    due: 0,
    tagIds: [],
    memberIds: ["u-6"],
    createdDaysAgo: 3,
  },
  {
    id: "t-25",
    title: "رفع خطای ورود با ایمیل سازمانی",
    description:
      "کاربران دارای دامنه سازمانی نمی‌توانستند وارد شوند. علت، اعتبارسنجی نادرست دامنه بود.",
    status: "done",
    priority: "urgent",
    assigneeId: "u-4",
    projectId: null,
    start: -6,
    due: -4,
    tagIds: ["t-5"],
    memberIds: ["u-6"],
    checklist: [
      ["بازتولید خطا", true],
      ["یافتن علت", true],
      ["اعمال اصلاح", true],
      ["تست نهایی", true],
    ],
    createdDaysAgo: 6,
    completedDaysAgo: 4,
  },
  {
    id: "t-26",
    title: "آماده‌سازی نسخه ۱.۲",
    description:
      "جمع‌بندی تغییرات، تهیه یادداشت انتشار و هماهنگی زمان انتشار نسخه جدید.",
    status: "todo",
    priority: "high",
    assigneeId: null,
    projectId: null,
    start: 5,
    due: 25,
    tagIds: ["t-7"],
    createdDaysAgo: 1,
  },
];

function buildChecklist(items: [string, boolean][] | undefined): ChecklistItem[] {
  if (!items) return [];

  return items.map(([title, done]) => ({ id: createId("chk"), title, done }));
}

export const TASKS: Task[] = SEEDS.map((seed, index) => ({
  id: seed.id,
  code: `TF-${101 + index}`,
  projectId: seed.projectId,
  title: seed.title,
  description: seed.description,
  status: seed.status,
  priority: seed.priority,
  assigneeId: seed.assigneeId,
  memberIds: seed.memberIds ?? [],
  mentionIds: seed.mentionIds ?? [],
  startDate: dayOffset(seed.start),
  dueDate: seed.due === null ? null : dayOffset(seed.due),
  tagIds: seed.tagIds,
  checklist: buildChecklist(seed.checklist),
  // Populated in `data/index.ts` once comments exist, so the two collections
  // can never drift apart.
  commentIds: [],
  createdById: seed.assigneeId ?? "u-5",
  createdAt: daysAgo(seed.createdDaysAgo, 9, 30),
  updatedAt: daysAgo(Math.max(0, seed.createdDaysAgo - 2), 14, 15),
  completedAt:
    seed.completedDaysAgo === undefined
      ? null
      : daysAgo(seed.completedDaysAgo, 16, 45),
}));

/** Seeds exported for the stores that need to regenerate fixtures. */
export { SEEDS as TASK_SEEDS };
export { dayOffset, daysAgo };
