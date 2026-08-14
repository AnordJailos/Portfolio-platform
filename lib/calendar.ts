/**
 * lib/calendar.ts
 * ----------------------------------------------------------------------------
 * Server-to-server Google Calendar integration using a single refresh token
 * for YOUR calendar (not per-visitor OAuth — visitors never log into Google).
 * Setup steps for GOOGLE_CLIENT_ID / SECRET / REFRESH_TOKEN are in
 * SETUP_GUIDE.docx §5.
 * ----------------------------------------------------------------------------
 */
import { google } from "googleapis";

function getOAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

function getCalendarClient() {
  return google.calendar({ version: "v3", auth: getOAuthClient() });
}

/** Returns [{start, end}] busy blocks between two dates on the configured calendar. */
export async function getBusyTimes(timeMin: Date, timeMax: Date): Promise<{ start: Date; end: Date }[]> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";
  const calendar = getCalendarClient();

  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: calendarId }],
    },
  });

  const busy = data.calendars?.[calendarId]?.busy ?? [];
  return busy
    .filter((b) => b.start && b.end)
    .map((b) => ({ start: new Date(b.start!), end: new Date(b.end!) }));
}

/** Creates a calendar event (with a Google Meet link) once a booking is confirmed. */
export async function createCalendarEvent(params: {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendeeEmail: string;
}): Promise<{ eventId: string; meetingLink: string | null }> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";
  const calendar = getCalendarClient();

  const { data } = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.start.toISOString() },
      end: { dateTime: params.end.toISOString() },
      attendees: [{ email: params.attendeeEmail }],
      conferenceData: {
        createRequest: {
          requestId: `booking-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  return {
    eventId: data.id ?? "",
    meetingLink: data.hangoutLink ?? null,
  };
}

export async function cancelCalendarEvent(eventId: string): Promise<void> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";
  const calendar = getCalendarClient();
  await calendar.events.delete({ calendarId, eventId, sendUpdates: "all" });
}

// ---------------------------------------------------------------------------
// Slot computation — combines your recurring AvailabilityRule rows with live
// Google Calendar busy blocks to produce bookable slots for a given day.
// ---------------------------------------------------------------------------

export type AvailabilityRule = {
  dayOfWeek: number;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
};

export function computeAvailableSlots(params: {
  date: Date; // the calendar day being requested (local midnight)
  durationMinutes: number;
  rules: AvailabilityRule[];
  busy: { start: Date; end: Date }[];
  slotIntervalMinutes?: number;
}): Date[] {
  const { date, durationMinutes, rules, busy, slotIntervalMinutes = 30 } = params;
  const dayOfWeek = date.getDay();
  const rule = rules.find((r) => r.dayOfWeek === dayOfWeek);
  if (!rule) return [];



  const [startH = 0, startM = 0] = rule.startTime.split(":").map(Number);
  const [endH = 0, endM = 0] = rule.endTime.split(":").map(Number);

  // const [startH, startM] = rule.startTime.split(":").map(Number);
  // const [endH, endM] = rule.endTime.split(":").map(Number);

  const windowStart = new Date(date);
  windowStart.setHours(startH, startM, 0, 0);
  const windowEnd = new Date(date);
  windowEnd.setHours(endH, endM, 0, 0);

  const slots: Date[] = [];
  const cursor = new Date(windowStart);

  while (cursor.getTime() + durationMinutes * 60_000 <= windowEnd.getTime()) {
    const slotEnd = new Date(cursor.getTime() + durationMinutes * 60_000);
    const overlapsBusy = busy.some((b) => cursor < b.end && slotEnd > b.start);
    const inPast = cursor.getTime() < Date.now();

    if (!overlapsBusy && !inPast) {
      slots.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + slotIntervalMinutes);
  }

  return slots;
}
