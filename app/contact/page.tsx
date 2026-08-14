import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { SITE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/portfolio/contact-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const socialLinks = await prisma.socialLink.findMany({ orderBy: { order: "asc" } }).catch(() => []);

  return (
    <div className="container max-w-4xl py-20">
      <div className="mb-10">
        <h1 className="font-display text-3xl text-foreground">Get in touch</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Have a project in mind, a question, or just want to say hi? Send a message below.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_260px]">
        <ContactForm />

        <Card className="h-fit">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3 text-sm text-foreground-muted">
              <Mail className="h-4 w-4 text-signal-amber" />
              <a href={`mailto:${SITE.email}`} className="hover:text-foreground">
                {SITE.email}
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground-muted">
              <MapPin className="h-4 w-4 text-signal-amber" />
              {SITE.location}
            </div>
            {socialLinks.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="mb-2 font-mono text-xs uppercase tracking-wider text-foreground-faint">Elsewhere</p>
                <div className="flex flex-col gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm capitalize text-foreground-muted hover:text-foreground"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
