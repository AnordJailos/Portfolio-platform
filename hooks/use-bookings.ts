"use client";

import { useCallback, useEffect, useState } from "react";
import type { BookingFormInput } from "@/lib/validations";
import type { TimeSlot } from "@/types";

export function useAvailability(date: Date | null, durationMinutes: number) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      date: date.toISOString(),
      duration: String(durationMinutes),
    });

    fetch(`/api/bookings/availability?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Couldn't load availability.");
        return res.json();
      })
      .then((data) => setSlots(data.slots ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [date, durationMinutes]);

  return { slots, isLoading, error };
}

export function useCreateBooking() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (input: BookingFormInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't complete the booking. Please try again.");
      }
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createBooking, isSubmitting, error };
}
