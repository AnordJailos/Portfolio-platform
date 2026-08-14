import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { subDays, format, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import type { AnalyticsSummary } from "@/types";

export const runtime = "nodejs";

const trackEventSchema = z.object({
  type: z.enum(["PAGE_VIEW", "PROJECT_VIEW"]),
  path: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** POST — public, fire-and-forget event tracking from the client (page views, project views). */
export async function POST(req: NextRequest) {
  const { ok } = rateLimit(`analytics:${getClientKey(req)}`, 120, 60_000);
  if (!ok) return NextResponse.json({ ok: false }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = trackEventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  await prisma.analyticsEvent
  .create({
    data: {
      type: parsed.data.type,
      path: parsed.data.path,
      metadata: parsed.data.metadata
        ? JSON.parse(JSON.stringify(parsed.data.metadata))
        : undefined,
    },
  })
  .catch(() => {});

  // await prisma.analyticsEvent
  //   .create({ data: { type: parsed.data.type, path: parsed.data.path, metadata: parsed.data.metadata } })
  //   .catch(() => {}); // analytics must never break the page it's tracking

  return NextResponse.json({ ok: true });
}

/** GET — admin only: aggregate summary for the dashboard. */
export async function GET() {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = subDays(new Date(), 30);

  const [totalPageViews, totalProjectViews, totalChatSessions, totalBookings, recentEvents, projectViewEvents] =
    await Promise.all([
      prisma.analyticsEvent.count({ where: { type: "PAGE_VIEW" } }),
      prisma.analyticsEvent.count({ where: { type: "PROJECT_VIEW" } }),
      prisma.chatSession.count(),
      prisma.booking.count(),
      prisma.analyticsEvent.findMany({
        where: { type: "PAGE_VIEW", createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.analyticsEvent.findMany({
        where: { type: "PROJECT_VIEW" },
        select: { metadata: true },
      }),
    ]);

  // Bucket page views by day for the last 30 days.
  const dayBuckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    dayBuckets.set(format(subDays(new Date(), i), "MMM d"), 0);
  }
  for (const event of recentEvents) {
    const key = format(startOfDay(event.createdAt), "MMM d");
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
  }

  // Tally project views by project title (metadata.title set when the event was logged).
  const projectTally = new Map<string, number>();
  for (const event of projectViewEvents) {
    const title = (event.metadata as { title?: string } | null)?.title ?? "Unknown project";
    projectTally.set(title, (projectTally.get(title) ?? 0) + 1);
  }

  const summary: AnalyticsSummary = {
    totalPageViews,
    totalProjectViews,
    totalChatSessions,
    totalBookings,
    topProjects: Array.from(projectTally.entries())
      .map(([title, views]) => ({ title, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5),
    viewsByDay: Array.from(dayBuckets.entries()).map(([date, views]) => ({ date, views })),
  };

  return NextResponse.json(summary);
}
