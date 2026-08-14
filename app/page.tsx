import { HeroSection } from "@/components/portfolio/hero-section";
import { FeaturedProjects } from "@/components/portfolio/featured-projects";
import { SkillsSection } from "@/components/portfolio/skills-section";
import { AiAssistantPreview } from "@/components/portfolio/ai-assistant-preview";
import { TestimonialsSection } from "@/components/portfolio/testimonials-section";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { ContactForm } from "@/components/portfolio/contact-form";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProjects />
      <AiAssistantPreview />
      <SkillsSection />
      <TestimonialsSection />

      <section id="contact" className="container py-24">
        <SectionHeading eyebrow="Get in touch" title="Let's build something" />
        <div className="mt-10 max-w-xl">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
