import { MessageSquare } from "lucide-react";
import { COMMENT_LABELS, TASK_PAGE_LABELS } from "../../../shared/constants/labels";
import { useWorkspace } from "../../../shared/hooks/useWorkspace";
import type { ID, TaskWithRelations } from "../../../shared/types";
import { cn } from "../../../shared/utils/cn";
import { formatNumber } from "../../../shared/utils/text";
import { Checkbox } from "../../../shared/components/ui/Checkbox";
import { TaskDates } from "./TaskDates";
import { TaskPeople } from "./TaskPeople";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskTags } from "./TaskTags";

export interface TaskRowProps {
  task: TaskWithRelations;
  onOpen: (taskId: ID) => void;
  className?: string;
}

/**
 * One task in a list.
 *
 * Hierarchy is deliberate: the title carries the most weight, the status and
 * deadline sit in a quieter trailing group, and everything else is secondary
 * text. The whole row opens the task — the title is the real button, stretched
 * over the row — while the checkbox stays above that overlay so ticking a task
 * never opens it by accident.
 */
export function TaskRow({ task, onOpen, className }: TaskRowProps) {
  const { actions } = useWorkspace();

  const done = task.status === "done";
  const commentCount = task.comments.length;

  return (
    <li
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border border-line bg-surface px-3 transition-colors",
        "py-(--density-row-py)",
        "hover:border-line-strong hover:bg-surface-2/60",
        className,
      )}
    >
      <span className="relative z-10 mt-0.5 flex items-center">
        <Checkbox
          checked={done}
          onCheckedChange={() => void actions.toggleTaskComplete(task.id)}
          label={
            done
              ? TASK_PAGE_LABELS.reopenTask(task.title)
              : TASK_PAGE_LABELS.completeTask(task.title)
          }
          size="sm"
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpen(task.id)}
            className={cn(
              "min-w-0 flex-1 truncate text-start text-[13px] font-medium transition-colors",
              "after:absolute after:inset-0 after:content-['']",
              done ? "text-muted line-through" : "text-content group-hover:text-brand-600 dark:group-hover:text-brand-400",
            )}
          >
            {task.title}
          </button>

          <TaskPriorityBadge priority={task.priority} compact className="sm:hidden" />
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="numeric text-[11px] text-subtle">{task.code}</span>

          <TaskTags tags={task.tags} max={2} />

          {/* On phones the trailing group is hidden, so status and deadline
              move into this line rather than disappearing. */}
          <span className="sm:hidden">
            <TaskStatusBadge status={task.status} />
          </span>

          <span className="sm:hidden">
            <TaskDates startDate={null} dueDate={task.dueDate} dueOnly />
          </span>

          {task.project && (
            <span className="hidden truncate text-[11px] text-subtle md:inline">
              {task.project.name}
            </span>
          )}
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-3 sm:flex">
        <TaskStatusBadge status={task.status} />

        <TaskDates
          startDate={null}
          dueDate={task.dueDate}
          dueOnly
          className="w-24 justify-end"
        />

        {commentCount > 0 ? (
          <span
            className="inline-flex items-center gap-1 text-[11px] text-subtle"
            title={COMMENT_LABELS.countLabel(formatNumber(commentCount))}
          >
            <MessageSquare aria-hidden className="size-3.5" />
            {formatNumber(commentCount)}
          </span>
        ) : (
          <span aria-hidden className="w-6" />
        )}

        <TaskPeople assignee={task.assignee} members={task.members} size="xs" />
      </div>
    </li>
  );
}
