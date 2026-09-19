import { createContext } from "react";

export type ThemePreference = "light" | "dark" | "system";

export type ResolvedTheme = "light" | "dark";

export type Density = "comfortable" | "compact";

export interface AppearanceContextValue {
  /** What the user chose — may be "system". */
  theme: ThemePreference;
  /** What is actually painted right now — never "system". */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  /** Flips between light and dark, resolving "system" first. */
  toggleTheme: () => void;
  density: Density;
  setDensity: (density: Density) => void;
}

export const AppearanceContext = createContext<AppearanceContextValue | null>(
  null,
);

export type ToastTone = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  tone: ToastTone;
  message: string;
  description?: string;
  /** Milliseconds before auto-dismiss; 0 keeps it until dismissed. */
  duration: number;
}

export interface ToastOptions {
  description?: string;
  duration?: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  notify: (tone: ToastTone, message: string, options?: ToastOptions) => string;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
