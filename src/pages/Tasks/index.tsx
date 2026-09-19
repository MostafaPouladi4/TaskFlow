import { useCallback, useMemo, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Rows3 } from "lucide-react";
import {
  ACTION_LABELS,
  SORT_LABELS,
  TASK_PAGE_LABELS,
} from "../../constants/labels";
import { SEARCH_DEBOUNCE_MS } from "../../constants/config";
import { useAppShell } from "../../hooks/useAppShell";
import { useDebouncedValue } from "../../hooks/useDisclosure";
import { useTasks } from "../../hooks/useTasks";
import { useWorkspace } from "../../hooks/useWorkspace";
import type { ID, TaskFilters, TaskSort, TaskSortKey } from "../../types";
import {
  applyQuickPreset,
  createEmptyFilters,
  DEFAULT_SORT,
  filterAndSortTasks,
  hasActiveFilters,
} from "../../utils/filter";
import type { QuickPreset } from "../../utils/filter";
import { toPersianDigits } from "../../utils/text";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageGuard } from "../../components/layout/PageGuard";
import { TaskDetailDrawer } from "../../components/task/TaskDetailDrawer";
import { TaskFiltersBar } from "../../components/task/TaskFiltersBar";
import { TaskList } from "../../components/task/TaskList";
import { Button } from "../../components/ui/Button";
import { IconButton } from "../../components/ui/IconButton";
import { Menu } from "../../components/ui/Menu";
import { SearchInput } from "../../components/ui/SearchInput";
import { Skeleton } from "../../components/ui/Skeleton";
import { Tooltip } from "../../components/ui/Tooltip";

const SORT_OPTIONS: { key: TaskSortKey; label: string }[] = [
  { key: "dueDate", label: SORT_LABELS.dueDate },
  { key: "priority", label: SORT_LABELS.priority },
  { key: "createdAt", label: SORT_LABELS.createdAt },
  { key: "title", label: SORT_LABELS.title },
  { key: "status", label: SORT_LABELS.status },
];

function TasksSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }, (_unused, index) => (
        <Skeleton key={index} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}

/**
 * The task workspace: search, quick presets, the full filter panel, and the
 * list — with the detail drawer driven by the URL so a task is linkable and the
 * back button does what it should.
 */
export function TasksPage() {
  const navigate = useNavigate();
  const { openCreateTask } = useAppShell();
  const { currentUser } = useWorkspace();
  const tasks = useTasks();

  // Read from the pathname rather than a nested route, so opening a task does
  // not remount the page and throw away the filters the user just set.
  const match = useMatch("/tasks/:taskId");
  const openTaskId = match?.params.taskId;

  const [filters, setFilters] = useState<TaskFilters>(createEmptyFilters);
  const [preset, setPreset] = useState<QuickPreset>("all");
  const [sort, setSort] = useState<TaskSort>(DEFAULT_SORT);
  const [grouped, setGrouped] = useState(true);

  // The input stays instant; only the filtering waits for a pause in typing.
  const debouncedQuery = useDebouncedValue(filters.query, SEARCH_DEBOUNCE_MS);

  const scoped = useMemo(
    () => applyQuickPreset(tasks, preset, currentUser.id),
    [tasks, preset, currentUser.id],
  );

  const visible = useMemo(
    () =>
      filterAndSortTasks(scoped, { ...filters, query: debouncedQuery }, sort),
    [scoped, filters, debouncedQuery, sort],
  );

  const openTask = useCallback(
    (taskId: ID) => navigate(`/tasks/${taskId}`),
    [navigate],
  );

  const closeTask = useCallback(() => navigate("/tasks"), [navigate]);

  const clearFilters = useCallback(() => {
    setFilters(createEmptyFilters());
    setPreset("all");
  }, []);

  const active = tasks.find((task) => task.id === openTaskId) ?? null;

  const sortItems = SORT_OPTIONS.map((option) => ({
    id: option.key,
    label: option.label,
    checked: sort.key === option.key,
    onSelect: () =>
      setSort((current) => ({ key: option.key, direction: current.direction })),
  }));

  const ascending = sort.direction === "asc";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={TASK_PAGE_LABELS.title}
        description={TASK_PAGE_LABELS.subtitle}
        actions={
          <Button icon={Plus} onClick={openCreateTask}>
            {TASK_PAGE_LABELS.newTask}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={filters.query}
          loading={filters.query !== debouncedQuery}
          placeholder={TASK_PAGE_LABELS.searchPlaceholder}
          aria-label={ACTION_LABELS.search}
          onClear={() => setFilters((current) => ({ ...current, query: "" }))}
          onChange={(event) =>
            setFilters((current) => ({ ...current, query: event.target.value }))
          }
          className="w-full sm:max-w-sm"
        />

        <div className="ms-auto flex items-center gap-1.5">
          <Tooltip
            content={
              grouped
                ? TASK_PAGE_LABELS.groupByStatus
                : TASK_PAGE_LABELS.groupByNone
            }
          >
            <IconButton
              icon={Rows3}
              label={TASK_PAGE_LABELS.groupByStatus}
              variant={grouped ? "subtle" : "ghost"}
              aria-pressed={grouped}
              onClick={() => setGrouped((value) => !value)}
            />
          </Tooltip>

          <Menu
            align="end"
            header={
              <span className="block text-[11px] font-semibold text-subtle">
                {SORT_LABELS.label}
              </span>
            }
            items={sortItems}
            trigger={(state) => (
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowUpDown}
                {...state.triggerProps}
                onClick={state.toggle}
              >
                {SORT_LABELS[sort.key]}
              </Button>
            )}
          />

          <Tooltip
            content={ascending ? SORT_LABELS.descending : SORT_LABELS.ascending}
          >
            <IconButton
              icon={ascending ? ArrowUp : ArrowDown}
              label={ascending ? SORT_LABELS.ascending : SORT_LABELS.descending}
              variant="ghost"
              onClick={() =>
                setSort((current) => ({
                  ...current,
                  direction: current.direction === "asc" ? "desc" : "asc",
                }))
              }
            />
          </Tooltip>
        </div>
      </div>

      <TaskFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        preset={preset}
        onPresetChange={setPreset}
        summary={TASK_PAGE_LABELS.resultsCount(toPersianDigits(visible.length))}
      />

      <PageGuard skeleton={<TasksSkeleton />}>
        <TaskList
          tasks={visible}
          onOpen={openTask}
          grouped={grouped}
          filtered={hasActiveFilters(filters) || preset !== "all"}
          onClearFilters={clearFilters}
          onCreate={openCreateTask}
        />
      </PageGuard>

      <TaskDetailDrawer task={active} onClose={closeTask} />
    </div>
  );
}
