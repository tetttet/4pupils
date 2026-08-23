"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { useAuth } from "@/context/auth-context";
import type { BotReply } from "@/lib/atlas/types";
import { ChatComposer } from "./ChatComposer";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatSidebar } from "./ChatSidebar";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { useChatAutoScroll } from "./useChatAutoScroll";
import {
  initialChat,
  maxStoredChats,
  maxStoredMessages,
  starterChips,
} from "./chat-data";
import {
  readChatHydrationState,
  writeChatHydrationState,
} from "./chat-storage";
import type {
  ChatSession,
  ThemeMode,
  ThemeTransitionOrigin,
} from "./chat-types";
import {
  createEmptyChat,
  createId,
  getDeviceTheme,
  titleFromMessage,
} from "./chat-utils";

const THEME_TRANSITION_DURATION_MS = 680;
const THEME_TRANSITION_EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

type ViewTransitionController = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    updateCallback: () => void | Promise<void>,
  ) => ViewTransitionController;
};

type DeleteConfirmation =
  | {
      chatId: string;
      kind: "chat";
      title: string;
    }
  | {
      kind: "all";
    };

type ChatStreamEvent =
  | {
      text: string;
      type: "delta";
    }
  | {
      reply: BotReply;
      type: "fallback" | "final";
    };

function isStreamingChatResponse(response: Response) {
  return (
    response.headers.get("content-type")?.includes("application/x-ndjson") ??
    false
  );
}

function parseChatStreamEvent(line: string): ChatStreamEvent | null {
  const value = JSON.parse(line) as Partial<ChatStreamEvent>;

  if (value.type === "delta" && typeof value.text === "string") {
    return {
      text: value.text,
      type: "delta",
    };
  }

  if (
    (value.type === "final" || value.type === "fallback") &&
    value.reply &&
    typeof value.reply === "object"
  ) {
    return {
      reply: value.reply as BotReply,
      type: value.type,
    };
  }

  return null;
}

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getThemeRevealRadius(origin: ThemeTransitionOrigin) {
  const horizontalDistance = Math.max(origin.x, window.innerWidth - origin.x);
  const verticalDistance = Math.max(origin.y, window.innerHeight - origin.y);

  return Math.hypot(horizontalDistance, verticalDistance);
}

