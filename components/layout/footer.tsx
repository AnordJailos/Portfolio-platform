import Link from "next/link";
import { Github, Linkedin, Twitter, Youtube, Mail, type LucideIcon } from "lucide-react";
import { SITE, NAV_LINKS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { SignalMark } from "@/components/portfolio/signal-waveform";

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
};

export async function Footer() {
  // Social links live in the DB (editable from /admin) with a graceful
  // empty-state if the table hasn't been seeded yet.
  const socialLinks = await prisma.socialLink.findMany({ orderBy: { order: "asc" } }).catch(() => []);

  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col gap-8 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2 font-display text-lg text-foreground">
            <SignalMark className="h-5 w-5" />
            {SITE.name}
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{SITE.shortBio}</p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-foreground-faint">Site</h4>
            <ul className="mt-3 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-foreground-muted transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-foreground-faint">Elsewhere</h4>
            <ul className="mt-3 flex flex-col gap-2">
              {socialLinks.map((link) => {
                const Icon = PLATFORM_ICONS[link.platform] ?? Mail;
                return (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="capitalize">{link.platform}</span>
                    </a>
                  </li>
                );
              })}
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col-reverse items-center justify-between gap-3 py-6 text-xs text-foreground-faint sm:flex-row">
          <span>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </span>
          <span className="font-mono">Built with Next.js, an AI digital twin, and too much coffee.</span>
        </div>
      </div>
    </footer>
  );
}
