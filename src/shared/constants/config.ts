/** localStorage keys, namespaced so they can't collide with other apps. */
export const STORAGE_KEYS = {
  theme: "taskflow:theme",
  sidebar: "taskflow:sidebar-collapsed",
  density: "taskflow:density",
  tasks: "taskflow:tasks",
  notifications: "taskflow:notifications",
  notificationPrefs: "taskflow:notification-prefs",
  profile: "taskflow:profile",
} as const;

/** The signed-in user for this mock build. */
export const CURRENT_USER_ID = "u-1";

export const TASK_CODE_PREFIX = "TF";

export const DEFAULT_PAGE_SIZE = 20;

/** A task is "due soon" this many days before its deadline. */
export const DUE_SOON_THRESHOLD_DAYS = 2;

export const MAX_TITLE_LENGTH = 120;
export const MIN_TITLE_LENGTH = 3;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_COMMENT_LENGTH = 1000;
export const MAX_TAG_SUGGESTIONS = 8;
export const MAX_MENTION_SUGGESTIONS = 6;

/** Debounce applied to search inputs before filtering runs. */
export const SEARCH_DEBOUNCE_MS = 180;
