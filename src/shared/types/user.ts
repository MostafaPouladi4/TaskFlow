import type { ID } from "./common";

export type UserRole =
  | "frontend"
  | "backend"
  | "designer"
  | "product"
  | "qa"
  | "devops";

export type PresenceStatus = "online" | "away" | "offline";

/**
 * `avatar` holds the rendered initials rather than an image URL — the product
 * ships without any network-hosted assets, so avatars are drawn locally from
 * initials + a deterministic tone.
 */
export interface User {
  id: ID;
  name: string;
  avatar: string;
  role: UserRole;
  title: string;
  email: string;
  presence: PresenceStatus;
}

/** A user plus the workload numbers the team page needs. */
export interface TeamMemberStats {
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface TeamMember extends User {
  stats: TeamMemberStats;
}
