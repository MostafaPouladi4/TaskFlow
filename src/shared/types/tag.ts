import type { ID } from "./common";

/** Palette keys, not raw colours — the tone maps to classes in one place. */
export type TagTone =
  | "brand"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "cyan"
  | "slate";

export interface Tag {
  id: ID;
  label: string;
  tone: TagTone;
}
