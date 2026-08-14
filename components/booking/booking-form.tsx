"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { bookingFormSchema, type BookingFormInput } from "@/lib/validations";
import { useCreateBooking } from "@/hooks/use-bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function BookingForm({
  selectedIso,
  durationMinutes,
  onSuccess,
}: {
  selectedIso: string;
  durationMinutes: 15 | 30 | 60;
  onSuccess: () => void;
}) {
  const { createBooking, isSubmitting } = useCreateBooking();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormInput>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: selectedIso,
      durationMinutes,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  async function onSubmit(data: BookingFormInput) {
    try {
      await createBooking({ ...data, date: selectedIso, durationMinutes });
      onSuccess();
    } catch {
      toast.error("Couldn't complete the booking. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <input type="hidden" {...register("date")} value={selectedIso} />
      <input type="hidden" {...register("durationMinutes", { valueAsNumber: true })} value={durationMinutes} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="guestName">Name</Label>
        <Input id="guestName" placeholder="Your name" {...register("guestName")} />
        {errors.guestName && <p className="text-xs text-state-danger">{errors.guestName.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="guestEmail">Email</Label>
        <Input id="guestEmail" type="email" placeholder="you@example.com" {...register("guestEmail")} />
        {errors.guestEmail && <p className="text-xs text-state-danger">{errors.guestEmail.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="topic">What's this about? (optional)</Label>
        <Input id="topic" placeholder="e.g. Project scoping call" {...register("topic")} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Anything I should know beforehand? (optional)</Label>
        <Textarea id="notes" rows={3} {...register("notes")} />
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Booking…" : "Confirm booking"}
      </Button>
    </form>
  );
}
