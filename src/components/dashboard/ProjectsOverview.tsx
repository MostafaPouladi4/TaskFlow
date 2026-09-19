import { FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import { DASHBOARD_LABELS, PROJECT_LABELS } from "../../constants/labels";
import { PROJECT_TONES } from "../../constants/tones";
import { useProjectsWithProgress } from "../../hooks/useTasks";
import { cn } from "../../utils/cn";
import { formatNumber, formatPercent } from "../../utils/text";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { EmptyState } from "../ui/States";

const VISIBLE_LIMIT = 4;

export interface ProjectsOverviewProps {
  className?: string;
}

/**
 * In-flight projects with their completion.
 *
 * Listed in the fixture's own order and trimmed to `VISIBLE_LIMIT` — the point
 * is a stable, recognisable shortlist rather than a ranking, since the full
 * picture lives on the projects page.
 */
export function ProjectsOverview({ className }: ProjectsOverviewProps) {
  const projects = useProjectsWithProgress();
  const visible = projects.slice(0, VISIBLE_LIMIT);

  return (
    <Card className={className}>
      <CardHeader
        title={DASHBOARD_LABELS.activeProjects}
        action={
          <Link
            to="/projects"
            className="rounded-lg px-2 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-500/10 dark:text-brand-400"
          >
            {DASHBOARD_LABELS.viewAll}
          </Link>
        }
      />

      {visible.length === 0 ? (
        <EmptyState
          variant="compact"
          icon={FolderKanban}
          title={PROJECT_LABELS.empty}
          body={PROJECT_LABELS.emptyHint}
        />
      ) : (
        <CardBody className="flex flex-col gap-4">
          {visible.map((project) => (
            <div key={project.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    PROJECT_TONES[project.tone].solid,
                  )}
                />

                <Link
                  to="/projects"
                  className="min-w-0 flex-1 truncate text-[13px] font-medium text-content transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {project.name}
                </Link>

                <span className="numeric shrink-0 text-[11px] font-medium text-muted">
                  {formatPercent(project.progress)}
                </span>
              </div>

              <div
                role="progressbar"
                aria-label={`${PROJECT_LABELS.progress} ${project.name}`}
                aria-valuenow={Math.round(project.progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 overflow-hidden rounded-full bg-surface-3"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500 ease-out",
                    PROJECT_TONES[project.tone].solid,
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                />
              </div>

              <p className="text-[10px] text-subtle">
                {PROJECT_LABELS.tasksCount(formatNumber(project.totalTasks))}
              </p>
            </div>
          ))}
        </CardBody>
      )}
    </Card>
  );
}
