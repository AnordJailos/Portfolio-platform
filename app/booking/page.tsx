"use client";

import { useState } from "react";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { BookingForm } from "@/components/booking/booking-form";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BOOKING_DURATIONS_MIN } from "@/lib/constants";

type Duration = (typeof BOOKING_DURATIONS_MIN)[number];

export default function BookingPage() {
  const [duration, setDuration] = useState<Duration>(30);
  const [date, setDate] = useState<Date | null>(null);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed && selectedIso) {
    return (
      <div className="container max-w-lg py-20">
        <BookingConfirmation date={new Date(selectedIso)} durationMinutes={duration} />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-20">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl text-foreground">Book a call</h1>
        <p className="mt-2 text-sm text-foreground-muted">Pick a length, a day, and a time that works for you.</p>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {BOOKING_DURATIONS_MIN.map((mins) => (
          <button
            key={mins}
            onClick={() => {
              setDuration(mins);
              setSelectedIso(null);
            }}
            className={cn(
              "rounded-full border border-border px-5 py-2 text-sm transition-colors",
              duration === mins ? "bg-signal-gradient font-semibold text-void" : "text-foreground-muted hover:text-foreground"
            )}
          >
            {mins} min
          </button>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="p-6">
          <BookingCalendar
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setSelectedIso(null);
            }}
          />
        </Card>

        <Card className="p-6">
          {!selectedIso ? (
            <TimeSlotPicker date={date} durationMinutes={duration} selected={selectedIso} onSelect={setSelectedIso} />
          ) : (
            <div>
              <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => setSelectedIso(null)}>
                ← Choose a different time
              </Button>
              <BookingForm selectedIso={selectedIso} durationMinutes={duration} onSuccess={() => setConfirmed(true)} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
