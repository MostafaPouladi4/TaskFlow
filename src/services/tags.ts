import type { Tag } from "../../shared/types";

/**
 * The workspace's tag vocabulary.
 *
 * Tags are the cross-cutting axis: a project groups work by initiative, a tag
 * groups it by what the work actually is, so these deliberately overlap with
 * more than one project.
 */
export const TAGS: Tag[] = [
  { id: "t-1", label: "فرانت‌اند", tone: "brand" },
  { id: "t-2", label: "بک‌اند", tone: "violet" },
  { id: "t-3", label: "طراحی", tone: "rose" },
  { id: "t-4", label: "API", tone: "cyan" },
  { id: "t-5", label: "باگ", tone: "amber" },
  { id: "t-6", label: "بهبود عملکرد", tone: "emerald" },
  { id: "t-7", label: "مستندات", tone: "slate" },
  { id: "t-8", label: "زیرساخت", tone: "violet" },
];
