import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CURRENT_USER_ID } from "../shared/constants/config";
import { ERROR_LABELS, TOAST_LABELS } from "../shared/constants/labels";
import { buildIndex, resolveTasks, type WorkspaceSnapshot } from "../data";
import { fetchWorkspace, persist, remove } from "../services/api";
import {
  clearStoredWorkspace,
  readStoredWorkspace,
  toSnapshot,
  writeStoredWorkspace,
} from "../services/persistence";
import { USERS } from "../services/users";
import type { ApiResponse } from "../../shared/types";
import type { Comment, ID, Task, TaskDraft, TaskPatch, TaskStatus } from "../../shared/types";
import { createId, nextTaskNumber, seedTaskCounter } from "../shared/utils/id";
import { useToast } from "../shared/hooks/useToast";
import {
  onCommentCreated,
  onTaskCreated,
  onTaskPatched,
} from "./workspaceMutations";
import {
  INITIAL_WORKSPACE_STATE,
  snapshotForRollback,
  workspaceReducer,
  type WorkspaceState,
} from "./workspaceReducer";
import {
  WorkspaceContext,
  type WorkspaceActions,
  type WorkspaceContextValue,
} from "./workspaceContext";

/** Rendered before the workspace loads, so the shell never has a null user. */
const FALLBACK_USER = USERS[0];

