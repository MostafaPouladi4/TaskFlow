import type { ProjectTone, TagTone } from "../types";
import type { DueTone } from "../utils/date";

/**
 * Tone → classes. Kept as literal strings (not built by interpolation) so
 * Tailwind's scanner can see every class it needs to generate.
 */
export interface ToneClasses {
  /** Small chip / badge. */
  chip: string;
  /** Solid swatch. */
  solid: string;
  /** Soft tinted surface used for cards. */
  soft: string;
  /** Text-only accent. */
  text: string;
}

export const TAG_TONES: Record<TagTone, ToneClasses> = {
  brand: {
    chip: "bg-brand-500/10 text-brand-700 border-brand-500/20 dark:text-brand-300",
    solid: "bg-brand-500",
    soft: "bg-brand-500/8 border-brand-500/20",
    text: "text-brand-600 dark:text-brand-400",
  },
  violet: {
    chip: "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-300",
    solid: "bg-violet-500",
    soft: "bg-violet-500/8 border-violet-500/20",
    text: "text-violet-600 dark:text-violet-400",
  },
  emerald: {
    chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
    solid: "bg-emerald-500",
    soft: "bg-emerald-500/8 border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    chip: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
    solid: "bg-amber-500",
    soft: "bg-amber-500/8 border-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    chip: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300",
    solid: "bg-rose-500",
    soft: "bg-rose-500/8 border-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
  },
  cyan: {
    chip: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:text-cyan-300",
    solid: "bg-cyan-500",
    soft: "bg-cyan-500/8 border-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  slate: {
    chip: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300",
    solid: "bg-slate-500",
    soft: "bg-slate-500/8 border-slate-500/20",
    text: "text-slate-600 dark:text-slate-400",
  },
};

export const PROJECT_TONES: Record<ProjectTone, ToneClasses> = {
  brand: TAG_TONES.brand,
  violet: TAG_TONES.violet,
  emerald: TAG_TONES.emerald,
  amber: TAG_TONES.amber,
  rose: TAG_TONES.rose,
};

/**
 * Avatar backgrounds. Deterministic per user id, so a person keeps the same
 * colour across sessions and pages.
 */
export const AVATAR_TONES = [  "bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-500/20",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-500/20",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/20",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/20",
  "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ring-cyan-500/20",
] as const;

/**
 * How a deadline is coloured. Overdue and urgent share a colour on purpose:
 * both mean "act now", and a fourth hue would only add noise.
 */
export const DUE_TONE_CLASSES: Record<DueTone, string> = {
  overdue: "text-rose-600 dark:text-rose-400",
  urgent: "text-rose-600 dark:text-rose-400",
  soon: "text-amber-600 dark:text-amber-400",
  normal: "text-muted",
  none: "text-subtle",
};
