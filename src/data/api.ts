import type { ApiResponse } from "../types";
import { INITIAL_WORKSPACE, type WorkspaceSnapshot } from "./index";
import { MOCK_LATENCY_MS } from "./users";

/**
 * The seam between the UI and its data source.
 *
 * Every store talks to the app through this module, so replacing the mock
 * with real `fetch` calls later means rewriting these three functions and
 * nothing else — the components already handle loading, empty and error.
 */

/** Append `?fail=1` to the URL to exercise the error states. */
function failureRequested(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("fail") === "1";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function ok<T>(data: T, message = "عملیات با موفقیت انجام شد"): ApiResponse<T> {
  return { data, success: true, message };
}

function fail<T>(message: string): ApiResponse<T> {
  return { data: null as T, success: false, message };
}

/** Loads the whole workspace in one call — a real API would paginate. */
export async function fetchWorkspace(): Promise<ApiResponse<WorkspaceSnapshot>> {
  await delay(MOCK_LATENCY_MS);

  if (failureRequested()) {
    return fail<WorkspaceSnapshot>("بارگذاری اطلاعات با خطا مواجه شد");
  }

  // Deep-ish copy so the store's edits never mutate the module fixture and
  // leak into a fresh mount.
  return ok({
    ...INITIAL_WORKSPACE,
    tasks: INITIAL_WORKSPACE.tasks.map((task) => ({
      ...task,
      checklist: task.checklist.map((item) => ({ ...item })),
      memberIds: [...task.memberIds],
      mentionIds: [...task.mentionIds],
      tagIds: [...task.tagIds],
      commentIds: [...task.commentIds],
    })),
    comments: INITIAL_WORKSPACE.comments.map((comment) => ({
      ...comment,
      reactions: comment.reactions.map((reaction) => ({
        ...reaction,
        userIds: [...reaction.userIds],
      })),
    })),
    notifications: INITIAL_WORKSPACE.notifications.map((notification) => ({
      ...notification,
      meta: { ...notification.meta },
    })),
  });
}

/**
 * Stand-in for a write endpoint. A real implementation returns the persisted
 * entity; the mock simply echoes it back after latency.
 */
export async function persist<T>(entity: T): Promise<ApiResponse<T>> {
  await delay(MOCK_LATENCY_MS / 3);

  if (failureRequested()) {
    return fail<T>("ذخیره تغییرات با خطا مواجه شد");
  }

  return ok(entity, "تغییرات ذخیره شد");
}

export async function remove(id: string): Promise<ApiResponse<{ id: string }>> {
  await delay(MOCK_LATENCY_MS / 3);

  if (failureRequested()) {
    return fail<{ id: string }>("حذف با خطا مواجه شد");
  }

  return ok({ id }, "با موفقیت حذف شد");
}
