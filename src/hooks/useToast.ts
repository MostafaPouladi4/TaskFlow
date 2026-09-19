import { useContext } from "react";
import { ToastContext, type ToastContextValue } from "../store/appearanceContext";

/** Access to the toast queue. Must be used inside `ToastProvider`. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast باید داخل ToastProvider استفاده شود.");
  }

  return context;
}
