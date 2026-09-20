import { GENERIC_LABELS } from "../../shared/constants/labels";
import { cn } from "../../shared/utils/cn";
import { toPersianDigits } from "../../shared/utils/text";

export interface ProgressBarProps {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  className?: string;
  size?: "xs" | "sm" | "md";
  tone?: "brand" | "success" | "warning" | "danger";
  /** Accessible name — a bare progress bar conveys nothing on its own. */
  label: string;
  /** Renders the percentage after the bar. */
  showValue?: boolean;
  /** Animates width changes instead of snapping. */
  animated?: boolean;
}

const SIZE_CLASSES = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2.5",
} as const;

const TONE_CLASSES = {
  brand: "bg-brand-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
} as const;

export function ProgressBar({
  value,
  className,
  size = "sm",
  tone = "brand",
  label,
  showValue = false,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${toPersianDigits(clamped)} ${GENERIC_LABELS.percent}`}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-surface-3",
          SIZE_CLASSES[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full",
            TONE_CLASSES[tone],
            animated && "transition-[width] duration-500 ease-out",
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {showValue && (
        <span className="numeric shrink-0 text-xs font-medium text-muted">
          {toPersianDigits(clamped)}٪
        </span>
      )}
    </div>
  );
}

export interface SegmentedProgressProps {
  /** Each segment becomes a block in the meter. */
  segments: number;
  filled: number;
  label: string;
  className?: string;
}

/**
 * A discrete meter (the `████░░░░` shape). Reads better than a continuous bar
 * when the total is small enough to count.
 */
export function SegmentedProgress({
  segments,
  filled,
  label,
  className,
}: SegmentedProgressProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={segments}
      className={cn("flex items-center gap-1", className)}
      dir="ltr"
    >
      {Array.from({ length: segments }, (_unused, index) => (
        <span
          key={index}
          aria-hidden
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors duration-300",
            index < filled ? "bg-brand-500" : "bg-surface-3",
          )}
        />
      ))}
    </div>
  );
}
