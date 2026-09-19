import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "../../utils/cn";
import type { SortDirection } from "../../types";

export interface DataTableColumn<T> {
  /** Stable identity for the column — also the sort key. */
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  /** Hidden on phones; `renderCard` is expected to carry the value instead. */
  secondary?: boolean;
  align?: "start" | "end";
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableSort {
  key: string;
  direction: SortDirection;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  /** Accessible description of the table's contents. */
  caption: string;
  /**
   * Makes the whole row activate. The first column's renderer becomes the
   * row's control, so it must not contain interactive elements of its own.
   */
  onSelect?: (item: T) => void;
  /** Set together with `onSortChange` to make the headers sortable. */
  sort?: DataTableSort;
  onSortChange?: (key: string) => void;
  /** Replaces the table below `sm`, where a four-column table is unusable. */
  renderCard?: (row: T) => ReactNode;
  emptyState?: ReactNode;
  rowClassName?: (row: T) => string;
}

/**
 * A generic, responsive table.
 *
 * Below the `sm` breakpoint a real table is the wrong shape, so when a
 * `renderCard` is supplied the rows are drawn as stacked cards instead of
 * being squeezed or horizontally scrolled.
 */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  caption,
  onSelect,
  sort,
  onSortChange,
  renderCard,
  emptyState,
  rowClassName,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const table = (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">{caption}</caption>

      <thead>
        <tr className="border-b border-line">
          {columns.map((column) => {
            const active = sort?.key === column.key;
            const sortable = Boolean(onSortChange);

            return (
              <th
                key={column.key}
                scope="col"
                aria-sort={
                  sortable
                    ? active
                      ? sort?.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
                className={cn(
                  "px-3 py-2.5 text-start text-[11px] font-semibold tracking-wide text-subtle uppercase",
                  column.align === "end" && "text-end",
                  column.secondary && !renderCard && "hidden sm:table-cell",
                  column.headerClassName,
                )}
              >
                {sortable ? (
                  <button
                    type="button"
                    onClick={() => onSortChange?.(column.key)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded transition-colors hover:text-content",
                      active && "text-content",
                    )}
                  >
                    {column.header}
                    {active &&
                      (sort?.direction === "asc" ? (
                        <ArrowUp aria-hidden className="size-3" />
                      ) : (
                        <ArrowDown aria-hidden className="size-3" />
                      ))}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr
            key={getRowId(row)}
            className={cn(
              "relative border-b border-line/70 transition-colors last:border-0",
              onSelect ? "hover:bg-surface-2" : undefined,
              rowClassName?.(row),
            )}
          >
            {columns.map((column, index) => (
              <td
                key={column.key}
                className={cn(
                  "px-3",
                  "py-(--density-row-py)",
                  column.align === "end" && "text-end",
                  column.secondary && !renderCard && "hidden sm:table-cell",
                  column.cellClassName,
                )}
              >
                {onSelect && index === 0 ? (
                  // One real button stretched over the row: the whole row is a
                  // target, but the accessibility tree still sees a button.
                  <button
                    type="button"
                    onClick={() => onSelect(row)}
                    className="w-full text-start after:absolute after:inset-0 after:content-['']"
                  >
                    {column.render(row)}
                  </button>
                ) : (
                  column.render(row)
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (!renderCard) {
    return (
      <div className="scrollbar-slim overflow-x-auto">{table}</div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2 sm:hidden">
        {data.map((row) => (
          <li key={getRowId(row)}>{renderCard(row)}</li>
        ))}
      </ul>

      <div className="hidden sm:block">{table}</div>
    </>
  );
}
