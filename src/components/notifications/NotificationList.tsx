import { useMemo } from "react";
import { BellOff } from "lucide-react";
import { NOTIFICATION_LABELS } from "../../constants/labels";
import type { AppNotification } from "../../types";
import type { Lookup } from "../../utils/activityText";
import { relativeDayBucket } from "../../utils/date";
import { EmptyState } from "../ui/States";
import { NotificationItem } from "./NotificationItem";

type GroupKey = ReturnType<typeof relativeDayBucket>;

const GROUP_ORDER: GroupKey[] = ["today", "yesterday", "earlier"];

export interface NotificationListProps {
  notifications: AppNotification[];
  lookup: Lookup;
  onSelect: (notification: AppNotification) => void;
  dense?: boolean;
}

/**
 * The notification feed, grouped by day.
 *
 * Grouping happens here rather than in the store so the same flat list can be
 * reused by the dropdown, the full page and any future digest.
 */
export function NotificationList({
  notifications,
  lookup,
  onSelect,
  dense = false,
}: NotificationListProps) {
  const grouped = useMemo(() => {
    const map = new Map<GroupKey, AppNotification[]>();

    for (const notification of notifications) {
      const key = relativeDayBucket(notification.createdAt);
      const bucket = map.get(key);

      if (bucket) bucket.push(notification);
      else map.set(key, [notification]);
    }

    return map;
  }, [notifications]);

  if (notifications.length === 0) {
    return (
      <EmptyState
        variant="compact"
        icon={BellOff}
        title={NOTIFICATION_LABELS.empty}
        body={NOTIFICATION_LABELS.emptyHint}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {GROUP_ORDER.map((key) => {
        const bucket = grouped.get(key);
        if (!bucket || bucket.length === 0) return null;

        return (
          <section key={key} className="flex flex-col gap-1">
            <h3 className="px-1 text-[10px] font-semibold tracking-wider text-subtle uppercase">
              {NOTIFICATION_LABELS.groups[key]}
            </h3>

            {bucket.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                lookup={lookup}
                onSelect={onSelect}
                dense={dense}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
