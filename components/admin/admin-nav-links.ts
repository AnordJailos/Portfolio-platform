import {
  LayoutDashboard, Briefcase, Newspaper, CalendarClock,
  BrainCircuit, BarChart3, MessageSquare,
} from "lucide-react";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { href: "/admin/skills", label: "Skills", icon: BrainCircuit },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/admin/knowledge-base", label: "Knowledge Base", icon: BrainCircuit },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
];