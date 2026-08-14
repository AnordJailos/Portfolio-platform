/**
 * services/booking.service.ts — availability computation + booking lifecycle.
 */
import { prisma } from "@/lib/prisma";
import { getBusyTimes, createCalendarEvent, cancelCalendarEvent, computeAvailableSlots } from "@/lib/calendar";
import { sendBookingConfirmation } from "@/lib/email";
import type { BookingFormInput } from "@/lib/validations";

export async function getAvailableSlotsForDate(date: Date, durationMinutes: number) {
  const rules = await prisma.availabilityRule.findMany({ where: { isActive: true } });

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Google Calendar is the source of truth for busy time; if it's not configured
  // yet (no refresh token during initial setup), fall back to only checking our
  // own bookings table so the booking page still works before Calendar is wired up.
  let busy: { start: Date; end: Date }[] = [];
  try {
    busy = await getBusyTimes(dayStart, dayEnd);
  } catch {
    const existingBookings = await prisma.booking.findMany({
      where: { date: { gte: dayStart, lte: dayEnd }, status: { in: ["PENDING", "CONFIRMED"] } },
    });
    busy = existingBookings.map((b) => ({
      start: b.date,
      end: new Date(b.date.getTime() + b.durationMinutes * 60_000),
    }));
  }

  return computeAvailableSlots({
    date: dayStart,
    durationMinutes,
    rules: rules.map((r) => ({ dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime })),
    busy,
  });
}

export async function createBooking(input: BookingFormInput) {
  const start = new Date(input.date);
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);

  const booking = await prisma.booking.create({
    data: {
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      topic: input.topic,
      notes: input.notes,
      date: start,
      durationMinutes: input.durationMinutes,
      timezone: input.timezone,
      status: "PENDING",
    },
  });

  // Best-effort calendar sync — a missing/invalid Google config shouldn't block the booking itself.
  let meetingLink: string | null = null;
  try {
    const event = await createCalendarEvent({
      summary: `Call with ${input.guestName}${input.topic ? ` — ${input.topic}` : ""}`,
      description: input.notes,
      start,
      end,
      attendeeEmail: input.guestEmail,
    });
    meetingLink = event.meetingLink;
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED", calendarEventId: event.eventId, meetingLink },
    });
  } catch (err) {
    console.error("Google Calendar event creation failed — booking saved as PENDING.", err);
  }

  try {
    await sendBookingConfirmation({
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      date: start,
      durationMinutes: input.durationMinutes,
      meetingLink,
    });
  } catch (err) {
    console.error("Booking confirmation email failed to send.", err);
  }

  await prisma.analyticsEvent.create({ data: { type: "BOOKING_CREATED", metadata: { bookingId: booking.id } } });

  return booking;
}

export async function cancelBooking(id: string) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  if (booking.calendarEventId) {
    try {
      await cancelCalendarEvent(booking.calendarEventId);
    } catch (err) {
      console.error("Failed to cancel calendar event", err);
    }
  }
  return prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
}

export async function listBookingsForAdmin() {
  return prisma.booking.findMany({ orderBy: { date: "desc" } });
}