export function AtlasChat() {
  const { loading: isAuthLoading, user } = useAuth();
  const [chats, setChats] = useState<ChatSession[]>([initialChat]);
  const [activeChatId, setActiveChatId] = useState(initialChat.id);
  const [input, setInput] = useState("");
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [streamingChatId, setStreamingChatId] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<{
    chatId: string;
    message: string;
  } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode | null>(null);
  const [hasThemeOverride, setHasThemeOverride] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const themeRef = useRef<ThemeMode>("light");
  const plannedThemeRef = useRef<ThemeMode>("light");
  const themeTransitionQueueRef = useRef<Promise<void>>(Promise.resolve());

  const activeChat = useMemo(() => {
    return (
      chats.find((chat) => chat.id === activeChatId) ?? chats[0] ?? initialChat
    );
  }, [activeChatId, chats]);

  const orderedChats = useMemo(() => {
    return [...chats].sort(
      (first, second) => second.updatedAt - first.updatedAt,
    );
  }, [chats]);

  const isLoading = loadingChatId === activeChat.id;
  const isStreaming = streamingChatId === activeChat.id;
  const hasAnyLoadingChat = Boolean(loadingChatId || streamingChatId);
  const hasTypingMessage = Boolean(typingMessageId);
  const hasActiveResponse =
    hasAnyLoadingChat || hasTypingMessage || activeRequestRef.current !== null;
  const activeError =
    error && error.chatId === activeChat.id ? error.message : "";
  const resolvedTheme = theme ?? "light";
  const isBooting = isAuthLoading || !isHydrated;
  const welcomeName =
    user?.first_name?.trim() ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  const welcomeTitle = user
    ? `Здравствуйте${welcomeName ? `, ${welcomeName}` : ""}!`
    : undefined;
  const welcomeSubtitle = user ? "Чем могу помочь сегодня?" : undefined;
  const deleteConfirmationCopy =
    deleteConfirmation?.kind === "all"
      ? {
          confirmLabel: "Удалить все",
          description:
            "История переписок будет очищена. Это действие нельзя отменить.",
          title: "Удалить все чаты?",
        }
      : {
          confirmLabel: "Удалить чат",
          description: `Чат «${deleteConfirmation?.title ?? "Без названия"}» исчезнет из истории. Это действие нельзя отменить.`,
          title: "Удалить этот чат?",
        };

  const chips = useMemo(() => {
    const lastAssistant = [...activeChat.messages]
      .reverse()
      .find((message) => message.role === "assistant" && message.reply);

    return lastAssistant?.reply?.chips ?? starterChips;
  }, [activeChat.messages]);
  const isTypingActive = useMemo(
    () =>
      Boolean(
        typingMessageId &&
          activeChat.messages.some((message) => message.id === typingMessageId),
      ),
    [activeChat.messages, typingMessageId],
  );
  const shouldShowSuggestions = useMemo(
    () => !activeChat.messages.some((message) => message.role === "user"),
    [activeChat.messages],
  );
  const isResponseActive = isLoading || isStreaming || isTypingActive;
  const {
    bottomRef,
    contentRef,
    enableFollowMode,
    scrollRef,
    scrollToBottom,
    showScrollToBottom,
  } = useChatAutoScroll({
    activeChatId: activeChat.id,
    isReady: !isBooting,
    isStreaming: isResponseActive,
  });

  const followLatestMessage = useCallback(
    (smooth: boolean) => {
      enableFollowMode();
      window.requestAnimationFrame(() => {
        scrollToBottom({ smooth });
      });
    },
    [enableFollowMode, scrollToBottom],
  );

  function focusInputOnDesktop() {
    if (window.matchMedia("(pointer: fine)").matches) {
      inputRef.current?.focus();
    }
  }

  const clearActiveRequest = useCallback((controller?: AbortController) => {
    if (!controller || activeRequestRef.current === controller) {
      activeRequestRef.current = null;
    }
  }, []);

  function closeSidebar() {
    setIsSidebarOpen(false);
    setIsSettingsOpen(false);
  }

  const clearThemeTransitionContext = useCallback(() => {
    const root = document.documentElement;

    delete root.dataset.atlasThemeTransition;
    root.style.removeProperty("--atlas-theme-origin-x");
    root.style.removeProperty("--atlas-theme-origin-y");
    root.style.removeProperty("--atlas-theme-reveal-radius");
    root.style.removeProperty("--atlas-theme-transition-duration");
    root.style.removeProperty("--atlas-theme-transition-ease");
  }, []);

  const syncThemeToDocument = useCallback((nextTheme: ThemeMode) => {
    document.documentElement.dataset.atlasTheme = nextTheme;
  }, []);

  const commitTheme = useCallback(
    (nextTheme: ThemeMode) => {
      themeRef.current = nextTheme;
      syncThemeToDocument(nextTheme);
      setTheme(nextTheme);
    },
    [syncThemeToDocument],
  );

  const prefersReducedMotion = useCallback(() => {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const setThemeTransitionGeometry = useCallback(
    (origin?: ThemeTransitionOrigin) => {
      const root = document.documentElement;
      const resolvedOrigin = origin ?? {
        x: 48,
        y: window.innerHeight - 56,
      };
      const x = clamp(resolvedOrigin.x, 0, window.innerWidth);
      const y = clamp(resolvedOrigin.y, 0, window.innerHeight);
      const radius = getThemeRevealRadius({ x, y }) + 24;

      root.style.setProperty("--atlas-theme-origin-x", `${x}px`);
      root.style.setProperty("--atlas-theme-origin-y", `${y}px`);
      root.style.setProperty("--atlas-theme-reveal-radius", `${radius}px`);
      root.style.setProperty(
        "--atlas-theme-transition-duration",
        `${THEME_TRANSITION_DURATION_MS}ms`,
      );
      root.style.setProperty(
        "--atlas-theme-transition-ease",
        THEME_TRANSITION_EASE,
      );
    },
    [],
  );

  const applyTheme = useCallback(
    async (
      nextTheme: ThemeMode,
      options?: {
        animate?: boolean;
        origin?: ThemeTransitionOrigin;
      },
    ) => {
      const root = document.documentElement;
      const supportsViewTransitions =
        typeof document !== "undefined" &&
        typeof (document as DocumentWithViewTransition).startViewTransition ===
          "function";
      const shouldAnimate =
        Boolean(options?.animate) &&
        supportsViewTransitions &&
        !prefersReducedMotion();

      root.dataset.atlasThemeTransition = shouldAnimate ? "running" : "instant";

      if (!shouldAnimate) {
        flushSync(() => {
          commitTheme(nextTheme);
        });

        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => {
            clearThemeTransitionContext();
            resolve();
          });
        });
        return;
      }

      setThemeTransitionGeometry(options?.origin);

      try {
        const transition = (document as DocumentWithViewTransition)
          .startViewTransition?.(() => {
            flushSync(() => {
              commitTheme(nextTheme);
            });
          });

        if (!transition) {
          flushSync(() => {
            commitTheme(nextTheme);
          });
          return;
        }

        await transition.finished;
      } catch {
        flushSync(() => {
          commitTheme(nextTheme);
        });
      } finally {
        clearThemeTransitionContext();
      }
    },
    [
      clearThemeTransitionContext,
      commitTheme,
      prefersReducedMotion,
      setThemeTransitionGeometry,
    ],
  );

  const enqueueThemeChange = useCallback(
    (
      nextTheme: ThemeMode,
      options?: {
        animate?: boolean;
        origin?: ThemeTransitionOrigin;
      },
    ) => {
      themeTransitionQueueRef.current = themeTransitionQueueRef.current
        .catch(() => undefined)
        .then(() => applyTheme(nextTheme, options));
    },
    [applyTheme],
  );

  function toggleTheme(origin: ThemeTransitionOrigin) {
    setHasThemeOverride(true);

    const nextTheme =
      plannedThemeRef.current === "dark" ? "light" : "dark";
    plannedThemeRef.current = nextTheme;

    enqueueThemeChange(nextTheme, {
      animate: true,
      origin,
    });
  }

  function createNewChat() {
    const chat = createEmptyChat(chats.length);
    setChats((current) => [chat, ...current].slice(0, maxStoredChats));
    setActiveChatId(chat.id);
    setInput("");
    setError(null);
    setStreamingMessageId(null);
    setTypingMessageId(null);
    setIsSidebarOpen(false);
  }

  function selectChat(chatId: string) {
    setActiveChatId(chatId);
    setInput("");
    setError(null);
    setStreamingMessageId(null);
    setTypingMessageId(null);
    setIsSidebarOpen(false);
  }

  function requestDeleteChat(chatId: string) {
    const chatToDelete = chats.find((chat) => chat.id === chatId);

    if (!chatToDelete) {
      return;
    }

    setDeleteConfirmation({
      chatId,
      kind: "chat",
      title: chatToDelete.title,
    });
  }

  function deleteChat(chatId: string) {
    if (loadingChatId === chatId || streamingChatId === chatId) {
      activeRequestRef.current?.abort();
    }

    const filtered = chats.filter((chat) => chat.id !== chatId);
    const nextChats = filtered.length ? filtered : [createEmptyChat(0)];

    setChats(nextChats);

    if (
      chatId === activeChatId ||
      !nextChats.some((chat) => chat.id === activeChatId)
    ) {
      setActiveChatId(nextChats[0].id);
    }

    if (loadingChatId === chatId) {
      setLoadingChatId(null);
    }

    if (streamingChatId === chatId) {
      setStreamingChatId(null);
      setStreamingMessageId(null);
    }

    setTypingMessageId((current) => {
      const deletedChat = chats.find((chat) => chat.id === chatId);
      const deletedMessageIds = new Set(
        deletedChat?.messages.map((message) => message.id) ?? [],
      );

      return current && deletedMessageIds.has(current) ? null : current;
    });

    setError((current) => (current?.chatId === chatId ? null : current));
  }

  function requestClearAllChats() {
    setDeleteConfirmation({ kind: "all" });
  }

  function clearAllChats() {
    activeRequestRef.current?.abort();

    const chat = createEmptyChat(0);
    setChats([chat]);
    setActiveChatId(chat.id);
    setInput("");
    setError(null);
    setLoadingChatId(null);
    setStreamingChatId(null);
    setStreamingMessageId(null);
    setTypingMessageId(null);
  }

  const stopResponse = useCallback(() => {
    const activeRequest = activeRequestRef.current;

    if (activeRequest && !activeRequest.signal.aborted) {
      activeRequest.abort();
    }

    if (typingMessageId) {
      setTypingMessageId(null);
    }

    if (streamingMessageId) {
      setStreamingMessageId(null);
    }
  }, [streamingMessageId, typingMessageId]);

  function cancelDeleteConfirmation() {
    setDeleteConfirmation(null);
  }

  function confirmDelete() {
    if (!deleteConfirmation) {
      return;
    }

    if (deleteConfirmation.kind === "chat") {
      deleteChat(deleteConfirmation.chatId);
    } else {
      clearAllChats();
    }

    setDeleteConfirmation(null);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSidebar();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
      clearThemeTransitionContext();
    };
  }, [clearThemeTransitionContext]);

  useEffect(() => {
    let isMounted = true;

    const stored = readChatHydrationState();
    const documentTheme = document.documentElement.dataset.atlasTheme;
    const initialTheme =
      stored.theme ??
      (documentTheme === "light" || documentTheme === "dark"
        ? documentTheme
        : null);

    if (!isMounted) {
      return;
    }

    const nextTheme = initialTheme ?? getDeviceTheme();

    themeRef.current = nextTheme;
    plannedThemeRef.current = nextTheme;
    syncThemeToDocument(nextTheme);
    setTheme(nextTheme);
    setHasThemeOverride(Boolean(stored.theme));

    if (stored.chats?.length) {
      setChats(stored.chats);
      setActiveChatId(stored.activeChatId ?? stored.chats[0].id);
    }

    setIsHydrated(true);

    return () => {
      isMounted = false;
    };
  }, [syncThemeToDocument]);

  useEffect(() => {
    if (
      !isHydrated ||
      hasThemeOverride ||
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => {
      const nextTheme = getDeviceTheme();

      if (nextTheme === plannedThemeRef.current) {
        return;
      }

      plannedThemeRef.current = nextTheme;
      enqueueThemeChange(nextTheme, { animate: false });
    };

    syncTheme();
    const onChange = () => syncTheme();

    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, [enqueueThemeChange, hasThemeOverride, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writeChatHydrationState({
      activeChatId,
      chats,
      theme: hasThemeOverride ? theme : null,
    });
  }, [activeChatId, chats, hasThemeOverride, isHydrated, theme]);

  async function sendMessage(value: string) {
    const text = value.trim();

    if (
      !text ||
      loadingChatId ||
      streamingChatId ||
      typingMessageId ||
      activeRequestRef.current
    ) {
      return;
    }

    const abortController = new AbortController();
    const chatId = activeChat.id;
    const memorySnapshot = activeChat.memory;
    const historySnapshot = activeChat.messages
      .filter((message) => message.content.trim())
      .slice(-10)
      .map(({ content, role }) => ({ content, role }));
    const contextSnapshot = {
      ...activeChat.context,
      ...(user?.role ? { role: user.role } : {}),
    };
    let pendingStreamingMessageId: string | null = null;
    const userMessage = {
      id: createId(),
      role: "user" as const,
      content: text,
    };

    activeRequestRef.current = abortController;
    setInput("");
    setError(null);
    setLoadingChatId(chatId);
    followLatestMessage(true);
    setChats((current) =>
      current.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }

        const hasUserMessage = chat.messages.some(
          (message) => message.role === "user",
        );

        return {
          ...chat,
          title: hasUserMessage ? chat.title : titleFromMessage(text),
          updatedAt: Date.now(),
          messages: [...chat.messages, userMessage].slice(-maxStoredMessages),
        };
      }),
    );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: historySnapshot,
          memory: memorySnapshot,
          context: contextSnapshot,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      if (isStreamingChatResponse(response)) {
        const body = response.body;

        if (!body) {
          throw new Error("Streaming response has no body");
        }

        const assistantMessageId = createId();
        pendingStreamingMessageId = assistantMessageId;
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let hasFinalReply = false;

        setTypingMessageId(null);
        setLoadingChatId(null);
        setStreamingChatId(chatId);
        setStreamingMessageId(assistantMessageId);
        setChats((current) =>
          current.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  updatedAt: Date.now(),
                  messages: [
                    ...chat.messages,
                    {
                      id: assistantMessageId,
                      role: "assistant" as const,
                      content: "",
                    },
                  ].slice(-maxStoredMessages),
                }
              : chat,
          ),
        );

        function applyStreamReply(reply: BotReply) {
          hasFinalReply = true;

          if (reply.engine === "openrouter") {
            console.log("Atlas получил ответ через OpenRouter");
          }

          setChats((current) =>
            current.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    updatedAt: Date.now(),
                    memory: reply.memory,
                    context: reply.context,
                    messages: chat.messages
                      .map((message) =>
                        message.id === assistantMessageId
                          ? {
                              ...message,
                              content: reply.answer,
                              reply,
                            }
                          : message,
                      )
                      .slice(-maxStoredMessages),
                  }
                : chat,
            ),
          );
          setStreamingMessageId((current) =>
            current === assistantMessageId ? null : current,
          );
        }

        function applyStreamDelta(textDelta: string) {
          setChats((current) =>
            current.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    updatedAt: Date.now(),
                    messages: chat.messages.map((message) =>
                      message.id === assistantMessageId
                        ? {
                            ...message,
                            content: `${message.content}${textDelta}`,
                          }
                        : message,
                    ),
                  }
                : chat,
            ),
          );
        }

        while (true) {
          const { done, value: chunk } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(chunk, { stream: true });

          while (buffer.includes("\n")) {
            const newlineIndex = buffer.indexOf("\n");
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (!line) {
              continue;
            }

            const event = parseChatStreamEvent(line);

            if (!event) {
              continue;
            }

            if (event.type === "delta") {
              applyStreamDelta(event.text);
            } else {
              applyStreamReply(event.reply);
            }
          }
        }

        const finalLine = buffer.trim();

        if (finalLine) {
          const event = parseChatStreamEvent(finalLine);

          if (event?.type === "delta") {
            applyStreamDelta(event.text);
          } else if (event) {
            applyStreamReply(event.reply);
          }
        }

        if (!hasFinalReply) {
          if (abortController.signal.aborted) {
            return;
          }

          throw new Error("Streaming response ended without final reply");
        }

        return;
      }

      const reply = (await response.json()) as BotReply;
      if (reply.engine === "openrouter") {
        console.log("Atlas получил ответ через OpenRouter");
      }

      const assistantMessage = {
        id: createId(),
        role: "assistant" as const,
        content: reply.answer,
        reply,
      };

      setTypingMessageId(assistantMessage.id);
      setChats((current) =>
        current.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                updatedAt: Date.now(),
                memory: reply.memory,
                context: reply.context,
                messages: [...chat.messages, assistantMessage].slice(
                  -maxStoredMessages,
                ),
              }
            : chat,
        ),
      );
    } catch (error) {
      if (isAbortError(error) || abortController.signal.aborted) {
        return;
      }

      setError({
        chatId,
        message: "Не получилось получить ответ. Попробуйте еще раз.",
      });
    } finally {
      clearActiveRequest(abortController);
      setLoadingChatId(null);
      setStreamingChatId(null);
      setStreamingMessageId((current) =>
        current === pendingStreamingMessageId ? null : current,
      );
      focusInputOnDesktop();
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  if (isBooting) {
    return (
      <section
        className="chat-shell relative grid h-full min-h-0 w-full place-items-center overflow-hidden bg-[var(--app-bg)] text-[var(--text)] transition-colors duration-300"
        data-chat-theme={theme ?? undefined}
        style={theme ? { colorScheme: theme } : undefined}
      >
        <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
          <div
            aria-label="Загружаем Atlas"
            className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]"
            role="status"
          />
          <span className="text-sm font-medium">Загружаем Atlas</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className="chat-shell relative flex h-full min-h-0 w-full overflow-hidden bg-[var(--app-bg)] text-[var(--text)] transition-colors duration-300"
      data-chat-theme={theme ?? undefined}
      style={theme ? { colorScheme: theme } : undefined}
    >
      <ChatSidebar
        activeChatId={activeChat.id}
        chats={orderedChats}
        isOpen={isSidebarOpen}
        isSettingsOpen={isSettingsOpen}
        onClearAllChats={requestClearAllChats}
        onClose={closeSidebar}
        onCloseSettings={() => setIsSettingsOpen(false)}
        onCreateChat={createNewChat}
        onDeleteChat={requestDeleteChat}
        onSelectChat={selectChat}
        onToggleSettings={() => setIsSettingsOpen((current) => !current)}
        onToggleTheme={toggleTheme}
        theme={resolvedTheme}
      />

      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--main-bg)] transition-colors duration-300">
        <ChatHeader
          activeTitle={activeChat.title}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <ChatMessages
          bottomRef={bottomRef}
          contentRef={contentRef}
          isLoading={isLoading}
          messages={activeChat.messages}
          onTypingComplete={(messageId) =>
            setTypingMessageId((current) =>
              current === messageId ? null : current,
            )
          }
          scrollRef={scrollRef}
          streamingMessageId={streamingMessageId}
          typingMessageId={typingMessageId}
          welcomeSubtitle={welcomeSubtitle}
          welcomeTitle={welcomeTitle}
        />

        <ChatComposer
          activeError={activeError}
          chips={shouldShowSuggestions ? chips : []}
          input={input}
          inputRef={inputRef}
          isDisabled={hasActiveResponse}
          isResponding={hasActiveResponse}
          onChangeInput={setInput}
          onChipClick={(chip) => void sendMessage(chip)}
          onRequestScrollToBottom={() => followLatestMessage(true)}
          onStop={stopResponse}
          onSubmit={onSubmit}
          scrollRef={scrollRef}
          showScrollToBottom={showScrollToBottom}
        />
      </div>

      <DeleteConfirmationDialog
        confirmLabel={deleteConfirmationCopy.confirmLabel}
        description={deleteConfirmationCopy.description}
        isOpen={Boolean(deleteConfirmation)}
        onCancel={cancelDeleteConfirmation}
        onConfirm={confirmDelete}
        title={deleteConfirmationCopy.title}
      />
    </section>
  );
}