/**
 * Owns the application's data.
 *
 * Writes are optimistic: the store updates immediately, the write is sent,
 * and a failure restores the pre-mutation snapshot and reports why. That
 * keeps interactions instant while still being honest when a write fails.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [state, dispatch] = useReducer(workspaceReducer, INITIAL_WORKSPACE_STATE);
  const [reloadToken, setReloadToken] = useState(0);

  // Lets action creators read the latest state without re-creating callbacks
  // on every render (which would invalidate every consumer's memoisation).
  const stateRef = useRef<WorkspaceState>(state);
  stateRef.current = state;

  const currentUserId = CURRENT_USER_ID;

  /* ── Loading ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "load:start" });

    const hydrate = (snapshot: WorkspaceSnapshot): void => {
      const highestCode = snapshot.tasks.reduce((highest, task) => {
        const numeric = Number.parseInt(task.code.replace(/\D/g, ""), 10);
        return Number.isNaN(numeric) ? highest : Math.max(highest, numeric);
      }, 100);
      seedTaskCounter(highestCode);

      dispatch({ type: "load:success", payload: snapshot });
    };

    const stored = readStoredWorkspace();
    if (stored) {
      hydrate(stored);
      return;
    }

    void fetchWorkspace().then((response) => {
      if (cancelled) return;

      if (response.success) {
        hydrate(response.data);
      } else {
        dispatch({ type: "load:error", payload: response.message });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  /* ── Persistence ─────────────────────────────────────────────────────── */

  const { tasks, comments, activity, notifications, status } = state;

  useEffect(() => {
    if (status !== "success") return;

    const timer = window.setTimeout(() => {
      writeStoredWorkspace(toSnapshot(stateRef.current));
    }, 400);

    return () => window.clearTimeout(timer);
  }, [tasks, comments, activity, notifications, status]);

  /* ── Derived views ───────────────────────────────────────────────────── */

  const index = useMemo(
    () =>
      buildIndex({
        users: state.users,
        tags: state.tags,
        projects: state.projects,
        tasks: state.tasks,
        comments: state.comments,
        activity: state.activity,
        notifications: state.notifications,
      }),
    [
      state.users,
      state.tags,
      state.projects,
      state.tasks,
      state.comments,
      state.activity,
      state.notifications,
    ],
  );

  const resolvedTasks = useMemo(
    () => resolveTasks(state.tasks, index),
    [state.tasks, index],
  );

  const currentUser = index.users.get(currentUserId) ?? FALLBACK_USER;

  /* ── Write plumbing ──────────────────────────────────────────────────── */

  /**
   * Applies a change optimistically, then persists it, restoring the previous
   * snapshot if the write fails.
   *
   * The snapshot is taken before `apply` runs, so it always reflects the
   * state the user saw. Actions are driven by user input, so two mutations
   * never race in the same tick.
   */
  const runMutation = useCallback(
    async (
      apply: () => void,
      send: () => Promise<ApiResponse<unknown>>,
      errorMessage: string,
    ): Promise<boolean> => {
      const rollbackPoint = snapshotForRollback(stateRef.current);
      apply();

      const response = await send();

      if (!response.success) {
        dispatch({ type: "workspace:restore", payload: rollbackPoint });
        toast.error(errorMessage);
        return false;
      }

      return true;
    },
    [toast],
  );

  /** Fire-and-forget write for low-stakes changes (reactions, read state). */
  const persistQuietly = useCallback((send: () => Promise<ApiResponse<unknown>>) => {
    void send();
  }, []);

  /* ── Task actions ────────────────────────────────────────────────────── */

  const applyTaskPatch = useCallback(
    async (id: ID, patch: TaskPatch, errorMessage = ERROR_LABELS.saveFailed) => {
      const before = stateRef.current.tasks.find((task) => task.id === id);
      if (!before) return false;

      const now = new Date().toISOString();
      const after: Task = { ...before, ...patch, updatedAt: now };
      const effects = onTaskPatched(before, after, currentUserId, now, createId);

      return runMutation(
        () =>
          dispatch({
            type: "task:patch",
            payload: { id, patch: { ...patch, updatedAt: now }, ...effects },
          }),
        () => persist(after),
        errorMessage,
      );
    },
    [currentUserId, runMutation],
  );

  const createTask = useCallback(
    async (draft: TaskDraft): Promise<Task | null> => {
      const now = new Date().toISOString();

      const task: Task = {
        id: createId("task"),
        code: `TF-${nextTaskNumber()}`,
        projectId: draft.projectId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        status: draft.status,
        priority: draft.priority,
        assigneeId: draft.assigneeId,
        memberIds: draft.memberIds,
        mentionIds: [],
        startDate: draft.startDate || null,
        dueDate: draft.dueDate || null,
        tagIds: draft.tagIds,
        checklist: draft.checklist,
        commentIds: [],
        createdById: currentUserId,
        createdAt: now,
        updatedAt: now,
        completedAt: draft.status === "done" ? now : null,
      };

      const effects = onTaskCreated(task, currentUserId, now, createId);

      const succeeded = await runMutation(
        () => dispatch({ type: "task:add", payload: { task, ...effects } }),
        () => persist(task),
        ERROR_LABELS.saveFailed,
      );

      if (!succeeded) return null;

      toast.success(TOAST_LABELS.taskCreated);
      return task;
    },
    [currentUserId, runMutation, toast],
  );

  const updateTask = useCallback(
    async (id: ID, patch: TaskPatch): Promise<boolean> => {
      const succeeded = await applyTaskPatch(id, patch);

      if (succeeded) toast.success(TOAST_LABELS.taskUpdated);
      return succeeded;
    },
    [applyTaskPatch, toast],
  );

  const deleteTask = useCallback(
    async (id: ID): Promise<boolean> => {
      const succeeded = await runMutation(
        () => dispatch({ type: "task:remove", payload: { id } }),
        () => remove(id),
        ERROR_LABELS.saveFailed,
      );

      if (succeeded) toast.success(TOAST_LABELS.taskDeleted);
      return succeeded;
    },
    [runMutation, toast],
  );

  const setTaskStatus = useCallback(
    async (id: ID, status: TaskStatus): Promise<boolean> => {
      const now = new Date().toISOString();

      const succeeded = await applyTaskPatch(id, {
        status,
        completedAt: status === "done" ? now : null,
      });

      if (succeeded) {
        toast.success(
          status === "done" ? TOAST_LABELS.taskCompleted : TOAST_LABELS.statusChanged,
        );
      }

      return succeeded;
    },
    [applyTaskPatch, toast],
  );

  const toggleTaskComplete = useCallback(
    async (id: ID): Promise<boolean> => {
      const task = stateRef.current.tasks.find((item) => item.id === id);
      if (!task) return false;

      return setTaskStatus(id, task.status === "done" ? "todo" : "done");
    },
    [setTaskStatus],
  );

  /* ── Checklist actions ───────────────────────────────────────────────── */

  const rewriteChecklist = useCallback(
    async (
      taskId: ID,
      transform: (items: Task["checklist"]) => Task["checklist"],
      message: string,
    ): Promise<boolean> => {
      const task = stateRef.current.tasks.find((item) => item.id === taskId);
      if (!task) return false;

      const succeeded = await applyTaskPatch(taskId, {
        checklist: transform(task.checklist),
      });

      if (succeeded) toast.success(message);
      return succeeded;
    },
    [applyTaskPatch, toast],
  );

  const addChecklistItem = useCallback(
    (taskId: ID, title: string) =>
      rewriteChecklist(
        taskId,
        (items) => [...items, { id: createId("chk"), title: title.trim(), done: false }],
        TOAST_LABELS.checklistUpdated,
      ),
    [rewriteChecklist],
  );

  const updateChecklistItem = useCallback(
    (taskId: ID, itemId: ID, title: string) =>
      rewriteChecklist(
        taskId,
        (items) =>
          items.map((item) => (item.id === itemId ? { ...item, title } : item)),
        TOAST_LABELS.changesSaved,
      ),
    [rewriteChecklist],
  );

  const removeChecklistItem = useCallback(
    (taskId: ID, itemId: ID) =>
      rewriteChecklist(
        taskId,
        (items) => items.filter((item) => item.id !== itemId),
        TOAST_LABELS.changesSaved,
      ),
    [rewriteChecklist],
  );

  const toggleChecklistItem = useCallback(
    (taskId: ID, itemId: ID) =>
      rewriteChecklist(
        taskId,
        (items) =>
          items.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item,
          ),
        TOAST_LABELS.checklistUpdated,
      ),
    [rewriteChecklist],
  );

  /* ── Comment actions ─────────────────────────────────────────────────── */

  const addComment = useCallback(
    async (
      taskId: ID,
      body: string,
      parentId: ID | null = null,
    ): Promise<Comment | null> => {
      const trimmed = body.trim();
      if (!trimmed) return null;

      const current = stateRef.current;
      const task = current.tasks.find((item) => item.id === taskId);
      if (!task) return null;

      const now = new Date().toISOString();
      const comment: Comment = {
        id: createId("cmt"),
        taskId,
        authorId: currentUserId,
        body: trimmed,
        parentId,
        createdAt: now,
        updatedAt: null,
        edited: false,
        reactions: [],
      };

      const parent = parentId
        ? current.comments.find((item) => item.id === parentId)
        : undefined;

      const effects = onCommentCreated(
        comment,
        task,
        parent,
        currentUserId,
        now,
        createId,
      );

      const succeeded = await runMutation(
        () => dispatch({ type: "comment:add", payload: { comment, ...effects } }),
        () => persist(comment),
        ERROR_LABELS.saveFailed,
      );

      if (!succeeded) return null;

      toast.success(TOAST_LABELS.commentAdded);
      return comment;
    },
    [currentUserId, runMutation, toast],
  );

  const updateComment = useCallback(
    async (commentId: ID, body: string): Promise<boolean> => {
      const trimmed = body.trim();
      if (!trimmed) return false;

      const now = new Date().toISOString();

      const succeeded = await runMutation(
        () =>
          dispatch({
            type: "comment:patch",
            payload: { id: commentId, patch: { body: trimmed, edited: true, updatedAt: now } },
          }),
        () => persist({ id: commentId, body: trimmed, updatedAt: now }),
        ERROR_LABELS.saveFailed,
      );

      if (succeeded) toast.success(TOAST_LABELS.commentUpdated);
      return succeeded;
    },
    [runMutation, toast],
  );

  const deleteComment = useCallback(
    async (commentId: ID): Promise<boolean> => {
      const comment = stateRef.current.comments.find(
        (item) => item.id === commentId,
      );
      if (!comment) return false;

      const succeeded = await runMutation(
        () =>
          dispatch({
            type: "comment:remove",
            payload: { id: commentId, taskId: comment.taskId },
          }),
        () => remove(commentId),
        ERROR_LABELS.saveFailed,
      );

      if (succeeded) toast.success(TOAST_LABELS.commentDeleted);
      return succeeded;
    },
    [runMutation, toast],
  );

  const toggleReaction = useCallback(
    (commentId: ID, emoji: string): void => {
      dispatch({
        type: "comment:react",
        payload: { commentId, emoji, userId: currentUserId },
      });

      persistQuietly(() => persist({ id: commentId, emoji, userId: currentUserId }));
    },
    [currentUserId, persistQuietly],
  );

  /* ── Notification actions ────────────────────────────────────────────── */

  const markNotificationRead = useCallback(
    (id: ID): void => {
      dispatch({ type: "notification:read", payload: { id } });
      persistQuietly(() => persist({ id, read: true }));
    },
    [persistQuietly],
  );

  const markAllNotificationsRead = useCallback((): void => {
    dispatch({
      type: "notification:readAll",
      payload: { recipientId: currentUserId },
    });
    persistQuietly(() => persist({ recipientId: currentUserId, read: true }));
    toast.success(TOAST_LABELS.notificationsRead);
  }, [currentUserId, persistQuietly, toast]);

  /* ── Workspace lifecycle ─────────────────────────────────────────────── */

  const reload = useCallback((): void => {
    setReloadToken((token) => token + 1);
  }, []);

  const resetWorkspace = useCallback(async (): Promise<void> => {
    clearStoredWorkspace();
    toast.success(TOAST_LABELS.dataReset);
    reload();
  }, [reload, toast]);

  const actions = useMemo<WorkspaceActions>(
    () => ({
      reload,
      resetWorkspace,
      createTask,
      updateTask,
      deleteTask,
      setTaskStatus,
      toggleTaskComplete,
      addChecklistItem,
      updateChecklistItem,
      removeChecklistItem,
      toggleChecklistItem,
      addComment,
      updateComment,
      deleteComment,
      toggleReaction,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      reload,
      resetWorkspace,
      createTask,
      updateTask,
      deleteTask,
      setTaskStatus,
      toggleTaskComplete,
      addChecklistItem,
      updateChecklistItem,
      removeChecklistItem,
      toggleChecklistItem,
      addComment,
      updateComment,
      deleteComment,
      toggleReaction,
      markNotificationRead,
      markAllNotificationsRead,
    ],
  );

  const unreadCount = useMemo(
    () =>
      state.notifications.filter(
        (notification) =>
          notification.recipientId === currentUserId && !notification.read,
      ).length,
    [state.notifications, currentUserId],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      status: state.status,
      error: state.error,
      tasks: resolvedTasks,
      users: state.users,
      tags: state.tags,
      projects: state.projects,
      comments: state.comments,
      activity: state.activity,
      notifications: state.notifications,
      unreadCount,
      index,
      currentUser,
      actions,
    }),
    [
      state.status,
      state.error,
      state.users,
      state.tags,
      state.projects,
      state.comments,
      state.activity,
      state.notifications,
      resolvedTasks,
      unreadCount,
      index,
      currentUser,
      actions,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}
