import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SourceCitations } from "@/components/chat/source-citation";
import type { ChatMessage as ChatMessageType } from "@/types";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0">
        {isUser ? (
          <AvatarFallback className="bg-surface-raised text-foreground-muted">You</AvatarFallback>
        ) : (
          <>
            <AvatarImage src={SITE.avatarUrl} alt={SITE.name} />
            <AvatarFallback>{SITE.name[0]}</AvatarFallback>
          </>
        )}
      </Avatar>

      <div
        className={cn(
          "max-w-[80%] rounded-lg border border-border px-4 py-3 text-sm leading-relaxed",
          isUser ? "bg-signal-violet/10 text-foreground" : "bg-surface text-foreground"
        )}
      >
        {message.content ? (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-pre:bg-void">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <span className="text-foreground-faint">…</span>
        )}
        {!isUser && message.sources && <SourceCitations sources={message.sources} />}
      </div>
    </div>
  );
}
