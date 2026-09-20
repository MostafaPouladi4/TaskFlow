import type { ID, MentionCandidate, MentionQuery, User } from "../../shared/types";

/**
 * Mentions are stored inline in the comment body as `@[نام](شناسه)`, which
 * survives a round-trip through the API as plain text and can't be broken by
 * a later rename — the display name is resolved from the id at render time.
 */
const MENTION_PATTERN = /@\[([^\]]+)\]\(([^)]+)\)/g;

/** Longest `@`-query we'll treat as an active mention (Persian full names). */
const MAX_QUERY_LENGTH = 30;

const WORD_CHAR = /[\p{L}\p{N}_]/u;

export function serializeMention(user: User): string {
  return `@[${user.name}](${user.id})`;
}

/** Ids of everyone mentioned in a body — drives notifications. */
export function extractMentionIds(body: string): ID[] {
  const ids = new Set<ID>();

  for (const match of body.matchAll(MENTION_PATTERN)) {
    ids.add(match[2]);
  }

  return [...ids];
}

/** Plain-text rendering, used for previews and notification excerpts. */
export function stripMentions(body: string): string {
  return body.replace(MENTION_PATTERN, (_full, name: string) => name);
}

/**
 * Splits a body into tokens so the renderer can style mentions without ever
 * using `dangerouslySetInnerHTML`.
 */
export type BodyToken =
  | { kind: "text"; value: string }
  | { kind: "mention"; userId: ID; name: string };

export function tokenizeBody(body: string): BodyToken[] {
  const tokens: BodyToken[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(MENTION_PATTERN)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      tokens.push({ kind: "text", value: body.slice(lastIndex, index) });
    }

    tokens.push({ kind: "mention", userId: match[2], name: match[1] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < body.length) {
    tokens.push({ kind: "text", value: body.slice(lastIndex) });
  }

  return tokens;
}

/**
 * Detects whether the caret currently sits inside an unfinished mention.
 *
 * Rejects anything that looks like an email (`a@b`) or an already-inserted
 * token (`@[name](id)`) so the suggestion menu only opens when it should.
 */
export function findActiveMention(
  value: string,
  caret: number,
): MentionQuery | null {
  const upToCaret = value.slice(0, caret);
  const at = upToCaret.lastIndexOf("@");

  if (at === -1) return null;

  const before = at > 0 ? upToCaret[at - 1] : "";
  if (before && WORD_CHAR.test(before)) return null;

  const query = upToCaret.slice(at + 1);

  if (query.length > MAX_QUERY_LENGTH) return null;
  if (/[\n\r[\]()]/.test(query)) return null;

  return { start: at, query };
}

export interface InsertMentionResult {
  value: string;
  /** Where the caret should land once React re-renders. */
  caret: number;
}

/** Replaces the in-progress `@query` with a completed mention token. */
export function insertMention(
  value: string,
  candidate: MentionCandidate,
): InsertMentionResult {
  const token = `${serializeMention(candidate.user)} `;
  const before = value.slice(0, candidate.start);
  const after = value.slice(candidate.start + candidate.query.length + 1);

  return { value: before + token + after, caret: before.length + token.length };
}

/** Users whose name matches the typed query, best matches first. */
export function filterMentionCandidates(
  users: User[],
  query: string,
  limit: number,
): User[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return users.slice(0, limit);

  return users
    .filter((user) => user.name.toLowerCase().includes(normalized))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(normalized) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(normalized) ? 0 : 1;
      return aStarts - bStarts || a.name.localeCompare(b.name, "fa");
    })
    .slice(0, limit);
}
