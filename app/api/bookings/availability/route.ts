import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlotsForDate } from "@/services/booking.service";
import type { TimeSlot } from "@/types";

export const runtime = "nodejs";

const ALLOWED_DURATIONS = [15, 30, 60];

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");
  const durationParam = Number(req.nextUrl.searchParams.get("duration") ?? 30);

  if (!dateParam || !ALLOWED_DURATIONS.includes(durationParam)) {
    return NextResponse.json({ error: "Invalid date or duration" }, { status: 400 });
  }

  const date = new Date(dateParam);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const availableDates = await getAvailableSlotsForDate(date, durationParam);

  const slots: TimeSlot[] = availableDates.map((d) => ({
    iso: d.toISOString(),
    label: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  }));

  return NextResponse.json({ slots });
}
