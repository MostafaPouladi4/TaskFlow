import { CheckCircle2, CircleDashed, Clock, TriangleAlert } from "lucide-react";
import { DASHBOARD_LABELS } from "../../constants/labels";
import { useTaskStats } from "../../hooks/useTasks";
import { cn } from "../../utils/cn";
import { formatNumber, formatPercent } from "../../utils/text";
import { StatCard } from "./StatCard";

export interface StatsGridProps {
  className?: string;
}

/**
 * The four headline numbers.
 *
 * Each carries a share-of-total hint so a bare count has context — "۱۲" means
 * little on its own, "۲۴٪ از کل" does not.
 */
export function StatsGrid({ className }: StatsGridProps) {
  const stats = useTaskStats();

  const share = (count: number): string =>
    stats.total === 0 ? formatPercent(0) : formatPercent((count / stats.total) * 100);

  return (
    <div
      className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4", className)}
    >
      <StatCard
        label={DASHBOARD_LABELS.stats.total}
        value={formatNumber(stats.total)}
        icon={CircleDashed}
        tone="brand"
        hint={DASHBOARD_LABELS.doneOfTotal(
          formatNumber(stats.done),
          formatNumber(stats.total),
        )}
      />

      <StatCard
        label={DASHBOARD_LABELS.stats.done}
        value={formatNumber(stats.done)}
        icon={CheckCircle2}
        tone="emerald"
        hint={share(stats.done)}
      />

      <StatCard
        label={DASHBOARD_LABELS.stats.inProgress}
        value={formatNumber(stats.inProgress)}
        icon={Clock}
        tone="amber"
        hint={share(stats.inProgress)}
      />

      <StatCard
        label={DASHBOARD_LABELS.stats.overdue}
        value={formatNumber(stats.overdue)}
        icon={TriangleAlert}
        tone="rose"
        hint={share(stats.overdue)}
      />
    </div>
  );
}
