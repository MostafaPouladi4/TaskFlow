import { toLatinDigits } from "./text";

/**
 * Persian text normalisation for search.
 *
 * Users type the same word several ways — Arabic `ي` vs Persian `ی`, with or
 * without the zero-width non-joiner, Persian vs Latin digits. Folding all of
 * those to one form means a search for "نیم فاصله" finds "نیم‌فاصله".
 */
const CHAR_FOLDS: Record<string, string> = {
  "ي": "ی",
  "ى": "ی",
  "ﻯ": "ی",
  "ك": "ک",
  "ﻙ": "ک",
  "ة": "ه",
  "ۀ": "ه",
  "أ": "ا",
  "إ": "ا",
  "آ": "ا",
  "ٱ": "ا",
  "ؤ": "و",
  "ئ": "ی",
  "ء": "",
};

/** Arabic diacritics (harakat) — invisible and never typed intentionally. */
const DIACRITICS = /[ً-ْٰـ]/g;
const ZWNJ = /[​-‍﻿]/g;
const WHITESPACE = /\s+/g;

export function normalize(input: string): string {
  let output = toLatinDigits(input.normalize("NFC").toLowerCase());

  output = output.replace(/[.,!?؟،؛:;"'«»()\[\]{}]/g, " ");
  output = output.replace(DIACRITICS, "");
  output = output.replace(ZWNJ, "");
  output = output.replace(/./g, (char) => CHAR_FOLDS[char] ?? char);
  output = output.replace(WHITESPACE, " ").trim();

  return output;
}

/** Space-free form, so "نیم فاصله" also matches "نیم‌فاصله". */
function compact(input: string): string {
  return input.replace(/ /g, "");
}

/**
 * Relevance score for a match, or 0 when there's no match. Higher is better;
 * used to rank search results rather than merely filtering them.
 */
export function scoreMatch(haystack: string, query: string): number {
  if (!query) return 0;

  const hay = normalize(haystack);
  const needle = normalize(query);

  if (!hay || !needle) return 0;

  if (hay === needle) return 100;
  if (hay.startsWith(needle)) return 80;

  // Word-boundary hit beats a mid-word hit: "طراحی" should rank
  // "طراحی رابط" above "بازطراحی".
  const boundary = new RegExp(`(^| )${escapeRegExp(needle)}`);
  if (boundary.test(hay)) return 60;

  if (hay.includes(needle)) return 40;

  const compactHay = compact(hay);
  if (compactHay.includes(compact(needle))) return 25;

  return 0;
}

export function matchesQuery(haystack: string, query: string): boolean {
  return scoreMatch(haystack, query) > 0;
}

/** Best score across several fields — a task matches if any field matches. */
export function scoreFields(fields: string[], query: string): number {
  return fields.reduce((best, field) => Math.max(best, scoreMatch(field, query)), 0);
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
