/** Branded alias so a raw string can't be passed where an id is expected. */
export type ID = string;

export type Nullable<T> = T | null;

export type Maybe<T> = T | null | undefined;

export type SortDirection = "asc" | "desc";

/**
 * Envelope every data-layer call resolves to. Keeping the mock layer behind
 * this shape means swapping in `fetch` later touches no component code.
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

/** Discriminated union — makes impossible states unrepresentable. */
export type AsyncState<T> =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: string };

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Shared shape for every dropdown / radio group in the app. */
export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
  description?: string;
}

export interface DateRange {
  from: Nullable<string>;
  to: Nullable<string>;
}

/** Anything sortable by the generic table/list needs exactly this much. */
export type Comparator<T> = (a: T, b: T) => number;
