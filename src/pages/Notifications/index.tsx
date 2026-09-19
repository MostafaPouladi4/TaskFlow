import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck } from "lucide-react";
import { NOTIFICATION_LABELS } from "../../constants/labels";
import { useInboxNotifications, useLookup } from "../../hooks/useTasks";
import { useWorkspace } from "../../hooks/useWorkspace";
import type { AppNotification } from "../../types";
import { formatNumber } from "../../utils/text";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageGuard } from "../../components/layout/PageGuard";
import { NotificationList } from "../../components/notifications/NotificationList";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { Skeleton } from "../../components/ui/Skeleton";

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
