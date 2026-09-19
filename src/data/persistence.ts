import type { WorkspaceSnapshot } from "./index";

/**
 * Durable copy of the workspace, so edits survive a reload.
 *
 * Stored under a versioned envelope: if the shape of the data changes, the
 * version bump invalidates old payloads instead of hydrating the store with
 * records that no longer match the types.
 */
const STORAGE_KEY = "taskflow:workspace";
const SCHEMA_VERSION = 1;

interface StoredEnvelope {
  version: number;
  savedAt: string;
  snapshot: WorkspaceSnapshot;
}

export function readStoredWorkspace(): WorkspaceSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredEnvelope;
    if (parsed.version !== SCHEMA_VERSION) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.snapshot;
  } catch {
    // Corrupt payload — drop it and fall back to the fixtures.
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing more we can do.
    }
    return null;
  }
}

export function writeStoredWorkspace(snapshot: WorkspaceSnapshot): void {
  if (typeof window === "undefined") return;

  const envelope: StoredEnvelope = {
    version: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    snapshot,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Over quota or storage disabled — the session still works in memory.
  }
}

export function clearStoredWorkspace(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

/** Extracts just the persisted slices from a store state object. */
export function toSnapshot(state: WorkspaceSnapshot): WorkspaceSnapshot {
  return {
    users: state.users,
    tags: state.tags,
    projects: state.projects,
    tasks: state.tasks,
    comments: state.comments,
    activity: state.activity,
    notifications: state.notifications,
  };
}
