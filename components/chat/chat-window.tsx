"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { SuggestedPrompts } from "@/components/chat/suggested-prompts";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ChatWindow({ initialPrompt }: { initialPrompt?: string }) {
  const { messages, sendMessage, isStreaming, isLoadingHistory, stopStreaming } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const firedInitialPrompt = useRef(false);

  useEffect(() => {
    if (initialPrompt && !firedInitialPrompt.current && !isLoadingHistory && messages.length === 0) {
      firedInitialPrompt.current = true;
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, isLoadingHistory, messages.length, sendMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const lastMessage = messages[messages.length - 1];
  const isThinking = isStreaming && lastMessage?.role === "assistant" && lastMessage.content === "";

  return (
    <Card className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {isLoadingHistory ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-16 w-2/3 self-end" />
          </div>
        ) : messages.length === 0 ? (
          <SuggestedPrompts onSelect={sendMessage} />
        ) : (
          <div className="flex flex-col gap-5">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {isThinking && <TypingIndicator />}
          </div>
        )}
      </div>
      <ChatInput onSend={sendMessage} isStreaming={isStreaming} onStop={stopStreaming} />
    </Card>
  );
}
