import { CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { DASHBOARD_LABELS } from "../../constants/labels";
import { useUpcomingTasks } from "../../hooks/useTasks";
import type { ID } from "../../types";
import { cn } from "../../utils/cn";
import { Card, CardHeader } from "../ui/Card";
import { EmptyState } from "../ui/States";
import { TaskRow } from "../task/TaskRow";

const CARD_LINK_CLASSES =
  "rounded-lg px-2 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-500/10 dark:text-brand-400";

export interface UpcomingTasksProps {
  onOpenTask: (taskId: ID) => void;
  limit?: number;
  className?: string;
}

/** The deadlines that are actually close, soonest first. */
export function UpcomingTasks({
  onOpenTask,
  limit = 5,
  className,
}: UpcomingTasksProps) {
  const tasks = useUpcomingTasks(limit);

  return (
    <Card className={className}>
      <CardHeader
        title={DASHBOARD_LABELS.upcoming}
        description={DASHBOARD_LABELS.upcomingHint}
        action={
          <Link to="/tasks" className={CARD_LINK_CLASSES}>
            {DASHBOARD_LABELS.viewAll}
          </Link>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          variant="compact"
          icon={CalendarCheck}
          title={DASHBOARD_LABELS.upcomingEmpty}
          body={DASHBOARD_LABELS.upcomingEmptyHint}
        />
      ) : (
        <ul className={cn("flex flex-col gap-2 p-3")}>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </ul>
      )}
    </Card>
  );
}
