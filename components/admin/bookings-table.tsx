"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { XCircle, ExternalLink } from "lucide-react";
import type { Booking } from "@prisma/client";
import { formatFullDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT = {
  PENDING: "outline",
  CONFIRMED: "success",
  CANCELLED: "danger",
  COMPLETED: "default",
} as const;

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function cancel(id: string) {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Booking cancelled");
      router.refresh();
    } catch {
      toast.error("Couldn't cancel that booking");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-foreground-faint">
          <tr>
            <th className="px-4 py-3">Guest</th>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">{booking.guestName}</div>
                <div className="text-xs text-foreground-faint">{booking.guestEmail}</div>
                {booking.topic && <div className="text-xs text-foreground-muted">{booking.topic}</div>}
              </td>
              <td className="px-4 py-3 text-foreground-muted">{formatFullDate(booking.date)}</td>
              <td className="px-4 py-3 text-foreground-muted">{booking.durationMinutes} min</td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[booking.status]}>{booking.status}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {booking.meetingLink && (
                    <Button asChild variant="ghost" size="icon">
                      <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" aria-label="Open meeting link">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {booking.status !== "CANCELLED" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => cancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      aria-label="Cancel booking"
                    >
                      <XCircle className="h-4 w-4 text-state-danger" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-foreground-faint">
                No bookings yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
