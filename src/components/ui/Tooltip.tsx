import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export type TooltipSide = "top" | "bottom" | "start" | "end";

/**
 * Centring uses the *physical* `left-1/2` with `-translate-x-1/2`: the two
 * cancel out, so it centres in either direction. The side placements use the
 * logical `inset-s-full` / `inset-e-full` so the tooltip follows the writing
 * direction, paired with a logical margin for the gap.
 */
const SIDE_CLASSES: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  start: "inset-e-full top-1/2 -translate-y-1/2 me-2",
  end: "inset-s-full top-1/2 -translate-y-1/2 ms-2",
};

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: TooltipSide;
  className?: string;
}

/**
 * A CSS-only tooltip: it appears on hover *and* on keyboard focus, so the
 * information isn't mouse-only. `aria-hidden` is deliberate — the same text is
 * already exposed through the trigger's accessible name.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}

      <span
        aria-hidden
        role="presentation"
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-56 rounded-lg border border-line bg-surface-3 px-2 py-1",
          "text-[11px] font-medium text-content shadow-md",
          "opacity-0 transition-opacity duration-150",
          "group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          SIDE_CLASSES[side],
        )}
      >
        {content}
      </span>
    </span>
  );
}
