import { useEffect, useId, useMemo, useRef, useState } from "react";
import { SendHorizonal, Smile, X } from "lucide-react";
import { ACTION_LABELS, COMMENT_LABELS } from "../../constants/labels";
import { MAX_COMMENT_LENGTH, MAX_MENTION_SUGGESTIONS } from "../../constants/config";
import { useOnClickOutside } from "../../hooks/useDisclosure";
import { useWorkspace } from "../../hooks/useWorkspace";
import type { ID, MentionQuery } from "../../types";
import { cn } from "../../utils/cn";
import {
  filterMentionCandidates,
  findActiveMention,
  insertMention,
} from "../../utils/mention";
import { toPersianDigits } from "../../utils/text";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";

const EMOJI = [
  "👍",
  "🎉",
  "✅",
  "🔥",
  "😄",
  "🙏",
  "👀",
  "🚀",
  "💡",
  "❤️",
  "🤝",
  "📌",
  "⚠️",
  "🐛",
  "✨",
  "📝",
];

export interface CommentComposerProps {
  submitLabel?: string;
  placeholder?: string;
  /** Prefilled body — used when editing an existing comment. */
  initialValue?: string;
  autoFocus?: boolean;
  /** Adds a cancel action beside submit. */
  onCancel?: () => void;
  onSubmit: (body: string) => Promise<boolean> | boolean;
  className?: string;
}

/**
 * The comment box.
 *
 * Chat conventions throughout: Enter sends, Shift+Enter breaks the line, `@`
 * opens a mention menu that is driven from the keyboard, and the emoji picker
 * inserts at the caret rather than appending.
 */
export function CommentComposer({
  submitLabel = COMMENT_LABELS.send,
  placeholder = COMMENT_LABELS.placeholder,
  initialValue = "",
  autoFocus = false,
  onCancel,
  onSubmit,
  className,
}: CommentComposerProps) {
  const { users } = useWorkspace();

  const [value, setValue] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<MentionQuery | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);

  // Several composers can be mounted at once (one editing a comment, one for
  // the thread), so the listbox id has to be per-instance.
  const menuId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const caretRef = useRef<number | null>(null);

  useOnClickOutside(wrapperRef, () => setEmojiOpen(false), emojiOpen);

  const candidates = useMemo(
    () =>
      mentionQuery
        ? filterMentionCandidates(users, mentionQuery.query, MAX_MENTION_SUGGESTIONS)
        : [],
    [mentionQuery, users],
  );

  const menuOpen = mentionQuery !== null && candidates.length > 0;

  // Restore the caret after a programmatic insert (mention or emoji), which
  // React would otherwise reset to the end of the value.
  useEffect(() => {
    const caret = caretRef.current;
    const textarea = textareaRef.current;

    if (caret === null || !textarea) return;

    caretRef.current = null;
    textarea.focus();
    textarea.setSelectionRange(caret, caret);
  }, [value]);

  const syncMentionQuery = (next: string, caret: number): void => {
    setMentionQuery(findActiveMention(next, caret));
    setActiveIndex(0);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    const next = event.target.value;
    setValue(next);
    syncMentionQuery(next, event.target.selectionStart);
  };

  const insertAtCaret = (text: string): void => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setValue((previous) => previous + text);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = value.slice(0, start) + text + value.slice(end);

    caretRef.current = start + text.length;
    setValue(next);
  };

  const chooseMention = (userId: ID): void => {
    if (!mentionQuery) return;

    const user = candidates.find((candidate) => candidate.id === userId);
    if (!user) return;

    const result = insertMention(value, { ...mentionQuery, user });

    caretRef.current = result.caret;
    setValue(result.value);
    setMentionQuery(null);
  };

  const submit = async (): Promise<void> => {
    const body = value.trim();
    if (!body || pending) return;

    setPending(true);
    try {
      const ok = await onSubmit(body);
      if (ok) {
        setValue("");
        setMentionQuery(null);
      }
    } finally {
      setPending(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (menuOpen) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % candidates.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(
          (index) => (index - 1 + candidates.length) % candidates.length,
        );
        return;
      }

      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        chooseMention(candidates[activeIndex].id);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
      return;
    }

    if (event.key === "Escape" && onCancel) {
      event.preventDefault();
      onCancel();
    }
  };

  const remaining = MAX_COMMENT_LENGTH - value.length;
  const tooLong = remaining < 0;
  const canSubmit = value.trim().length > 0 && !tooLong && !pending;

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {menuOpen && (
        <ul
          id={menuId}
          role="listbox"
          aria-label={COMMENT_LABELS.mentionSuggestions}
          className="absolute inset-s-0 bottom-full z-50 mb-2 max-h-56 w-72 animate-scale-in overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-lg scrollbar-slim"
        >
          {candidates.map((candidate, index) => (
            <li
              key={candidate.id}
              id={`mention-${candidate.id}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseMention(candidate.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors",
                index === activeIndex && "bg-surface-2",
              )}
            >
              <Avatar
                name={candidate.name}
                initials={candidate.avatar}
                seed={candidate.id}
                size="xs"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-content">
                  {candidate.name}
                </span>
                <span className="block truncate text-[10px] text-subtle">
                  {candidate.title}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {emojiOpen && (
        <div className="absolute inset-s-0 bottom-full z-40 mb-2 w-56 animate-scale-in rounded-xl border border-line bg-surface p-2 shadow-lg">
          <div className="grid grid-cols-8 gap-0.5">
            {EMOJI.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  insertAtCaret(emoji);
                  setEmojiOpen(false);
                }}
                aria-label={COMMENT_LABELS.addEmoji(emoji)}
                className="inline-flex size-6 items-center justify-center rounded-md text-base transition-colors hover:bg-surface-2"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          "rounded-xl border bg-surface transition-colors",
          tooLong ? "border-rose-500/70" : "border-line focus-within:border-brand-500",
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          autoFocus={autoFocus}
          rows={3}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={(event) =>
            syncMentionQuery(value, event.currentTarget.selectionStart)
          }
          placeholder={placeholder}
          aria-label={placeholder}
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          aria-activedescendant={
            menuOpen ? `mention-${candidates[activeIndex].id}` : undefined
          }
          aria-autocomplete="list"
          className="scrollbar-slim w-full resize-y bg-transparent px-3.5 py-2.5 text-[13px] leading-6 text-content outline-none placeholder:text-subtle"
        />

        <div className="flex items-center gap-1 border-t border-line px-2 py-1.5">
          <IconButton
            icon={Smile}
            label={COMMENT_LABELS.emoji}
            size="sm"
            variant="ghost"
            aria-expanded={emojiOpen}
            onClick={() => setEmojiOpen((open) => !open)}
          />

          <span className="ms-1 hidden text-[10px] text-subtle sm:inline">
            {COMMENT_LABELS.mentionHint}
          </span>

          <span className="ms-auto flex items-center gap-2">
            {value.length > 0 && (
              <span
                className={cn(
                  "text-[10px]",
                  tooLong ? "text-rose-500" : "text-subtle",
                )}
              >
                {toPersianDigits(Math.abs(remaining))}
              </span>
            )}

            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={onCancel}
                disabled={pending}
              >
                {ACTION_LABELS.cancel}
              </Button>
            )}

            <Button
              size="sm"
              icon={SendHorizonal}
              onClick={() => void submit()}
              loading={pending}
              disabled={!canSubmit}
            >
              {submitLabel}
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
}
