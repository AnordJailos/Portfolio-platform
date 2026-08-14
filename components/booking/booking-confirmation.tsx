import { CheckCircle2 } from "lucide-react";
import { formatFullDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function BookingConfirmation({ date, durationMinutes }: { date: Date; durationMinutes: number }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <CheckCircle2 className="h-12 w-12 text-state-success" />
      <h2 className="font-display text-2xl text-foreground">You're booked in</h2>
      <p className="max-w-sm text-sm text-foreground-muted">
        {formatFullDate(date)} at {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ·{" "}
        {durationMinutes} minutes. A confirmation email is on its way, along with a calendar invite.
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
