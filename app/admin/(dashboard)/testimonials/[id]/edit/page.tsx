import { notFound } from "next/navigation";
import { getTestimonial } from "@/services/testimonial.service";
import { AdminHeader } from "@/components/admin/admin-header";
import { TestimonialForm } from "@/components/admin/testimonials-form";

type Params = { params: Promise<{ id: string }> };

export default async function EditTestimonialPage({ params }: Params) {
  const { id } = await params;
  const testimonial = await getTestimonial(id);
  if (!testimonial) notFound();

  return (
    <div>
      <AdminHeader title={`Edit — ${testimonial.authorName}`} />
      <div className="p-6">
        <TestimonialForm testimonial={testimonial} />
      </div>
    </div>
  );
}
