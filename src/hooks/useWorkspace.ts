import { useContext } from "react";
import {
  WorkspaceContext,
  type WorkspaceContextValue,
} from "../store/workspaceContext";

/** The application's data, actions and current user. */
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace باید داخل WorkspaceProvider استفاده شود.");
  }

  return context;
}
