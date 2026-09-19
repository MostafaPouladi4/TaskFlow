import { History } from "lucide-react";
import { Link } from "react-router-dom";
import { DASHBOARD_LABELS } from "../../constants/labels";
import { useActivityFeed } from "../../hooks/useTasks";
import { cn } from "../../utils/cn";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { EmptyState } from "../ui/States";
import { ActivityTimeline } from "../task/ActivityTimeline";

const DEFAULT_LIMIT = 6;

export interface ActivityFeedProps {
  limit?: number;
  className?: string;
}

/** What the team has been doing lately, newest first. */
export function ActivityFeed({
  limit = DEFAULT_LIMIT,
  className,
}: ActivityFeedProps) {
  const events = useActivityFeed(limit);

  return (
    <Card className={className}>
      <CardHeader
        title={DASHBOARD_LABELS.recentActivity}
        action={
          <Link
            to="/notifications"
            className="rounded-lg px-2 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-500/10 dark:text-brand-400"
          >
            {DASHBOARD_LABELS.viewAll}
          </Link>
        }
      />

      <CardBody className={cn("pt-4")}>
        {events.length === 0 ? (
          <EmptyState
            variant="compact"
            icon={History}
            title={DASHBOARD_LABELS.activityEmptyTitle}
            body={DASHBOARD_LABELS.activityEmptyBody}
          />
        ) : (
          <ActivityTimeline events={events} />
        )}
      </CardBody>
    </Card>
  );
}
