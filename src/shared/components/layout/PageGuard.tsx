import type { ReactNode } from "react";
import { ERROR_LABELS } from "../../shared/constants/labels";
import { useWorkspace } from "../../shared/hooks/useWorkspace";
import { ErrorState } from "../ui/States";

export interface PageGuardProps {
  children: ReactNode;
  /** Shown while the workspace loads — prefer a skeleton over a spinner. */
  skeleton: ReactNode;
  /** Overrides the generic failure heading for pages that load something specific. */
  errorTitle?: string;
}

/**
 * Loading / error / content for a whole page.
 *
 * Centralised so every page treats the three states the same way — a retry that
 * calls the same `reload`, and a skeleton that matches the shape of what is
 * coming rather than a generic spinner.
 */
export function PageGuard({
  children,
  skeleton,
  errorTitle,
}: PageGuardProps) {
  const { status, error, actions } = useWorkspace();

  if (status === "idle" || status === "loading") {
    return <div aria-busy="true">{skeleton}</div>;
  }

  if (status === "error") {
    return (
      <ErrorState
        title={errorTitle ?? ERROR_LABELS.generic}
        body={error ?? ERROR_LABELS.genericHint}
        onRetry={actions.reload}
      />
    );
  }

  return <>{children}</>;
}
