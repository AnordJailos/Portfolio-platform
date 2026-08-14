import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/portfolio/section-heading";

export async function TestimonialsSection() {
  const testimonials = await prisma.testimonial
    .findMany({ where: { published: true }, orderBy: { order: "asc" } })
    .catch(() => []);

  if (testimonials.length === 0) return null;

  return (
    <section className="container py-24">
      <SectionHeading eyebrow="Kind Words From Great People" title="What People Say About Me" />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.id} className="p-2">
            <CardContent className="flex h-full flex-col gap-4 p-4">
              <p className="text-sm leading-relaxed text-foreground-muted">"{t.quote}"</p>
              <div className="mt-auto flex items-center gap-3 pt-2">
                <Avatar>
                  {t.avatar && <AvatarImage src={t.avatar} alt={t.authorName} />}
                  <AvatarFallback>{t.authorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.authorName}</p>
                  <p className="text-xs text-foreground-faint">
                    {[t.authorRole, t.company].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
