"use client";

import { useState, type KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput({
  onSend,
  isStreaming,
  onStop,
}: {
  onSend: (content: string) => void;
  isStreaming: boolean;
  onStop: () => void;
}) {
  const [value, setValue] = useState("");

  function submit() {
    if (!value.trim() || isStreaming) return;
    onSend(value.trim());
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border bg-surface-raised p-4">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about my projects, experience, or availability…"
        rows={1}
        className="min-h-[44px] resize-none py-2.5"
      />
      {isStreaming ? (
        <Button type="button" variant="outline" size="icon" onClick={onStop} aria-label="Stop generating">
          <Square className="h-4 w-4" />
        </Button>
      ) : (
        <Button type="button" size="icon" onClick={submit} disabled={!value.trim()} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
