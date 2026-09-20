import type { ReactNode } from "react";
import { Toaster } from "../shared/components/ui/Toaster";
import { AppearanceProvider } from "./AppearanceProvider";
import { ToastProvider } from "./ToastProvider";
import { WorkspaceProvider } from "./WorkspaceProvider";

/**
 * Composes every app-wide provider in dependency order.
 *
 * Toasts sit above the workspace because the workspace reports write failures
 * through them; the appearance provider sits above everything so the theme is
 * applied before any surface renders.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppearanceProvider>
      <ToastProvider>
        <WorkspaceProvider>
          {children}
          <Toaster />
        </WorkspaceProvider>
      </ToastProvider>
    </AppearanceProvider>
  );
}
