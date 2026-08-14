/**
 * services/chat.service.ts — chat session/message persistence.
 * The actual RAG generation lives in lib/rag.ts; this file only handles
 * storing the conversation so a visitor's history survives a page refresh.
 */
import { prisma } from "@/lib/prisma";
import type { ChatSource } from "@/types";

export async function getOrCreateSession(sessionId: string) {
  return prisma.chatSession.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId },
  });
}

export async function getSessionHistory(sessionId: string) {
  const session = await prisma.chatSession.findUnique({
    where: { sessionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  return session?.messages ?? [];
}

export async function appendMessage(params: {
  sessionId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  sources?: ChatSource[];
}) {
  const session = await getOrCreateSession(params.sessionId);
  return prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      role: params.role,
      content: params.content,
      sources: params.sources ? JSON.parse(JSON.stringify(params.sources)) : undefined,
    },
  });
}
