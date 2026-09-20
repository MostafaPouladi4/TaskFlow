import type { ReactNode } from "react";
import { cn } from "../../shared/utils/cn";

export interface CardProps {
  children: ReactNode;
  className?: string;
  /** `raised` adds a shadow — reserve it for genuinely floating surfaces. */
  variant?: "flat" | "raised" | "quiet";
  as?: "div" | "section" | "article" | "li";
}

const VARIANT_CLASSES = {
  // Cards are separated by a hairline border rather than a shadow, which
  // keeps dense layouts calm. Shadow is opt-in.
  flat: "border border-line bg-surface",
  raised: "border border-line bg-surface shadow-md",
  quiet: "border border-line/70 bg-surface-2/60",
} as const;

export function Card({
  children,
  className,
  variant = "flat",
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-2xl",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/** Consistent header block: title, optional hint, optional trailing action. */
export function CardHeader({
  title,
  description,
  action,
  icon,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-line px-5 py-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="mt-0.5 shrink-0 text-muted">{icon}</div>}

        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-content">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted">{description}</p>
          )}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
