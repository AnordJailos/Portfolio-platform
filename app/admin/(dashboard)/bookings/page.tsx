import { listBookingsForAdmin } from "@/services/booking.service";
import { AdminHeader } from "@/components/admin/admin-header";
import { BookingsTable } from "@/components/admin/bookings-table";

export default async function AdminBookingsPage() {
  const bookings = await listBookingsForAdmin();

  return (
    <div>
      <AdminHeader title="Bookings" description="Everyone who's booked a call, synced with Google Calendar." />
      <div className="p-6">
        <BookingsTable bookings={bookings} />
      </div>
    </div>
  );
}
