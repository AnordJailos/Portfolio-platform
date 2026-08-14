import { NextRequest, NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/validations";
import { streamRagCompletion } from "@/lib/rag";
import { getSessionHistory, appendMessage } from "@/services/chat.service";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // needs Prisma + the OpenAI SDK, not Edge-safe

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ messages: [] });

  const dbMessages = await getSessionHistory(sessionId);
  const messages = dbMessages.map((m) => ({
    id: m.id,
    role: m.role.toLowerCase() as "user" | "assistant",
    content: m.content,
    sources: (m.sources as unknown as { title: string; sourceType: string; sourceId: string | null }[]) ?? undefined,
    createdAt: m.createdAt.toISOString(),
  }));

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const { ok } = rateLimit(`chat:${getClientKey(req)}`, 20, 60_000); // 20 messages/minute/IP
  if (!ok) {
    return NextResponse.json({ error: "You're sending messages too quickly. Please slow down." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { sessionId, messages } = parsed.data;
  const lastUserMessage = messages[messages.length - 1];

  try {
    await appendMessage({ sessionId, role: "USER", content: lastUserMessage!.content });

    const { stream, sources } = await streamRagCompletion(messages);

    // Tee the stream: forward bytes to the client while also buffering them
    // to persist the full assistant reply once generation finishes.
    let fullReply = "";
    const [clientStream, persistStream] = stream.tee();

    (async () => {
      const reader = persistStream.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullReply += decoder.decode(value, { stream: true });
      }
      await appendMessage({ sessionId, role: "ASSISTANT", content: fullReply, sources });
      await prisma.analyticsEvent.create({ data: { type: "CHAT_MESSAGE" } }).catch(() => {});
    })();

    return new NextResponse(clientStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Sources": encodeURIComponent(JSON.stringify(sources)),
      },
    });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { error: "The assistant is temporarily unavailable. Please try again shortly." },
      { status: 500 }
    );
  }
}
