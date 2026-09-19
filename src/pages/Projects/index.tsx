import { FolderKanban, TriangleAlert } from "lucide-react";
import {
  PROJECT_LABELS,
  PROJECT_STATUS_LABELS,
  TASK_PAGE_LABELS,
} from "../../constants/labels";
import { PROJECT_TONES } from "../../constants/tones";
import { useProjectsWithProgress } from "../../hooks/useTasks";
import type { ProjectWithProgress } from "../../types";
import { cn } from "../../utils/cn";
import { formatJalaliShort } from "../../utils/date";
import { formatNumber, formatPercent } from "../../utils/text";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageGuard } from "../../components/layout/PageGuard";
import { Avatar } from "../../components/ui/Avatar";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/States";
import { useWorkspace } from "../../hooks/useWorkspace";

const STATUS_CHIP_CLASSES: Record<ProjectWithProgress["status"], string> = {
  active: "bg-brand-500/10 text-brand-700 dark:text-brand-300",
  planning: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  on_hold: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

interface ProjectCardProps {
  project: ProjectWithProgress;
}

function ProjectCard({ project }: ProjectCardProps) {
  const { index } = useWorkspace();
  const lead = index.users.get(project.leadId);
  const tone = PROJECT_TONES[project.tone];

  return (
    <Card as="li" className="flex flex-col">
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn("size-2 shrink-0 rounded-full", tone.solid)}
            />
            {project.name}
          </span>
        }
        description={project.description}
        action={
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
              STATUS_CHIP_CLASSES[project.status],
            )}
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
        }
      />

      <CardBody className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted">
              {PROJECT_LABELS.progress}
            </span>
            <span className="numeric text-[11px] font-medium text-content">
              {formatPercent(project.progress)}
            </span>
          </div>

          <ProgressBar
            value={project.progress}
            size="sm"
            tone={project.overdueTasks > 0 ? "warning" : "brand"}
            label={`${PROJECT_LABELS.progress} ${project.name}`}
          />
        </div>

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <dt className="text-subtle">{TASK_PAGE_LABELS.title}</dt>
            <dd className="numeric font-medium text-content">
              {formatNumber(project.doneTasks)}/
              {formatNumber(project.totalTasks)}
            </dd>
          </div>

          {project.overdueTasks > 0 && (
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <TriangleAlert aria-hidden className="size-3.5" />
              <dd className="numeric font-medium">
                {formatNumber(project.overdueTasks)}
              </dd>
            </div>
          )}

          {project.dueDate && (
            <div className="flex items-center gap-1.5">
              <dt className="text-subtle">{PROJECT_LABELS.dueDate}</dt>
              <dd className="text-muted">{formatJalaliShort(project.dueDate)}</dd>
            </div>
          )}
        </dl>

        {lead && (
          <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
            <Avatar
              name={lead.name}
              initials={lead.avatar}
              seed={lead.id}
              size="xs"
            />
            <span className="min-w-0 truncate text-[11px] text-muted">
              {lead.name}
            </span>
            <span className="ms-auto shrink-0 text-[10px] text-subtle">
              {PROJECT_LABELS.lead}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_unused, index) => (
        <Skeleton key={index} className="h-56 rounded-2xl" />
      ))}
    </div>
  );
}

export function ProjectsPage() {
  const projects = useProjectsWithProgress();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={PROJECT_LABELS.title}
        description={PROJECT_LABELS.subtitle}
      />

      <PageGuard skeleton={<ProjectsSkeleton />}>
        {projects.length === 0 ? (
          <Card>
            <EmptyState
              icon={FolderKanban}
              title={PROJECT_LABELS.empty}
              body={PROJECT_LABELS.emptyHint}
            />
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </ul>
        )}
      </PageGuard>
    </div>
  );
}
