import { cn } from "../../utils/cn";

export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SegmentedControlProps<TValue extends string> {
  value: TValue;
  onValueChange: (value: TValue) => void;
  options: SegmentedOption<TValue>[];
  /** Accessible name for the group. */
  label: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * A radio group styled as a segmented switch — used where the options are few
 * and mutually exclusive (theme choice, task grouping, sort order).
 *
 * Implemented with real radios so arrow keys move between options, which is
 * what a keyboard user expects from a choice like this.
 */
export function SegmentedControl<TValue extends string>({
  value,
  onValueChange,
  options,
  label,
  size = "md",
  className,
}: SegmentedControlProps<TValue>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl border border-line bg-surface-2 p-1",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;

        return (
          <label
            key={option.value}
            className={cn(
              "relative inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium",
              "transition-[background-color,color,box-shadow] duration-150",
              size === "sm" ? "h-7 px-2.5 text-[11px]" : "h-8 px-3 text-xs",
              selected
                ? "bg-surface text-content shadow-sm"
                : "text-muted hover:text-content",
            )}
          >
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={selected}
              onChange={() => onValueChange(option.value)}
              className="sr-only"
            />

            {Icon && <Icon className="size-3.5 shrink-0" />}
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
