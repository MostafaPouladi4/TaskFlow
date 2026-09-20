import { History } from "lucide-react";
import { EMPTY_STATE_LABELS, GENERIC_LABELS } from "../../../shared/constants/labels";
import { useLookup } from "../../../shared/hooks/useTasks";
import type { ActivityEvent } from "../../../shared/types";
import { cn } from "../../../shared/utils/cn";
import { describeActivity } from "../../../shared/utils/activityText";
import { formatRelativeTime } from "../../../shared/utils/date";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { EmptyState } from "../../../shared/components/ui/States";

export interface ActivityTimelineProps {
  events: ActivityEvent[];
  className?: string;
}

/**
 * The task's history, newest first.
 *
 * Each entry is a sentence assembled from typed segments, so the emphasised
 * parts (statuses, names) are rendered as elements rather than injected markup.
 */
export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  const lookup = useLookup();

  if (events.length === 0) {
    return (
      <EmptyState
        variant="compact"
        icon={History}
        title={EMPTY_STATE_LABELS.activity.title}
        body={EMPTY_STATE_LABELS.activity.body}
      />
    );
  }

  return (
    <ol className={cn("flex flex-col", className)}>
      {events.map((event, index) => {
        const actor = lookup.getUser(event.actorId);
        const description = describeActivity(event, lookup);
        const last = index === events.length - 1;

        return (
          <li key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Avatar
                name={actor?.name ?? GENERIC_LABELS.unknownUser}
                initials={actor?.avatar ?? GENERIC_LABELS.unknownInitial}
                seed={event.actorId}
                size="xs"
              />

              {!last && (
                <span aria-hidden className="w-px flex-1 bg-line" />
              )}
            </div>

            <div className={cn("min-w-0 flex-1", !last && "pb-4")}>
              <p className="text-[12px] leading-5 text-muted">
                <span className="font-medium text-content">
                  {actor?.name ?? GENERIC_LABELS.unknownUser}
                </span>{" "}
                {description.segments.map((segment, segmentIndex) => (
                  <span
                    // Positional segments, stable across renders.
                    key={segmentIndex}
                    className={
                      segment.kind === "strong"
                        ? "font-medium text-content"
                        : undefined
                    }
                  >
                    {segment.value}
                  </span>
                ))}
              </p>

              <time
                dateTime={event.createdAt}
                className="mt-0.5 block text-[10px] text-subtle"
              >
                {formatRelativeTime(event.createdAt)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
