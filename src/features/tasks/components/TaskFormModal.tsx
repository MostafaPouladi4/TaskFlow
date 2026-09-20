import { useEffect, useId, useMemo, useState } from "react";
import { ChevronDown, ListChecks, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import {
  ACTION_LABELS,
  PICKER_LABELS,
  TASK_DETAIL_LABELS,
  TASK_FORM_LABELS,
} from "../../../shared/constants/labels";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_TITLE_LENGTH,
} from "../../../shared/constants/config";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
} from "../../../shared/constants/taskMeta";
import {
  useProjectPickerOptions,
  useTagPickerOptions,
  useUserPickerOptions,
} from "../../../shared/hooks/useTasks";
import { useWorkspace } from "../../../shared/hooks/useWorkspace";
import type {
  ChecklistItem,
  SelectOption,
  TaskDraft,
  TaskPatch,
  TaskPriority,
  TaskStatus,
  TaskWithRelations,
} from "../../../shared/types";
import { cn } from "../../../shared/utils/cn";
import { createId } from "../../../shared/utils/id";
import { Button } from "../../../shared/components/ui/Button";
import { Checkbox } from "../../../shared/components/ui/Checkbox";
import { Combobox } from "../../../shared/components/ui/Combobox";
import { DatePicker } from "../../../shared/components/ui/DatePicker";
import { Field, Input, Textarea } from "../../../shared/components/ui/Field";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { Modal } from "../../../shared/components/ui/Modal";
import { MultiSelect } from "../../../shared/components/ui/MultiSelect";
import { Select } from "../../../shared/components/ui/Select";

const DEFAULT_STATUS: TaskStatus = "todo";
const DEFAULT_PRIORITY: TaskPriority = "medium";

const STATUS_OPTIONS: SelectOption<TaskStatus>[] = STATUS_ORDER.map((value) => ({
  value,
  label: STATUS_META[value].label,
}));

const PRIORITY_OPTIONS: SelectOption<TaskPriority>[] = PRIORITY_ORDER.map(
  (value) => ({ value, label: PRIORITY_META[value].label }),
);

interface FormErrors {
  title: string | null;
  assignee: string | null;
  dueDate: string | null;
}

function toFormValues(
  task: TaskWithRelations | null,
  defaultStatus?: TaskStatus,
): TaskDraft {
  if (!task) {
    return {
      title: "",
      description: "",
      status: defaultStatus ?? DEFAULT_STATUS,
      priority: DEFAULT_PRIORITY,
      assigneeId: null,
      memberIds: [],
      startDate: "",
      dueDate: "",
      tagIds: [],
      checklist: [],
      projectId: null,
    };
  }

  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId,
    memberIds: [...task.memberIds],
    startDate: task.startDate ?? "",
    dueDate: task.dueDate ?? "",
    tagIds: [...task.tagIds],
    // Copied so edits in the form never touch the stored task before it is saved.
    checklist: task.checklist.map((item) => ({ ...item })),
    projectId: task.projectId,
  };
}

function validate(values: TaskDraft): FormErrors {
  const title = values.title.trim();

  return {
    title: !title
      ? TASK_FORM_LABELS.errors.titleRequired
      : title.length < MIN_TITLE_LENGTH
        ? TASK_FORM_LABELS.errors.titleTooShort
        : title.length > MAX_TITLE_LENGTH
          ? TASK_FORM_LABELS.errors.titleTooLong
          : null,
    assignee: values.assigneeId
      ? null
      : TASK_FORM_LABELS.errors.assigneeRequired,
    // Both bounds are ISO `yyyy-mm-dd`, so a string compare is a date compare.
    dueDate:
      values.startDate && values.dueDate && values.dueDate < values.startDate
        ? TASK_FORM_LABELS.errors.dueBeforeStart
        : null,
  };
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((error) => error !== null);
}

export interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Pass an existing task to edit; omit (or null) to create a new one. */
  task?: TaskWithRelations | null;
  /** Seeds the status when creating from a filtered view. */
  defaultStatus?: TaskStatus;
}

/**
 * Create / edit dialog for a task.
 *
 * The essentials (title, description, status, priority, owner, due date) are
 * always visible; scheduling extras, people, tags and the checklist live behind
 * "تنظیمات بیشتر" so the common case stays short. Validation runs on every
 * keystroke but messages only appear once submit has been attempted — the user
 * is not scolded while still typing the first character.
 */
