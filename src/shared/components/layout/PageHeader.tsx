import type { ReactNode } from "react";
import { cn } from "../../shared/utils/cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Sits above the title — a breadcrumb, a back link, a status chip. */
  eyebrow?: ReactNode;
  /** Primary actions, aligned to the far edge on wide screens. */
  actions?: ReactNode;
  className?: string;
}

/**
 * The heading block every page opens with.
 *
 * Stacks on phones and becomes a two-column row from `sm` up, so the title
 * never gets squeezed by a wide action group.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5">{eyebrow}</div>}

        <h1 className="text-xl font-semibold tracking-tight text-content sm:text-2xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-muted">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
