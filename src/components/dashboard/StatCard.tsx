import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

export type StatTone = "brand" | "emerald" | "amber" | "rose";

const TONE_CLASSES: Record<StatTone, string> = {
  brand: "bg-brand-500/10 text-brand-600 dark:text-brand-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export interface StatCardProps {
  label: string;
  /** Already formatted — the caller owns digit shaping and grouping. */
  value: string;
  icon: LucideIcon;
  tone?: StatTone;
  /** Secondary line under the value, e.g. a share of the total. */
  hint?: string;
  className?: string;
}

/**
 * One number from the dashboard's summary row.
 *
 * The value is the loudest thing in the card and the icon is a quiet tint
 * behind it — the opposite weighting (big colourful icon, small number) reads
 * as decoration rather than as data.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3.5 rounded-2xl border border-line bg-surface p-4 sm:p-5",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-xl",
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="size-4.5" />
      </span>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-muted">{label}</p>

        <p className="numeric mt-1 text-2xl font-semibold leading-none tracking-tight text-content">
          {value}
        </p>

        {hint && (
          <p className="mt-1.5 truncate text-[11px] text-subtle">{hint}</p>
        )}
      </div>
    </div>
  );
}
