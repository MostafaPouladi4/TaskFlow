import { useOutletContext } from "react-router-dom";

/**
 * What every routed page receives from `AppShell`.
 *
 * Pages do not own the create-task dialog — the shell does — so a page deep in
 * the tree can open it without prop-drilling a callback through every level.
 */
export interface AppShellContext {
  openCreateTask: () => void;
}

export function useAppShell(): AppShellContext {
  return useOutletContext<AppShellContext>();
}
