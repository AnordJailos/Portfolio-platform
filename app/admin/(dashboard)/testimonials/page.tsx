import { listAllTestimonialsForAdmin } from "@/services/testimonial.service";
import { AdminHeader } from "@/components/admin/admin-header";
import { TestimonialsTable } from "@/components/admin/testimonials-table";

export default async function AdminTestimonialsPage() {
  const testimonials = await listAllTestimonialsForAdmin();

  return (
    <div>
      <AdminHeader title="Testimonials" description="Approve visitor submissions or add your own." />
      <div className="p-6">
        <TestimonialsTable testimonials={testimonials} />
      </div>
    </div>
  );
}
