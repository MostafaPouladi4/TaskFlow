import { useMemo } from "react";
import type { ID } from "../../types";
import { cn } from "../../utils/cn";
import { tokenizeBody } from "../../utils/mention";

export interface MentionTextProps {
  body: string;
  /** When omitted, mentions render as static chips rather than buttons. */
  onMentionClick?: (userId: ID) => void;
  className?: string;
}

/**
 * Renders a comment body with its mentions styled.
 *
 * The body is tokenised and mapped to elements rather than parsed into HTML,
 * so there is no `dangerouslySetInnerHTML` anywhere near user input.
 */
export function MentionText({
  body,
  onMentionClick,
  className,
}: MentionTextProps) {
  const tokens = useMemo(() => tokenizeBody(body), [body]);

  const chipClasses =
    "inline-flex items-center rounded-md bg-brand-500/10 px-1 py-px font-medium text-brand-700 dark:text-brand-300";

  return (
    <p
      className={cn(
        "text-[13px] leading-6 break-words whitespace-pre-wrap text-content",
        className,
      )}
    >
      {tokens.map((token, index) => {
        if (token.kind !== "mention") {
          // Token order is stable, so the index is a safe key here.
          return <span key={index}>{token.value}</span>;
        }

        if (!onMentionClick) {
          return (
            <span key={index} className={chipClasses}>
              @{token.name}
            </span>
          );
        }

        return (
          <button
            key={index}
            type="button"
            onClick={() => onMentionClick(token.userId)}
            className={cn(chipClasses, "transition-colors hover:bg-brand-500/20")}
          >
            @{token.name}
          </button>
        );
      })}
    </p>
  );
}
