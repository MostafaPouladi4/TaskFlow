import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../utils/cn";

export type FieldSize = "sm" | "md";

export const CONTROL_BASE =
  "w-full bg-surface text-content border border-line transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-subtle disabled:cursor-not-allowed disabled:opacity-60";

const CONTROL_SIZE: Record<FieldSize, string> = {
  sm: "h-9 rounded-lg px-3 text-sm",
  md: "h-10 rounded-xl px-3.5 text-sm",
};

export function controlClasses(
  invalid: boolean,
  size: FieldSize,
  extra?: string,
): string {
  return cn(
    CONTROL_BASE,
    CONTROL_SIZE[size],
    invalid
      ? "border-rose-500/70 focus:border-rose-500"
      : "hover:border-line-strong focus:border-brand-500",
    extra,
  );
}

export interface FieldProps {
  label?: ReactNode;
  /** Helper text shown when there is no error. */
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Label + control + message. The error replaces the hint rather than stacking,
 * so the field's height doesn't jump when validation fails.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-xs font-medium text-content"
        >
          {label}
          {required && (
            <span aria-hidden className="text-rose-500">
              *
            </span>
          )}
        </label>
      )}

      {children}

      <div aria-live="polite" className="min-h-4">
        {error ? (
          <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle aria-hidden className="size-3 shrink-0" />
            {error}
          </p>
        ) : (
          hint && <p className="text-[11px] text-subtle">{hint}</p>
        )}
      </div>
    </div>
  );
}

export interface InputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "size"> {
  invalid?: boolean;
  size?: FieldSize;
  icon?: React.ComponentType<{ className?: string }>;
}

export function Input({
  invalid = false,
  size = "md",
  icon: Icon,
  className,
  ...rest
}: InputProps) {
  const control = controlClasses(invalid, size, className);

  if (!Icon) {
    return (
      <input
        aria-invalid={invalid || undefined}
        className={control}
        {...rest}
      />
    );
  }

  return (
    <div className="relative">
      <Icon
        aria-hidden
        className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
      />
      <input
        aria-invalid={invalid || undefined}
        className={cn(control, "ps-9")}
        {...rest}
      />
    </div>
  );
}

export interface TextareaProps
  extends ComponentPropsWithoutRef<"textarea"> {
  invalid?: boolean;
}

export function Textarea({
  invalid = false,
  className,
  rows = 4,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL_BASE,
        "resize-y rounded-xl px-3.5 py-2.5 text-sm leading-6",
        invalid
          ? "border-rose-500/70 focus:border-rose-500"
          : "hover:border-line-strong focus:border-brand-500",
        "scrollbar-slim",
        className,
      )}
      {...rest}
    />
  );
}
