import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { ACTION_LABELS } from "../../shared/constants/labels";
import { Button } from "./Button";
import { Modal } from "./Modal";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
}

/**
 * Confirmation for a destructive action.
 *
 * The confirm handler may be async; the dialog stays open with a pending
 * button until it resolves, so the user can't dismiss it mid-write and lose
 * the outcome.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = ACTION_LABELS.confirm,
  cancelLabel = ACTION_LABELS.cancel,
  tone = "danger",
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  const handleConfirm = async (): Promise<void> => {
    setPending(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      dismissible={!pending}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => void handleConfirm()}
            loading={pending}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3.5">
        <span
          className={
            tone === "danger"
              ? "inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : "inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400"
          }
        >
          <AlertTriangle aria-hidden className="size-5" />
        </span>

        <p className="pt-1 text-sm leading-6 text-muted">{body}</p>
      </div>
    </Modal>
  );
}
