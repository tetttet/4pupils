"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { productBrand } from "@/lib/atlas/brand";
import { AtlasIntroResponse } from "./AtlasIntroResponse";
import { welcomeBackdropSubtext, welcomeBackdropText } from "./chat-data";
import type { ChatMessage } from "./chat-types";

type ChatMessagesProps = {
  bottomRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  messages: ChatMessage[];
  onTypingComplete?: (messageId: string) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  streamingMessageId?: string | null;
  typingMessageId?: string | null;
  welcomeSubtitle?: string;
  welcomeTitle?: string;
};

const urlPattern = /https?:\/\/[^\s]+/g;
const urlAtCursorPattern = /^https?:\/\/[^\s]+/;
const orderedListPattern = /^\s*(\d+)[.)]\s+(.*)$/;
const unorderedListPattern = /^\s*[-*•]\s+(.*)$/;
const messageTextLinkClassName =
  "break-all font-bold underline decoration-2 underline-offset-4 transition hover:text-[var(--accent)]";

type MessageBlock =
  | {
      lines: string[];
      type: "paragraph";
    }
  | {
      items: string[];
      start: number;
      type: "ordered";
    }
  | {
      items: string[];
      type: "unordered";
    };

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function isSafeMessageHref(href: string) {
  return isExternalHref(href) || href.startsWith("/") || href.startsWith("#");
}

function splitTrailingPunctuation(value: string) {
  const match = value.match(/[),.;!?]+$/);

  if (!match) {
    return { href: value, trailing: "" };
  }

  return {
    href: value.slice(0, -match[0].length),
    trailing: match[0],
  };
}

