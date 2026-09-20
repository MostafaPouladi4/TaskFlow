import { useEffect, useState, type ReactNode } from "react";
import { CalendarClock, FileText, History, Pencil, Trash2, Users } from "lucide-react";
import {
  ACTION_LABELS,
  PICKER_LABELS,
  TASK_DETAIL_LABELS,
  TASK_FORM_LABELS,
} from "../../../shared/constants/labels";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
} from "../../../shared/constants/taskMeta";
import { useTaskActivity, useUserPickerOptions } from "../../../shared/hooks/useTasks";
import { useWorkspace } from "../../../shared/hooks/useWorkspace";
import type {
  SelectOption,
  TaskPriority,
  TaskStatus,
  TaskWithRelations,
} from "../../../shared/types";
import { formatRelativeTime } from "../../../shared/utils/date";
import { CommentList } from "../../comments/components/CommentList";
import { Combobox } from "../../../shared/components/ui/Combobox";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { Drawer } from "../../../shared/components/ui/Drawer";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { Select } from "../../../shared/components/ui/Select";
import { ActivityTimeline } from "./ActivityTimeline";
import { ChecklistSection } from "./ChecklistSection";
import { TaskDates } from "./TaskDates";
import { TaskFormModal } from "./TaskFormModal";
import { TaskPeople } from "./TaskPeople";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskTags } from "./TaskTags";

const STATUS_OPTIONS: SelectOption<TaskStatus>[] = STATUS_ORDER.map((value) => ({
  value,
  label: STATUS_META[value].label,
}));

const PRIORITY_OPTIONS: SelectOption<TaskPriority>[] = PRIORITY_ORDER.map(
  (value) => ({ value, label: PRIORITY_META[value].label }),
);

interface SectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}

/** Titled block used for every part of the detail view. */
function Section({ title, icon: Icon, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-2">
        <Icon aria-hidden className="size-3.5 text-subtle" />
        <h3 className="text-[13px] font-semibold text-content">{title}</h3>
      </header>

      {children}
    </section>
  );
}

export interface TaskDetailDrawerProps {
  /**
   * The task to show, or null to close. The last non-null task is retained
   * internally so the panel keeps its content through the exit animation.
   */
  task: TaskWithRelations | null;
  onClose: () => void;
}

/**
 * Everything about one task, without leaving the list.
 *
 * Status, priority and owner are editable in place at the top — those are the
 * three things that change most often, and bouncing through an edit dialog just
 * to move a task to "در حال انجام" would be friction for no reason.
 */
export function TaskDetailDrawer({ task, onClose }: TaskDetailDrawerProps) {
  const { actions } = useWorkspace();
  const userOptions = useUserPickerOptions();

  const [cached, setCached] = useState<TaskWithRelations | null>(task);
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (task) setCached(task);
  }, [task]);

  const shown = task ?? cached;
  const events = useTaskActivity(shown?.id);

  if (!shown) return null;

  const handleDelete = async (): Promise<void> => {
    setConfirmOpen(false);
    if (await actions.deleteTask(shown.id)) onClose();
  };

  return (
    <>
      <Drawer
        open={task !== null}
        onClose={onClose}
        width="lg"
        title={shown.title}
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-[10px] text-subtle">
              {shown.code}
            </span>
            <span aria-hidden>·</span>
            <span>{formatRelativeTime(shown.createdAt)}</span>
          </span>
        }
        headerAccessory={
          <>
            <IconButton
              icon={Pencil}
              label={TASK_FORM_LABELS.editTitle}
              size="sm"
              onClick={() => setEditing(true)}
            />
            <IconButton
              icon={Trash2}
              label={TASK_DETAIL_LABELS.deleteConfirmTitle}
              size="sm"
              variant="danger"
              onClick={() => setConfirmOpen(true)}
            />
          </>
        }
      >
        <div className="flex flex-col gap-6 px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted">
                {TASK_FORM_LABELS.fields.status}
              </span>
              <Select
                value={shown.status}
                options={STATUS_OPTIONS}
                onValueChange={(value) =>
                  void actions.setTaskStatus(shown.id, value)
                }
                aria-label={TASK_FORM_LABELS.fields.status}
                size="sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted">
                {TASK_FORM_LABELS.fields.priority}
              </span>
              <Select
                value={shown.priority}
                options={PRIORITY_OPTIONS}
                onValueChange={(value) =>
                  void actions.updateTask(shown.id, { priority: value })
                }
                aria-label={TASK_FORM_LABELS.fields.priority}
                size="sm"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[11px] font-medium text-muted">
                {TASK_FORM_LABELS.fields.assignee}
              </span>
              <Combobox
                value={shown.assigneeId}
                options={userOptions}
                onChange={(value) =>
                  void actions.updateTask(shown.id, { assigneeId: value })
                }
                label={TASK_FORM_LABELS.fields.assignee}
                placeholder={TASK_FORM_LABELS.placeholders.selectUser}
                searchPlaceholder={PICKER_LABELS.searchUsers}
                emptyLabel={PICKER_LABELS.noUsers}
                size="sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <TaskStatusBadge status={shown.status} />
            <TaskPriorityBadge priority={shown.priority} />
            {shown.tags.length > 0 && <TaskTags tags={shown.tags} max={4} />}
          </div>

          <Section title={TASK_DETAIL_LABELS.description} icon={FileText}>
            {shown.description ? (
              <p className="whitespace-pre-line break-words text-[13px] leading-6 text-muted">
                {shown.description}
              </p>
            ) : (
              <p className="text-[12px] italic text-subtle">
                {TASK_DETAIL_LABELS.noDescription}
              </p>
            )}
          </Section>

          <Section title={TASK_DETAIL_LABELS.dates} icon={CalendarClock}>
            <TaskDates
              layout="stacked"
              startDate={shown.startDate}
              dueDate={shown.dueDate}
              className="rounded-xl border border-line bg-surface-2/40 px-3.5 py-3"
            />
          </Section>

          <Section title={TASK_DETAIL_LABELS.members} icon={Users}>
            <TaskPeople
              variant="group"
              assignee={shown.assignee}
              members={shown.members}
            />
          </Section>

          <div className="border-t border-line pt-5">
            <ChecklistSection taskId={shown.id} items={shown.checklist} />
          </div>

          <div className="border-t border-line pt-5">
            <CommentList taskId={shown.id} />
          </div>

          <div className="border-t border-line pt-5">
            <Section title={TASK_DETAIL_LABELS.activity} icon={History}>
              <ActivityTimeline events={events} />
            </Section>
          </div>
        </div>
      </Drawer>

      <TaskFormModal
        open={editing}
        onClose={() => setEditing(false)}
        task={shown}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
        title={TASK_DETAIL_LABELS.deleteConfirmTitle}
        body={TASK_DETAIL_LABELS.deleteConfirmBody}
        confirmLabel={ACTION_LABELS.delete}
      />
    </>
  );
}
