import { PRIORITY_META, STATUS_META } from "../shared/constants/taskMeta";
import { GENERIC_LABELS, USER_ROLE_LABELS } from "../shared/constants/labels";
import type {
  ActivityEvent,
  ID,
  Project,
  Tag,
  Task,
  User,
} from "../../shared/types";
import { formatJalaliShort } from "./date";

/** Resolvers the caller supplies so this module stays free of store access. */
export interface Lookup {
  getUser: (id: ID) => User | undefined;
  getTask?: (id: ID) => Task | undefined;
  getTag?: (id: ID) => Tag | undefined;
  getProject?: (id: ID) => Project | undefined;
}

/** An activity sentence split into plain and emphasised runs. */
export type ActivitySegment =
  | { kind: "text"; value: string }
  | { kind: "strong"; value: string };

export interface ActivityDescription {
  segments: ActivitySegment[];
  /** Flattened sentence — used for `aria-label` and tooltips. */
  plain: string;
}

const text = (value: string): ActivitySegment => ({ kind: "text", value });
const strong = (value: string): ActivitySegment => ({ kind: "strong", value });

function build(segments: ActivitySegment[]): ActivityDescription {
  return {
    segments,
    plain: segments.map((segment) => segment.value).join(""),
  };
}

const statusLabel = (value?: string): string =>
  value && value in STATUS_META
    ? STATUS_META[value as keyof typeof STATUS_META].label
    : GENERIC_LABELS.unknown;

const priorityLabel = (value?: string): string =>
  value && value in PRIORITY_META
    ? PRIORITY_META[value as keyof typeof PRIORITY_META].label
    : GENERIC_LABELS.unknown;

/**
 * Renders one history entry as Persian prose. The switch is exhaustive — the
 * `never` check at the end turns a new `ActivityType` into a compile error
 * rather than a silently blank timeline row.
 */
export function describeActivity(
  event: ActivityEvent,
  lookup: Lookup,
): ActivityDescription {
  const { meta } = event;

  switch (event.type) {
    case "task_created":
      return build([text("این وظیفه را ایجاد کرد")]);

    case "task_updated":
      return build([text("جزئیات وظیفه را ویرایش کرد")]);

    case "status_changed":
      return build([
        text("وضعیت را از "),
        strong(statusLabel(meta.from)),
        text(" به "),
        strong(statusLabel(meta.to)),
        text(" تغییر داد"),
      ]);

    case "priority_changed":
      return build([
        text("اولویت را از "),
        strong(priorityLabel(meta.from)),
        text(" به "),
        strong(priorityLabel(meta.to)),
        text(" تغییر داد"),
      ]);

    case "assignee_changed": {
      const from = meta.from ? lookup.getUser(meta.from)?.name : null;
      const to = meta.to ? lookup.getUser(meta.to)?.name : null;

      return build([
        text(from ? `مسئول را از ${from} به ` : "مسئول را به "),
        strong(to ?? GENERIC_LABELS.unassigned),
        text(" تغییر داد"),
      ]);
    }

    case "due_date_changed": {
      const to = meta.to ? formatJalaliShort(meta.to) : GENERIC_LABELS.noDueDate;
      return build([
        text("مهلت انجام را به "),
        strong(to),
        text(" تغییر داد"),
      ]);
    }

    case "comment_added":
      return build([text("کامنت گذاشت")]);

    case "user_mentioned": {
      const target = meta.targetUserId
        ? lookup.getUser(meta.targetUserId)?.name
        : null;

      return target
        ? build([strong(target), text(" را منشن کرد")])
        : build([text("کاربری را منشن کرد")]);
    }

    case "checklist_updated":
      return meta.text
        ? build([text("آیتم "), strong(meta.text), text(" را به‌روزرسانی کرد")])
        : build([text("چک‌لیست را به‌روزرسانی کرد")]);

    case "attachment_added":
      return build([text("فایلی پیوست کرد")]);

    default: {
      const exhaustive: never = event.type;
      return build([text(String(exhaustive))]);
    }
  }
}

/** `علی رضایی · توسعه‌دهنده فرانت‌اند` — the actor line under a timeline row. */
export function describeActor(user: User | undefined): string {
  if (!user) return GENERIC_LABELS.unknownUser;
  return `${user.name} · ${USER_ROLE_LABELS[user.role]}`;
}
