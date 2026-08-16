import { AdminHeader } from "@/components/admin/admin-header";
import { TestimonialForm } from "@/components/admin/testimonials-form";

export default function NewTestimonialPage() {
  return (
    <div>
      <AdminHeader title="New testimonial" description="Published immediately unless you turn off the toggle below." />
      <div className="p-6">
        <TestimonialForm />
      </div>
    </div>
  );
}
