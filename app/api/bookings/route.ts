import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { bookingFormSchema } from "@/lib/validations";
import { createBooking, listBookingsForAdmin } from "@/services/booking.service";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bookings = await listBookingsForAdmin();
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const { ok } = rateLimit(`booking:${getClientKey(req)}`, 5, 60_000);
  if (!ok) {
    return NextResponse.json({ error: "Too many booking attempts. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bookingFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const booking = await createBooking(parsed.data);
  return NextResponse.json(booking, { status: 201 });
}
