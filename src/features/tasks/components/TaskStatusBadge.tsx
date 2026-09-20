import { STATUS_META } from "../../../shared/constants/taskMeta";
import type { TaskStatus } from "../../../shared/types";
import { cn } from "../../../shared/utils/cn";

export interface TaskStatusBadgeProps {
  status: TaskStatus;
  withDot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/** The status pill. Colours come from `STATUS_META`, so it never drifts. */
export function TaskStatusBadge({
  status,
  withDot = true,
  size = "sm",
  className,
}: TaskStatusBadgeProps) {
  const meta = STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        meta.badge,
        className,
      )}
    >
      {withDot && (
        <span aria-hidden className={cn("size-1.5 rounded-full", meta.dot)} />
      )}
      {meta.label}
    </span>
  );
}
