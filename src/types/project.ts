import type { ID, Nullable } from "./common";

export type ProjectStatus = "active" | "planning" | "on_hold" | "completed";

export type ProjectTone = "brand" | "violet" | "emerald" | "amber" | "rose";

export interface Project {
  id: ID;
  name: string;
  description: string;
  tone: ProjectTone;
  status: ProjectStatus;
  leadId: ID;
  memberIds: ID[];
  startDate: string;
  dueDate: Nullable<string>;
  createdAt: string;
}

export interface ProjectWithProgress extends Project {
  totalTasks: number;
  doneTasks: number;
  progress: number;
  overdueTasks: number;
}