function parseMessageBlocks(content: string) {
  const blocks: MessageBlock[] = [];
  const paragraphLines: string[] = [];
  let activeList: Extract<
    MessageBlock,
    { type: "ordered" | "unordered" }
  > | null = null;

  function flushParagraph() {
    if (!paragraphLines.length) {
      return;
    }

    blocks.push({ lines: [...paragraphLines], type: "paragraph" });
    paragraphLines.length = 0;
  }

  function flushList() {
    if (!activeList) {
      return;
    }

    blocks.push(activeList);
    activeList = null;
  }

  for (const line of content.replace(/\r\n/g, "\n").split("\n")) {
    const orderedMatch = line.match(orderedListPattern);
    const unorderedMatch = line.match(unorderedListPattern);

    if (orderedMatch) {
      flushParagraph();

      if (activeList?.type !== "ordered") {
        flushList();
        activeList = {
          items: [],
          start: Number(orderedMatch[1]),
          type: "ordered",
        };
      }

      activeList.items.push(orderedMatch[2]);
      continue;
    }

    if (unorderedMatch) {
      flushParagraph();

      if (activeList?.type !== "unordered") {
        flushList();
        activeList = { items: [], type: "unordered" };
      }

      activeList.items.push(unorderedMatch[1]);
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      flushList();
      continue;
    }

    if (activeList && /^\s+\S/.test(line)) {
      activeList.items[activeList.items.length - 1] += `\n${line.trim()}`;
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function parseMarkdownLink(value: string) {
  if (!value.startsWith("[")) {
    return null;
  }

  const labelEnd = value.indexOf("](");

  if (labelEnd <= 1) {
    return null;
  }

  const hrefEnd = value.indexOf(")", labelEnd + 2);

  if (hrefEnd === -1) {
    return null;
  }

  const href = value.slice(labelEnd + 2, hrefEnd).trim();

  if (!isSafeMessageHref(href)) {
    return null;
  }

  return {
    href,
    label: value.slice(1, labelEnd),
    length: hrefEnd + 1,
  };
}

function renderInlineMarkdown(content: string, keyPrefix: string) {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  while (cursor < content.length) {
    const marker = content.slice(cursor, cursor + 2);

    if (marker === "**" || marker === "__") {
      const end = content.indexOf(marker, cursor + marker.length);
      const strongText =
        end === -1
          ? content.slice(cursor + marker.length)
          : content.slice(cursor + marker.length, end);

      if (strongText) {
        nodes.push(
          <strong
            className="font-semibold"
            key={`${keyPrefix}-strong-${cursor}`}
          >
            {renderInlineMarkdown(strongText, `${keyPrefix}-strong-${cursor}`)}
          </strong>,
        );
      }

      cursor = end === -1 ? content.length : end + marker.length;
      continue;
    }

    const markdownLink = parseMarkdownLink(content.slice(cursor));

    if (markdownLink) {
      nodes.push(
        <MessageLink
          className={messageTextLinkClassName}
          href={markdownLink.href}
          key={`${keyPrefix}-markdown-link-${cursor}`}
        >
          {renderInlineMarkdown(
            markdownLink.label,
            `${keyPrefix}-markdown-link-${cursor}`,
          )}
        </MessageLink>,
      );
      cursor += markdownLink.length;
      continue;
    }

    const urlMatch = content.slice(cursor).match(urlAtCursorPattern);

    if (urlMatch) {
      const rawUrl = urlMatch[0];
      const { href, trailing } = splitTrailingPunctuation(rawUrl);

      nodes.push(
        <a
          className={messageTextLinkClassName}
          href={href}
          key={`${keyPrefix}-url-${cursor}`}
          rel="noreferrer"
          target="_blank"
        >
          {href}
        </a>,
      );

      if (trailing) {
        nodes.push(trailing);
      }

      cursor += rawUrl.length;
      continue;
    }

    const nextSpecialIndexes = [
      content.indexOf("**", cursor),
      content.indexOf("__", cursor),
      content.indexOf("[", cursor),
      content.slice(cursor + 1).search(urlPattern) === -1
        ? -1
        : cursor + 1 + content.slice(cursor + 1).search(urlPattern),
    ].filter((index) => index > cursor);

    const nextCursor = nextSpecialIndexes.length
      ? Math.min(...nextSpecialIndexes)
      : content.length;

    nodes.push(content.slice(cursor, nextCursor));
    cursor = nextCursor;
  }

  return nodes;
}

function renderInlineMarkdownWithBreaks(
  content: string,
  keyPrefix: string,
  trailingNode?: ReactNode,
) {
  const nodes: ReactNode[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    if (index > 0) {
      nodes.push(<br key={`${keyPrefix}-br-${index}`} />);
    }

    nodes.push(...renderInlineMarkdown(line, `${keyPrefix}-line-${index}`));
  });

  if (trailingNode) {
    nodes.push(
      <Fragment key={`${keyPrefix}-trailing`}>{trailingNode}</Fragment>,
    );
  }

  return nodes;
}

function renderPlainTextWithBreaks(
  content: string,
  keyPrefix: string,
  trailingNode?: ReactNode,
) {
  const nodes: ReactNode[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  lines.forEach((line, index) => {
    if (index > 0) {
      nodes.push(<br key={`${keyPrefix}-br-${index}`} />);
    }

    if (line) {
      nodes.push(
        <Fragment key={`${keyPrefix}-line-${index}`}>{line}</Fragment>,
      );
    }
  });

  if (trailingNode) {
    nodes.push(
      <Fragment key={`${keyPrefix}-trailing`}>{trailingNode}</Fragment>,
    );
  }

  return nodes;
}

function renderMessageContent(content: string, trailingNode?: ReactNode) {
  const blocks = parseMessageBlocks(content);

  if (!blocks.length) {
    return trailingNode ? <span>{trailingNode}</span> : null;
  }

  return blocks.map((block, blockIndex) => {
    const isLastBlock = blockIndex === blocks.length - 1;

    if (block.type === "paragraph") {
      return (
        <p className="whitespace-pre-wrap" key={`paragraph-${blockIndex}`}>
          {renderInlineMarkdownWithBreaks(
            block.lines.join("\n"),
            `paragraph-${blockIndex}`,
            isLastBlock ? trailingNode : undefined,
          )}
        </p>
      );
    }

    const ListTag = block.type === "ordered" ? "ol" : "ul";
    const markerClassName =
      block.type === "ordered" ? "list-decimal" : "list-disc";

    return (
      <ListTag
        className={`ml-5 space-y-1 ${markerClassName} marker:font-semibold marker:text-current`}
        key={`${block.type}-${blockIndex}`}
        start={block.type === "ordered" ? block.start : undefined}
      >
        {block.items.map((item, itemIndex) => (
          <li className="pl-1" key={`${block.type}-${blockIndex}-${itemIndex}`}>
            {renderInlineMarkdownWithBreaks(
              item,
              `${block.type}-${blockIndex}-${itemIndex}`,
              isLastBlock && itemIndex === block.items.length - 1
                ? trailingNode
                : undefined,
            )}
          </li>
        ))}
      </ListTag>
    );
  });
}

function renderPlainMessageContent(content: string, trailingNode?: ReactNode) {
  if (!content) {
    return trailingNode ? <span>{trailingNode}</span> : null;
  }

  return (
    <p className="whitespace-pre-wrap">
      {renderPlainTextWithBreaks(content, "plain-message", trailingNode)}
    </p>
  );
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  return prefersReducedMotion;
}

function getTypewriterDuration(textLength: number) {
  const minimumDuration = 360;
  const maximumDuration = 1480;

  return Math.min(
    maximumDuration,
    Math.max(minimumDuration, textLength * 7),
  );
}

type TypewriterTextProps = {
  isActive: boolean;
  messageId: string;
  onComplete: (messageId: string) => void;
  prefersReducedMotion: boolean;
  text: string;
};

function TypewriterText({
  isActive,
  messageId,
  onComplete,
  prefersReducedMotion,
  text,
}: TypewriterTextProps) {
  const [visibleLength, setVisibleLength] = useState(() =>
    isActive ? 0 : text.length,
  );

  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (prefersReducedMotion) {
      onComplete(messageId);
      return;
    }

    const totalDuration = getTypewriterDuration(text.length);
    const startAt = window.performance.now();
    let frameId = 0;
    let lastVisibleLength = 0;

    const tick = (timestamp: number) => {
      const progress =
        totalDuration <= 0
          ? 1
          : Math.min(1, (timestamp - startAt) / totalDuration);
      const nextVisibleLength = Math.min(
        text.length,
        Math.max(1, Math.ceil(text.length * progress)),
      );

      if (nextVisibleLength !== lastVisibleLength) {
        lastVisibleLength = nextVisibleLength;
        setVisibleLength(nextVisibleLength);
      }

      if (progress >= 1) {
        onComplete(messageId);
        return;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [isActive, messageId, onComplete, prefersReducedMotion, text]);

  const renderedText =
    isActive && !prefersReducedMotion ? text.slice(0, visibleLength) : text;
  const caret =
    isActive && !prefersReducedMotion ? (
      <span
        aria-hidden="true"
        className="chat-type-caret ml-0.5 inline-block"
      />
    ) : undefined;

  return (
    <div className="space-y-2 break-words">
      {isActive && !prefersReducedMotion
        ? renderPlainMessageContent(renderedText, caret)
        : renderMessageContent(renderedText, caret)}
    </div>
  );
}

type LiveMessageTextProps = {
  isActive: boolean;
  prefersReducedMotion: boolean;
  text: string;
};

function LiveMessageText({
  isActive,
  prefersReducedMotion,
  text,
}: LiveMessageTextProps) {
  const caret =
    isActive && !prefersReducedMotion ? (
      <span
        aria-hidden="true"
        className="chat-type-caret ml-0.5 inline-block"
      />
    ) : undefined;

  return (
    <div className="space-y-2 break-words">
      {renderPlainMessageContent(text, caret)}
    </div>
  );
}

type MessageLinkProps = {
  children: ReactNode;
  className: string;
  href: string;
};

function MessageLink({ children, className, href }: MessageLinkProps) {
  if (isExternalHref(href)) {
    return (
      <a className={className} href={href} rel="noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

export function ChatMessages({
  bottomRef,
  contentRef,
  isLoading,
  messages,
  onTypingComplete,
  scrollRef,
  streamingMessageId,
  typingMessageId,
  welcomeSubtitle,
  welcomeTitle,
}: ChatMessagesProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const resolvedWelcomeSubtitle =
    welcomeSubtitle?.trim() || welcomeBackdropSubtext;
  const resolvedWelcomeTitle = welcomeTitle?.trim() || welcomeBackdropText;

  const handleTypingComplete = useCallback(
    (messageId: string) => {
      onTypingComplete?.(messageId);
    },
    [onTypingComplete],
  );

  return (
    <div
      className="relative min-h-0 flex-1 overflow-y-auto bg-[var(--chat-bg)] px-4 pb-5 pt-20 transition-colors duration-300 sm:px-6"
      ref={scrollRef}
    >
      <div className="space-y-4" ref={contentRef}>
        {messages.length === 0 ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid select-none place-items-center px-6 text-center"
          >
            <div className="max-w-4xl space-y-2">
              <p className="break-words text-3xl font-semibold leading-tight text-[var(--welcome-backdrop-text)] sm:text-5xl">
                {resolvedWelcomeTitle}
              </p>
              <p className="break-words text-xl font-medium leading-tight text-[var(--welcome-backdrop-text)] sm:text-3xl">
                {resolvedWelcomeSubtitle}
              </p>
            </div>
          </div>
        ) : null}

        {messages.map((message) => {
          const isTyping =
            message.role === "assistant" && message.id === typingMessageId;
          const isStreaming =
            message.role === "assistant" && message.id === streamingMessageId;
          const hasSettledIntro = Boolean(message.reply?.intro) && !isStreaming;
          const isAssistantContentLive =
            message.role === "assistant" && !message.reply;
          const isAssistantAnimationActive = isTyping || isStreaming;

          return (
            <motion.article
              animate={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 1, scale: 1, y: 0 }
              }
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
              initial={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, scale: 0.985, y: 18 }
              }
              key={message.id}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <div
                className={`rounded-[22px] px-4 py-3 text-sm leading-6 transition-colors duration-300 ${
                  hasSettledIntro
                    ? "w-full max-w-full sm:max-w-full"
                    : "max-w-[88%] sm:max-w-[78%]"
                } ${
                  message.role === "user"
                    ? "bg-[var(--user-bubble)] text-[var(--user-bubble-text)] shadow-[0_14px_34px_rgba(15,23,42,0.16)]"
                    : "border border-transparent text-[var(--assistant-bubble-text)]"
                }`}
              >
                {isAssistantContentLive ? (
                  <LiveMessageText
                    isActive={isStreaming}
                    prefersReducedMotion={prefersReducedMotion}
                    text={message.content}
                  />
                ) : (
                  <TypewriterText
                    isActive={isTyping}
                    key={`${message.id}-${isTyping ? "typing" : "static"}`}
                    messageId={message.id}
                    onComplete={handleTypingComplete}
                    prefersReducedMotion={prefersReducedMotion}
                    text={message.content}
                  />
                )}

                {!isAssistantAnimationActive && message.reply?.intro ? (
                  <AtlasIntroResponse intro={message.reply.intro} />
                ) : null}

                {!isAssistantAnimationActive &&
                !message.reply?.intro &&
                message.reply?.links?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.reply.links.map((link) => (
                      <MessageLink
                        className="select-none rounded-full bg-[var(--link-chip-bg)] px-3 py-1.5 text-xs font-medium text-[var(--link-chip-text)] transition duration-300 hover:bg-[var(--link-chip-hover)] active:scale-[0.98]"
                        href={link.href}
                        key={link.href}
                      >
                        {link.label}
                      </MessageLink>
                    ))}
                  </div>
                ) : null}

                {!isAssistantAnimationActive &&
                !message.reply?.intro &&
                message.reply?.actions?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.reply.actions.map((action) => (
                      <MessageLink
                        className="select-none rounded-full bg-[var(--action-bg)] px-3 py-1.5 text-xs font-semibold text-white transition duration-300 hover:bg-[var(--action-hover)] active:scale-[0.98]"
                        href={action.href ?? productBrand.supportPath}
                        key={`${action.label}-${action.href}`}
                      >
                        {action.label}
                      </MessageLink>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.article>
          );
        })}

        {isLoading ? (
          <motion.div
            animate={
              prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }
            }
            className="flex justify-start"
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, scale: 0.985, y: 14 }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <div
              aria-label="Ассистент печатает ответ"
              className="min-w-[12.5rem] rounded-[24px] border border-[var(--bubble-border)] bg-[var(--assistant-bubble)] px-4 py-3 text-sm text-[var(--muted)] shadow-[0_14px_36px_rgba(15,23,42,0.07)]"
              role="status"
            >
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                Atlas думает
              </span>
              <span aria-hidden="true" className="flex h-6 items-center gap-1.5">
                <span className="chat-typing-dot block h-2 w-2 rounded-full bg-[var(--muted)]" />
                <span className="chat-typing-dot block h-2 w-2 rounded-full bg-[var(--muted)]" />
                <span className="chat-typing-dot block h-2 w-2 rounded-full bg-[var(--muted)]" />
              </span>
              <div aria-hidden="true" className="mt-3 space-y-2">
                <div className="h-2.5 w-40 rounded-full bg-[var(--bubble-border)]/75" />
                <div className="h-2.5 w-28 rounded-full bg-[var(--bubble-border)]/55" />
              </div>
            </div>
          </motion.div>
        ) : null}

        <div aria-hidden="true" ref={bottomRef} />
      </div>
    </div>
  );
}
