import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import type { SelectOption } from "../../types";
import { cn } from "../../utils/cn";
import { controlClasses, type FieldSize } from "./Field";

export interface SelectProps<TValue extends string>
  extends Omit<
    ComponentPropsWithoutRef<"select">,
    "value" | "onChange" | "size" | "children"
  > {
  value: TValue;
  onValueChange: (value: TValue) => void;
  options: SelectOption<TValue>[];
  /** Rendered as a disabled first option when `value` is empty. */
  placeholder?: string;
  invalid?: boolean;
  size?: FieldSize;
}

/**
 * Generic over the value union, so `onValueChange` hands back the narrowed
 * type instead of a bare string — no cast at the call site.
 *
 * A styled native `<select>` is deliberate: it gets the platform's keyboard
 * behaviour (type-ahead, arrow keys, mobile wheel picker) for free, which a
 * custom listbox has to reimplement and usually gets subtly wrong.
 */
export function Select<TValue extends string>({
  value,
  onValueChange,
  options,
  placeholder,
  invalid = false,
  size = "md",
  className,
  ...rest
}: SelectProps<TValue>) {
  return (
    <div className="relative">
      <select
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(event) => onValueChange(event.target.value as TValue)}
        className={cn(
          controlClasses(invalid, size),
          "cursor-pointer appearance-none pe-9",
          className,
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
      />
    </div>
  );
}
