import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

/** Tonal badges. Tones are semantic, not decorative. */
export type BadgeTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "violet";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral:
    "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300",
  brand: "bg-brand-500/10 text-brand-700 border-brand-500/25 dark:text-brand-300",
  success:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300",
  warning:
    "bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300",
  danger: "bg-rose-500/10 text-rose-700 border-rose-500/25 dark:text-rose-300",
  violet:
    "bg-violet-500/10 text-violet-700 border-violet-500/25 dark:text-violet-300",
};

export type BadgeSize = "sm" | "md";

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "h-5 gap-1 rounded-md px-1.5 text-[11px]",
  md: "h-6 gap-1.5 rounded-lg px-2 text-xs",
};

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: LucideIcon;
  /** Renders a small tone-coloured dot before the label. */
  dot?: string;
  className?: string;
}

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  icon: Icon,
  dot,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center border font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        className,
      )}
    >
      {dot && (
        <span aria-hidden className={cn("size-1.5 rounded-full", dot)} />
      )}
      {Icon && <Icon aria-hidden className="size-3 shrink-0" />}
      {children}
    </span>
  );
}