export function TaskFormModal({
  open,
  onClose,
  task = null,
  defaultStatus,
}: TaskFormModalProps) {
  const { actions } = useWorkspace();

  const userOptions = useUserPickerOptions();
  const tagOptions = useTagPickerOptions();
  const projectOptions = useProjectPickerOptions();

  const formId = useId();
  const titleId = useId();
  const descriptionId = useId();

  const [values, setValues] = useState<TaskDraft>(() =>
    toFormValues(task, defaultStatus),
  );
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [checklistDraft, setChecklistDraft] = useState("");

  const isEdit = task !== null;

  // Re-seed on open so a cancelled edit never leaks into the next one.
  useEffect(() => {
    if (!open) return;

    setValues(toFormValues(task, defaultStatus));
    setTouched(false);
    setSubmitting(false);
    setShowAdvanced(false);
    setChecklistDraft("");
  }, [open, task, defaultStatus]);

  const errors = useMemo(() => validate(values), [values]);
  const invalid = touched && hasErrors(errors);

  const patch = <K extends keyof TaskDraft>(
    key: K,
    value: TaskDraft[K],
  ): void => {
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const updateChecklist = (
    id: string,
    changes: Partial<ChecklistItem>,
  ): void => {
    patch(
      "checklist",
      values.checklist.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    );
  };

  const addChecklistItem = (): void => {
    const title = checklistDraft.trim();
    if (!title) return;

    patch("checklist", [
      ...values.checklist,
      { id: createId("check"), title, done: false },
    ]);
    setChecklistDraft("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setTouched(true);
    if (hasErrors(errors) || submitting) return;

    const draft: TaskDraft = {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
    };

    setSubmitting(true);
    try {
      if (task) {
        // Empty strings mean "cleared" here, but the model stores null for an
        // absent date — so they are converted rather than persisted as "".
        const changes: TaskPatch = {
          title: draft.title,
          description: draft.description,
          status: draft.status,
          priority: draft.priority,
          assigneeId: draft.assigneeId,
          memberIds: draft.memberIds,
          startDate: draft.startDate || null,
          dueDate: draft.dueDate || null,
          tagIds: draft.tagIds,
          checklist: draft.checklist,
          projectId: draft.projectId,
        };

        if (await actions.updateTask(task.id, changes)) onClose();
      } else if (await actions.createTask(draft)) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fields = TASK_FORM_LABELS.fields;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      dismissible={!submitting}
      title={isEdit ? TASK_FORM_LABELS.editTitle : TASK_FORM_LABELS.createTitle}
      description={
        isEdit ? TASK_FORM_LABELS.editSubtitle : TASK_FORM_LABELS.createSubtitle
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            {ACTION_LABELS.cancel}
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={submitting}
            disabled={submitting}
          >
            {isEdit ? ACTION_LABELS.saveChanges : ACTION_LABELS.createTask}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={(event) => void handleSubmit(event)}
        className="flex flex-col gap-5"
      >
        <Field
          label={fields.title}
          required
          htmlFor={titleId}
          error={touched ? errors.title : null}
        >
          <Input
            id={titleId}
            value={values.title}
            autoFocus
            maxLength={MAX_TITLE_LENGTH}
            placeholder={TASK_FORM_LABELS.placeholders.title}
            invalid={invalid && errors.title !== null}
            onChange={(event) => patch("title", event.target.value)}
          />
        </Field>

        <Field label={fields.description} htmlFor={descriptionId}>
          <Textarea
            id={descriptionId}
            value={values.description}
            rows={4}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder={TASK_FORM_LABELS.placeholders.description}
            onChange={(event) => patch("description", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={fields.status}>
            <Select
              value={values.status}
              onValueChange={(value) => patch("status", value)}
              options={STATUS_OPTIONS}
              aria-label={fields.status}
            />
          </Field>

          <Field label={fields.priority}>
            <Select
              value={values.priority}
              onValueChange={(value) => patch("priority", value)}
              options={PRIORITY_OPTIONS}
              aria-label={fields.priority}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={fields.assignee}
            required
            error={touched ? errors.assignee : null}
          >
            <Combobox
              value={values.assigneeId}
              onChange={(value) => patch("assigneeId", value)}
              options={userOptions}
              label={fields.assignee}
              placeholder={TASK_FORM_LABELS.placeholders.selectUser}
              searchPlaceholder={PICKER_LABELS.searchUsers}
              emptyLabel={PICKER_LABELS.noUsers}
              invalid={invalid && errors.assignee !== null}
            />
          </Field>

          <Field
            label={fields.dueDate}
            error={touched ? errors.dueDate : null}
          >
            <DatePicker
              value={values.dueDate || null}
              onChange={(value) => patch("dueDate", value ?? "")}
              label={fields.dueDate}
              placeholder={TASK_FORM_LABELS.placeholders.selectDate}
              clearable
              min={values.startDate || null}
              invalid={invalid && errors.dueDate !== null}
            />
          </Field>
        </div>

        <div className="rounded-xl border border-line">
          <button
            type="button"
            aria-expanded={showAdvanced}
            onClick={() => setShowAdvanced((visible) => !visible)}
            className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-start text-[13px] font-medium text-content transition-colors hover:bg-surface-2"
          >
            <SlidersHorizontal aria-hidden className="size-4 text-muted" />
            {TASK_FORM_LABELS.sections.advanced}

            {!showAdvanced && (
              <span className="text-[11px] font-normal text-subtle">
                {fields.project}، {fields.tags}، {fields.checklist}
              </span>
            )}

            <ChevronDown
              aria-hidden
              className={cn(
                "ms-auto size-4 shrink-0 text-subtle transition-transform duration-200",
                showAdvanced && "rotate-180",
              )}
            />
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-4 border-t border-line px-3.5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={fields.project}>
                  <Combobox
                    value={values.projectId}
                    onChange={(value) => patch("projectId", value)}
                    options={projectOptions}
                    label={fields.project}
                    placeholder={fields.project}
                    searchPlaceholder={PICKER_LABELS.searchProjects}
                    emptyLabel={PICKER_LABELS.noProjects}
                    clearable
                  />
                </Field>

                <Field label={fields.startDate}>
                  <DatePicker
                    value={values.startDate || null}
                    onChange={(value) => patch("startDate", value ?? "")}
                    label={fields.startDate}
                    placeholder={TASK_FORM_LABELS.placeholders.selectDate}
                    clearable
                    max={values.dueDate || null}
                  />
                </Field>
              </div>

              <Field label={fields.members}>
                <MultiSelect
                  values={values.memberIds}
                  onChange={(next) => patch("memberIds", next)}
                  options={userOptions}
                  label={fields.members}
                  placeholder={TASK_FORM_LABELS.placeholders.selectUser}
                  searchPlaceholder={PICKER_LABELS.searchUsers}
                  emptyLabel={PICKER_LABELS.noUsers}
                />
              </Field>

              <Field label={fields.tags}>
                <MultiSelect
                  values={values.tagIds}
                  onChange={(next) => patch("tagIds", next)}
                  options={tagOptions}
                  label={fields.tags}
                  placeholder={TASK_FORM_LABELS.placeholders.selectTags}
                  searchPlaceholder={PICKER_LABELS.searchTags}
                  emptyLabel={PICKER_LABELS.noTags}
                />
              </Field>

              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-content">
                  <ListChecks aria-hidden className="size-3.5 text-muted" />
                  {fields.checklist}
                </span>

                {values.checklist.length === 0 ? (
                  <p className="text-[11px] text-subtle">
                    {TASK_DETAIL_LABELS.checklistEmpty}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {values.checklist.map((item) => (
                      <li key={item.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={item.done}
                          onCheckedChange={(done) =>
                            updateChecklist(item.id, { done })
                          }
                          label={item.title}
                          size="sm"
                        />

                        <Input
                          value={item.title}
                          size="sm"
                          aria-label={fields.checklist}
                          onChange={(event) =>
                            updateChecklist(item.id, {
                              title: event.target.value,
                            })
                          }
                          className={cn(
                            item.done && "text-subtle line-through",
                          )}
                        />

                        <IconButton
                          icon={Trash2}
                          label={TASK_FORM_LABELS.checklistRemove}
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            patch(
                              "checklist",
                              values.checklist.filter(
                                (entry) => entry.id !== item.id,
                              ),
                            )
                          }
                        />
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center gap-2">
                  <Input
                    value={checklistDraft}
                    size="sm"
                    aria-label={TASK_FORM_LABELS.checklistAdd}
                    placeholder={TASK_FORM_LABELS.placeholders.checklistItem}
                    onChange={(event) => setChecklistDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      // Enter here adds a row — it must not submit the task.
                      event.preventDefault();
                      addChecklistItem();
                    }}
                  />

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Plus}
                    onClick={addChecklistItem}
                    disabled={checklistDraft.trim().length === 0}
                  >
                    {ACTION_LABELS.create}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
