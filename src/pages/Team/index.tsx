import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRoundX } from "lucide-react";
import {
  ACTION_LABELS,
  PRESENCE_LABELS,
  TEAM_LABELS,
  USER_ROLE_LABELS,
} from "../../shared/constants/labels";
import { useTeamMembers } from "../../shared/hooks/useTasks";
import type { TeamMember } from "../../types";
import { cn } from "../../shared/utils/cn";
import { normalize } from "../../shared/utils/search";
import { formatNumber, formatPercent } from "../../shared/utils/text";
import { PageHeader } from "../../shared/components/layout/PageHeader";
import { PageGuard } from "../../shared/components/layout/PageGuard";
import { Avatar } from "../../shared/components/ui/Avatar";
import { Card } from "../../shared/components/ui/Card";
import { DataTable } from "../../shared/components/ui/DataTable";
import type { DataTableColumn, DataTableSort } from "../../shared/components/ui/DataTable";
import { ProgressBar } from "../../shared/components/ui/ProgressBar";
import { SearchInput } from "../../shared/components/ui/SearchInput";
import { Skeleton } from "../../shared/components/ui/Skeleton";
import { EmptyState } from "../../shared/components/ui/States";

const PRESENCE_DOT: Record<TeamMember["presence"], string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-slate-400",
};

const SORT_ACCESSORS: Record<string, (member: TeamMember) => string | number> = {
  name: (member) => member.name,
  activeTasks: (member) => member.stats.activeTasks,
  completedTasks: (member) => member.stats.completedTasks,
  overdueTasks: (member) => member.stats.overdueTasks,
  completionRate: (member) => member.stats.completionRate,
};

function sortMembers(members: TeamMember[], sort: DataTableSort): TeamMember[] {
  const accessor = SORT_ACCESSORS[sort.key];
  if (!accessor) return members;

  const sign = sort.direction === "asc" ? 1 : -1;

  return [...members].sort((a, b) => {
    const left = accessor(a);
    const right = accessor(b);

    if (typeof left === "string" || typeof right === "string") {
      return String(left).localeCompare(String(right), "fa") * sign;
    }

    return (left - right) * sign;
  });
}

function TeamSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }, (_unused, index) => (
        <Skeleton key={index} className="h-14 rounded-xl" />
      ))}
    </div>
  );
}

/**
 * The team roster.
 *
 * A real table on desktop and stacked cards on phones — the generic
 * `DataTable<T>` handles the swap, so the column definitions are written once.
 */
export function TeamPage() {
  const members = useTeamMembers();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<DataTableSort>({
    key: "activeTasks",
    direction: "desc",
  });

  const rows = useMemo(() => {
    const needle = normalize(query);

    const filtered = needle
      ? members.filter((member) =>
          [member.name, member.title, USER_ROLE_LABELS[member.role], member.email]
            .map(normalize)
            .some((field) => field.includes(needle)),
        )
      : members;

    return sortMembers(filtered, sort);
  }, [members, query, sort]);

  const openMemberTasks = useCallback(() => void navigate("/tasks"), [navigate]);

  const handleSortChange = useCallback((key: string) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "desc" },
    );
  }, []);

  const columns: DataTableColumn<TeamMember>[] = [
    {
      key: "name",
      header: TEAM_LABELS.columns.member,
      render: (member) => (
        <span className="flex items-center gap-2.5">
          <Avatar
            name={member.name}
            initials={member.avatar}
            seed={member.id}
            size="sm"
          />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-content">
              {member.name}
            </span>
            <span className="block truncate text-[10px] text-subtle">
              {member.title}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: "role",
      header: TEAM_LABELS.columns.role,
      secondary: true,
      render: (member) => (
        <span className="text-[12px] text-muted">
          {USER_ROLE_LABELS[member.role]}
        </span>
      ),
    },
    {
      key: "presence",
      header: TEAM_LABELS.columns.presence,
      secondary: true,
      render: (member) => (
        <span className="flex items-center gap-1.5 text-[11px] text-muted">
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              PRESENCE_DOT[member.presence],
            )}
          />
          {PRESENCE_LABELS[member.presence]}
        </span>
      ),
    },
    {
      key: "activeTasks",
      header: TEAM_LABELS.columns.activeTasks,
      align: "end",
      render: (member) => (
        <span className="numeric text-[13px] font-medium text-content">
          {formatNumber(member.stats.activeTasks)}
        </span>
      ),
    },
    {
      key: "completedTasks",
      header: TEAM_LABELS.columns.completedTasks,
      align: "end",
      secondary: true,
      render: (member) => (
        <span className="numeric text-[13px] text-muted">
          {formatNumber(member.stats.completedTasks)}
        </span>
      ),
    },
    {
      key: "completionRate",
      header: TEAM_LABELS.completionRate,
      align: "end",
      secondary: true,
      render: (member) => (
        <span className="flex items-center justify-end gap-2">
          <ProgressBar
            value={member.stats.completionRate}
            size="xs"
            tone={member.stats.overdueTasks > 0 ? "warning" : "success"}
            label={`${TEAM_LABELS.completionRate} ${member.name}`}
            className="w-20"
          />
          <span className="numeric w-10 text-end text-[11px] text-muted">
            {formatPercent(member.stats.completionRate)}
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={TEAM_LABELS.title}
        description={TEAM_LABELS.subtitle}
      />

      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
        placeholder={TEAM_LABELS.searchPlaceholder}
        aria-label={ACTION_LABELS.search}
        className="w-full sm:max-w-sm"
      />

      <PageGuard skeleton={<TeamSkeleton />}>
        <Card className="overflow-hidden">
          <DataTable<TeamMember>
            data={rows}
            columns={columns}
            getRowId={(member) => member.id}
            caption={TEAM_LABELS.subtitle}
            sort={sort}
            onSortChange={handleSortChange}
            onSelect={openMemberTasks}
            emptyState={
              <EmptyState
                icon={UserRoundX}
                title={TEAM_LABELS.empty}
                body={TEAM_LABELS.emptyHint}
              />
            }
            renderCard={(member) => (
              <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    name={member.name}
                    initials={member.avatar}
                    seed={member.id}
                    size="md"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-content">
                      {member.name}
                    </p>
                    <p className="truncate text-[11px] text-subtle">
                      {member.title}
                    </p>
                  </div>

                  <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-muted">
                    <span
                      aria-hidden
                      className={cn(
                        "size-1.5 rounded-full",
                        PRESENCE_DOT[member.presence],
                      )}
                    />
                    {PRESENCE_LABELS[member.presence]}
                  </span>
                </div>

                <dl className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
                  <div>
                    <dt className="text-[10px] text-subtle">
                      {TEAM_LABELS.columns.activeTasks}
                    </dt>
                    <dd className="numeric mt-0.5 text-sm font-semibold text-content">
                      {formatNumber(member.stats.activeTasks)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-subtle">
                      {TEAM_LABELS.columns.completedTasks}
                    </dt>
                    <dd className="numeric mt-0.5 text-sm font-semibold text-content">
                      {formatNumber(member.stats.completedTasks)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-subtle">
                      {TEAM_LABELS.completionRate}
                    </dt>
                    <dd className="numeric mt-0.5 text-sm font-semibold text-content">
                      {formatPercent(member.stats.completionRate)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          />
        </Card>
      </PageGuard>
    </div>
  );
}
