"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import type { ChatMessage, ChatSource } from "@/types";

const SESSION_STORAGE_KEY = "portfolio_chat_session_id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = nanoid();
    localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

/**
 * Owns the assistant conversation: persistent session id, history rehydration,
 * and streamed message sending. Talks to app/api/chat/route.ts.
 */
export function useChat() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Rehydrate session + history on mount.
  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
    if (!id) return;

    fetch(`/api/chat?sessionId=${encodeURIComponent(id)}`)
      .then((res) => (res.ok ? res.json() : { messages: [] }))
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]))
      .finally(() => setIsLoadingHistory(false));
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || !content.trim() || isStreaming) return;

      const userMessage: ChatMessage = {
        id: nanoid(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };
      const assistantMessageId = nanoid();

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantMessageId, role: "assistant", content: "", createdAt: new Date().toISOString() },
      ]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error("The assistant is unavailable right now — please try again shortly.");
        }

        const sourcesHeader = res.headers.get("X-Sources");
        const sources: ChatSource[] = sourcesHeader ? JSON.parse(decodeURIComponent(sourcesHeader)) : [];

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMessageId ? { ...m, content: accumulated } : m))
          );
        }

        setMessages((prev) => prev.map((m) => (m.id === assistantMessageId ? { ...m, content: accumulated, sources } : m)));
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: "Sorry — something went wrong reaching the assistant. Please try again." }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId, messages, isStreaming]
  );

  const stopStreaming = useCallback(() => abortRef.current?.abort(), []);

  return { messages, sendMessage, isStreaming, isLoadingHistory, stopStreaming };
}
