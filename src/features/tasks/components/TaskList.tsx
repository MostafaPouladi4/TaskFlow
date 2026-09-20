import { useMemo } from "react";
import { ListChecks, Plus, SearchX } from "lucide-react";
import {
  ACTION_LABELS,
  EMPTY_STATE_LABELS,
  TASK_PAGE_LABELS,
} from "../../../shared/constants/labels";
import { STATUS_META } from "../../../shared/constants/taskMeta";
import { groupByStatus } from "../../../shared/utils/filter";
import type { TaskStatusGroup } from "../../../shared/utils/filter";
import { cn } from "../../../shared/utils/cn";
import { formatNumber } from "../../../shared/utils/text";
import type { ID, TaskWithRelations } from "../../../shared/types";
import { Button } from "../../../shared/components/ui/Button";
import { SkeletonList } from "../../../shared/components/ui/Skeleton";
import { EmptyState } from "../../../shared/components/ui/States";
import { TaskRow } from "./TaskRow";

export interface TaskListProps {
  tasks: TaskWithRelations[];
  onOpen: (taskId: ID) => void;
  /** Splits the list into workflow-stage sections. */
  grouped?: boolean;
  loading?: boolean;
  /** Distinguishes "no tasks yet" from "nothing matches your filters". */
  filtered?: boolean;
  onClearFilters?: () => void;
  onCreate?: () => void;
}

/**
 * The task list.
 *
 * Empty, loading and populated are three genuinely different states here: a
 * filtered-out list is not the same as an empty workspace, and telling the user
 * which one they're looking at is the difference between "change a filter" and
 * "get started".
 */
export function TaskList({
  tasks,
  onOpen,
  grouped = false,
  loading = false,
  filtered = false,
  onClearFilters,
  onCreate,
}: TaskListProps) {
  const sections = useMemo<TaskStatusGroup[]>(
    () => (grouped ? groupByStatus(tasks) : [{ status: null, tasks }]),
    [grouped, tasks],
  );

  if (loading) {
    return <SkeletonList rows={6} />;
  }

  if (tasks.length === 0) {
    return filtered ? (
      <EmptyState
        icon={SearchX}
        title={EMPTY_STATE_LABELS.filtered.title}
        body={EMPTY_STATE_LABELS.filtered.body}
        action={
          onClearFilters && (
            <Button variant="secondary" onClick={onClearFilters}>
              {ACTION_LABELS.clearFilters}
            </Button>
          )
        }
      />
    ) : (
      <EmptyState
        icon={ListChecks}
        title={EMPTY_STATE_LABELS.tasks.title}
        body={EMPTY_STATE_LABELS.tasks.body}
        action={
          onCreate && (
            <Button icon={Plus} onClick={onCreate}>
              {ACTION_LABELS.createTask}
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => {
        if (section.tasks.length === 0) return null;

        const meta = section.status ? STATUS_META[section.status] : null;

        return (
          <section key={section.status ?? "all"} className="flex flex-col gap-2">
            {meta && (
              <h2 className="flex items-center gap-2 px-1 text-xs font-semibold text-muted">
                <span
                  aria-hidden
                  className={cn("size-2 rounded-full", meta.dot)}
                />
                {meta.label}
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-3 px-1.5 text-[10px] font-medium text-muted">
                  {formatNumber(section.tasks.length)}
                </span>
              </h2>
            )}

            <ul className="flex flex-col gap-1.5">
              {section.tasks.map((task) => (
                <TaskRow key={task.id} task={task} onOpen={onOpen} />
              ))}
            </ul>
          </section>
        );
      })}

      <p className="px-1 text-[11px] text-subtle">
        {TASK_PAGE_LABELS.resultsCount(formatNumber(tasks.length))}
      </p>
    </div>
  );
}
