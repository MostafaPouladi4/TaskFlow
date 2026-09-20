import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { createId } from "../shared/utils/id";
import {
  ToastContext,
  type Toast,
  type ToastContextValue,
  type ToastOptions,
  type ToastTone,
} from "./appearanceContext";

const DEFAULT_DURATION = 4200;
const MAX_VISIBLE = 4;

/**
 * Application-wide feedback.
 *
 * Toasts are queued here rather than rendered by the caller so that a message
 * survives the unmount of whatever triggered it (a modal closing after a
 * successful save, for example).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (tone: ToastTone, message: string, options?: ToastOptions): string => {
      const id = createId("toast");
      const duration = options?.duration ?? DEFAULT_DURATION;

      const toast: Toast = {
        id,
        tone,
        message,
        description: options?.description,
        duration,
      };

      setToasts((current) => [...current, toast].slice(-MAX_VISIBLE));

      if (duration > 0) {
        timers.current.set(id, window.setTimeout(() => dismiss(id), duration));
      }

      return id;
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      notify,
      success: (message, options) => notify("success", message, options),
      error: (message, options) => notify("error", message, options),
      info: (message, options) => notify("info", message, options),
      warning: (message, options) => notify("warning", message, options),
      dismiss,
      dismissAll: () => {
        timers.current.forEach((timer) => window.clearTimeout(timer));
        timers.current.clear();
        setToasts([]);
      },
    }),
    [toasts, notify, dismiss],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
