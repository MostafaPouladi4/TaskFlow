import type { ComponentPropsWithoutRef } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "subtle"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white border border-transparent shadow-sm hover:bg-brand-500 active:bg-brand-700",
  secondary:
    "bg-surface-2 text-content border border-line hover:bg-surface-3 hover:border-line-strong",
  ghost:
    "bg-transparent text-muted border border-transparent hover:bg-surface-2 hover:text-content",
  subtle:
    "bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-transparent hover:bg-brand-500/16",
  danger:
    "bg-rose-600 text-white border border-transparent shadow-sm hover:bg-rose-500 active:bg-rose-700",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-11 gap-2 rounded-xl px-5 text-sm",
};

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks interaction without changing the layout. */
  loading?: boolean;
  icon?: LucideIcon;
  iconEnd?: LucideIcon;
  fullWidth?: boolean;
}

/**
 * The single button in the system. `type` defaults to `"button"` so a button
 * inside a form never submits by accident — pass `type="submit"` explicitly.
 */
export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon: Icon,
  iconEnd: IconEnd,
  fullWidth = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled === true || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap",
        "transition-[background-color,border-color,color,box-shadow,transform] duration-150",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 aria-hidden className="size-4 animate-spin" />
      ) : (
        Icon && <Icon aria-hidden className="size-4 shrink-0" />
      )}

      {children}

      {IconEnd && !loading && <IconEnd aria-hidden className="size-4 shrink-0" />}
    </button>
  );
}
