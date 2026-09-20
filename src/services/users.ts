import type { User } from "../../shared/types";
import { getInitials } from "../shared/utils/text";

/**
 * Simulated delay for the mock data layer. Long enough that skeleton states
 * are actually observable during development, short enough not to annoy.
 */
export const MOCK_LATENCY_MS = 420;

const raw: Omit<User, "avatar">[] = [
  {
    id: "u-1",
    name: "مصطفی کریمی",
    role: "frontend",
    title: "توسعه‌دهنده فرانت‌اند",
    email: "mostafa@taskflow.ir",
    presence: "online",
  },
  {
    id: "u-2",
    name: "علی رضایی",
    role: "frontend",
    title: "توسعه‌دهنده فرانت‌اند",
    email: "ali@taskflow.ir",
    presence: "online",
  },
  {
    id: "u-3",
    name: "سارا محمدی",
    role: "designer",
    title: "طراح UI/UX",
    email: "sara@taskflow.ir",
    presence: "away",
  },
  {
    id: "u-4",
    name: "رضا احمدی",
    role: "backend",
    title: "توسعه‌دهنده بک‌اند",
    email: "reza@taskflow.ir",
    presence: "online",
  },
  {
    id: "u-5",
    name: "مریم حسینی",
    role: "product",
    title: "مدیر محصول",
    email: "maryam@taskflow.ir",
    presence: "offline",
  },
  {
    id: "u-6",
    name: "محمد نوری",
    role: "qa",
    title: "کارشناس تست",
    email: "mohammad@taskflow.ir",
    presence: "online",
  },
  {
    id: "u-7",
    name: "نگار صادقی",
    role: "devops",
    title: "مهندس دواپس",
    email: "negar@taskflow.ir",
    presence: "away",
  },
  {
    id: "u-8",
    name: "امیر تهرانی",
    role: "backend",
    title: "توسعه‌دهنده بک‌اند",
    email: "amir@taskflow.ir",
    presence: "offline",
  },
];

/** Initials are derived rather than stored, so a rename stays consistent. */
export const USERS: User[] = raw.map((user) => ({
  ...user,
  avatar: getInitials(user.name),
}));
