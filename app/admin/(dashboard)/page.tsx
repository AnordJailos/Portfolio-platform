export const dynamic = "force-dynamic";


import Link from "next/link";
import { Briefcase, Newspaper, CalendarClock, MessageSquare, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent } from "@/components/ui/card";



export default async function AdminDashboardPage() {
  const [projectCount, postCount, upcomingBookings, unreadMessages] = await Promise.all([
    prisma.project.count(),
    prisma.blogPost.count(),
    prisma.booking.count({ where: { status: { in: ["PENDING", "CONFIRMED"] }, date: { gte: new Date() } } }),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  const cards = [
    { label: "Projects", value: projectCount, href: "/admin/projects", icon: Briefcase },
    { label: "Blog posts", value: postCount, href: "/admin/blog", icon: Newspaper },
    { label: "Upcoming bookings", value: upcomingBookings, href: "/admin/bookings", icon: CalendarClock },
    { label: "Unread messages", value: unreadMessages, href: "/admin/messages", icon: MessageSquare },
  ];

  return (
    <div>
      <AdminHeader title="Dashboard" description="A quick overview of your site." />
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, href, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="transition-colors hover:border-signal-amber/40">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-2xl font-medium text-foreground">{value}</p>
                  <p className="text-xs text-foreground-muted">{label}</p>
                </div>
                <Icon className="h-6 w-6 text-foreground-faint" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="p-6 pt-0">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <p className="text-sm text-foreground-muted">
              First time here? Replace the placeholder content seeded by <code className="font-mono text-xs">prisma/seed.ts</code>{" "}
              with your real projects, posts, and bio — then sync the AI assistant's knowledge base.
            </p>
            <Link href="/admin/knowledge-base" className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-signal-amber">
              Knowledge base <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
