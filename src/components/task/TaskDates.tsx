import { CalendarDays, Clock } from "lucide-react";
import { GENERIC_LABELS, TASK_DETAIL_LABELS } from "../../constants/labels";
import { DUE_TONE_CLASSES } from "../../constants/tones";
import { describeDueDate, formatJalaliShort } from "../../utils/date";
import { cn } from "../../utils/cn";

export interface TaskDatesProps {
  startDate: string | null;
  dueDate: string | null;
  /** `stacked` is the detail panel; `inline` is a list row. */
  layout?: "inline" | "stacked";
  /** Hides the start date — list rows only have space for the deadline. */
  dueOnly?: boolean;
  className?: string;
}

/**
 * Start and due dates together.
 *
 * The deadline carries its own urgency label and colour (`describeDueDate`), so
 * "overdue" is stated in words rather than signalled by red alone.
 */
export function TaskDates({
  startDate,
  dueDate,
  layout = "inline",
  dueOnly = false,
  className,
}: TaskDatesProps) {
  const due = describeDueDate(dueDate);

  const dueNode = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        DUE_TONE_CLASSES[due.tone],
      )}
      title={
        dueDate ? `${TASK_DETAIL_LABELS.dueDate}: ${due.label}` : undefined
      }
    >
      <Clock aria-hidden className="size-3.5 shrink-0" />
      <span className="whitespace-nowrap">{due.label}</span>
    </span>
  );

  if (dueOnly) {
    return <span className={cn("inline-flex", className)}>{dueNode}</span>;
  }

  const startNode = (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted"
      title={startDate ? TASK_DETAIL_LABELS.startDate : undefined}
    >
      <CalendarDays aria-hidden className="size-3.5 shrink-0" />
      <span className="whitespace-nowrap">
        {startDate ? formatJalaliShort(startDate) : GENERIC_LABELS.noStartDate}
      </span>
    </span>
  );

  if (layout === "stacked") {
    return (
      <dl className={cn("flex flex-col gap-2", className)}>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[11px] text-subtle">
            {TASK_DETAIL_LABELS.startDate}
          </dt>
          <dd>{startNode}</dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-[11px] text-subtle">
            {TASK_DETAIL_LABELS.dueDate}
          </dt>
          <dd>{dueNode}</dd>
        </div>
      </dl>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {startNode}
      {dueNode}
    </div>
  );
}
