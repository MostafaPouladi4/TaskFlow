import { DASHBOARD_LABELS } from "../../../shared/constants/labels";
import { STATUS_META, STATUS_ORDER } from "../../../shared/constants/taskMeta";
import { useTaskStats } from "../../../shared/hooks/useTasks";
import type { TaskStatus } from "../../../shared/types";
import { cn } from "../../../shared/utils/cn";
import { formatNumber, formatPercent } from "../../../shared/utils/text";
import { Card, CardBody, CardHeader } from "../../../shared/components/ui/Card";
import { ProgressBar, SegmentedProgress } from "../../../shared/components/ui/ProgressBar";

/** The `████░░░░` meter reads best around this many blocks. */
const METER_SEGMENTS = 20;

export interface ProgressOverviewProps {
  className?: string;
}

/**
 * Overall completion, expressed three ways on purpose: a percentage for the
 * exact figure, a block meter for a glanceable sense of scale, and a per-status
 * breakdown for where the remaining work actually sits.
 */
export function ProgressOverview({ className }: ProgressOverviewProps) {
  const stats = useTaskStats();

  const counts: Record<TaskStatus, number> = {
    todo: stats.todo,
    in_progress: stats.inProgress,
    in_review: stats.inReview,
    blocked: stats.blocked,
    done: stats.done,
  };

  const rate = stats.completionRate;
  const filled = Math.round((rate / 100) * METER_SEGMENTS);

  return (
    <Card className={className}>
      <CardHeader
        title={DASHBOARD_LABELS.progress}
        description={DASHBOARD_LABELS.progressHint}
      />

      <CardBody className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="numeric text-3xl font-semibold leading-none tracking-tight text-content">
              {formatPercent(rate)}
            </p>
            <p className="mt-2 text-[11px] text-subtle">
              {DASHBOARD_LABELS.doneOfTotal(
                formatNumber(stats.done),
                formatNumber(stats.total),
              )}
            </p>
          </div>

          <p className="text-[11px] text-subtle">
            {DASHBOARD_LABELS.completionRate}
          </p>
        </div>

        <SegmentedProgress
          segments={METER_SEGMENTS}
          filled={filled}
          label={DASHBOARD_LABELS.progress}
        />

        <ProgressBar
          value={rate}
          size="xs"
          tone="brand"
          label={DASHBOARD_LABELS.progress}
        />

        <ul className="flex flex-col gap-2.5 border-t border-line pt-4">
          {STATUS_ORDER.map((status) => {
            const count = counts[status];
            const share = stats.total === 0 ? 0 : (count / stats.total) * 100;

            return (
              <li key={status} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    STATUS_META[status].dot,
                  )}
                />

                <span className="w-24 shrink-0 text-[12px] text-muted">
                  {STATUS_META[status].label}
                </span>

                <span
                  aria-hidden
                  className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-3"
                >
                  <span
                    className={cn(
                      "block h-full rounded-full transition-[width] duration-500 ease-out",
                      STATUS_META[status].dot,
                    )}
                    style={{ width: `${share}%` }}
                  />
                </span>

                <span className="numeric w-8 shrink-0 text-end text-[12px] font-medium text-content">
                  {formatNumber(count)}
                </span>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}
