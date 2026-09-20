import { TASK_FORM_LABELS } from "../../../shared/constants/labels";
import { PRIORITY_META } from "../../../shared/constants/taskMeta";
import type { TaskPriority } from "../../../shared/types";
import { cn } from "../../../shared/utils/cn";

export interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  /**
   * Icon-only. Used in dense rows where the glyph carries the meaning and a
   * full label would crowd out the title.
   */
  compact?: boolean;
  className?: string;
}

/** The priority pill. `compact` trades the label for an accessible name. */
export function TaskPriorityBadge({
  priority,
  compact = false,
  className,
}: TaskPriorityBadgeProps) {
  const meta = PRIORITY_META[priority];

  if (compact) {
    return (
      <span
        title={meta.label}
        aria-label={`${TASK_FORM_LABELS.fields.priority}: ${meta.label}`}
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold",
          meta.badge,
          className,
        )}
      >
        <span aria-hidden>{meta.glyph}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        meta.badge,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
