import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck } from "lucide-react";
import { NOTIFICATION_LABELS } from "../../shared/constants/labels";
import { useInboxNotifications, useLookup } from "../../shared/hooks/useTasks";
import { useWorkspace } from "../../shared/hooks/useWorkspace";
import type { AppNotification } from "../../types";
import { formatNumber } from "../../shared/utils/text";
import { PageHeader } from "../../shared/components/layout/PageHeader";
import { PageGuard } from "../../shared/components/layout/PageGuard";
import { NotificationList } from "../../features/notifications/components/NotificationList";
import { Button } from "../../shared/components/ui/Button";
import { Card } from "../../shared/components/ui/Card";
import { SegmentedControl } from "../../shared/components/ui/SegmentedControl";
import { Skeleton } from "../../shared/components/ui/Skeleton";

type InboxFilter = "all" | "unread";

const FILTER_OPTIONS: { value: InboxFilter; label: string }[] = [
  { value: "all", label: NOTIFICATION_LABELS.all },
  { value: "unread", label: NOTIFICATION_LABELS.unreadOnly },
];

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: 6 }, (_unused, index) => (
        <Skeleton key={index} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}

/**
 * The full notification inbox.
 *
 * The bell popover shows the same feed in miniature; this page adds the
 * unread-only filter and a bulk "mark all read" action.
 */
export function NotificationsPage() {
  const { unreadCount, actions } = useWorkspace();
  const inbox = useInboxNotifications();
  const lookup = useLookup();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<InboxFilter>("all");

  const visible = useMemo(
    () => (filter === "unread" ? inbox.filter((item) => !item.read) : inbox),
    [inbox, filter],
  );

  const handleSelect = useCallback(
    (notification: AppNotification) => {
      actions.markNotificationRead(notification.id);

      if (notification.taskId) {
        void navigate(`/tasks/${notification.taskId}`);
      }
    },
    [actions, navigate],
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={NOTIFICATION_LABELS.title}
        description={
          unreadCount > 0
            ? `${formatNumber(unreadCount)} ${NOTIFICATION_LABELS.unread}`
            : undefined
        }
        actions={
          <Button
            icon={CheckCheck}
            size="sm"
            disabled={unreadCount === 0}
            onClick={actions.markAllNotificationsRead}
          >
            {NOTIFICATION_LABELS.markAllRead}
          </Button>
        }
      />

      <SegmentedControl<InboxFilter>
        value={filter}
        onValueChange={setFilter}
        options={FILTER_OPTIONS}
        label={NOTIFICATION_LABELS.title}
        size="sm"
        className="self-start"
      />

      <PageGuard skeleton={<NotificationsSkeleton />}>
        <Card className="p-2.5">
          <NotificationList
            notifications={visible}
            lookup={lookup}
            onSelect={handleSelect}
          />
        </Card>
      </PageGuard>
    </div>
  );
}
