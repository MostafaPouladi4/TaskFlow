import type { Comment } from "../types";
import { createId } from "../utils/id";

interface CommentSeed {
  taskId: string;
  authorId: string;
  /** Mentions are written as `@[نام](شناسه)` — the stored wire format. */
  body: string;
  parentId?: string;
  hoursAgo: number;
  edited?: boolean;
  reactions?: [emoji: string, userIds: string[]][];
}

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

const SEEDS: CommentSeed[] = [
  // ── داشبورد ────────────────────────────────────────────────────────────
  {
    taskId: "t-3",
    authorId: "u-5",
    body: "چیدمان کلی خیلی خوب شده. فقط فاصله بین کارت‌های آماری کمی کم است؛ اگر به ۱۶ پیکسل برسانیم خواناتر می‌شود.",
    hoursAgo: 52,
    reactions: [["👍", ["u-1", "u-3"]]],
  },
  {
    taskId: "t-3",
    authorId: "u-1",
    body: "حتماً، اصلاح می‌کنم. @[سارا محمدی](u-3) نظرت درباره رنگ نمودار پیشرفت چیه؟ فعلاً آبی برند است.",
    hoursAgo: 46,
    reactions: [["🚀", ["u-5"]]],
  },
  {
    taskId: "t-3",
    authorId: "u-3",
    body: "آبی برند خوبه، ولی برای تفکیک بهتر پیشنهاد می‌کنم بخش «انجام شده» با سبز ملایم نمایش داده بشه تا در یک نگاه قابل تشخیص باشه.",
    parentId: "c-2",
    hoursAgo: 44,
    reactions: [
      ["💡", ["u-1", "u-5"]],
      ["👍", ["u-2"]],
    ],
  },
  {
    taskId: "t-3",
    authorId: "u-2",
    body: "من روی بخش کارت‌های آماری کار می‌کنم. @[مصطفی کریمی](u-1) اگر ساختار داده نهایی شده، بگو تا نوع‌ها را همراستا کنم.",
    hoursAgo: 20,
  },
  {
    taskId: "t-3",
    authorId: "u-1",
    body: "ساختار داده نهایی شده و در پوشه `types` قرار داره. می‌تونی مستقیم استفاده کنی.",
    parentId: "c-5",
    hoursAgo: 18,
    reactions: [["✅", ["u-2"]]],
  },

  // ── اتصال API ──────────────────────────────────────────────────────────
  {
    taskId: "t-4",
    authorId: "u-4",
    body: "نقطه پایانی فهرست وظایف آماده است. پارامترهای `page` و `pageSize` و `sort` پشتیبانی می‌شوند.",
    hoursAgo: 74,
    reactions: [["🎉", ["u-2"]]],
  },
  {
    taskId: "t-4",
    authorId: "u-2",
    body: "ممنون. @[رضا احمدی](u-4) برای حالت خطا چه ساختاری برمی‌گردانید؟ لازم دارم پیام فارسی مناسب نمایش بدم.",
    hoursAgo: 70,
  },
  {
    taskId: "t-4",
    authorId: "u-4",
    body: "قالب خطا `{ success: false, message, data: null }` است. پیام‌ها فعلاً انگلیسی‌اند ولی می‌توانم نسخه فارسی هم اضافه کنم.",
    parentId: "c-8",
    hoursAgo: 66,
    edited: true,
    reactions: [["👍", ["u-2", "u-1"]]],
  },

  // ── باگ تاریخ ──────────────────────────────────────────────────────────
  {
    taskId: "t-6",
    authorId: "u-6",
    body: "روی سافاری ۱۷ و iOS بازتولید شد. مشکل از الگوی `Intl` است که در این مرورگر نتیجه متفاوتی می‌دهد.",
    hoursAgo: 30,
    reactions: [["👀", ["u-2"]]],
  },
  {
    taskId: "t-6",
    authorId: "u-1",
    body: "پیشنهاد می‌کنم به‌جای اتکا به `Intl`، تبدیل تقویم را خودمان انجام دهیم تا در همه مرورگرها یکسان باشد. @[علی رضایی](u-2) موافقی؟",
    hoursAgo: 26,
  },
  {
    taskId: "t-6",
    authorId: "u-2",
    body: "کاملاً موافقم. اینطور رفتار تاریخ در همه مرورگرها قابل پیش‌بینی می‌شود.",
    parentId: "c-11",
    hoursAgo: 22,
    reactions: [["✅", ["u-1"]]],
  },

  // ── تست عملکرد ─────────────────────────────────────────────────────────
  {
    taskId: "t-12",
    authorId: "u-6",
    body: "این وظیفه مسدود شده چون هنوز به دستگاه‌های آزمایشگاه دسترسی نداریم. @[نگار صادقی](u-7) امکان تهیه دستگاه تا پایان هفته هست؟",
    hoursAgo: 40,
  },
  {
    taskId: "t-12",
    authorId: "u-7",
    body: "دو دستگاه آزمایشی سفارش داده شده و تا سه روز آینده می‌رسد. بعد از تحویل اطلاع می‌دهم.",
    parentId: "c-13",
    hoursAgo: 36,
    reactions: [
      ["🙏", ["u-6"]],
      ["👍", ["u-5"]],
    ],
  },

  // ── مهاجرت پایگاه داده ─────────────────────────────────────────────────
  {
    taskId: "t-15",
    authorId: "u-7",
    body: "نسخه پشتیبان گرفته شد و مهاجرت روی محیط آزمایشی بدون خطا انجام شد. زمان تقریبی توقف سرویس حدود ۴ دقیقه است.",
    hoursAgo: 58,
    reactions: [["🚀", ["u-4", "u-8"]]],
  },
  {
    taskId: "t-15",
    authorId: "u-8",
    body: "پنجره زمانی مناسب برای مهاجرت نهایی را هماهنگ کنیم. @[نگار صادقی](u-7) پیشنهاد من بامداد جمعه است.",
    hoursAgo: 12,
  },

  // ── بازبینی امنیت ──────────────────────────────────────────────────────
  {
    taskId: "t-19",
    authorId: "u-4",
    body: "بررسی احراز هویت و سطح دسترسی تمام شد. دو مورد نیازمند اصلاح پیدا شد که در گزارش ثبت کردم.",
    hoursAgo: 16,
  },
  {
    taskId: "t-19",
    authorId: "u-7",
    body: "آزمون تزریق را من انجام می‌دهم. نتیجه را تا فردا اضافه می‌کنم.",
    hoursAgo: 8,
    reactions: [["👍", ["u-4"]]],
  },

  // ── بازخورد کاربران ────────────────────────────────────────────────────
  {
    taskId: "t-24",
    authorId: "u-5",
    body: "بیشترین درخواست کاربران مربوط به حالت تاریک و جستجوی سریع بوده است. هر دو در نسخه بعدی در نظر گرفته می‌شوند.",
    hoursAgo: 6,
    reactions: [
      ["🎉", ["u-1", "u-3", "u-6"]],
      ["❤️", ["u-2"]],
    ],
  },
];

/** Ids are generated once and reused, so replies can point at their parent. */
const IDS = SEEDS.map((_seed, index) => `c-${index + 1}`);

export const COMMENTS: Comment[] = SEEDS.map((seed, index) => {
  const parentIndex = seed.parentId
    ? Number.parseInt(seed.parentId.replace("c-", ""), 10) - 1
    : -1;

  return {
    id: IDS[index],
    taskId: seed.taskId,
    authorId: seed.authorId,
    body: seed.body,
    parentId: parentIndex >= 0 ? IDS[parentIndex] : null,
    createdAt: hoursAgo(seed.hoursAgo),
    updatedAt: seed.edited ? hoursAgo(seed.hoursAgo - 1) : null,
    edited: seed.edited ?? false,
    reactions: (seed.reactions ?? []).map(([emoji, userIds]) => ({
      emoji,
      userIds,
    })),
  };
});

/** Unused in fixtures, but keeps the id generator part of the data layer. */
export const createCommentId = (): string => createId("c");
