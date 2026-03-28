import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TutorMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  highlightedText?: string | null;
  createdAt?: string;
}

interface UsageInfo {
  used: number;
  limit: number | null;
  remaining: number | null;
}

export interface TutorContext {
  userCode?: string;
  consoleOutput?: string;
  stepTitle?: string;
  stepDescription?: string;
  taskInstructions?: string;
  validationResult?: { passed: boolean; feedback: string } | null;
  stepOrder?: number;
  totalSteps?: number;
}

interface UseTutorChatOptions {
  contentType: string;
  contentSlug: string;
  enabled?: boolean;
  context?: TutorContext;
}

export function useTutorChat({
  contentType,
  contentSlug,
  enabled = true,
  context,
}: UseTutorChatOptions) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const contextRef = useRef(context);
  contextRef.current = context;
  const queryClient = useQueryClient();

  // Fetch conversation history
  const { data: historyData } = useQuery({
    queryKey: ["tutor-history", contentType, contentSlug],
    queryFn: async () => {
      const res = await fetch(
        `/api/tutor/history?contentType=${encodeURIComponent(contentType)}&contentSlug=${encodeURIComponent(contentSlug)}`
      );
      if (!res.ok) return { conversation: null, messages: [] };
      return res.json();
    },
    enabled: enabled && !!contentSlug,
    staleTime: 1000 * 60 * 5,
  });

  // Load history into state on first fetch
  useEffect(() => {
    if (historyData?.messages?.length && messages.length === 0) {
      setMessages(historyData.messages);
      if (historyData.conversation?.id) {
        setConversationId(historyData.conversation.id);
      }
    }
  }, [historyData, messages.length]);

  // Fetch usage stats
  const { data: usage, refetch: refetchUsage } = useQuery<UsageInfo>({
    queryKey: ["tutor-usage"],
    queryFn: async () => {
      const res = await fetch("/api/tutor/usage");
      if (!res.ok) throw new Error("Failed to fetch usage");
      return res.json();
    },
    enabled,
    staleTime: 1000 * 60 * 2,
  });

  const sendMessage = useCallback(
    async (text: string, selectedText?: string | null) => {
      if (isStreaming || !text.trim()) return;

      const userMessage: TutorMessage = {
        role: "user",
        content: text,
        highlightedText: selectedText || highlightedText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setHighlightedText(null);

      // Add a placeholder for the assistant response
      const assistantMessage: TutorMessage = {
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        abortControllerRef.current = new AbortController();

        const res = await fetch("/api/tutor/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType,
            contentSlug,
            message: text,
            highlightedText: selectedText || highlightedText,
            context: contextRef.current,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Request failed with status ${res.status}`
          );
        }

        // Read the conversation ID from the header
        const newConversationId = res.headers.get("X-Conversation-Id");
        if (newConversationId) {
          setConversationId(newConversationId);
        }

        // Stream the response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No response body");

        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          // Update the last message (assistant placeholder) with streamed content
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: accumulated,
            };
            return updated;
          });
        }

        // Refresh usage after sending
        refetchUsage();

        // Invalidate history cache so it refreshes next time
        queryClient.invalidateQueries({
          queryKey: ["tutor-history", contentType, contentSlug],
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;

        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";

        // Update assistant message to show error
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: `Sorry, I ran into an issue: ${errorMessage}`,
          };
          return updated;
        });
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [
      isStreaming,
      contentType,
      contentSlug,
      highlightedText,
      refetchUsage,
      queryClient,
    ]
  );

  const clearHistory = useCallback(async () => {
    if (!conversationId) return;

    try {
      await fetch(
        `/api/tutor/history?conversationId=${encodeURIComponent(conversationId)}`,
        { method: "DELETE" }
      );
      setMessages([]);
      queryClient.invalidateQueries({
        queryKey: ["tutor-history", contentType, contentSlug],
      });
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  }, [conversationId, contentType, contentSlug, queryClient]);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isStreaming,
    usage: usage || { used: 0, limit: null, remaining: null },
    highlightedText,
    setHighlightedText,
    sendMessage,
    clearHistory,
    stopStreaming,
    conversationId,
  };
}
