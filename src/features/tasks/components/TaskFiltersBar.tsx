import { useId, useState } from "react";
import { CalendarRange, SlidersHorizontal, X } from "lucide-react";
import { ACTION_LABELS, FILTER_LABELS, PICKER_LABELS } from "../../../shared/constants/labels";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
} from "../../../shared/constants/taskMeta";
import {
  useProjectPickerOptions,
  useTagPickerOptions,
  useUserPickerOptions,
} from "../../../shared/hooks/useTasks";
import type { TaskFilters, TaskPriority, TaskStatus } from "../../../shared/types";
import { cn } from "../../../shared/utils/cn";
import { countActiveFilters, createEmptyFilters, hasActiveFilters } from "../../../shared/utils/filter";
import type { QuickPreset } from "../../../shared/utils/filter";
import { toPersianDigits } from "../../../shared/utils/text";
import { Button } from "../../../shared/components/ui/Button";
import { DatePicker } from "../../../shared/components/ui/DatePicker";
import { MultiSelect } from "../../../shared/components/ui/MultiSelect";
import { SegmentedControl } from "../../../shared/components/ui/SegmentedControl";
import type { PickerOption } from "../../../shared/components/ui/picker";

const PRESET_ORDER: QuickPreset[] = ["all", "overdue", "today", "week", "mine"];

const STATUS_PICKER_OPTIONS: PickerOption<TaskStatus>[] = STATUS_ORDER.map(
  (value) => ({
    value,
    label: STATUS_META[value].label,
    dotClassName: STATUS_META[value].dot,
  }),
);

const PRIORITY_PICKER_OPTIONS: PickerOption<TaskPriority>[] = PRIORITY_ORDER.map(
  (value) => ({
    value,
    label: PRIORITY_META[value].label,
    dotClassName: PRIORITY_META[value].dot,
  }),
);

export interface TaskFiltersBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  preset: QuickPreset;
  onPresetChange: (preset: QuickPreset) => void;
  /** Rendered next to the filter toggle — usually the result count. */
  summary?: string;
  className?: string;
}

/**
 * Quick presets on top, the full filter set one click below.
 *
 * The common questions ("what's late?", "what's mine?") are single taps, while
 * the five-field panel stays out of the way until it is actually needed. The
 * panel expands inline rather than in a popover so it behaves the same on a
 * phone, where a floating panel would cover the very list being filtered.
 */
export function TaskFiltersBar({
  filters,
  onFiltersChange,
  preset,
  onPresetChange,
  summary,
  className,
}: TaskFiltersBarProps) {
  const userOptions = useUserPickerOptions();
  const tagOptions = useTagPickerOptions();
  const projectOptions = useProjectPickerOptions();

  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  const activeCount = countActiveFilters(filters);
  const active = hasActiveFilters(filters);

  const patch = (changes: Partial<TaskFilters>): void =>
    onFiltersChange({ ...filters, ...changes });

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="scrollbar-none -mx-1 max-w-full overflow-x-auto px-1 py-0.5">
          <SegmentedControl<QuickPreset>
            value={preset}
            onValueChange={onPresetChange}
            label={ACTION_LABELS.filters}
            size="sm"
            options={PRESET_ORDER.map((value) => ({
              value,
              label: FILTER_LABELS.presets[value],
            }))}
          />
        </div>

        {summary && (
          <span className="hidden text-[11px] text-subtle sm:inline">
            {summary}
          </span>
        )}

        <div className="ms-auto flex items-center gap-2">
          {active && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => onFiltersChange(createEmptyFilters())}
            >
              {ACTION_LABELS.clearFilters}
            </Button>
          )}

          <Button
            variant={expanded || active ? "subtle" : "secondary"}
            size="sm"
            icon={SlidersHorizontal}
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((open) => !open)}
          >
            {ACTION_LABELS.filters}

            {activeCount > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                {toPersianDigits(activeCount)}
              </span>
            )}
          </Button>
        </div>
      </div>

      {expanded && (
        <div
          id={panelId}
          className="animate-slide-down rounded-2xl border border-line bg-surface-2/40 p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted">
                {FILTER_LABELS.status}
              </span>
              <MultiSelect<TaskStatus>
                values={filters.statuses}
                onChange={(statuses) => patch({ statuses })}
                options={STATUS_PICKER_OPTIONS}
                label={FILTER_LABELS.status}
                placeholder={FILTER_LABELS.status}
                searchPlaceholder={FILTER_LABELS.status}
                emptyLabel={FILTER_LABELS.status}
                size="sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted">
                {FILTER_LABELS.priority}
              </span>
              <MultiSelect<TaskPriority>
                values={filters.priorities}
                onChange={(priorities) => patch({ priorities })}
                options={PRIORITY_PICKER_OPTIONS}
                label={FILTER_LABELS.priority}
                placeholder={FILTER_LABELS.priority}
                searchPlaceholder={FILTER_LABELS.priority}
                emptyLabel={FILTER_LABELS.priority}
                size="sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted">
                {FILTER_LABELS.assignee}
              </span>
              <MultiSelect
                values={filters.assigneeIds}
                onChange={(assigneeIds) => patch({ assigneeIds })}
                options={userOptions}
                label={FILTER_LABELS.assignee}
                placeholder={FILTER_LABELS.assignee}
                searchPlaceholder={PICKER_LABELS.searchUsers}
                emptyLabel={PICKER_LABELS.noUsers}
                size="sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted">
                {FILTER_LABELS.tag}
              </span>
              <MultiSelect
                values={filters.tagIds}
                onChange={(tagIds) => patch({ tagIds })}
                options={tagOptions}
                label={FILTER_LABELS.tag}
                placeholder={FILTER_LABELS.tag}
                searchPlaceholder={PICKER_LABELS.searchTags}
                emptyLabel={PICKER_LABELS.noTags}
                size="sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted">
                {FILTER_LABELS.project}
              </span>
              <MultiSelect
                values={filters.projectIds}
                onChange={(projectIds) => patch({ projectIds })}
                options={projectOptions}
                label={FILTER_LABELS.project}
                placeholder={FILTER_LABELS.project}
                searchPlaceholder={PICKER_LABELS.searchProjects}
                emptyLabel={PICKER_LABELS.noProjects}
                size="sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
                <CalendarRange aria-hidden className="size-3.5" />
                {FILTER_LABELS.date}
              </span>

              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  value={filters.dueFrom}
                  onChange={(dueFrom) => patch({ dueFrom })}
                  label={FILTER_LABELS.dueFrom}
                  placeholder={FILTER_LABELS.dueFrom}
                  clearable
                  size="sm"
                />
                <DatePicker
                  value={filters.dueTo}
                  onChange={(dueTo) => patch({ dueTo })}
                  label={FILTER_LABELS.dueTo}
                  placeholder={FILTER_LABELS.dueTo}
                  clearable
                  min={filters.dueFrom}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
