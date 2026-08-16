import {
  LayoutDashboard,
  Briefcase,
  Newspaper,
  CalendarClock,
  BrainCircuit,
  BarChart3,
  MessageSquare,
  UserCircle,
  Quote,
} from "lucide-react";

/**
 * Deliberately NOT a "use client" module. It's imported by both
 * admin-sidebar.tsx (a Client Component) and admin-header.tsx (a Server
 * Component) — plain data like this has to live in a boundary-neutral file.
 *
 * Importing a plain array/object export from a "use client" module into a
 * Server Component doesn't give you the real value on the server; Next.js
 * replaces every export of a client module with a client-reference
 * descriptor (so React knows where to hydrate it), which works for
 * components but not for data. Keeping shared data here avoids that
 * entirely.
 */
export const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/profile", label: "Profile", icon: UserCircle },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/admin/knowledge-base", label: "Knowledge Base", icon: BrainCircuit },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
];
