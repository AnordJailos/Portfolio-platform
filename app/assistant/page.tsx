import type { Metadata } from "next";
import { ChatWindow } from "@/components/chat/chat-window";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "AI Assistant" };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AssistantPage({ searchParams }: Props) {
  const { q } = await searchParams;

  return (
    <div className="container max-w-3xl py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl text-foreground">Ask {SITE.name}'s AI twin</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Grounded in real projects, experience, and FAQs — with sources for every answer.
        </p>
      </div>
      <ChatWindow initialPrompt={q} />
    </div>
  );
}
