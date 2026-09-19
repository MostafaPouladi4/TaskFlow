import type { Project } from "../types";

const day = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const PROJECTS: Project[] = [
  {
    id: "p-1",
    name: "بازطراحی پنل کاربری",
    description:
      "به‌روزرسانی کامل رابط پنل کاربری با تمرکز بر سرعت بارگذاری و دسترس‌پذیری.",
    tone: "brand",
    status: "active",
    leadId: "u-2",
    memberIds: ["u-1", "u-2", "u-3", "u-6"],
    startDate: day(-42),
    dueDate: day(28),
    createdAt: new Date(Date.now() - 42 * 86_400_000).toISOString(),
  },
  {
    id: "p-2",
    name: "اپلیکیشن موبایل",
    description: "نسخه موبایل تسک‌فلو با تجربه کاربری بومی و حالت آفلاین.",
    tone: "violet",
    status: "active",
    leadId: "u-3",
    memberIds: ["u-3", "u-1", "u-4", "u-6"],
    startDate: day(-21),
    dueDate: day(56),
    createdAt: new Date(Date.now() - 21 * 86_400_000).toISOString(),
  },
  {
    id: "p-3",
    name: "زیرساخت و مقیاس‌پذیری",
    description: "مهاجرت به معماری خرد‌خدمات و راه‌اندازی خط لوله استقرار خودکار.",
    tone: "emerald",
    status: "active",
    leadId: "u-7",
    memberIds: ["u-4", "u-7", "u-8"],
    startDate: day(-63),
    dueDate: day(14),
    createdAt: new Date(Date.now() - 63 * 86_400_000).toISOString(),
  },
  {
    id: "p-4",
    name: "داشبورد هوش تجاری",
    description: "گزارش‌های تحلیلی و شاخص‌های کلیدی عملکرد برای مدیران.",
    tone: "amber",
    status: "planning",
    leadId: "u-5",
    memberIds: ["u-5", "u-6", "u-8"],
    startDate: day(7),
    dueDate: null,
    createdAt: new Date(Date.now() - 4 * 86_400_000).toISOString(),
  },
];
