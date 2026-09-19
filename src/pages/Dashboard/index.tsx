import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ERROR_LABELS } from "../../constants/labels";
import { useAppShell } from "../../hooks/useAppShell";
import type { ID } from "../../types";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { GreetingHeader } from "../../components/dashboard/GreetingHeader";
import { ProgressOverview } from "../../components/dashboard/ProgressOverview";
import { ProjectsOverview } from "../../components/dashboard/ProjectsOverview";
import { StatsGrid } from "../../components/dashboard/StatsGrid";
import { UpcomingTasks } from "../../components/dashboard/UpcomingTasks";
import { PageGuard } from "../../components/layout/PageGuard";
import { Skeleton, SkeletonStats } from "../../components/ui/Skeleton";

/** Mirrors the real grid so the layout does not jump when data lands. */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <SkeletonStats />

      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { openCreateTask } = useAppShell();

  const openTask = useCallback(
    (taskId: ID) => navigate(`/tasks/${taskId}`),
    [navigate],
  );

  return (
    <PageGuard
      skeleton={<DashboardSkeleton />}
      errorTitle={ERROR_LABELS.loadTasks}
    >
      <div className="flex flex-col gap-6">
        <GreetingHeader onCreateTask={openCreateTask} />

        <StatsGrid />

        <div className="grid gap-4 lg:grid-cols-3">
          <ProgressOverview />
          <UpcomingTasks onOpenTask={openTask} limit={6} className="lg:col-span-2" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ActivityFeed />
          <ProjectsOverview />
        </div>
      </div>
    </PageGuard>
  );
}
