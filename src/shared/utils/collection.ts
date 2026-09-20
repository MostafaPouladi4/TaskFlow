/**
 * Small generic collection helpers. Each is typed so the element type flows
 * through — no casts at the call site.
 */

/** Groups items by a derived key, preserving first-seen key order. */
export function groupBy<T, K extends string>(
  items: T[],
  getKey: (item: T) => K,
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;

  for (const item of items) {
    const key = getKey(item);
    (result[key] ??= []).push(item);
  }

  return result;
}

/** Builds an id → item map for O(1) relation lookups. */
export function indexBy<T, K extends string>(
  items: T[],
  getKey: (item: T) => K,
): Map<K, T> {
  return new Map(items.map((item) => [getKey(item), item]));
}

export function uniqueBy<T, K>(items: T[], getKey: (item: T) => K): T[] {
  const seen = new Set<K>();
  const result: T[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

/** Sorts without mutating the input. */
export function sortBy<T>(
  items: T[],
  compare: (a: T, b: T) => number,
): T[] {
  return [...items].sort(compare);
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** Resolves ids to entities, dropping any that no longer exist. */
export function resolveAll<T, K extends string>(
  ids: K[],
  map: Map<K, T>,
): T[] {
  const result: T[] = [];

  for (const id of ids) {
    const item = map.get(id);
    if (item !== undefined) result.push(item);
  }

  return result;
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** `[1..n]` — used by the calendar grid. */
export function range(start: number, end: number): number[] {
  const length = Math.max(0, end - start + 1);
  return Array.from({ length }, (_unused, index) => start + index);
}

export function isEmpty<T>(items: T[] | null | undefined): boolean {
  return !items || items.length === 0;
}
