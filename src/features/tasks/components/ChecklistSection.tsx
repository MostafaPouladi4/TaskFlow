import { useState } from "react";
import { Check, ListPlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { ACTION_LABELS, TASK_DETAIL_LABELS, TASK_FORM_LABELS } from "../../../shared/constants/labels";
import { useWorkspace } from "../../../shared/hooks/useWorkspace";
import { cn } from "../../../shared/utils/cn";
import { formatPercent, toPersianDigits } from "../../../shared/utils/text";
import type { ChecklistItem, ID } from "../../../shared/types";
import { Checkbox } from "../../../shared/components/ui/Checkbox";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { ProgressBar } from "../../../shared/components/ui/ProgressBar";

export interface ChecklistSectionProps {
  taskId: ID;
  items: ChecklistItem[];
  className?: string;
}

/**
 * The checklist, with its own progress readout.
 *
 * Rows are edited in place rather than through a dialog: a checklist is a
 * rapid-fire list of short strings, and a modal per item would be far more
 * friction than the edit is worth.
 */
export function ChecklistSection({
  taskId,
  items,
  className,
}: ChecklistSectionProps) {
  const { actions } = useWorkspace();

  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<ID | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const doneCount = items.filter((item) => item.done).length;
  const percent = items.length === 0 ? 0 : (doneCount / items.length) * 100;

  const handleAdd = async (): Promise<void> => {
    const title = draft.trim();
    if (!title) return;

    setAdding(true);
    try {
      const ok = await actions.addChecklistItem(taskId, title);
      if (ok) setDraft("");
    } finally {
      setAdding(false);
    }
  };

  const commitEdit = async (itemId: ID): Promise<void> => {
    const title = editingTitle.trim();
    setEditingId(null);

    if (!title) return;
    await actions.updateChecklistItem(taskId, itemId, title);
  };

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <header className="flex items-center gap-2">
        <h3 className="text-[13px] font-semibold text-content">
          {TASK_DETAIL_LABELS.checklist}
        </h3>

        {items.length > 0 && (
          <span className="text-[11px] text-subtle">
            {TASK_DETAIL_LABELS.checklistProgress(
              toPersianDigits(doneCount),
              toPersianDigits(items.length),
            )}
          </span>
        )}

        <span className="ms-auto text-[11px] font-medium text-muted">
          {formatPercent(percent)}
        </span>
      </header>

      {items.length > 0 && (
        <ProgressBar
          value={percent}
          size="sm"
          label={TASK_DETAIL_LABELS.checklist}
        />
      )}

      {items.length === 0 ? (
        <p className="text-[11px] leading-5 text-subtle">
          {TASK_DETAIL_LABELS.checklistEmpty}
        </p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="group flex items-start gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-surface-2"
            >
              <Checkbox
                size="sm"
                checked={item.done}
                onCheckedChange={() =>
                  void actions.toggleChecklistItem(taskId, item.id)
                }
                label={item.title}
              />

              {editingId === item.id ? (
                <span className="flex min-w-0 flex-1 items-center gap-1">
                  <input
                    autoFocus
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void commitEdit(item.id);
                      }
                      if (event.key === "Escape") setEditingId(null);
                    }}
                    aria-label={item.title}
                    className="h-7 min-w-0 flex-1 rounded-md border border-line bg-surface px-2 text-[13px] text-content outline-none focus:border-brand-500"
                  />

                  <IconButton
                    icon={Check}
                    label={ACTION_LABELS.save}
                    size="sm"
                    variant="ghost"
                    onClick={() => void commitEdit(item.id)}
                  />
                  <IconButton
                    icon={X}
                    label={ACTION_LABELS.cancel}
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  />
                </span>
              ) : (
                <>
                  <span
                    className={cn(
                      "min-w-0 flex-1 text-[13px] leading-6",
                      item.done ? "text-subtle line-through" : "text-content",
                    )}
                  >
                    {item.title}
                  </span>

                  <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <IconButton
                      icon={Pencil}
                      label={ACTION_LABELS.edit}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditingTitle(item.title);
                      }}
                    />
                    <IconButton
                      icon={Trash2}
                      label={ACTION_LABELS.remove}
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        void actions.removeChecklistItem(taskId, item.id)
                      }
                    />
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <span className="relative flex-1">
          <ListPlus
            aria-hidden
            className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
          />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleAdd();
              }
            }}
            placeholder={TASK_FORM_LABELS.placeholders.checklistItem}
            aria-label={TASK_FORM_LABELS.placeholders.checklistItem}
            className="h-9 w-full rounded-lg border border-line bg-surface ps-9 pe-3 text-[13px] text-content transition-colors outline-none placeholder:text-subtle hover:border-line-strong focus:border-brand-500"
          />
        </span>

        <IconButton
          icon={Plus}
          label={ACTION_LABELS.add}
          variant="secondary"
          loading={adding}
          disabled={draft.trim().length === 0}
          onClick={() => void handleAdd()}
        />
      </div>
    </section>
  );
}
