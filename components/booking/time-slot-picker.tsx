"use client";

import { useAvailability } from "@/hooks/use-bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TimeSlotPicker({
  date,
  durationMinutes,
  selected,
  onSelect,
}: {
  date: Date | null;
  durationMinutes: number;
  selected: string | null;
  onSelect: (iso: string) => void;
}) {
  const { slots, isLoading, error } = useAvailability(date, durationMinutes);

  if (!date) {
    return <p className="text-sm text-foreground-faint">Pick a date to see available times.</p>;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-state-danger">{error}</p>;
  }

  if (slots.length === 0) {
    return <p className="text-sm text-foreground-muted">No open slots this day — try another date.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.iso}
          onClick={() => onSelect(slot.iso)}
          className={cn(
            "rounded-md border border-border px-3 py-2 text-sm transition-colors",
            selected === slot.iso
              ? "border-signal-amber bg-signal-amber/10 text-foreground font-medium"
              : "text-foreground-muted hover:border-signal-amber/40 hover:text-foreground"
          )}
        >
          {slot.label}
        </button>
      ))}
    </div>
  );
}
