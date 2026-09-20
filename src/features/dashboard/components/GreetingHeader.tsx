import { useMemo } from "react";
import { Plus } from "lucide-react";
import { ACTION_LABELS, GREETING_LABELS } from "../../../shared/constants/labels";
import { useTaskStats } from "../../../shared/hooks/useTasks";
import { useWorkspace } from "../../../shared/hooks/useWorkspace";
import { cn } from "../../../shared/utils/cn";
import { formatJalaliWithWeekday, todayIso } from "../../../shared/utils/date";
import { firstName, greetingContext, salutation } from "../../../shared/utils/greeting";
import { countCompletedToday, countDueToday } from "../../../shared/utils/statistics";
import { Button } from "../../../shared/components/ui/Button";

export interface GreetingHeaderProps {
  onCreateTask: () => void;
  className?: string;
}

/**
 * The first thing on the dashboard: who you are, what time it is, and the one
 * fact worth knowing before you start scrolling.
 *
 * The sentence is derived from the data rather than static copy — a greeting
 * that says the same thing every day stops being read by the second day.
 */
export function GreetingHeader({
  onCreateTask,
  className,
}: GreetingHeaderProps) {
  const { currentUser, tasks } = useWorkspace();
  const stats = useTaskStats();

  const context = useMemo(
    () =>
      greetingContext(stats, countDueToday(tasks), countCompletedToday(tasks)),
    [stats, tasks],
  );

  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-subtle">
          {formatJalaliWithWeekday(todayIso())}
        </p>

        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-content sm:text-2xl">
          {salutation()}، {firstName(currentUser.name)}{" "}
          <span aria-hidden className="inline-block">
            {GREETING_LABELS.wave}
          </span>
        </h1>

        <p className="mt-1.5 text-[13px] leading-5 text-muted">{context}</p>
      </div>

      <Button icon={Plus} onClick={onCreateTask} className="shrink-0">
        {ACTION_LABELS.createTask}
      </Button>
    </header>
  );
}
