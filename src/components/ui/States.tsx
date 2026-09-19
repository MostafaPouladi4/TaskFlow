import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ACTION_LABELS, ERROR_LABELS } from "../../constants/labels";
import { cn } from "../../utils/cn";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
  /** `compact` drops the padding — for use inside an already-padded card. */
  variant?: "default" | "compact";
}

/**
 * The deliberate "nothing here yet" state. Every list in the app uses this
 * rather than rendering an empty container, because a blank region reads as a
 * rendering bug.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "default" ? "px-6 py-16" : "px-4 py-10",
        className,
      )}
    >
      <span className="relative mb-4 inline-flex size-14 items-center justify-center rounded-2xl border border-line bg-surface-2">
        <Icon aria-hidden className="size-6 text-subtle" />
      </span>

      <h3 className="text-sm font-semibold text-content">{title}</h3>

      {body && (
        <p className="mt-1.5 max-w-sm text-xs leading-6 text-muted">{body}</p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = ERROR_LABELS.generic,
  body = ERROR_LABELS.genericHint,
  onRetry,
  retryLabel = ACTION_LABELS.retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/10">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-6 text-rose-600 dark:text-rose-400"
        >
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      </span>

      <h3 className="text-sm font-semibold text-content">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-6 text-muted">{body}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-9 items-center rounded-xl border border-line bg-surface-2 px-4 text-xs font-medium text-content transition-colors hover:bg-surface-3"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
