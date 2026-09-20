import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NAV_LABELS, SECTION_LABELS } from "./labels";

export interface NavItem {
  id: string;
  /** Route path. */
  to: string;
  label: string;
  icon: LucideIcon;
  /** Also treat nested routes under this prefix as active. */
  matchPrefix?: string;
}

export interface NavSection {
  id: string;
  /** `null` renders the group without a heading. */
  label: string | null;
  items: NavItem[];
}

/**
 * The single source of navigation truth.
 *
 * Both the desktop sidebar and the mobile drawer render this, so a new section
 * can never appear in one and be missing from the other.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "workspace",
    label: SECTION_LABELS.workspace,
    items: [
      { id: "dashboard", to: "/", label: NAV_LABELS.dashboard, icon: LayoutDashboard },
      {
        id: "projects",
        to: "/projects",
        label: NAV_LABELS.projects,
        icon: FolderKanban,
        matchPrefix: "/projects",
      },
      {
        id: "tasks",
        to: "/tasks",
        label: NAV_LABELS.tasks,
        icon: ListChecks,
        matchPrefix: "/tasks",
      },
    ],
  },
  {
    id: "manage",
    label: SECTION_LABELS.manage,
    items: [
      {
        id: "team",
        to: "/team",
        label: NAV_LABELS.team,
        icon: Users,
        matchPrefix: "/team",
      },
      {
        id: "notifications",
        to: "/notifications",
        label: NAV_LABELS.notifications,
        icon: Bell,
        matchPrefix: "/notifications",
      },
    ],
  },
  {
    id: "account",
    label: SECTION_LABELS.account,
    items: [
      {
        id: "settings",
        to: "/settings",
        label: NAV_LABELS.settings,
        icon: Settings,
        matchPrefix: "/settings",
      },
    ],
  },
];

/** Every item, flattened — used by the command palette and quick jump. */
export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(
  (section) => section.items,
);
