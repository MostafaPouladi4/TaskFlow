import { Check, Minus } from "lucide-react";
import { useId } from "react";
import { cn } from "../../utils/cn";

export type CheckboxSize = "sm" | "md";

const BOX_SIZE: Record<CheckboxSize, string> = {
  sm: "size-4 rounded-[0.3rem]",
  md: "size-[1.15rem] rounded-md",
};

const GLYPH_SIZE: Record<CheckboxSize, string> = {
  sm: "size-3",
  md: "size-3.5",
};

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Visible label. When omitted, `label` must be supplied for a11y. */
  children?: React.ReactNode;
  /** Accessible name when there is no visible label. */
  label?: string;
  disabled?: boolean;
  /** Draws the dash state — a parent of partially-completed children. */
  indeterminate?: boolean;
  size?: CheckboxSize;
  className?: string;
  /** Strikethrough + dimmed label, used for completed tasks. */
  muted?: boolean;
}

/**
 * Built on a real `<input type="checkbox">` so form semantics, keyboard
 * toggling and screen-reader state all come for free; only the visuals are
 * replaced.
 */
export function Checkbox({
  checked,
  onCheckedChange,
  children,
  label,
  disabled = false,
  indeterminate = false,
  size = "md",
  className,
  muted = false,
}: CheckboxProps) {
  const id = useId();

  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <span className="relative inline-flex shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-label={children ? undefined : label}
          ref={(node) => {
            if (node) node.indeterminate = indeterminate && !checked;
          }}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className={cn(
            "peer cursor-pointer appearance-none border border-line-strong bg-surface",
            "transition-[background-color,border-color,box-shadow] duration-150",
            "hover:border-brand-400",
            "checked:border-brand-500 checked:bg-brand-500",
            "indeterminate:border-brand-500 indeterminate:bg-brand-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            BOX_SIZE[size],
          )}
        />

        {indeterminate && !checked ? (
          <Minus
            aria-hidden
            strokeWidth={3}
            className={cn(
              "pointer-events-none absolute text-white",
              GLYPH_SIZE[size],
            )}
          />
        ) : (
          <Check
            aria-hidden
            strokeWidth={3.5}
            className={cn(
              "pointer-events-none absolute text-white opacity-0",
              "transition-opacity duration-100 peer-checked:opacity-100 peer-checked:animate-check-pop",
              GLYPH_SIZE[size],
            )}
          />
        )}
      </span>

      {children && (
        <label
          htmlFor={id}
          className={cn(
            "cursor-pointer text-sm leading-6 select-none",
            muted ? "text-subtle line-through" : "text-content",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          {children}
        </label>
      )}
    </div>
  );
}
