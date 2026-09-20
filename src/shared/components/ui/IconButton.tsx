import type { ComponentPropsWithoutRef } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "../../shared/utils/cn";

export type IconButtonVariant = "ghost" | "secondary" | "subtle" | "danger";
export type IconButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  ghost: "text-muted hover:bg-surface-2 hover:text-content",
  secondary:
    "bg-surface-2 text-content border border-line hover:bg-surface-3 hover:border-line-strong",
  subtle:
    "bg-brand-500/10 text-brand-700 dark:text-brand-300 hover:bg-brand-500/16",
  danger: "text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
};

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: "size-7 rounded-lg",
  md: "size-9 rounded-xl",
  lg: "size-10 rounded-xl",
};

export interface IconButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "aria-label"> {
  icon: LucideIcon;
  /** Required: an icon-only control has no accessible name without it. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  /** Renders a filled dot in the corner — used by the notification bell. */
  indicator?: boolean;
}

/**
 * An icon-only button. The `label` prop is mandatory and becomes the
 * accessible name, so a screen reader never announces a bare "button".
 */
export function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  loading = false,
  indicator = false,
  className,
  disabled,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        "transition-[background-color,color,transform] duration-150",
        "active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 aria-hidden className="size-4 animate-spin" />
      ) : (
        <Icon aria-hidden className="size-4" />
      )}

      {indicator && (
        <span
          aria-hidden
          className="absolute inset-e-1 top-1 size-2 rounded-full bg-rose-500 ring-2 ring-surface"
        />
      )}
    </button>
  );
}
