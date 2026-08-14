"use client";

import { useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfToday,
  format,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function BookingCalendar({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (date: Date) => void;
}) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const today = startOfToday();

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <span className="font-display text-base text-foreground">{format(month, "MMMM yyyy")}</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setMonth(subMonths(month, 1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="py-1 font-mono text-[10px] uppercase text-foreground-faint">
            {d}
          </span>
        ))}
        {days.map((day) => {
          const disabled = isBefore(day, today) || !isSameMonth(day, month);
          const isSelected = selected && isSameDay(day, selected);
          return (
            <button
              key={day.toISOString()}
              disabled={disabled}
              onClick={() => onSelect(day)}
              className={cn(
                "aspect-square rounded-md text-sm transition-colors",
                disabled && "text-foreground-faint/40",
                !disabled && !isSelected && "text-foreground-muted hover:bg-white/5 hover:text-foreground",
                isSelected && "bg-signal-gradient font-semibold text-void"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
